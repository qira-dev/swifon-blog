import { pgTable, integer, primaryKey, timestamp } from "drizzle-orm/pg-core";

export const postTagsTable = pgTable("post_tags", {
  postId: integer("post_id").notNull(),
  tagId: integer("tag_id").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  primaryKey({ columns: [table.postId, table.tagId] }),
]);
