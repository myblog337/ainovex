import { createHash, randomUUID } from "node:crypto";
import { eq } from "drizzle-orm";
import { Router, type IRouter } from "express";
import { CreatePublishPreviewBody } from "@workspace/api-zod";
import {
  ainovexArticlesTable,
  ainovexCategoriesTable,
  ainovexGitHubSettingsTable,
  ainovexPublishHistoryTable,
  ainovexSiteConfigTable,
  db,
  type AdsConfigSnapshot,
  type DeploymentCheckData,
  type SiteConfigData,
  type SiteConfigSnapshot,
} from "@workspace/db";
import { requireSecureRequest, type AdminRequest } from "../middlewares/adminAuth";
import {
  parseCategoryFile,
  serializeArticleMarkdown,
  serializeCategoryFile,
  updateSiteConfigSource,
  type CategoryEntry,
} from "../lib/content-format";
import {
  articleRepositoryPath,
  isAllowedRepositoryPath,
  isValidGitHubCredentials,
} from "../lib/security-policy";

const router: IRouter = Router();
const githubApi = "https://api.github.com";
const previewTtlMs = 5 * 60 * 1000;
const maxPendingPreviews = 10;

type PublishKind = "article" | "category" | "site-config" | "ads";
type FileAction = "create" | "update" | "delete";
type DeploymentStatus = "reported_success" | "reported_failure" | "pending" | "unreported";

type Repository = {
  owner: string;
  repository: string;
  branch: string;
  commitMessage: string;
};

type RemoteFile = {
  sha: string;
  content: string;
};

type PendingPreview = {
  id: string;
  userId: string;
  username: string;
  token: string;
  expiresAt: number;
  kind: PublishKind;
  resourceId: string | null;
  removeResource: boolean;
  repository: Repository;
  branchSha: string;
  fileSha: string | null;
  sourceFingerprint: string;
  path: string;
  action: FileAction;
  oldContent: string | null;
  newContent: string | null;
};

type PlannedChange = {
  kind: PublishKind;
  resourceId: string | null;
  removeResource: boolean;
  repository: Repository;
  sourceFingerprint: string;
  path: string;
  action: FileAction;
  oldContent: string | null;
  newContent: string | null;
};

const pendingPreviews = new Map<string, PendingPreview>();

function asRecord(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  return value as Record<string, unknown>;
}

function fingerprint(value: unknown): string {
  return createHash("sha256").update(JSON.stringify(value)).digest("hex");
}

function siteSnapshot(data: SiteConfigData): SiteConfigSnapshot {
  return {
    siteUrl: data.siteUrl,
    name: data.name,
    tagline: data.tagline,
    launched: data.launched,
    ogImage: data.ogImage,
    analyticsProvider: data.analyticsProvider,
    analyticsMeasurementId: data.analyticsMeasurementId,
  };
}

function adsSnapshot(data: SiteConfigData): AdsConfigSnapshot {
  return { adsenseClient: data.adsenseClient, adsenseSlot: data.adsenseSlot };
}

function prunePreviews(): void {
  const now = Date.now();
  for (const [id, preview] of pendingPreviews) {
    if (preview.expiresAt <= now) pendingPreviews.delete(id);
  }
}

function githubUrl(path: string): URL {
  if (path.startsWith("/") || path.includes("..")) throw new Error("Invalid GitHub API path");
  return new URL(path, `${githubApi}/`);
}

