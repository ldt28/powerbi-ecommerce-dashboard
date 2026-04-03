import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, decimal, date } from "drizzle-orm/mysql-core";

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

// Advanced Analytics Tables

// Anomaly Detection Alerts
export const anomalyAlerts = mysqlTable("anomaly_alerts", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  metricName: varchar("metricName", { length: 128 }).notNull(), // revenue, orders, conversion_rate, etc.
  anomalyType: mysqlEnum("anomalyType", ["spike", "drop", "trend_change"]).notNull(),
  severity: mysqlEnum("severity", ["low", "medium", "high"]).default("medium").notNull(),
  expectedValue: decimal("expectedValue", { precision: 15, scale: 2 }),
  actualValue: decimal("actualValue", { precision: 15, scale: 2 }).notNull(),
  deviation: decimal("deviation", { precision: 10, scale: 2 }), // percentage deviation
  detectedAt: timestamp("detectedAt").defaultNow().notNull(),
  isResolved: int("isResolved").default(0).notNull(),
  resolvedAt: timestamp("resolvedAt"),
  notes: text("notes"),
});

export type AnomalyAlert = typeof anomalyAlerts.$inferSelect;
export type InsertAnomalyAlert = typeof anomalyAlerts.$inferInsert;

// Forecasting and Predictions
export const predictions = mysqlTable("predictions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  metricName: varchar("metricName", { length: 128 }).notNull(),
  predictionDate: date("predictionDate").notNull(),
  predictedValue: decimal("predictedValue", { precision: 15, scale: 2 }).notNull(),
  confidenceInterval: decimal("confidenceInterval", { precision: 5, scale: 2 }), // 95%, 90%, etc.
  lowerBound: decimal("lowerBound", { precision: 15, scale: 2 }),
  upperBound: decimal("upperBound", { precision: 15, scale: 2 }),
  modelType: varchar("modelType", { length: 64 }), // linear, exponential, arima, etc.
  accuracy: decimal("accuracy", { precision: 5, scale: 2 }), // model accuracy percentage
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Prediction = typeof predictions.$inferSelect;
export type InsertPrediction = typeof predictions.$inferInsert;

// Cohort Analysis
export const cohorts = mysqlTable("cohorts", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  cohortName: varchar("cohortName", { length: 255 }).notNull(),
  cohortType: mysqlEnum("cohortType", ["acquisition_date", "first_purchase_value", "geographic", "demographic", "behavioral"]).notNull(),
  startDate: date("startDate").notNull(),
  endDate: date("endDate"),
  memberCount: int("memberCount").default(0).notNull(),
  retentionRate: decimal("retentionRate", { precision: 5, scale: 2 }), // percentage
  avgLifetimeValue: decimal("avgLifetimeValue", { precision: 15, scale: 2 }),
  avgRepeatPurchases: decimal("avgRepeatPurchases", { precision: 10, scale: 2 }),
  churnRate: decimal("churnRate", { precision: 5, scale: 2 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Cohort = typeof cohorts.$inferSelect;
export type InsertCohort = typeof cohorts.$inferInsert;

// Customer Journey Events (for funnel and journey tracking)
export const customerJourneyEvents = mysqlTable("customer_journey_events", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  customerId: varchar("customerId", { length: 255 }).notNull(),
  eventType: varchar("eventType", { length: 64 }).notNull(), // view, add_to_cart, checkout, purchase, etc.
  eventName: varchar("eventName", { length: 255 }).notNull(),
  eventValue: decimal("eventValue", { precision: 15, scale: 2 }),
  source: varchar("source", { length: 64 }), // organic, paid, direct, referral, etc.
  medium: varchar("medium", { length: 64 }), // email, cpc, social, etc.
  campaign: varchar("campaign", { length: 255 }),
  deviceType: varchar("deviceType", { length: 64 }), // mobile, desktop, tablet
  country: varchar("country", { length: 64 }),
  sessionId: varchar("sessionId", { length: 255 }),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
  metadata: text("metadata"), // JSON stringified additional data
});

export type CustomerJourneyEvent = typeof customerJourneyEvents.$inferSelect;
export type InsertCustomerJourneyEvent = typeof customerJourneyEvents.$inferInsert;

// Attribution Models (stores attribution results)
export const attributionModels = mysqlTable("attribution_models", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  conversionId: varchar("conversionId", { length: 255 }).notNull(),
  customerId: varchar("customerId", { length: 255 }).notNull(),
  modelType: mysqlEnum("modelType", ["first_touch", "last_touch", "linear", "time_decay", "position_based"]).notNull(),
  touchpointCount: int("touchpointCount").default(0).notNull(),
  conversionValue: decimal("conversionValue", { precision: 15, scale: 2 }).notNull(),
  attributedValue: decimal("attributedValue", { precision: 15, scale: 2 }), // value attributed to this conversion
  touchpoints: text("touchpoints"), // JSON array of touchpoint details
  firstTouchSource: varchar("firstTouchSource", { length: 64 }),
  lastTouchSource: varchar("lastTouchSource", { length: 64 }),
  journeyLength: int("journeyLength").default(0).notNull(), // days from first to last touch
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type AttributionModel = typeof attributionModels.$inferSelect;
export type InsertAttributionModel = typeof attributionModels.$inferInsert;

// Funnel Analysis
export const funnelAnalysis = mysqlTable("funnel_analysis", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  funnelName: varchar("funnelName", { length: 255 }).notNull(),
  funnelSteps: text("funnelSteps").notNull(), // JSON array of step names
  totalSessions: int("totalSessions").default(0).notNull(),
  step1Count: int("step1Count").default(0).notNull(),
  step2Count: int("step2Count").default(0).notNull(),
  step3Count: int("step3Count").default(0).notNull(),
  step4Count: int("step4Count").default(0).notNull(),
  step5Count: int("step5Count").default(0).notNull(),
  conversionRate: decimal("conversionRate", { precision: 5, scale: 2 }), // overall conversion percentage
  dropoffRate: decimal("dropoffRate", { precision: 5, scale: 2 }), // overall dropoff percentage
  avgTimeInFunnel: int("avgTimeInFunnel"), // seconds
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type FunnelAnalysis = typeof funnelAnalysis.$inferSelect;
export type InsertFunnelAnalysis = typeof funnelAnalysis.$inferInsert;


// Dashboard Customization Tables

// Dashboard Configurations (stores user's dashboard layout and settings)
export const dashboardConfigs = mysqlTable("dashboard_configs", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  configName: varchar("configName", { length: 255 }).notNull(), // e.g., "Sales Dashboard", "Marketing Dashboard"
  isDefault: int("isDefault").default(0).notNull(),
  layout: text("layout").notNull(), // JSON: { columns: 3, gap: 16, responsive: true }
  metrics: text("metrics").notNull(), // JSON array of metric IDs and their order
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type DashboardConfig = typeof dashboardConfigs.$inferSelect;
export type InsertDashboardConfig = typeof dashboardConfigs.$inferInsert;

// Metric Cards (stores customization for individual metric cards)
export const metricCards = mysqlTable("metric_cards", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  configId: int("configId").notNull(), // references dashboardConfigs
  metricKey: varchar("metricKey", { length: 255 }).notNull(), // e.g., "total_revenue", "orders"
  metricName: varchar("metricName", { length: 255 }).notNull(),
  isVisible: int("isVisible").default(1).notNull(),
  cardColor: varchar("cardColor", { length: 7 }).default("#ffffff").notNull(), // hex color
  backgroundColor: varchar("backgroundColor", { length: 7 }).default("#f5f5f5").notNull(),
  textColor: varchar("textColor", { length: 7 }).default("#000000").notNull(),
  cardSize: mysqlEnum("cardSize", ["small", "medium", "large"]).default("medium").notNull(),
  showTrend: int("showTrend").default(1).notNull(),
  showComparison: int("showComparison").default(0).notNull(),
  comparisonPeriod: mysqlEnum("comparisonPeriod", ["day", "week", "month", "quarter", "year"]).default("month"),
  sortOrder: int("sortOrder").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type MetricCard = typeof metricCards.$inferSelect;
export type InsertMetricCard = typeof metricCards.$inferInsert;

// Metric Filters (stores calculation customization like date ranges, filters)
export const metricFilters = mysqlTable("metric_filters", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  metricCardId: int("metricCardId").notNull(), // references metricCards
  filterType: mysqlEnum("filterType", ["date_range", "category", "region", "product", "custom"]).notNull(),
  filterValue: text("filterValue").notNull(), // JSON: { startDate, endDate } or array of values
  isActive: int("isActive").default(1).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type MetricFilter = typeof metricFilters.$inferSelect;
export type InsertMetricFilter = typeof metricFilters.$inferInsert;

// Metric Thresholds (stores alert thresholds and targets)
export const metricThresholds = mysqlTable("metric_thresholds", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  metricCardId: int("metricCardId").notNull(), // references metricCards
  targetValue: decimal("targetValue", { precision: 15, scale: 2 }),
  warningThreshold: decimal("warningThreshold", { precision: 15, scale: 2 }), // yellow alert
  criticalThreshold: decimal("criticalThreshold", { precision: 15, scale: 2 }), // red alert
  thresholdType: mysqlEnum("thresholdType", ["above", "below", "range"]).default("above").notNull(),
  alertEnabled: int("alertEnabled").default(1).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type MetricThreshold = typeof metricThresholds.$inferSelect;
export type InsertMetricThreshold = typeof metricThresholds.$inferInsert;

// Dashboard Templates (pre-built configurations users can save/load)
export const dashboardTemplates = mysqlTable("dashboard_templates", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  templateName: varchar("templateName", { length: 255 }).notNull(),
  templateDescription: text("templateDescription"),
  templateConfig: text("templateConfig").notNull(), // JSON: full dashboard configuration
  isPublic: int("isPublic").default(0).notNull(), // can be shared with team
  usageCount: int("usageCount").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type DashboardTemplate = typeof dashboardTemplates.$inferSelect;
export type InsertDashboardTemplate = typeof dashboardTemplates.$inferInsert;

// Dashboard Export History (tracks exports for audit and recovery)
export const dashboardExports = mysqlTable("dashboard_exports", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  configId: int("configId").notNull(), // references dashboardConfigs
  exportFormat: mysqlEnum("exportFormat", ["csv", "pdf", "json"]).notNull(),
  fileName: varchar("fileName", { length: 255 }).notNull(),
  fileSize: int("fileSize"), // bytes
  fileUrl: text("fileUrl"), // S3 URL
  exportedAt: timestamp("exportedAt").defaultNow().notNull(),
});
export type DashboardExport = typeof dashboardExports.$inferSelect;
export type InsertDashboardExport = typeof dashboardExports.$inferInsert;

// Dashboard Alerts (triggered when thresholds are breached)
export const dashboardAlerts = mysqlTable("dashboard_alerts", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  metricCardId: int("metricCardId").notNull(), // references metricCards
  alertType: mysqlEnum("alertType", ["warning", "critical"]).notNull(),
  currentValue: decimal("currentValue", { precision: 15, scale: 2 }).notNull(),
  thresholdValue: decimal("thresholdValue", { precision: 15, scale: 2 }).notNull(),
  message: text("message"),
  isResolved: int("isResolved").default(0).notNull(),
  resolvedAt: timestamp("resolvedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type DashboardAlert = typeof dashboardAlerts.$inferSelect;
export type InsertDashboardAlert = typeof dashboardAlerts.$inferInsert;
