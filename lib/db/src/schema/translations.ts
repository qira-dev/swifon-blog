import { pgTable, text, serial, integer, timestamp, unique } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const translationsTable = pgTable("translations", {
  id: serial("id").primaryKey(),
  contentType: text("content_type").notNull(),
  contentId: integer("content_id").notNull(),
  langCode: text("lang_code").notNull(),
  field: text("field").notNull(),
  value: text("value").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
}, (table) => [
  unique().on(table.contentType, table.contentId, table.langCode, table.field),
]);

export const insertTranslationSchema = createInsertSchema(translationsTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertTranslation = z.infer<typeof insertTranslationSchema>;
export type Translation = typeof translationsTable.$inferSelect;
