import { pgTable, serial, text, integer, boolean, timestamp } from "drizzle-orm/pg-core";

export const adsTable = pgTable("ads", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  type: text("type").notNull().default("banner"),
  page: text("page").notNull().default("all"),
  position: text("position").notNull().default("sidebar"),
  title: text("title"),
  description: text("description"),
  imageUrl: text("image_url"),
  videoUrl: text("video_url"),
  redirectUrl: text("redirect_url"),
  adCode: text("ad_code"),
  slotId: text("slot_id"),
  width: integer("width"),
  height: integer("height"),
  network: text("network").notNull().default("custom"),
  sortOrder: integer("sort_order").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const adNetworkCredentialsTable = pgTable("ad_network_credentials", {
  network: text("network").primaryKey(),
  credentials: text("credentials").notNull().default("{}"),
  isEnabled: boolean("is_enabled").notNull().default(false),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});
