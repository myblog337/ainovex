import { createInsertSchema } from "drizzle-zod";
import { boolean, integer, jsonb, pgTable, smallint, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { z } from "zod/v4";

export type SiteConfigData = {
  siteUrl: string;
  name: string;
  tagline: string;
  launched: boolean;
  ogImage: string;
  analyticsProvider: "" | "google-analytics";
  analyticsMeasurementId: string;
  adsenseClient: string;
  adsenseSlot: string;
};

export type SiteConfigSnapshot = Pick<
  SiteConfigData,
  "siteUrl" | "name" | "tagline" | "launched" | "ogImage" | "analyticsProvider" | "analyticsMeasurementId"
>;

export type AdsConfigSnapshot = Pick<SiteConfigData, "adsenseClient" | "adsenseSlot">;

export type DeploymentCheckData = {
  context: string;
  state: "success" | "failure" | "error" | "pending";
  targetUrl: string;
};

export const ainovexGitHubSettingsTable = pgTable("ainovex_github_settings", {
  id: smallint("id").primaryKey().default(1),
  owner: text("owner").notNull().default(""),
  repository: text("repository").notNull().default(""),
  branch: text("branch").notNull().default("main"),
  commitMessage: text("commit_message").notNull().default("Update AINOVEX website"),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const ainovexSiteConfigTable = pgTable("ainovex_site_config", {
  id: smallint("id").primaryKey().default(1),
  data: jsonb("data").$type<SiteConfigData>().notNull(),
  publishedData: jsonb("published_data").$type<SiteConfigSnapshot | null>(),
  publishedAds: jsonb("published_ads").$type<AdsConfigSnapshot | null>(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const ainovexPublishHistoryTable = pgTable("ainovex_publish_history", {
  id: uuid("id").defaultRandom().primaryKey(),
  kind: text("kind").notNull(),
  path: text("path").notNull(),
  action: text("action").notNull(),
  branch: text("branch").notNull(),
  commitSha: text("commit_sha").notNull(),
  commitUrl: text("commit_url").notNull(),
  deploymentStatus: text("deployment_status").notNull(),
  githubStatus: text("github_status").notNull().default("committed"),
  deploymentChecks: jsonb("deployment_checks").$type<DeploymentCheckData[]>().notNull().default([]),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertAinovexGitHubSettingsSchema = createInsertSchema(ainovexGitHubSettingsTable);
export const insertAinovexSiteConfigSchema = createInsertSchema(ainovexSiteConfigTable);
export const insertAinovexPublishHistorySchema = createInsertSchema(ainovexPublishHistoryTable).omit({
  id: true,
  createdAt: true,
});

export type InsertAinovexGitHubSettings = z.infer<typeof insertAinovexGitHubSettingsSchema>;
export type InsertAinovexSiteConfig = z.infer<typeof insertAinovexSiteConfigSchema>;
export type InsertAinovexPublishHistory = z.infer<typeof insertAinovexPublishHistorySchema>;
export type AinovexGitHubSettings = typeof ainovexGitHubSettingsTable.$inferSelect;
export type AinovexSiteConfig = typeof ainovexSiteConfigTable.$inferSelect;
export type AinovexPublishHistory = typeof ainovexPublishHistoryTable.$inferSelect;
