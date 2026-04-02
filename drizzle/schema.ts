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
  isSuspended: int("isSuspended").default(0).notNull(),
  suspendedAt: timestamp("suspendedAt"),
  suspendedReason: text("suspendedReason"),
  passwordResetToken: varchar("passwordResetToken", { length: 255 }),
  passwordResetExpiry: timestamp("passwordResetExpiry"),
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

// API Connections table for managing various platform integrations
export const apiConnections = mysqlTable("api_connections", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  platform: varchar("platform", { length: 64 }).notNull(),
  connectionName: varchar("connectionName", { length: 255 }).notNull(),
  connectionType: varchar("connectionType", { length: 64 }).notNull(),
  accessToken: text("accessToken"),
  refreshToken: text("refreshToken"),
  expiresAt: timestamp("expiresAt"),
  accountId: varchar("accountId", { length: 255 }),
  accountEmail: varchar("accountEmail", { length: 320 }),
  accountName: varchar("accountName", { length: 255 }),
  isActive: int("isActive").default(1).notNull(),
  lastSyncedAt: timestamp("lastSyncedAt"),
  syncStatus: varchar("syncStatus", { length: 64 }).default("idle"),
  syncError: text("syncError"),
  metadata: text("metadata"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ApiConnection = typeof apiConnections.$inferSelect;
export type InsertApiConnection = typeof apiConnections.$inferInsert;

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

// OAuth2 Tokens table for secure token storage and management
export const oauth2Tokens = mysqlTable("oauth2_tokens", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  platform: varchar("platform", { length: 64 }).notNull(), // google, facebook, linkedin, tiktok
  accessToken: text("accessToken").notNull(),
  refreshToken: text("refreshToken"),
  idToken: text("idToken"), // For OpenID Connect providers
  tokenType: varchar("tokenType", { length: 32 }).default("Bearer").notNull(),
  expiresAt: timestamp("expiresAt").notNull(),
  scope: text("scope"), // Space-separated list of scopes
  state: varchar("state", { length: 255 }), // CSRF protection state
  codeVerifier: varchar("codeVerifier", { length: 255 }), // PKCE code verifier
  accountId: varchar("accountId", { length: 255 }).notNull(),
  accountEmail: varchar("accountEmail", { length: 320 }),
  accountName: varchar("accountName", { length: 255 }),
  profilePicture: text("profilePicture"),
  isActive: int("isActive").default(1).notNull(),
  lastRefreshedAt: timestamp("lastRefreshedAt"),
  refreshAttempts: int("refreshAttempts").default(0).notNull(),
  lastRefreshError: text("lastRefreshError"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type OAuth2Token = typeof oauth2Tokens.$inferSelect;
export type InsertOAuth2Token = typeof oauth2Tokens.$inferInsert;

// Admin Audit Log table for tracking admin actions
export const adminAuditLog = mysqlTable("admin_audit_log", {
  id: int("id").autoincrement().primaryKey(),
  adminId: int("adminId").notNull(),
  action: varchar("action", { length: 64 }).notNull(), // SUSPEND_USER, UNSUSPEND_USER, RESET_PASSWORD, CHANGE_ROLE, DELETE_USER
  targetUserId: int("targetUserId"),
  details: text("details"), // JSON stringified details
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

export type AdminAuditLog = typeof adminAuditLog.$inferSelect;
export type InsertAdminAuditLog = typeof adminAuditLog.$inferInsert;

// Team Management table
export const teams = mysqlTable("teams", {
  id: int("id").autoincrement().primaryKey(),
  ownerId: int("ownerId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Team = typeof teams.$inferSelect;
export type InsertTeam = typeof teams.$inferInsert;

// Team Members table
export const teamMembers = mysqlTable("team_members", {
  id: int("id").autoincrement().primaryKey(),
  teamId: int("teamId").notNull(),
  userId: int("userId").notNull(),
  role: mysqlEnum("role", ["admin", "editor", "viewer"]).default("viewer").notNull(),
  joinedAt: timestamp("joinedAt").defaultNow().notNull(),
  invitedBy: int("invitedBy"),
  invitedAt: timestamp("invitedAt"),
  acceptedAt: timestamp("acceptedAt"),
  status: mysqlEnum("status", ["pending", "accepted", "rejected"]).default("pending").notNull(),
});

export type TeamMember = typeof teamMembers.$inferSelect;
export type InsertTeamMember = typeof teamMembers.$inferInsert;

// Team Invitations table
export const teamInvitations = mysqlTable("team_invitations", {
  id: int("id").autoincrement().primaryKey(),
  teamId: int("teamId").notNull(),
  email: varchar("email", { length: 320 }).notNull(),
  role: mysqlEnum("role", ["admin", "editor", "viewer"]).default("viewer").notNull(),
  token: varchar("token", { length: 255 }).notNull().unique(),
  invitedBy: int("invitedBy").notNull(),
  invitedAt: timestamp("invitedAt").defaultNow().notNull(),
  expiresAt: timestamp("expiresAt").notNull(),
  acceptedAt: timestamp("acceptedAt"),
  status: mysqlEnum("status", ["pending", "accepted", "expired"]).default("pending").notNull(),
});

export type TeamInvitation = typeof teamInvitations.$inferSelect;
export type InsertTeamInvitation = typeof teamInvitations.$inferInsert;

// Activity Log table for tracking team actions
export const activityLog = mysqlTable("activity_log", {
  id: int("id").autoincrement().primaryKey(),
  teamId: int("teamId").notNull(),
  userId: int("userId").notNull(),
  action: varchar("action", { length: 64 }).notNull(), // VIEW_DASHBOARD, EDIT_DASHBOARD, EXPORT_DATA, CONNECT_PLATFORM, etc.
  resourceType: varchar("resourceType", { length: 64 }), // dashboard, report, connection, etc.
  resourceId: int("resourceId"),
  details: text("details"), // JSON stringified details
  ipAddress: varchar("ipAddress", { length: 45 }),
  userAgent: text("userAgent"),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

export type ActivityLog = typeof activityLog.$inferSelect;
export type InsertActivityLog = typeof activityLog.$inferInsert;

// Shared Dashboards table
export const sharedDashboards = mysqlTable("shared_dashboards", {
  id: int("id").autoincrement().primaryKey(),
  teamId: int("teamId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  createdBy: int("createdBy").notNull(),
  config: text("config"), // JSON stringified dashboard configuration
  isPublic: int("isPublic").default(0).notNull(),
  viewCount: int("viewCount").default(0).notNull(),
  lastViewedAt: timestamp("lastViewedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type SharedDashboard = typeof sharedDashboards.$inferSelect;
export type InsertSharedDashboard = typeof sharedDashboards.$inferInsert;

// Dashboard Access Control table
export const dashboardAccess = mysqlTable("dashboard_access", {
  id: int("id").autoincrement().primaryKey(),
  dashboardId: int("dashboardId").notNull(),
  userId: int("userId"),
  teamId: int("teamId"),
  role: mysqlEnum("role", ["viewer", "editor", "owner"]).default("viewer").notNull(),
  grantedBy: int("grantedBy").notNull(),
  grantedAt: timestamp("grantedAt").defaultNow().notNull(),
});

export type DashboardAccess = typeof dashboardAccess.$inferSelect;
export type InsertDashboardAccess = typeof dashboardAccess.$inferInsert;
