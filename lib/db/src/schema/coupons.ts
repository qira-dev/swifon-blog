import { pgTable, serial, text, integer, boolean, timestamp } from "drizzle-orm/pg-core";

export const couponsTable = pgTable("coupons", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  code: text("code").notNull(),
  category: text("category").notNull().default("Other"),
  type: text("type").notNull().default("percentage"),
  discount: text("discount"),
  description: text("description"),
  terms: text("terms"),
  logoUrl: text("logo_url"),
  websiteUrl: text("website_url"),
  affiliateUrl: text("affiliate_url"),
  expiresAt: timestamp("expires_at"),
  isActive: boolean("is_active").notNull().default(true),
  isVerified: boolean("is_verified").notNull().default(false),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const couponAdsTable = pgTable("coupon_ads", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  couponId: integer("coupon_id"),
  type: text("type").notNull().default("banner"),
  title: text("title"),
  description: text("description"),
  imageUrl: text("image_url"),
  redirectUrl: text("redirect_url"),
  adCode: text("ad_code"),
  width: integer("width"),
  height: integer("height"),
  isActive: boolean("is_active").notNull().default(true),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});
