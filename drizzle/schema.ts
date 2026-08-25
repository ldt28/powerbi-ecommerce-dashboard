import { int, sqliteTable, text, real, index } from "drizzle-orm/sqlite-core";

/**
 * SQLite schema — full port of the original MySQL schema.
 * - Timestamps → TEXT (ISO-8601)
 * - decimal → real
 * - mysqlEnum → text with enum list
 * - No .onUpdateNow() — handled at app layer
 */

// ─── Users ────────────────────────────────────────────────────────────────────

export const users = sqliteTable("users", {
  id: int("id").primaryKey({ autoIncrement: true }),
  openId: text("openId").notNull().unique(),
  name: text("name"),
  email: text("email"),
  loginMethod: text("loginMethod"),
  role: text("role", { enum: ["user", "admin"] }).default("user").notNull(),
  isSuspended: int("isSuspended").default(0).notNull(),
  suspendedAt: text("suspendedAt"),
  suspendedReason: text("suspendedReason"),
  passwordResetToken: text("passwordResetToken"),
  passwordResetExpiry: text("passwordResetExpiry"),
  createdAt: text("createdAt").notNull().$defaultFn(() => new Date().toISOString()),
  updatedAt: text("updatedAt").notNull().$defaultFn(() => new Date().toISOString()),
  lastSignedIn: text("lastSignedIn").notNull().$defaultFn(() => new Date().toISOString()),
});
export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// ─── Platform Credentials (new — real API keys) ───────────────────────────────

export const platformCredentials = sqliteTable("platform_credentials", {
  id: int("id").primaryKey({ autoIncrement: true }),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  platform: text("platform").notNull(),
  label: text("label").notNull(),
  credential1: text("credential1"),
  credential2: text("credential2"),
  credential3: text("credential3"),
  credential4: text("credential4"),
  credential5: text("credential5"),
  isActive: int("isActive").default(1).notNull(),
  lastTestedAt: text("lastTestedAt"),
  lastTestStatus: text("lastTestStatus"),
  lastTestError: text("lastTestError"),
  lastSyncedAt: text("lastSyncedAt"),
  createdAt: text("createdAt").notNull().$defaultFn(() => new Date().toISOString()),
  updatedAt: text("updatedAt").notNull().$defaultFn(() => new Date().toISOString()),
}, (t) => ({
  pcUserPlatformIdx: index("pc_user_platform_idx").on(t.userId, t.platform),
}));
export type PlatformCredential = typeof platformCredentials.$inferSelect;
export type InsertPlatformCredential = typeof platformCredentials.$inferInsert;

// ─── API Credentials (legacy) ─────────────────────────────────────────────────

export const apiCredentials = sqliteTable("api_credentials", {
  id: int("id").primaryKey({ autoIncrement: true }),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  marketplace: text("marketplace").notNull(),
  apiKey: text("apiKey").notNull(),
  apiSecret: text("apiSecret"),
  accessToken: text("accessToken"),
  refreshToken: text("refreshToken"),
  isActive: int("isActive").default(1).notNull(),
  lastSyncedAt: text("lastSyncedAt"),
  createdAt: text("createdAt").notNull().$defaultFn(() => new Date().toISOString()),
  updatedAt: text("updatedAt").notNull().$defaultFn(() => new Date().toISOString()),
}, (t) => ({ userIdIdx: index("api_cred_user_id_idx").on(t.userId) }));
export type ApiCredential = typeof apiCredentials.$inferSelect;
export type InsertApiCredential = typeof apiCredentials.$inferInsert;

// ─── API Connections ──────────────────────────────────────────────────────────

export const apiConnections = sqliteTable("api_connections", {
  id: int("id").primaryKey({ autoIncrement: true }),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  platform: text("platform").notNull(),
  connectionName: text("connectionName").notNull(),
  connectionType: text("connectionType").notNull(),
  accessToken: text("accessToken"),
  refreshToken: text("refreshToken"),
  expiresAt: text("expiresAt"),
  accountId: text("accountId"),
  accountEmail: text("accountEmail"),
  accountName: text("accountName"),
  isActive: int("isActive").default(1).notNull(),
  lastSyncedAt: text("lastSyncedAt"),
  syncStatus: text("syncStatus").default("idle"),
  syncError: text("syncError"),
  metadata: text("metadata"),
  createdAt: text("createdAt").notNull().$defaultFn(() => new Date().toISOString()),
  updatedAt: text("updatedAt").notNull().$defaultFn(() => new Date().toISOString()),
}, (t) => ({ userIdIdx: index("ac_user_id_idx").on(t.userId) }));
export type ApiConnection = typeof apiConnections.$inferSelect;
export type InsertApiConnection = typeof apiConnections.$inferInsert;

// ─── Sales / Ad data ──────────────────────────────────────────────────────────

