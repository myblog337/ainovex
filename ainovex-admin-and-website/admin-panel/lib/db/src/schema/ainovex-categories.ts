import { createInsertSchema } from "drizzle-zod";
import { boolean, jsonb, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { z } from "zod/v4";

export type CategoryData = {
  name: string;
  intro: string;
};

export const ainovexCategoriesTable = pgTable("ainovex_categories", {
  id: uuid("id").defaultRandom().primaryKey(),
  slug: text("slug").notNull().unique(),
  data: jsonb("data").$type<CategoryData>().notNull(),
  publishedData: jsonb("published_data").$type<CategoryData | null>(),
  deleteRequested: boolean("delete_requested").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertAinovexCategorySchema = createInsertSchema(ainovexCategoriesTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertAinovexCategory = z.infer<typeof insertAinovexCategorySchema>;
export type AinovexCategory = typeof ainovexCategoriesTable.$inferSelect;
