import { and, desc, eq } from "drizzle-orm";
import { Router, type IRouter, type Response } from "express";
import {
  CreateArticleBody,
  CreateCategoryBody,
  SaveGitHubSettingsBody,
  SaveSiteConfigBody,
  UpdateArticleBody,
  UpdateCategoryBody,
} from "@workspace/api-zod";
import {
  ainovexArticlesTable,
  ainovexCategoriesTable,
  ainovexGitHubSettingsTable,
  ainovexPublishHistoryTable,
  ainovexSiteConfigTable,
  db,
  type ArticleData,
  type AdsConfigSnapshot,
  type CategoryData,
  type SiteConfigSnapshot,
  type SiteConfigData,
} from "@workspace/db";
import type { AdminRequest } from "../middlewares/adminAuth";
import { requireSameOrigin } from "../middlewares/adminAuth";

const router: IRouter = Router();

function stableJson(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(stableJson).join(",")}]`;
  if (value && typeof value === "object") {
    const entries = Object.entries(value as Record<string, unknown>)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, child]) => `${JSON.stringify(key)}:${stableJson(child)}`);
    return `{${entries.join(",")}}`;
  }
  return JSON.stringify(value);
}

export function jsonEqual(left: unknown, right: unknown): boolean {
  return stableJson(left) === stableJson(right);
}

export function isValidSlug(slug: string): boolean {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug);
}

function toArticle(row: typeof ainovexArticlesTable.$inferSelect) {
  return {
    id: row.id,
    slug: row.slug,
    ...row.data,
    isPublished: row.publishedData !== null,
    isDirty: row.publishedData === null || row.deleteRequested || !jsonEqual(row.data, row.publishedData),
    deleteRequested: row.deleteRequested,
  };
}

function toCategory(row: typeof ainovexCategoriesTable.$inferSelect) {
  return {
    id: row.id,
    slug: row.slug,
    ...row.data,
    isPublished: row.publishedData !== null,
    isDirty: row.publishedData === null || row.deleteRequested || !jsonEqual(row.data, row.publishedData),
    deleteRequested: row.deleteRequested,
  };
}

function toHistory(row: typeof ainovexPublishHistoryTable.$inferSelect) {
  return {
    id: row.id,
    kind: row.kind as "article" | "category" | "site-config" | "ads",
    path: row.path,
    action: row.action as "create" | "update" | "delete",
    branch: row.branch,
    commitSha: row.commitSha,
    commitUrl: row.commitUrl,
    githubStatus: row.githubStatus as "committed",
    deploymentStatus: row.deploymentStatus as "reported_success" | "reported_failure" | "pending" | "unreported",
    deploymentChecks: row.deploymentChecks,
    createdAt: row.createdAt.toISOString(),
  };
}

function routeError(res: Response, message: string, status = 400) {
  res.status(status).json({ error: message });
}

function inputError(res: Response) {
  routeError(res, "The supplied information is invalid. Check the fields and try again.");
}

function validGithubSettings(input: {
  owner: string;
  repository: string;
  branch: string;
  commitMessage: string;
}): boolean {
  return (
    /^[A-Za-z\d](?:[A-Za-z\d-]{0,38})$/.test(input.owner) &&
    /^[A-Za-z\d_.-]{1,100}$/.test(input.repository) &&
    input.repository !== "." &&
    input.repository !== ".." &&
    input.branch.length <= 100 &&
    !input.branch.startsWith("/") &&
    !input.branch.endsWith("/") &&
    !input.branch.endsWith(".lock") &&
    !input.branch.includes("..") &&
    !input.branch.includes("//") &&
    !/[\s~^:?*\[\]\\]/.test(input.branch) &&
    input.commitMessage.length <= 200
  );
}

export function siteConfigSnapshot(data: SiteConfigData): SiteConfigSnapshot {
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

export function adsConfigSnapshot(data: SiteConfigData): AdsConfigSnapshot {
  return { adsenseClient: data.adsenseClient, adsenseSlot: data.adsenseSlot };
}

function siteConfigStatus(row: typeof ainovexSiteConfigTable.$inferSelect) {
  const siteDirty = row.publishedData === null || !jsonEqual(
    siteConfigSnapshot(row.data),
    row.publishedData,
  );
  const adsDirty = row.publishedAds === null || !jsonEqual(
    adsConfigSnapshot(row.data),
    row.publishedAds,
  );
  return { isDirty: siteDirty || adsDirty, siteDirty, adsDirty };
}

function validSiteConfig(input: SiteConfigData): boolean {
  let url: URL;
  try {
    url = new URL(input.siteUrl);
  } catch {
    return false;
  }
  const secureUrl = url.protocol === "https:" && !url.username && !url.password;
  const adsenseComplete = (input.adsenseClient === "") === (input.adsenseSlot === "");
  const analyticsComplete =
    input.analyticsProvider === "" ||
    input.analyticsMeasurementId === "" ||
    /^G-[A-Z\d]{6,14}$/i.test(input.analyticsMeasurementId);
  const safeImage =
    input.ogImage === "" ||
    /^\/[A-Za-z0-9/_-]+\.(?:png|jpe?g|webp|svg)$/i.test(input.ogImage) ||
    /^https:\/\/[^\s]+$/i.test(input.ogImage);
  return secureUrl && adsenseComplete && analyticsComplete && safeImage;
}

function isValidCalendarDate(value: string | null | undefined): boolean {
  if (value == null || value === "") return true;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const timestamp = Date.parse(`${value}T00:00:00Z`);
  return Number.isFinite(timestamp) && new Date(timestamp).toISOString().slice(0, 10) === value;
}

router.use((req, res, next) => {
  if (["POST", "PUT", "PATCH", "DELETE"].includes(req.method)) {
    requireSameOrigin(req, res, next);
    return;
  }
  next();
});

router.get("/session", (req, res) => {
  const admin = req as AdminRequest;
  res.json({ email: admin.adminEmail ?? "", role: "admin" });
});

router.get("/overview", async (_req, res) => {
  try {
    const [articles, categories, siteConfig, github, history] = await Promise.all([
      db.select().from(ainovexArticlesTable),
      db.select().from(ainovexCategoriesTable),
      db.select().from(ainovexSiteConfigTable).where(eq(ainovexSiteConfigTable.id, 1)).limit(1),
      db.select().from(ainovexGitHubSettingsTable).where(eq(ainovexGitHubSettingsTable.id, 1)).limit(1),
      db.select().from(ainovexPublishHistoryTable).orderBy(desc(ainovexPublishHistoryTable.createdAt)).limit(5),
    ]);
    const siteRow = siteConfig[0];
    const githubRow = github[0];
    res.json({
      articleCount: articles.filter((row) => row.publishedData !== null && !row.deleteRequested).length,
      articleDraftCount: articles.filter(
        (row) => row.publishedData === null || row.deleteRequested || !jsonEqual(row.data, row.publishedData),
      ).length,
      categoryCount: categories.filter((row) => row.publishedData !== null && !row.deleteRequested).length,
      categoryDraftCount: categories.filter(
        (row) => row.publishedData === null || row.deleteRequested || !jsonEqual(row.data, row.publishedData),
      ).length,
      siteConfigDraft: Boolean(siteRow && siteConfigStatus(siteRow).isDirty),
      repositoryConfigured: Boolean(githubRow?.owner && githubRow.repository && githubRow.branch),
      recentPublishing: history.map(toHistory),
    });
  } catch {
    routeError(res, "Could not load the admin overview.", 500);
  }
});

router.get("/github-settings", async (_req, res) => {
  try {
    const [row] = await db.select().from(ainovexGitHubSettingsTable)
      .where(eq(ainovexGitHubSettingsTable.id, 1)).limit(1);
    if (!row) {
      routeError(res, "Repository settings are not initialized.", 503);
      return;
    }
    res.json({
      owner: row.owner,
      repository: row.repository,
      branch: row.branch,
      commitMessage: row.commitMessage,
      configured: Boolean(row.owner && row.repository && row.branch),
    });
  } catch {
    routeError(res, "Could not load repository settings.", 500);
  }
});

router.put("/github-settings", async (req, res) => {
  const parsed = SaveGitHubSettingsBody.safeParse(req.body);
  if (!parsed.success || !validGithubSettings(parsed.data)) {
    inputError(res);
    return;
  }
  try {
    const [row] = await db.update(ainovexGitHubSettingsTable)
      .set(parsed.data)
      .where(eq(ainovexGitHubSettingsTable.id, 1))
      .returning();
    if (!row) {
      routeError(res, "Repository settings are not initialized.", 503);
      return;
    }
    res.json({
      owner: row.owner,
      repository: row.repository,
      branch: row.branch,
      commitMessage: row.commitMessage,
      configured: Boolean(row.owner && row.repository && row.branch),
    });
  } catch {
    routeError(res, "Could not save repository settings.", 500);
  }
});

router.get("/articles", async (_req, res) => {
  try {
    const rows = await db.select().from(ainovexArticlesTable).orderBy(desc(ainovexArticlesTable.updatedAt));
    res.json(rows.map(toArticle));
  } catch {
    routeError(res, "Could not load articles.", 500);
  }
});

router.post("/articles", async (req, res) => {
  const parsed = CreateArticleBody.safeParse(req.body);
  if (
    !parsed.success ||
    !isValidSlug(parsed.data.slug) ||
    !isValidCalendarDate(parsed.data.date) ||
    !isValidCalendarDate(parsed.data.updated)
  ) {
    inputError(res);
    return;
  }
  const input = parsed.data;
  try {
    const [category] = await db.select().from(ainovexCategoriesTable)
      .where(and(eq(ainovexCategoriesTable.slug, input.category), eq(ainovexCategoriesTable.deleteRequested, false)))
      .limit(1);
    if (!category) {
      routeError(res, "Choose an existing category before saving this article.", 400);
      return;
    }
    const data: ArticleData = {
      title: input.title,
      description: input.description,
      category: input.category,
      author: input.author || "editorial",
      date: input.date,
      updated: input.updated || null,
      featured: input.featured ?? false,
      cornerstone: input.cornerstone ?? false,
      primaryKeyword: input.primaryKeyword ?? "",
      related: input.related ?? [],
      faq: input.faq ?? false,
      image: input.image ?? "",
      imageAlt: input.imageAlt ?? "",
      body: input.body,
      extraFrontmatter: {},
    };
    const [row] = await db.insert(ainovexArticlesTable).values({ slug: input.slug, data }).returning();
    res.status(201).json(toArticle(row!));
  } catch (error) {
    if ((error as { code?: string })?.code === "23505") {
      routeError(res, "An article with that slug already exists.", 409);
      return;
    }
    routeError(res, "Could not create the article draft.", 500);
  }
});

router.patch("/articles/:id", async (req, res) => {
  const parsed = UpdateArticleBody.safeParse(req.body);
  if (
    !parsed.success ||
    !isValidCalendarDate(parsed.data.date) ||
    !isValidCalendarDate(parsed.data.updated)
  ) {
    inputError(res);
    return;
  }
  try {
    const [row] = await db.select().from(ainovexArticlesTable)
      .where(eq(ainovexArticlesTable.id, req.params.id ?? "")).limit(1);
    if (!row) {
      routeError(res, "Article not found.", 404);
      return;
    }
    const input = parsed.data;
    const [category] = await db.select().from(ainovexCategoriesTable)
      .where(and(eq(ainovexCategoriesTable.slug, input.category), eq(ainovexCategoriesTable.deleteRequested, false)))
      .limit(1);
    if (!category) {
      routeError(res, "Choose an existing category before saving this article.", 400);
      return;
    }
    const data: ArticleData = {
      ...row.data,
      title: input.title,
      description: input.description,
      category: input.category,
      author: input.author ?? row.data.author,
      date: input.date,
      updated: input.updated === undefined ? row.data.updated : input.updated || null,
      featured: input.featured ?? row.data.featured,
      cornerstone: input.cornerstone ?? row.data.cornerstone,
      primaryKeyword: input.primaryKeyword ?? row.data.primaryKeyword,
      related: input.related ?? row.data.related,
      faq: input.faq ?? row.data.faq,
      image: input.image ?? row.data.image,
      imageAlt: input.imageAlt ?? row.data.imageAlt,
      body: input.body,
    };
    const [updated] = await db.update(ainovexArticlesTable)
      .set({ data, deleteRequested: false })
      .where(eq(ainovexArticlesTable.id, row.id))
      .returning();
    res.json(toArticle(updated!));
  } catch {
    routeError(res, "Could not save the article draft.", 500);
  }
});

router.delete("/articles/:id", async (req, res) => {
  try {
    const [row] = await db.select().from(ainovexArticlesTable)
      .where(eq(ainovexArticlesTable.id, req.params.id ?? "")).limit(1);
    if (!row) {
      routeError(res, "Article not found.", 404);
      return;
    }
    if (row.publishedData === null) {
      await db.delete(ainovexArticlesTable).where(eq(ainovexArticlesTable.id, row.id));
      res.json({ id: row.id, requiresPublish: false, message: "Draft removed." });
      return;
    }
    await db.update(ainovexArticlesTable).set({ deleteRequested: true })
      .where(eq(ainovexArticlesTable.id, row.id));
    res.json({
      id: row.id,
      requiresPublish: true,
      message: "Deletion is a draft until an explicit GitHub publish is confirmed.",
    });
  } catch {
    routeError(res, "Could not request article deletion.", 500);
  }
});

router.get("/categories", async (_req, res) => {
  try {
    const rows = await db.select().from(ainovexCategoriesTable).orderBy(ainovexCategoriesTable.slug);
    res.json(rows.map(toCategory));
  } catch {
    routeError(res, "Could not load categories.", 500);
  }
});

router.post("/categories", async (req, res) => {
  const parsed = CreateCategoryBody.safeParse(req.body);
  if (!parsed.success || !isValidSlug(parsed.data.slug)) {
    inputError(res);
    return;
  }
  try {
    const data: CategoryData = { name: parsed.data.name, intro: parsed.data.intro };
    const [row] = await db.insert(ainovexCategoriesTable)
      .values({ slug: parsed.data.slug, data }).returning();
    res.status(201).json(toCategory(row!));
  } catch (error) {
    if ((error as { code?: string })?.code === "23505") {
      routeError(res, "A category with that slug already exists.", 409);
      return;
    }
    routeError(res, "Could not create the category draft.", 500);
  }
});

router.patch("/categories/:id", async (req, res) => {
  const parsed = UpdateCategoryBody.safeParse(req.body);
  if (!parsed.success) {
    inputError(res);
    return;
  }
  try {
    const [row] = await db.select().from(ainovexCategoriesTable)
      .where(eq(ainovexCategoriesTable.id, req.params.id ?? "")).limit(1);
    if (!row) {
      routeError(res, "Category not found.", 404);
      return;
    }
    const data: CategoryData = { name: parsed.data.name, intro: parsed.data.intro };
    const [updated] = await db.update(ainovexCategoriesTable)
      .set({ data, deleteRequested: false })
      .where(eq(ainovexCategoriesTable.id, row.id))
      .returning();
    res.json(toCategory(updated!));
  } catch {
    routeError(res, "Could not save the category draft.", 500);
  }
});

router.delete("/categories/:id", async (req, res) => {
  try {
    const [row] = await db.select().from(ainovexCategoriesTable)
      .where(eq(ainovexCategoriesTable.id, req.params.id ?? "")).limit(1);
    if (!row) {
      routeError(res, "Category not found.", 404);
      return;
    }
    const usedBy = await db.select().from(ainovexArticlesTable);
    if (usedBy.some((item) => item.data.category === row.slug && !item.deleteRequested)) {
      routeError(res, "Move its articles to another category before deleting this category.", 400);
      return;
    }
    if (row.publishedData === null) {
      await db.delete(ainovexCategoriesTable).where(eq(ainovexCategoriesTable.id, row.id));
      res.json({ id: row.id, requiresPublish: false, message: "Draft category removed." });
      return;
    }
    await db.update(ainovexCategoriesTable).set({ deleteRequested: true })
      .where(eq(ainovexCategoriesTable.id, row.id));
    res.json({
      id: row.id,
      requiresPublish: true,
      message: "Deletion is a draft until an explicit GitHub publish is confirmed.",
    });
  } catch {
    routeError(res, "Could not request category deletion.", 500);
  }
});

router.get("/site-config", async (_req, res) => {
  try {
    const [row] = await db.select().from(ainovexSiteConfigTable)
      .where(eq(ainovexSiteConfigTable.id, 1)).limit(1);
    if (!row) {
      routeError(res, "Site settings are not initialized.", 503);
      return;
    }
    res.json({ ...row.data, ...siteConfigStatus(row) });
  } catch {
    routeError(res, "Could not load site settings.", 500);
  }
});

router.put("/site-config", async (req, res) => {
  const parsed = SaveSiteConfigBody.safeParse(req.body);
  if (!parsed.success || !validSiteConfig(parsed.data as SiteConfigData)) {
    inputError(res);
    return;
  }
  try {
    const [row] = await db.update(ainovexSiteConfigTable)
      .set({ data: parsed.data as SiteConfigData })
      .where(eq(ainovexSiteConfigTable.id, 1))
      .returning();
    if (!row) {
      routeError(res, "Site settings are not initialized.", 503);
      return;
    }
    res.json({ ...row.data, ...siteConfigStatus(row) });
  } catch {
    routeError(res, "Could not save site settings.", 500);
  }
});

router.get("/publishing/history", async (_req, res) => {
  try {
    const rows = await db.select().from(ainovexPublishHistoryTable)
      .orderBy(desc(ainovexPublishHistoryTable.createdAt)).limit(50);
    res.json(rows.map(toHistory));
  } catch {
    routeError(res, "Could not load publishing history.", 500);
  }
});

export default router;