export const salesData = sqliteTable("sales_data", {
  id: int("id").primaryKey({ autoIncrement: true }),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  orderId: text("orderId").notNull(),
  marketplace: text("marketplace").notNull(),
  productSku: text("productSku"),
  productName: text("productName"),
  quantity: int("quantity").default(1).notNull(),
  unitPrice: real("unitPrice").notNull(),
  revenue: real("revenue").notNull(),
  cogs: real("cogs"),
  profit: real("profit"),
  orderDate: text("orderDate").notNull(),
  createdAt: text("createdAt").notNull().$defaultFn(() => new Date().toISOString()),
  updatedAt: text("updatedAt").notNull().$defaultFn(() => new Date().toISOString()),
}, (t) => ({
  userIdIdx: index("sd_user_id_idx").on(t.userId),
  userOrderDateIdx: index("sd_user_order_date_idx").on(t.userId, t.orderDate),
}));
export type SalesData = typeof salesData.$inferSelect;
export type InsertSalesData = typeof salesData.$inferInsert;

export const adSpendData = sqliteTable("ad_spend_data", {
  id: int("id").primaryKey({ autoIncrement: true }),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  marketplace: text("marketplace").notNull(),
  adSpend: real("adSpend").notNull(),
  impressions: int("impressions").default(0).notNull(),
  clicks: int("clicks").default(0).notNull(),
  conversions: int("conversions").default(0).notNull(),
  revenueFromAds: real("revenueFromAds").notNull(),
  date: text("date").notNull(),
  createdAt: text("createdAt").notNull().$defaultFn(() => new Date().toISOString()),
  updatedAt: text("updatedAt").notNull().$defaultFn(() => new Date().toISOString()),
}, (t) => ({
  userIdIdx: index("asd_user_id_idx").on(t.userId),
  userDateIdx: index("asd_user_date_idx").on(t.userId, t.date),
}));
export type AdSpendData = typeof adSpendData.$inferSelect;
export type InsertAdSpendData = typeof adSpendData.$inferInsert;

export const dataSyncLog = sqliteTable("data_sync_log", {
  id: int("id").primaryKey({ autoIncrement: true }),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  marketplace: text("marketplace").notNull(),
  syncType: text("syncType").notNull(),
  status: text("status").notNull(),
  recordsProcessed: int("recordsProcessed").default(0),
  errorMessage: text("errorMessage"),
  syncedAt: text("syncedAt").notNull().$defaultFn(() => new Date().toISOString()),
  createdAt: text("createdAt").notNull().$defaultFn(() => new Date().toISOString()),
}, (t) => ({ userIdIdx: index("dsl_user_id_idx").on(t.userId) }));
export type DataSyncLog = typeof dataSyncLog.$inferSelect;
export type InsertDataSyncLog = typeof dataSyncLog.$inferInsert;

// ─── Cached platform data (new) ───────────────────────────────────────────────

export const cachedSalesData = sqliteTable("cached_sales_data", {
  id: int("id").primaryKey({ autoIncrement: true }),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  platform: text("platform").notNull(),
  orderId: text("orderId").notNull(),
  orderDate: text("orderDate").notNull(),
  revenue: real("revenue").notNull(),
  quantity: int("quantity").default(1).notNull(),
  productName: text("productName"),
  currency: text("currency").default("USD"),
  syncedAt: text("syncedAt").notNull().$defaultFn(() => new Date().toISOString()),
}, (t) => ({
  csdUserPlatformIdx: index("csd_user_platform_idx").on(t.userId, t.platform),
  csdUserDateIdx: index("csd_user_date_idx").on(t.userId, t.orderDate),
}));
export type CachedSalesData = typeof cachedSalesData.$inferSelect;
export type InsertCachedSalesData = typeof cachedSalesData.$inferInsert;

export const cachedAdSpendData = sqliteTable("cached_ad_spend_data", {
  id: int("id").primaryKey({ autoIncrement: true }),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  platform: text("platform").notNull(),
  date: text("date").notNull(),
  spend: real("spend").notNull(),
  impressions: int("impressions").default(0),
  clicks: int("clicks").default(0),
  conversions: int("conversions").default(0),
  revenue: real("revenue").default(0),
  currency: text("currency").default("USD"),
  syncedAt: text("syncedAt").notNull().$defaultFn(() => new Date().toISOString()),
}, (t) => ({
  casdUserPlatformIdx: index("casd_user_platform_idx").on(t.userId, t.platform),
  casdUserDateIdx: index("casd_user_date_idx").on(t.userId, t.date),
}));
export type CachedAdSpendData = typeof cachedAdSpendData.$inferSelect;
export type InsertCachedAdSpendData = typeof cachedAdSpendData.$inferInsert;

// ─── OAuth2 Tokens ────────────────────────────────────────────────────────────

