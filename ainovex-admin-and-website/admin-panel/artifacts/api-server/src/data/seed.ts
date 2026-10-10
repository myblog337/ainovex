import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { db, ainovexArticlesTable, ainovexCategoriesTable, ainovexGitHubSettingsTable, ainovexSiteConfigTable, type ArticleData, type CategoryData, type SiteConfigData, type SiteConfigSnapshot, type AdsConfigSnapshot } from "@workspace/db";
import { parseArticleMarkdown } from "../lib/content-format";

const sourceDirectory = path.dirname(fileURLToPath(import.meta.url));
const initialArticlesDirectory = path.join(sourceDirectory, "seed", "articles");

export async function seedAdminContent(): Promise<void> {
  const articleFiles = (await readdir(initialArticlesDirectory)).filter((name) => name.endsWith(".md")).sort();
  for (const file of articleFiles) {
    const markdown = await readFile(path.join(initialArticlesDirectory, file), "utf8");
    const slug = file.slice(0, -3);
    const data = parseArticleMarkdown(markdown, slug);
    await db.insert(ainovexArticlesTable).values({ slug, data, publishedData: data }).onConflictDoNothing();
  }

  const categoryRows = JSON.parse(
    await readFile(path.join(sourceDirectory, "seed", "categories.json"), "utf8"),
  ) as Array<{ slug: string } & CategoryData>;
  for (const category of categoryRows) {
    await db.insert(ainovexCategoriesTable).values({
      slug: category.slug,
      data: { name: category.name, intro: category.intro },
      publishedData: { name: category.name, intro: category.intro },
    }).onConflictDoNothing();
  }

  const siteConfig = JSON.parse(
    await readFile(path.join(sourceDirectory, "seed", "site-config.json"), "utf8"),
  ) as SiteConfigData;
  const publishedSite: SiteConfigSnapshot = {
    siteUrl: siteConfig.siteUrl,
    name: siteConfig.name,
    tagline: siteConfig.tagline,
    launched: siteConfig.launched,
    ogImage: siteConfig.ogImage,
    analyticsProvider: siteConfig.analyticsProvider,
    analyticsMeasurementId: siteConfig.analyticsMeasurementId,
  };
  const publishedAds: AdsConfigSnapshot = {
    adsenseClient: siteConfig.adsenseClient,
    adsenseSlot: siteConfig.adsenseSlot,
  };
  await db.insert(ainovexSiteConfigTable).values({
    id: 1,
    data: siteConfig,
    publishedData: publishedSite,
    publishedAds,
  }).onConflictDoNothing();
  await db.insert(ainovexGitHubSettingsTable).values({ id: 1 }).onConflictDoNothing();
}
