import { pgTable, text, serial, integer, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const comparisonsTable = pgTable("comparisons", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  categoryId: integer("category_id").notNull(),
  description: text("description"),
  productIds: jsonb("product_ids").$type<number[]>().default([]),
  comparisonFields: jsonb("comparison_fields").$type<string[]>().default([]),
  verdict: text("verdict"),
  metaTitle: text("meta_title"),
  metaDescription: text("meta_description"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertComparisonSchema = createInsertSchema(comparisonsTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertComparison = z.infer<typeof insertComparisonSchema>;
export type Comparison = typeof comparisonsTable.$inferSelect;