export const oauth2Tokens = sqliteTable("oauth2_tokens", {
  id: int("id").primaryKey({ autoIncrement: true }),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  platform: text("platform").notNull(),
  accessToken: text("accessToken").notNull(),
  refreshToken: text("refreshToken"),
  idToken: text("idToken"),
  tokenType: text("tokenType").default("Bearer").notNull(),
  expiresAt: text("expiresAt").notNull(),
  scope: text("scope"),
  state: text("state"),
  codeVerifier: text("codeVerifier"),
  accountId: text("accountId").notNull(),
  accountEmail: text("accountEmail"),
  accountName: text("accountName"),
  profilePicture: text("profilePicture"),
  isActive: int("isActive").default(1).notNull(),
  lastRefreshedAt: text("lastRefreshedAt"),
  refreshAttempts: int("refreshAttempts").default(0).notNull(),
  lastRefreshError: text("lastRefreshError"),
  createdAt: text("createdAt").notNull().$defaultFn(() => new Date().toISOString()),
  updatedAt: text("updatedAt").notNull().$defaultFn(() => new Date().toISOString()),
}, (t) => ({
  userIdIdx: index("ot_user_id_idx").on(t.userId),
  userPlatformIdx: index("ot_user_platform_idx").on(t.userId, t.platform),
}));
export type OAuth2Token = typeof oauth2Tokens.$inferSelect;
export type InsertOAuth2Token = typeof oauth2Tokens.$inferInsert;

// ─── Admin Audit Log ─────────────────────────────────────────────────────────

export const adminAuditLog = sqliteTable("admin_audit_log", {
  id: int("id").primaryKey({ autoIncrement: true }),
  adminId: int("adminId").notNull().references(() => users.id),
  action: text("action").notNull(),
  targetUserId: int("targetUserId").references(() => users.id),
  details: text("details"),
  timestamp: text("timestamp").notNull().$defaultFn(() => new Date().toISOString()),
}, (t) => ({
  adminIdIdx: index("aal_admin_id_idx").on(t.adminId),
  targetUserIdIdx: index("aal_target_user_id_idx").on(t.targetUserId),
}));
export type AdminAuditLog = typeof adminAuditLog.$inferSelect;
export type InsertAdminAuditLog = typeof adminAuditLog.$inferInsert;

// ─── Teams ────────────────────────────────────────────────────────────────────

export const teams = sqliteTable("teams", {
  id: int("id").primaryKey({ autoIncrement: true }),
  ownerId: int("ownerId").notNull().references(() => users.id),
  name: text("name").notNull(),
  description: text("description"),
  createdAt: text("createdAt").notNull().$defaultFn(() => new Date().toISOString()),
  updatedAt: text("updatedAt").notNull().$defaultFn(() => new Date().toISOString()),
}, (t) => ({ ownerIdIdx: index("teams_owner_id_idx").on(t.ownerId) }));
export type Team = typeof teams.$inferSelect;
export type InsertTeam = typeof teams.$inferInsert;

export const teamMembers = sqliteTable("team_members", {
  id: int("id").primaryKey({ autoIncrement: true }),
  teamId: int("teamId").notNull().references(() => teams.id, { onDelete: "cascade" }),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  role: text("role", { enum: ["admin", "editor", "viewer"] }).default("viewer").notNull(),
  joinedAt: text("joinedAt").notNull().$defaultFn(() => new Date().toISOString()),
  invitedBy: int("invitedBy").references(() => users.id),
  invitedAt: text("invitedAt"),
  acceptedAt: text("acceptedAt"),
  status: text("status", { enum: ["pending", "accepted", "rejected"] }).default("pending").notNull(),
}, (t) => ({
  teamIdIdx: index("tm_team_id_idx").on(t.teamId),
  userIdIdx: index("tm_user_id_idx").on(t.userId),
  teamUserIdx: index("tm_team_user_idx").on(t.teamId, t.userId),
}));
export type TeamMember = typeof teamMembers.$inferSelect;
export type InsertTeamMember = typeof teamMembers.$inferInsert;

export const teamInvitations = sqliteTable("team_invitations", {
  id: int("id").primaryKey({ autoIncrement: true }),
  teamId: int("teamId").notNull().references(() => teams.id, { onDelete: "cascade" }),
  email: text("email").notNull(),
  role: text("role", { enum: ["admin", "editor", "viewer"] }).default("viewer").notNull(),
  token: text("token").notNull().unique(),
  invitedBy: int("invitedBy").notNull().references(() => users.id),
  invitedAt: text("invitedAt").notNull().$defaultFn(() => new Date().toISOString()),
  expiresAt: text("expiresAt").notNull(),
  acceptedAt: text("acceptedAt"),
  status: text("status", { enum: ["pending", "accepted", "expired"] }).default("pending").notNull(),
}, (t) => ({
  teamIdIdx: index("ti_team_id_idx").on(t.teamId),
  invitedByIdx: index("ti_invited_by_idx").on(t.invitedBy),
}));
export type TeamInvitation = typeof teamInvitations.$inferSelect;
export type InsertTeamInvitation = typeof teamInvitations.$inferInsert;

