import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

export const auditLogsTable = pgTable("audit_logs", {
  id:           serial("id").primaryKey(),
  actorRole:    text("actor_role").notNull().default("anonymous"),
  actorEmail:   text("actor_email").notNull().default(""),
  action:       text("action").notNull(),
  resourceType: text("resource_type"),
  resourceId:   text("resource_id"),
  details:      text("details"),
  ip:           text("ip"),
  userAgent:    text("user_agent"),
  createdAt:    timestamp("created_at").notNull().defaultNow(),
});
