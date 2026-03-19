import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, decimal } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// API Credentials table
export const apiCredentials = mysqlTable("api_credentials", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  marketplace: varchar("marketplace", { length: 64 }).notNull(),
  apiKey: text("apiKey").notNull(),
  apiSecret: text("apiSecret"),
  accessToken: text("accessToken"),
  refreshToken: text("refreshToken"),
  isActive: int("isActive").default(1).notNull(),
  lastSyncedAt: timestamp("lastSyncedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ApiCredential = typeof apiCredentials.$inferSelect;
export type InsertApiCredential = typeof apiCredentials.$inferInsert;

// Sales Data table
export const salesData = mysqlTable("sales_data", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  orderId: varchar("orderId", { length: 128 }).notNull(),
  marketplace: varchar("marketplace", { length: 64 }).notNull(),
  productSku: varchar("productSku", { length: 128 }),
  productName: text("productName"),
  quantity: int("quantity").default(1).notNull(),
  unitPrice: decimal("unitPrice", { precision: 10, scale: 2 }).notNull(),
  revenue: decimal("revenue", { precision: 12, scale: 2 }).notNull(),
  cogs: decimal("cogs", { precision: 12, scale: 2 }),
  profit: decimal("profit", { precision: 12, scale: 2 }),
  orderDate: timestamp("orderDate").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type SalesData = typeof salesData.$inferSelect;
export type InsertSalesData = typeof salesData.$inferInsert;

// Ad Spend Data table
export const adSpendData = mysqlTable("ad_spend_data", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  marketplace: varchar("marketplace", { length: 64 }).notNull(),
  adSpend: decimal("adSpend", { precision: 12, scale: 2 }).notNull(),
  impressions: int("impressions").default(0).notNull(),
  clicks: int("clicks").default(0).notNull(),
  conversions: int("conversions").default(0).notNull(),
  revenueFromAds: decimal("revenueFromAds", { precision: 12, scale: 2 }).notNull(),
  date: timestamp("date").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type AdSpendData = typeof adSpendData.$inferSelect;
export type InsertAdSpendData = typeof adSpendData.$inferInsert;

// Data Sync Log table
export const dataSyncLog = mysqlTable("data_sync_log", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  marketplace: varchar("marketplace", { length: 64 }).notNull(),
  syncType: varchar("syncType", { length: 64 }).notNull(),
  status: varchar("status", { length: 32 }).notNull(),
  recordsProcessed: int("recordsProcessed").default(0),
  errorMessage: text("errorMessage"),
  syncedAt: timestamp("syncedAt").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type DataSyncLog = typeof dataSyncLog.$inferSelect;
export type InsertDataSyncLog = typeof dataSyncLog.$inferInsert;