async function githubRequest(
  token: string,
  path: string,
  method = "GET",
  body?: Record<string, unknown>,
): Promise<Response> {
  const response = await fetch(githubUrl(path), {
    method,
    redirect: "error",
    signal: AbortSignal.timeout(20_000),
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${token}`,
      "X-GitHub-Api-Version": "2022-11-28",
      ...(body ? { "Content-Type": "application/json" } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  return response;
}

async function githubJson(token: string, path: string): Promise<Record<string, unknown>> {
  const response = await githubRequest(token, path);
  if (!response.ok) throw new Error("GitHub request failed");
  return asRecord(await response.json());
}

function repoBase(repository: Repository): string {
  return `repos/${encodeURIComponent(repository.owner)}/${encodeURIComponent(repository.repository)}`;
}

function encodePath(path: string): string {
  return path.split("/").map((part) => encodeURIComponent(part)).join("/");
}

function repositoryPath(path: string): string {
  if (isAllowedRepositoryPath(path)) return path;
  throw new Error("Publishing path is not allowed");
}

async function ensureGithubAccess(username: string, token: string, repository: Repository): Promise<string> {
  if (!/^[A-Za-z\d](?:[A-Za-z\d-]{0,38})$/.test(username)) {
    throw new Error("GitHub credentials could not be verified.");
  }
  const user = await githubJson(token, "user");
  const login = typeof user.login === "string" ? user.login : "";
  if (login.toLowerCase() !== username.toLowerCase()) {
    throw new Error("The GitHub username does not match the supplied token.");
  }

  const repo = await githubJson(token, repoBase(repository));
  const fullName = typeof repo.full_name === "string" ? repo.full_name : "";
  if (fullName.toLowerCase() !== `${repository.owner}/${repository.repository}`.toLowerCase()) {
    throw new Error("The configured GitHub repository could not be verified.");
  }
  const permissions = asRecord(repo.permissions);
  if (permissions.push !== true && permissions.admin !== true && permissions.maintain !== true) {
    throw new Error("The supplied GitHub account does not have repository write access.");
  }

  const branchSegments = repository.branch.split("/").map(encodeURIComponent).join("/");
  const branch = await githubJson(token, `${repoBase(repository)}/git/ref/heads/${branchSegments}`);
  const object = asRecord(branch.object);
  if (typeof object.sha !== "string") throw new Error("The configured repository branch could not be verified.");
  return object.sha;
}

async function fetchRemoteFile(token: string, repository: Repository, path: string): Promise<RemoteFile | null> {
  const apiPath = `${repoBase(repository)}/contents/${encodePath(repositoryPath(path))}?ref=${encodeURIComponent(repository.branch)}`;
  const response = await githubRequest(token, apiPath);
  if (response.status === 404) return null;
  if (!response.ok) throw new Error("Could not read the configured repository file.");
  const file = asRecord(await response.json());
  if (file.type !== "file" || typeof file.sha !== "string" || typeof file.content !== "string") {
    throw new Error("The configured repository path is not a readable file.");
  }
  return {
    sha: file.sha,
    content: Buffer.from(file.content.replace(/\s/g, ""), "base64").toString("utf8"),
  };
}

function siteFilePath(): string {
  return repositoryPath("site.config.mjs");
}

async function loadRepositorySettings(): Promise<Repository> {
  const [row] = await db.select().from(ainovexGitHubSettingsTable)
    .where(eq(ainovexGitHubSettingsTable.id, 1)).limit(1);
  if (!row || !row.owner || !row.repository || !row.branch) {
    throw new Error("Save the GitHub repository, branch, and owner in Settings first.");
  }
  return {
    owner: row.owner,
    repository: row.repository,
    branch: row.branch,
    commitMessage: row.commitMessage.trim() || "Update AINOVEX website",
  };
}

async function getSiteConfig(): Promise<SiteConfigData> {
  const [row] = await db.select().from(ainovexSiteConfigTable)
    .where(eq(ainovexSiteConfigTable.id, 1)).limit(1);
  if (!row) throw new Error("Site settings are not initialized.");
  return row.data;
}

async function planChange(kind: PublishKind, resourceId: string | null): Promise<PlannedChange> {
  const repository = await loadRepositorySettings();

  if (kind === "article") {
    if (!resourceId) throw new Error("Select an article to publish.");
    const [row] = await db.select().from(ainovexArticlesTable)
      .where(eq(ainovexArticlesTable.id, resourceId)).limit(1);
    if (!row) throw new Error("The selected article no longer exists.");
    const path = repositoryPath(articleRepositoryPath(row.slug));
    const action = row.deleteRequested ? "delete" : "update";
    return {
      kind,
      resourceId,
      removeResource: row.deleteRequested,
      repository,
      sourceFingerprint: fingerprint({ id: row.id, slug: row.slug, data: row.data, deleteRequested: row.deleteRequested }),
      path,
      action,
      oldContent: null,
      newContent: row.deleteRequested ? null : serializeArticleMarkdown(row.slug, row.data),
    };
  }

  if (kind === "category") {
    if (!resourceId) throw new Error("Select a category to publish.");
    const [row] = await db.select().from(ainovexCategoriesTable)
      .where(eq(ainovexCategoriesTable.id, resourceId)).limit(1);
    if (!row) throw new Error("The selected category no longer exists.");
    return {
      kind,
      resourceId,
      removeResource: row.deleteRequested,
      repository,
      sourceFingerprint: fingerprint({ id: row.id, slug: row.slug, data: row.data, deleteRequested: row.deleteRequested }),
      path: repositoryPath("content/categories.json"),
      action: "update",
      oldContent: null,
      newContent: null,
    };
  }

  if (resourceId) throw new Error("A site-wide publish does not accept a content ID.");
  const config = await getSiteConfig();
  const section = kind === "ads" ? "ads" : "site";
  const snapshot = section === "ads" ? adsSnapshot(config) : siteSnapshot(config);
  return {
    kind,
    resourceId: null,
    removeResource: false,
    repository,
    sourceFingerprint: fingerprint(snapshot),
    path: siteFilePath(),
    action: "update",
    oldContent: null,
    newContent: null,
  };
}

async function prepareContentChange(
  plan: PlannedChange,
  token: string,
  remote: RemoteFile | null,
): Promise<PlannedChange> {
  const oldContent = remote?.content ?? null;

  if (plan.kind === "article") {
    if (plan.action === "delete") {
      if (!remote) throw new Error("The published article file is already missing from GitHub.");
      return { ...plan, action: "delete", oldContent, newContent: null };
    }
    const newContent = plan.newContent ?? "";
    const action: FileAction = remote ? "update" : "create";
    if (remote?.content === newContent) throw new Error("There are no article changes to publish.");
    return { ...plan, action, oldContent, newContent };
  }

  if (plan.kind === "category") {
    if (!remote) throw new Error("The GitHub categories file could not be found.");
    const categories = parseCategoryFile(remote.content);
    const duplicateSlugs = new Set<string>();
    for (const category of categories) {
      if (duplicateSlugs.has(category.slug)) throw new Error("The GitHub categories file has duplicate slugs.");
      duplicateSlugs.add(category.slug);
    }
    const [row] = await db.select().from(ainovexCategoriesTable)
      .where(eq(ainovexCategoriesTable.id, plan.resourceId ?? "")).limit(1);
    if (!row) throw new Error("The selected category no longer exists.");
    const index = categories.findIndex((category) => category.slug === row.slug);
    let changed: CategoryEntry[];
    if (row.deleteRequested) {
      if (index < 0) throw new Error("The category is already missing from GitHub.");
      changed = categories.filter((category) => category.slug !== row.slug);
      return { ...plan, removeResource: true, action: "update", oldContent, newContent: serializeCategoryFile(changed) };
    }
    if (index < 0) {
      changed = [...categories, { slug: row.slug, name: row.data.name, intro: row.data.intro }];
    } else {
      changed = categories.map((category, itemIndex) =>
        itemIndex === index ? { ...category, name: row.data.name, intro: row.data.intro } : category,
      );
    }
    const newContent = serializeCategoryFile(changed);
    if (newContent === remote.content) throw new Error("There are no category changes to publish.");
    return { ...plan, action: "update", oldContent, newContent };
  }

  if (!remote) throw new Error("The GitHub site configuration file could not be found.");
  const config = await getSiteConfig();
  const newContent = updateSiteConfigSource(remote.content, config, plan.kind === "ads" ? "ads" : "site");
  if (newContent === remote.content) throw new Error("There are no settings changes to publish.");
  return { ...plan, action: "update", oldContent, newContent };
}

function countChangedLines(oldContent: string | null, newContent: string | null): { additions: number; deletions: number } {
  const oldLines = oldContent === null ? [] : oldContent.split("\n");
  const newLines = newContent === null ? [] : newContent.split("\n");
  let prefix = 0;
  while (prefix < oldLines.length && prefix < newLines.length && oldLines[prefix] === newLines[prefix]) prefix += 1;
  let suffix = 0;
  while (
    suffix < oldLines.length - prefix &&
    suffix < newLines.length - prefix &&
    oldLines[oldLines.length - 1 - suffix] === newLines[newLines.length - 1 - suffix]
  ) suffix += 1;
  return {
    additions: newLines.length - prefix - suffix,
    deletions: oldLines.length - prefix - suffix,
  };
}

function previewSafeMessage(error: unknown): string {
  const message = error instanceof Error ? error.message : "";
  const safeMessages = new Set([
    "GitHub credentials could not be verified.",
    "The GitHub username does not match the supplied token.",
    "The configured GitHub repository could not be verified.",
    "The supplied GitHub account does not have repository write access.",
    "The configured repository branch could not be verified.",
    "The configured repository file could not be found.",
    "The GitHub categories file could not be found.",
    "The GitHub site configuration file could not be found.",
    "The published article file is already missing from GitHub.",
    "The category is already missing from GitHub.",
    "There are no article changes to publish.",
    "There are no category changes to publish.",
    "There are no settings changes to publish.",
    "Save the GitHub repository, branch, and owner in Settings first.",
    "Select an article to publish.",
    "Select a category to publish.",
    "A site-wide publish does not accept a content ID.",
    "The selected article no longer exists.",
    "The selected category no longer exists.",
    "The GitHub categories file has duplicate slugs.",
    "The remote category file is not a JSON list",
    "The remote category file contains an invalid entry",
    "Article is missing YAML front matter",
    "Article slug does not match its allowed filename",
    "Article date must use YYYY-MM-DD",
    "Article title, description, and category are required",
    "Article related field must be a list of slugs",
    "site.config.mjs must export a default object",
  ]);
  return safeMessages.has(message) ? message : "GitHub could not prepare this publish. Check the repository, branch, and token permissions.";
}

async function verifyRepositoryTarget(
  token: string,
  repository: Repository,
  username: string,
): Promise<string> {
  return ensureGithubAccess(username, token, repository);
}

function validateGithubInput(username: string, token: string): boolean {
  return isValidGitHubCredentials(username, token);
}

async function deploymentChecks(token: string, repository: Repository, commitSha: string): Promise<{
  checks: DeploymentCheckData[];
  status: DeploymentStatus;
}> {
  const base = `${repoBase(repository)}/commits/${encodeURIComponent(commitSha)}`;
  try {
    const [statusResponse, runsResponse] = await Promise.all([
      githubRequest(token, `${base}/status`),
      githubRequest(token, `${base}/check-runs?per_page=100`),
    ]);
    const contexts: DeploymentCheckData[] = [];
    if (statusResponse.ok) {
      const status = asRecord(await statusResponse.json());
      if (Array.isArray(status.statuses)) {
        for (const raw of status.statuses) {
          const item = asRecord(raw);
          if (typeof item.context !== "string") continue;
          const state = item.state;
          if (state !== "success" && state !== "failure" && state !== "error" && state !== "pending") continue;
          contexts.push({
            context: item.context,
            state,
            targetUrl: typeof item.target_url === "string" ? item.target_url : "",
          });
        }
      }
    }
    if (runsResponse.ok) {
      const runs = asRecord(await runsResponse.json());
      if (Array.isArray(runs.check_runs)) {
        for (const raw of runs.check_runs) {
          const item = asRecord(raw);
          if (typeof item.name !== "string") continue;
          const state: DeploymentCheckData["state"] =
            item.status !== "completed"
              ? "pending"
              : item.conclusion === "success" || item.conclusion === "neutral" || item.conclusion === "skipped"
                ? "success"
                : "failure";
          contexts.push({
            context: item.name,
            state,
            targetUrl: typeof item.html_url === "string" ? item.html_url : "",
          });
        }
      }
    }
    const cloudflare = contexts.filter((item) => /cloudflare/i.test(item.context));
    let status: DeploymentStatus = "unreported";
    if (cloudflare.length > 0) {
      if (cloudflare.some((item) => item.state === "failure" || item.state === "error")) {
        status = "reported_failure";
      } else if (cloudflare.every((item) => item.state === "success")) {
        status = "reported_success";
      } else {
        status = "pending";
      }
    }
    return { checks: contexts.slice(0, 50), status };
  } catch {
    return { checks: [], status: "unreported" };
  }
}

async function currentSourceFingerprint(preview: PendingPreview): Promise<string> {
  const { kind, resourceId } = preview;
  if (kind === "article") {
    const [row] = await db.select().from(ainovexArticlesTable)
      .where(eq(ainovexArticlesTable.id, resourceId ?? "")).limit(1);
    if (!row) throw new Error("The source draft changed after the preview.");
    return fingerprint({ id: row.id, slug: row.slug, data: row.data, deleteRequested: row.deleteRequested });
  }
  if (kind === "category") {
    const [row] = await db.select().from(ainovexCategoriesTable)
      .where(eq(ainovexCategoriesTable.id, resourceId ?? "")).limit(1);
    if (!row) throw new Error("The source draft changed after the preview.");
    return fingerprint({ id: row.id, slug: row.slug, data: row.data, deleteRequested: row.deleteRequested });
  }
  const config = await getSiteConfig();
  return fingerprint(kind === "ads" ? adsSnapshot(config) : siteSnapshot(config));
}

async function synchronizePublishedDraft(preview: PendingPreview): Promise<void> {
  if (preview.kind === "article") {
    if (preview.action === "delete") {
      await db.delete(ainovexArticlesTable).where(eq(ainovexArticlesTable.id, preview.resourceId ?? ""));
      return;
    }
    const [row] = await db.select().from(ainovexArticlesTable)
      .where(eq(ainovexArticlesTable.id, preview.resourceId ?? "")).limit(1);
    if (!row) throw new Error("The source draft was removed after the GitHub commit.");
    await db.update(ainovexArticlesTable).set({ publishedData: row.data, deleteRequested: false })
      .where(eq(ainovexArticlesTable.id, row.id));
    return;
  }
  if (preview.kind === "category") {
    const [row] = await db.select().from(ainovexCategoriesTable)
      .where(eq(ainovexCategoriesTable.id, preview.resourceId ?? "")).limit(1);
    if (!row) throw new Error("The source draft was removed after the GitHub commit.");
    if (preview.removeResource) {
      await db.delete(ainovexCategoriesTable).where(eq(ainovexCategoriesTable.id, row.id));
    } else {
      await db.update(ainovexCategoriesTable).set({ publishedData: row.data, deleteRequested: false })
        .where(eq(ainovexCategoriesTable.id, row.id));
    }
    return;
  }
  const config = await getSiteConfig();
  if (preview.kind === "ads") {
    await db.update(ainovexSiteConfigTable).set({ publishedAds: adsSnapshot(config) })
      .where(eq(ainovexSiteConfigTable.id, 1));
  } else {
    await db.update(ainovexSiteConfigTable).set({ publishedData: siteSnapshot(config) })
      .where(eq(ainovexSiteConfigTable.id, 1));
  }
}

router.post("/publishing/previews", requireSecureRequest, async (req, res) => {
  const parsed = CreatePublishPreviewBody.safeParse(req.body);
  if (!parsed.success || !validateGithubInput(parsed.data.username, parsed.data.personalAccessToken)) {
    res.status(400).json({ error: "Enter a valid GitHub username and personal access token." });
    return;
  }

  const adminUserId = (req as AdminRequest).adminUserId;
  if (!adminUserId) {
    res.status(401).json({ error: "Sign in to continue." });
    return;
  }
  prunePreviews();
  if (pendingPreviews.size >= maxPendingPreviews) {
    res.status(429).json({ error: "Too many publish previews are open. Cancel an existing preview and try again." });
    return;
  }

  const { kind, resourceId, username, personalAccessToken } = parsed.data;
  try {
    const plan = await planChange(kind, resourceId ?? null);
    const branchSha = await verifyRepositoryTarget(personalAccessToken, plan.repository, username);
    const remote = await fetchRemoteFile(personalAccessToken, plan.repository, plan.path);
    const prepared = await prepareContentChange(plan, personalAccessToken, remote);
    const expiresAt = Date.now() + previewTtlMs;
    const id = randomUUID();
    pendingPreviews.set(id, {
      id,
      userId: adminUserId,
      username,
      token: personalAccessToken,
      expiresAt,
      kind: prepared.kind,
      resourceId: prepared.resourceId,
      removeResource: prepared.removeResource,
      repository: prepared.repository,
      branchSha,
      fileSha: remote?.sha ?? null,
      sourceFingerprint: prepared.sourceFingerprint,
      path: prepared.path,
      action: prepared.action,
      oldContent: prepared.oldContent,
      newContent: prepared.newContent,
    });
    const expiryTimer = setTimeout(() => pendingPreviews.delete(id), previewTtlMs);
    expiryTimer.unref();
    const lineCounts = countChangedLines(prepared.oldContent, prepared.newContent);
    res.json({
      previewId: id,
      expiresAt: new Date(expiresAt).toISOString(),
      owner: prepared.repository.owner,
      repository: prepared.repository.repository,
      branch: prepared.repository.branch,
      commitMessage: prepared.repository.commitMessage,
      files: [{
        path: prepared.path,
        action: prepared.action,
        ...lineCounts,
        oldContent: prepared.oldContent,
        newContent: prepared.newContent,
      }],
    });
  } catch (error) {
    const message = previewSafeMessage(error);
    const conflict = /no .*changes|missing from GitHub|already missing|changed after the preview/i.test(message);
    res.status(conflict ? 409 : 400).json({ error: message });
  }
});

router.post("/publishing/previews/:previewId/confirm", requireSecureRequest, async (req, res) => {
  const rawPreviewId = req.params.previewId;
  const previewId = Array.isArray(rawPreviewId) ? rawPreviewId[0] : rawPreviewId;
  const preview = pendingPreviews.get(previewId ?? "");
  const userId = (req as AdminRequest).adminUserId;
  if (!preview || preview.expiresAt <= Date.now()) {
    if (preview) pendingPreviews.delete(preview.id);
    res.status(404).json({ error: "This preview has expired. Create a new preview with fresh credentials." });
    return;
  }
  if (preview.userId !== userId) {
    res.status(404).json({ error: "This publish preview is not available." });
    return;
  }

  try {
    const [currentSettings] = await db.select().from(ainovexGitHubSettingsTable)
      .where(eq(ainovexGitHubSettingsTable.id, 1)).limit(1);
    if (
      !currentSettings ||
      currentSettings.owner !== preview.repository.owner ||
      currentSettings.repository !== preview.repository.repository ||
      currentSettings.branch !== preview.repository.branch ||
      currentSettings.commitMessage !== preview.repository.commitMessage
    ) {
      res.status(409).json({ error: "Repository settings changed after the preview. Create a new preview." });
      return;
    }
    const freshFingerprint = await currentSourceFingerprint(preview);
    if (freshFingerprint !== preview.sourceFingerprint) {
      res.status(409).json({ error: "The source draft changed after the preview. Review a new preview." });
      return;
    }
    const branchSha = await verifyRepositoryTarget(preview.token, preview.repository, preview.username);
    if (branchSha !== preview.branchSha) {
      res.status(409).json({ error: "The GitHub branch changed after the preview. Review a new preview." });
      return;
    }
    const remote = await fetchRemoteFile(preview.token, preview.repository, preview.path);
    if ((remote?.sha ?? null) !== preview.fileSha) {
      res.status(409).json({ error: "The GitHub file changed after the preview. Review a new preview." });
      return;
    }

    const branch = preview.repository.branch;
    const commitMessage = preview.repository.commitMessage.trim() || "Update AINOVEX website";
    let response: Response;
    if (preview.action === "delete") {
      if (!remote) {
        res.status(409).json({ error: "The file is missing from GitHub; the delete was not committed." });
        return;
      }
      response = await githubRequest(
        preview.token,
        `${repoBase(preview.repository)}/contents/${encodePath(preview.path)}`,
        "DELETE",
        { message: commitMessage, sha: remote.sha, branch },
      );
    } else {
      if (preview.newContent === null) {
        res.status(409).json({ error: "The preview has no file content to commit." });
        return;
      }
      response = await githubRequest(
        preview.token,
        `${repoBase(preview.repository)}/contents/${encodePath(preview.path)}`,
        "PUT",
        {
          message: commitMessage,
          content: Buffer.from(preview.newContent, "utf8").toString("base64"),
          branch,
          ...(remote ? { sha: remote.sha } : {}),
        },
      );
    }
    if (!response.ok) {
      res.status(502).json({ error: "GitHub did not accept the commit. The credentials have been discarded; start a new preview." });
      return;
    }

    const commitResponse = asRecord(await response.json());
    const commit = asRecord(commitResponse.commit);
    const commitSha = typeof commit.sha === "string" ? commit.sha : "";
    const commitUrl = typeof commit.html_url === "string" ? commit.html_url : "";
    if (!commitSha || !commitUrl) {
      res.status(502).json({ error: "GitHub accepted the request but did not return a verifiable commit result." });
      return;
    }

    const deployment = await deploymentChecks(preview.token, preview.repository, commitSha);
    let syncMessage = "GitHub commit created.";
    try {
      await synchronizePublishedDraft(preview);
      await db.insert(ainovexPublishHistoryTable).values({
        kind: preview.kind,
        path: preview.path,
        action: preview.action,
        branch: preview.repository.branch,
        commitSha,
        commitUrl,
        deploymentStatus: deployment.status,
        githubStatus: "committed",
        deploymentChecks: deployment.checks,
      });
    } catch {
      syncMessage = "GitHub commit created. The admin draft could not be synchronized; review the source before publishing again.";
    }

    res.json({
      commitSha,
      commitUrl,
      branch,
      path: preview.path,
      action: preview.action,
      githubStatus: "committed",
      deploymentStatus: deployment.status,
      deploymentChecks: deployment.checks,
      message: `${syncMessage} Cloudflare status: ${deployment.status.replaceAll("_", " ")}.`,
    });
  } catch {
    res.status(502).json({ error: "Could not confirm this GitHub publish. The credentials have been discarded; start a new preview." });
  } finally {
    pendingPreviews.delete(preview.id);
  }
});

router.delete("/publishing/previews/:previewId", (req, res) => {
  const previewId = req.params.previewId ?? "";
  const preview = pendingPreviews.get(previewId);
  if (!preview || preview.userId !== (req as AdminRequest).adminUserId) {
    res.status(404).json({ error: "Publish preview not found." });
    return;
  }
  pendingPreviews.delete(previewId);
  res.status(204).send();
});

export default router;