export const activityLog = sqliteTable("activity_log", {
  id: int("id").primaryKey({ autoIncrement: true }),
  teamId: int("teamId").notNull().references(() => teams.id, { onDelete: "cascade" }),
  userId: int("userId").notNull().references(() => users.id),
  action: text("action").notNull(),
  resourceType: text("resourceType"),
  resourceId: int("resourceId"),
  details: text("details"),
  ipAddress: text("ipAddress"),
  userAgent: text("userAgent"),
  timestamp: text("timestamp").notNull().$defaultFn(() => new Date().toISOString()),
}, (t) => ({
  teamIdIdx: index("al_team_id_idx").on(t.teamId),
  userIdIdx: index("al_user_id_idx").on(t.userId),
  teamTimestampIdx: index("al_team_timestamp_idx").on(t.teamId, t.timestamp),
}));
export type ActivityLog = typeof activityLog.$inferSelect;
export type InsertActivityLog = typeof activityLog.$inferInsert;

export const teamRoles = sqliteTable("team_roles", {
  id: int("id").primaryKey({ autoIncrement: true }),
  teamId: int("teamId").notNull().references(() => teams.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  description: text("description"),
  permissions: text("permissions").notNull(),
  isDefault: int("isDefault").default(0).notNull(),
  createdAt: text("createdAt").notNull().$defaultFn(() => new Date().toISOString()),
  updatedAt: text("updatedAt").notNull().$defaultFn(() => new Date().toISOString()),
}, (t) => ({ teamIdIdx: index("tr_team_id_idx").on(t.teamId) }));
export type TeamRole = typeof teamRoles.$inferSelect;
export type InsertTeamRole = typeof teamRoles.$inferInsert;

export const teamActivityLog = sqliteTable("team_activity_log", {
  id: int("id").primaryKey({ autoIncrement: true }),
  teamId: int("teamId").notNull().references(() => teams.id, { onDelete: "cascade" }),
  userId: int("userId").notNull().references(() => users.id),
  action: text("action").notNull(),
  resourceType: text("resourceType").notNull(),
  resourceId: int("resourceId"),
  details: text("details"),
  ipAddress: text("ipAddress"),
  userAgent: text("userAgent"),
  createdAt: text("createdAt").notNull().$defaultFn(() => new Date().toISOString()),
}, (t) => ({
  teamIdIdx: index("tal_team_id_idx").on(t.teamId),
  userIdIdx: index("tal_user_id_idx").on(t.userId),
  teamCreatedAtIdx: index("tal_team_created_at_idx").on(t.teamId, t.createdAt),
}));
export type TeamActivityLog = typeof teamActivityLog.$inferSelect;
export type InsertTeamActivityLog = typeof teamActivityLog.$inferInsert;

// ─── Dashboards ───────────────────────────────────────────────────────────────

export const customDashboards = sqliteTable("custom_dashboards", {
  id: int("id").primaryKey({ autoIncrement: true }),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  teamId: int("teamId").references(() => teams.id, { onDelete: "set null" }),
  name: text("name").notNull(),
  description: text("description"),
  layout: text("layout").notNull(),
  widgets: text("widgets").notNull(),
  isPublic: int("isPublic").default(0).notNull(),
  isTemplate: int("isTemplate").default(0).notNull(),
  templateCategory: text("templateCategory"),
  viewCount: int("viewCount").default(0).notNull(),
  lastViewedAt: text("lastViewedAt"),
  createdAt: text("createdAt").notNull().$defaultFn(() => new Date().toISOString()),
  updatedAt: text("updatedAt").notNull().$defaultFn(() => new Date().toISOString()),
}, (t) => ({
  userIdIdx: index("cd_user_id_idx").on(t.userId),
  teamIdIdx: index("cd_team_id_idx").on(t.teamId),
}));
export type CustomDashboard = typeof customDashboards.$inferSelect;
export type InsertCustomDashboard = typeof customDashboards.$inferInsert;

export const dashboardSharing = sqliteTable("dashboard_sharing", {
  id: int("id").primaryKey({ autoIncrement: true }),
  dashboardId: int("dashboardId").notNull().references(() => customDashboards.id, { onDelete: "cascade" }),
  sharedWithUserId: int("sharedWithUserId").references(() => users.id, { onDelete: "set null" }),
  sharedWithTeamId: int("sharedWithTeamId").references(() => teams.id, { onDelete: "set null" }),
  permission: text("permission", { enum: ["view", "edit", "admin"] }).default("view").notNull(),
  sharedBy: int("sharedBy").notNull().references(() => users.id),
  createdAt: text("createdAt").notNull().$defaultFn(() => new Date().toISOString()),
}, (t) => ({
  dashboardIdIdx: index("ds_dashboard_id_idx").on(t.dashboardId),
  sharedWithUserIdIdx: index("ds_shared_with_user_idx").on(t.sharedWithUserId),
  sharedWithTeamIdIdx: index("ds_shared_with_team_idx").on(t.sharedWithTeamId),
}));
export type DashboardSharing = typeof dashboardSharing.$inferSelect;
export type InsertDashboardSharing = typeof dashboardSharing.$inferInsert;

export const sharedDashboards = sqliteTable("shared_dashboards", {
  id: int("id").primaryKey({ autoIncrement: true }),
  teamId: int("teamId").notNull().references(() => teams.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  description: text("description"),
  createdBy: int("createdBy").notNull().references(() => users.id),
  config: text("config"),
  isPublic: int("isPublic").default(0).notNull(),
  viewCount: int("viewCount").default(0).notNull(),
  lastViewedAt: text("lastViewedAt"),
  createdAt: text("createdAt").notNull().$defaultFn(() => new Date().toISOString()),
  updatedAt: text("updatedAt").notNull().$defaultFn(() => new Date().toISOString()),
}, (t) => ({
  teamIdIdx: index("sda_team_id_idx").on(t.teamId),
  createdByIdx: index("sda_created_by_idx").on(t.createdBy),
}));
export type SharedDashboard = typeof sharedDashboards.$inferSelect;
export type InsertSharedDashboard = typeof sharedDashboards.$inferInsert;

export const dashboardAccess = sqliteTable("dashboard_access", {
  id: int("id").primaryKey({ autoIncrement: true }),
  dashboardId: int("dashboardId").notNull().references(() => customDashboards.id, { onDelete: "cascade" }),
  userId: int("userId").references(() => users.id, { onDelete: "set null" }),
  teamId: int("teamId").references(() => teams.id, { onDelete: "set null" }),
  role: text("role", { enum: ["viewer", "editor", "owner"] }).default("viewer").notNull(),
  grantedBy: int("grantedBy").notNull().references(() => users.id),
  grantedAt: text("grantedAt").notNull().$defaultFn(() => new Date().toISOString()),
}, (t) => ({
  dashboardIdIdx: index("da_dashboard_id_idx").on(t.dashboardId),
  userIdIdx: index("da_user_id_idx").on(t.userId),
  teamIdIdx: index("da_team_id_idx").on(t.teamId),
}));
export type DashboardAccess = typeof dashboardAccess.$inferSelect;
export type InsertDashboardAccess = typeof dashboardAccess.$inferInsert;

// ─── Dashboard Customization ──────────────────────────────────────────────────

export const dashboardConfigs = sqliteTable("dashboard_configs", {
  id: int("id").primaryKey({ autoIncrement: true }),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  configName: text("configName").notNull(),
  isDefault: int("isDefault").default(0).notNull(),
  layout: text("layout").notNull(),
  metrics: text("metrics").notNull(),
  createdAt: text("createdAt").notNull().$defaultFn(() => new Date().toISOString()),
  updatedAt: text("updatedAt").notNull().$defaultFn(() => new Date().toISOString()),
}, (t) => ({ userIdIdx: index("dc_user_id_idx").on(t.userId) }));
export type DashboardConfig = typeof dashboardConfigs.$inferSelect;
export type InsertDashboardConfig = typeof dashboardConfigs.$inferInsert;

export const metricCards = sqliteTable("metric_cards", {
  id: int("id").primaryKey({ autoIncrement: true }),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  configId: int("configId").notNull().references(() => dashboardConfigs.id, { onDelete: "cascade" }),
  metricKey: text("metricKey").notNull(),
  metricName: text("metricName").notNull(),
  isVisible: int("isVisible").default(1).notNull(),
  cardColor: text("cardColor").default("#ffffff").notNull(),
  backgroundColor: text("backgroundColor").default("#f5f5f5").notNull(),
  textColor: text("textColor").default("#000000").notNull(),
  cardSize: text("cardSize", { enum: ["small", "medium", "large"] }).default("medium").notNull(),
  showTrend: int("showTrend").default(1).notNull(),
  showComparison: int("showComparison").default(0).notNull(),
  comparisonPeriod: text("comparisonPeriod", { enum: ["day", "week", "month", "quarter", "year"] }).default("month"),
  sortOrder: int("sortOrder").default(0).notNull(),
  createdAt: text("createdAt").notNull().$defaultFn(() => new Date().toISOString()),
  updatedAt: text("updatedAt").notNull().$defaultFn(() => new Date().toISOString()),
}, (t) => ({
  userIdIdx: index("mc_user_id_idx").on(t.userId),
  configIdIdx: index("mc_config_id_idx").on(t.configId),
}));
export type MetricCard = typeof metricCards.$inferSelect;
export type InsertMetricCard = typeof metricCards.$inferInsert;

export const metricFilters = sqliteTable("metric_filters", {
  id: int("id").primaryKey({ autoIncrement: true }),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  metricCardId: int("metricCardId").notNull().references(() => metricCards.id, { onDelete: "cascade" }),
  filterType: text("filterType", { enum: ["date_range", "category", "region", "product", "custom"] }).notNull(),
  filterValue: text("filterValue").notNull(),
  isActive: int("isActive").default(1).notNull(),
  createdAt: text("createdAt").notNull().$defaultFn(() => new Date().toISOString()),
}, (t) => ({
  userIdIdx: index("mf_user_id_idx").on(t.userId),
  metricCardIdIdx: index("mf_metric_card_id_idx").on(t.metricCardId),
}));
export type MetricFilter = typeof metricFilters.$inferSelect;
export type InsertMetricFilter = typeof metricFilters.$inferInsert;

export const metricThresholds = sqliteTable("metric_thresholds", {
  id: int("id").primaryKey({ autoIncrement: true }),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  metricCardId: int("metricCardId").notNull().references(() => metricCards.id, { onDelete: "cascade" }),
  targetValue: real("targetValue"),
  warningThreshold: real("warningThreshold"),
  criticalThreshold: real("criticalThreshold"),
  thresholdType: text("thresholdType", { enum: ["above", "below", "range"] }).default("above").notNull(),
  alertEnabled: int("alertEnabled").default(1).notNull(),
  createdAt: text("createdAt").notNull().$defaultFn(() => new Date().toISOString()),
  updatedAt: text("updatedAt").notNull().$defaultFn(() => new Date().toISOString()),
}, (t) => ({
  userIdIdx: index("mt_user_id_idx").on(t.userId),
  metricCardIdIdx: index("mt_metric_card_id_idx").on(t.metricCardId),
}));
export type MetricThreshold = typeof metricThresholds.$inferSelect;
export type InsertMetricThreshold = typeof metricThresholds.$inferInsert;

export const dashboardTemplates = sqliteTable("dashboard_templates", {
  id: int("id").primaryKey({ autoIncrement: true }),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  templateName: text("templateName").notNull(),
  templateDescription: text("templateDescription"),
  templateConfig: text("templateConfig").notNull(),
  isPublic: int("isPublic").default(0).notNull(),
  usageCount: int("usageCount").default(0).notNull(),
  createdAt: text("createdAt").notNull().$defaultFn(() => new Date().toISOString()),
  updatedAt: text("updatedAt").notNull().$defaultFn(() => new Date().toISOString()),
}, (t) => ({ userIdIdx: index("dt_user_id_idx").on(t.userId) }));
export type DashboardTemplate = typeof dashboardTemplates.$inferSelect;
export type InsertDashboardTemplate = typeof dashboardTemplates.$inferInsert;

export const dashboardExports = sqliteTable("dashboard_exports", {
  id: int("id").primaryKey({ autoIncrement: true }),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  configId: int("configId").notNull().references(() => dashboardConfigs.id, { onDelete: "cascade" }),
  exportFormat: text("exportFormat", { enum: ["csv", "pdf", "json"] }).notNull(),
  fileName: text("fileName").notNull(),
  fileSize: int("fileSize"),
  fileUrl: text("fileUrl"),
  exportedAt: text("exportedAt").notNull().$defaultFn(() => new Date().toISOString()),
}, (t) => ({
  userIdIdx: index("de_user_id_idx").on(t.userId),
  configIdIdx: index("de_config_id_idx").on(t.configId),
}));
export type DashboardExport = typeof dashboardExports.$inferSelect;
export type InsertDashboardExport = typeof dashboardExports.$inferInsert;

export const dashboardAlerts = sqliteTable("dashboard_alerts", {
  id: int("id").primaryKey({ autoIncrement: true }),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  metricCardId: int("metricCardId").notNull().references(() => metricCards.id, { onDelete: "cascade" }),
  alertType: text("alertType", { enum: ["warning", "critical"] }).notNull(),
  currentValue: real("currentValue").notNull(),
  thresholdValue: real("thresholdValue").notNull(),
  message: text("message"),
  isResolved: int("isResolved").default(0).notNull(),
  resolvedAt: text("resolvedAt"),
  createdAt: text("createdAt").notNull().$defaultFn(() => new Date().toISOString()),
}, (t) => ({
  userIdIdx: index("da2_user_id_idx").on(t.userId),
  metricCardIdIdx: index("da2_metric_card_id_idx").on(t.metricCardId),
}));
export type DashboardAlert = typeof dashboardAlerts.$inferSelect;
export type InsertDashboardAlert = typeof dashboardAlerts.$inferInsert;

export const dashboardWidgets = sqliteTable("dashboard_widgets", {
  id: int("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  type: text("type").notNull(),
  category: text("category").notNull(),
  description: text("description"),
  icon: text("icon"),
  defaultConfig: text("defaultConfig").notNull(),
  isActive: int("isActive").default(1).notNull(),
  createdAt: text("createdAt").notNull().$defaultFn(() => new Date().toISOString()),
  updatedAt: text("updatedAt").notNull().$defaultFn(() => new Date().toISOString()),
});
export type DashboardWidget = typeof dashboardWidgets.$inferSelect;
export type InsertDashboardWidget = typeof dashboardWidgets.$inferInsert;

export const exportSchedules = sqliteTable("export_schedules", {
  id: int("id").primaryKey({ autoIncrement: true }),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  format: text("format", { enum: ["csv", "excel", "pdf"] }).notNull(),
  frequency: text("frequency", { enum: ["daily", "weekly", "monthly"] }).notNull(),
  dayOfWeek: int("dayOfWeek"),
  dayOfMonth: int("dayOfMonth"),
  time: text("time").notNull(),
  emailRecipients: text("emailRecipients").notNull(),
  includeMetrics: text("includeMetrics").notNull(),
  isActive: int("isActive").default(1).notNull(),
  lastRunAt: text("lastRunAt"),
  nextRunAt: text("nextRunAt"),
  createdAt: text("createdAt").notNull().$defaultFn(() => new Date().toISOString()),
  updatedAt: text("updatedAt").notNull().$defaultFn(() => new Date().toISOString()),
}, (t) => ({ userIdIdx: index("es_user_id_idx").on(t.userId) }));
export type ExportSchedule = typeof exportSchedules.$inferSelect;
export type InsertExportSchedule = typeof exportSchedules.$inferInsert;

// ─── Advanced Analytics ───────────────────────────────────────────────────────

export const anomalyAlerts = sqliteTable("anomaly_alerts", {
  id: int("id").primaryKey({ autoIncrement: true }),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  metricName: text("metricName").notNull(),
  anomalyType: text("anomalyType", { enum: ["spike", "drop", "trend_change"] }).notNull(),
  severity: text("severity", { enum: ["low", "medium", "high"] }).default("medium").notNull(),
  expectedValue: real("expectedValue"),
  actualValue: real("actualValue").notNull(),
  deviation: real("deviation"),
  detectedAt: text("detectedAt").notNull().$defaultFn(() => new Date().toISOString()),
  isResolved: int("isResolved").default(0).notNull(),
  resolvedAt: text("resolvedAt"),
  notes: text("notes"),
}, (t) => ({
  userIdIdx: index("aa_user_id_idx").on(t.userId),
  detectedAtIdx: index("aa_detected_at_idx").on(t.detectedAt),
}));
export type AnomalyAlert = typeof anomalyAlerts.$inferSelect;
export type InsertAnomalyAlert = typeof anomalyAlerts.$inferInsert;

export const predictions = sqliteTable("predictions", {
  id: int("id").primaryKey({ autoIncrement: true }),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  metricName: text("metricName").notNull(),
  predictionDate: text("predictionDate").notNull(),
  predictedValue: real("predictedValue").notNull(),
  confidenceInterval: real("confidenceInterval"),
  lowerBound: real("lowerBound"),
  upperBound: real("upperBound"),
  modelType: text("modelType"),
  accuracy: real("accuracy"),
  createdAt: text("createdAt").notNull().$defaultFn(() => new Date().toISOString()),
}, (t) => ({
  userIdIdx: index("p_user_id_idx").on(t.userId),
  userPredDateIdx: index("p_user_pred_date_idx").on(t.userId, t.predictionDate),
}));
export type Prediction = typeof predictions.$inferSelect;
export type InsertPrediction = typeof predictions.$inferInsert;

export const cohorts = sqliteTable("cohorts", {
  id: int("id").primaryKey({ autoIncrement: true }),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  cohortName: text("cohortName").notNull(),
  cohortType: text("cohortType", { enum: ["acquisition_date", "first_purchase_value", "geographic", "demographic", "behavioral"] }).notNull(),
  startDate: text("startDate").notNull(),
  endDate: text("endDate"),
  memberCount: int("memberCount").default(0).notNull(),
  retentionRate: real("retentionRate"),
  avgLifetimeValue: real("avgLifetimeValue"),
  avgRepeatPurchases: real("avgRepeatPurchases"),
  churnRate: real("churnRate"),
  createdAt: text("createdAt").notNull().$defaultFn(() => new Date().toISOString()),
  updatedAt: text("updatedAt").notNull().$defaultFn(() => new Date().toISOString()),
}, (t) => ({
  userIdIdx: index("c_user_id_idx").on(t.userId),
  startDateIdx: index("c_start_date_idx").on(t.startDate),
}));
export type Cohort = typeof cohorts.$inferSelect;
export type InsertCohort = typeof cohorts.$inferInsert;

export const customerJourneyEvents = sqliteTable("customer_journey_events", {
  id: int("id").primaryKey({ autoIncrement: true }),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  customerId: text("customerId").notNull(),
  eventType: text("eventType").notNull(),
  eventName: text("eventName").notNull(),
  eventValue: real("eventValue"),
  source: text("source"),
  medium: text("medium"),
  campaign: text("campaign"),
  deviceType: text("deviceType"),
  country: text("country"),
  sessionId: text("sessionId"),
  timestamp: text("timestamp").notNull().$defaultFn(() => new Date().toISOString()),
  metadata: text("metadata"),
}, (t) => ({
  userIdIdx: index("cje_user_id_idx").on(t.userId),
  userTimestampIdx: index("cje_user_timestamp_idx").on(t.userId, t.timestamp),
  customerIdIdx: index("cje_customer_id_idx").on(t.customerId),
}));
export type CustomerJourneyEvent = typeof customerJourneyEvents.$inferSelect;
export type InsertCustomerJourneyEvent = typeof customerJourneyEvents.$inferInsert;

export const attributionModels = sqliteTable("attribution_models", {
  id: int("id").primaryKey({ autoIncrement: true }),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  conversionId: text("conversionId").notNull(),
  customerId: text("customerId").notNull(),
  modelType: text("modelType", { enum: ["first_touch", "last_touch", "linear", "time_decay", "position_based"] }).notNull(),
  touchpointCount: int("touchpointCount").default(0).notNull(),
  conversionValue: real("conversionValue").notNull(),
  attributedValue: real("attributedValue"),
  touchpoints: text("touchpoints"),
  firstTouchSource: text("firstTouchSource"),
  lastTouchSource: text("lastTouchSource"),
  journeyLength: int("journeyLength").default(0).notNull(),
  createdAt: text("createdAt").notNull().$defaultFn(() => new Date().toISOString()),
}, (t) => ({ userIdIdx: index("am_user_id_idx").on(t.userId) }));
export type AttributionModel = typeof attributionModels.$inferSelect;
export type InsertAttributionModel = typeof attributionModels.$inferInsert;

export const funnelAnalysis = sqliteTable("funnel_analysis", {
  id: int("id").primaryKey({ autoIncrement: true }),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  funnelName: text("funnelName").notNull(),
  funnelSteps: text("funnelSteps").notNull(),
  totalSessions: int("totalSessions").default(0).notNull(),
  step1Count: int("step1Count").default(0).notNull(),
  step2Count: int("step2Count").default(0).notNull(),
  step3Count: int("step3Count").default(0).notNull(),
  step4Count: int("step4Count").default(0).notNull(),
  step5Count: int("step5Count").default(0).notNull(),
  conversionRate: real("conversionRate"),
  dropoffRate: real("dropoffRate"),
  avgTimeInFunnel: int("avgTimeInFunnel"),
  createdAt: text("createdAt").notNull().$defaultFn(() => new Date().toISOString()),
  updatedAt: text("updatedAt").notNull().$defaultFn(() => new Date().toISOString()),
}, (t) => ({ userIdIdx: index("fa_user_id_idx").on(t.userId) }));
export type FunnelAnalysis = typeof funnelAnalysis.$inferSelect;
export type InsertFunnelAnalysis = typeof funnelAnalysis.$inferInsert;

// ─── User Preferences ─────────────────────────────────────────────────────────

export const userPreferences = sqliteTable("user_preferences", {
  id: int("id").primaryKey({ autoIncrement: true }),
  userId: int("userId").notNull().unique().references(() => users.id, { onDelete: "cascade" }),
  theme: text("theme", { enum: ["light", "dark", "auto"] }).default("auto").notNull(),
  timezone: text("timezone").default("UTC").notNull(),
  language: text("language").default("en").notNull(),
  dateFormat: text("dateFormat").default("MM/DD/YYYY").notNull(),
  currencySymbol: text("currencySymbol").default("$").notNull(),
  emailNotifications: int("emailNotifications").default(1).notNull(),
  slackNotifications: int("slackNotifications").default(0).notNull(),
  slackWebhookUrl: text("slackWebhookUrl"),
  defaultDashboardId: int("defaultDashboardId").references(() => customDashboards.id, { onDelete: "set null" }),
  itemsPerPage: int("itemsPerPage").default(20).notNull(),
  autoRefreshInterval: int("autoRefreshInterval").default(300).notNull(),
  createdAt: text("createdAt").notNull().$defaultFn(() => new Date().toISOString()),
  updatedAt: text("updatedAt").notNull().$defaultFn(() => new Date().toISOString()),
}, (t) => ({ defaultDashboardIdIdx: index("up_default_dashboard_id_idx").on(t.defaultDashboardId) }));
export type UserPreference = typeof userPreferences.$inferSelect;
export type InsertUserPreference = typeof userPreferences.$inferInsert;
