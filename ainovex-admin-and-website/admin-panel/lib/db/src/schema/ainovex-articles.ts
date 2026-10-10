import { createInsertSchema } from "drizzle-zod";
import { boolean, jsonb, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { z } from "zod/v4";

export type ArticleData = {
  title: string;
  description: string;
  category: string;
  author: string;
  date: string;
  updated: string | null;
  featured: boolean;
  cornerstone: boolean;
  primaryKeyword: string;
  related: string[];
  faq: boolean;
  image: string;
  imageAlt: string;
  body: string;
  extraFrontmatter: Record<string, unknown>;
};

export const ainovexArticlesTable = pgTable("ainovex_articles", {
  id: uuid("id").defaultRandom().primaryKey(),
  slug: text("slug").notNull().unique(),
  data: jsonb("data").$type<ArticleData>().notNull(),
  publishedData: jsonb("published_data").$type<ArticleData | null>(),
  deleteRequested: boolean("delete_requested").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertAinovexArticleSchema = createInsertSchema(ainovexArticlesTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertAinovexArticle = z.infer<typeof insertAinovexArticleSchema>;
export type AinovexArticle = typeof ainovexArticlesTable.$inferSelect;
