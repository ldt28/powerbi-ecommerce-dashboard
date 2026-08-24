import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import {
  getSalesDataByUser,
  getAdSpendDataByUser,
  getApiCredentialsByUser,
  insertSalesData,
  insertAdSpendData,
  insertApiCredential,
} from "./db";
import { TRPCError } from "@trpc/server";
import { apiConnectionsRouter } from "./routers/api-connections";
import { adminRouter } from "./routers/admin";
import { dashboardAnalyticsRouter } from "./routers/dashboard-analytics";
import { platformConnectionsRouter } from "./routers/platform-connections";
import { teamRouter } from "./routers/team";
import { advancedAnalyticsRouter } from "./routers/advanced-analytics";
import { dashboardCustomizationRouter } from "./routers/dashboard-customization";
import { webstoreMetricsRouter } from "./routers/webstore-metrics";
import { exportRouter } from "./routers/export";
import { marketplaceComparisonRouter } from "./routers/marketplace-comparison";
import { exportSchedulingRouter } from "./routers/export-scheduling";
import { searchFiltersRouter } from "./routers/search-filters";
import { teamsRouter } from "./routers/teams";
import { dashboardsRouter } from "./routers/dashboards";
import { bigcommerceRouter } from "./routers/bigcommerce";
import { dashboardSharingRouter } from "./routers/dashboard-sharing";
import { rbacManagementRouter } from "./routers/rbac-management";
import { teamInvitationsRouter, teamManagementRouter } from "./routers/team-management";
import { activityLogsRouter } from "./routers/activity-logs";
import { analyticsAggregationRouter } from "./routers/analytics-aggregation";
import { notificationsRouter } from "./routers/notifications";
import { oauth2Router } from "./routers/oauth2";
import { realtimeRouter } from "./routers/realtime";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // Dashboard data routers
  dashboard: router({
    // Get sales data for dashboard
    getSalesData: protectedProcedure
      .input(
        z.object({
          startDate: z.date().optional(),
          endDate: z.date().optional(),
        })
      )
      .query(async ({ ctx, input }) => {
        try {
          const data = await getSalesDataByUser(ctx.user.id, input.startDate, input.endDate);
          return data;
        } catch (error) {
          console.error("Error fetching sales data:", error);
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to fetch sales data" });
        }
      }),

    // Get ad spend data for dashboard
    getAdSpendData: protectedProcedure
      .input(
        z.object({
          startDate: z.date().optional(),
          endDate: z.date().optional(),
        })
      )
      .query(async ({ ctx, input }) => {
        try {
          const data = await getAdSpendDataByUser(ctx.user.id, input.startDate, input.endDate);
          return data;
        } catch (error) {
          console.error("Error fetching ad spend data:", error);
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to fetch ad spend data" });
        }
      }),

    // Add sales data (manual entry)
    addSalesData: protectedProcedure
      .input(
        z.object({
          orderId: z.string(),
          marketplace: z.string(),
          productSku: z.string().optional(),
          productName: z.string().optional(),
          quantity: z.number().int().positive(),
          unitPrice: z.number().positive(),
          revenue: z.number().positive(),
          cogs: z.number().positive().optional(),
          profit: z.number().optional(),
          orderDate: z.date(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        try {
          const profit = input.profit ?? (input.revenue - (input.cogs ?? 0));
          await insertSalesData({
            userId: ctx.user.id,
            orderId: input.orderId,
            marketplace: input.marketplace,
            productSku: input.productSku,
            productName: input.productName,
            quantity: input.quantity,
            unitPrice: input.unitPrice.toString(),
            revenue: input.revenue.toString(),
            cogs: input.cogs?.toString(),
            profit: profit.toString(),
            orderDate: input.orderDate,
          });
          return { success: true };
        } catch (error) {
          console.error("Error adding sales data:", error);
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to add sales data" });
        }
      }),

    // Add ad spend data (manual entry)
    addAdSpendData: protectedProcedure
      .input(
        z.object({
          marketplace: z.string().optional(),
          platform: z.string().optional(),
          campaignName: z.string().optional(),
          spend: z.number().optional(),
          adSpend: z.number().optional(),
          impressions: z.number().int().nonnegative().optional(),
          clicks: z.number().int().nonnegative().optional(),
          conversions: z.number().int().nonnegative().optional(),
          conversionValue: z.number().nonnegative().optional(),
          revenueFromAds: z.number().optional(),
          date: z.date().optional(),
          spendDate: z.date().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        try {
          const mkt = input.marketplace || input.platform || "general";
          const spd = input.spend ?? input.adSpend ?? 0;
          const rev = input.revenueFromAds ?? input.conversionValue ?? 0;
          const dt = input.date || input.spendDate || new Date();
          await insertAdSpendData({
            userId: ctx.user.id,
            marketplace: mkt,
            adSpend: spd.toString(),
            revenueFromAds: rev.toString(),
            impressions: input.impressions,
            clicks: input.clicks,
            conversions: input.conversions,
            date: dt,
          });
          return { success: true };
        } catch (error) {
          console.error("Error adding ad spend data:", error);
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to add ad spend data" });
        }
      }),
  }),

  // API Credentials management
  apiCredentials: router({
    // Get API credentials for a user
    getApiCredentials: protectedProcedure.query(async ({ ctx }) => {
      try {
        const credentials = await getApiCredentialsByUser(ctx.user.id);
        return credentials;
      } catch (error) {
        console.error("Error fetching API credentials:", error);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to fetch API credentials" });
      }
    }),

    // Add API credential (short name)
    add: protectedProcedure
      .input(
        z.object({
          marketplace: z.string(),
          apiKey: z.string().optional(),
          apiSecret: z.string().optional(),
          accessToken: z.string().optional(),
          refreshToken: z.string().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        try {
          await insertApiCredential({
            userId: ctx.user.id,
            marketplace: input.marketplace,
            apiKey: input.apiKey || "none",
            apiSecret: input.apiSecret,
            accessToken: input.accessToken,
            refreshToken: input.refreshToken,
            isActive: 1,
          });
          return { success: true };
        } catch (error) {
          console.error("Error adding API credential:", error);
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to add API credential" });
        }
      }),

    // Add API credential (full name)
    addApiCredential: protectedProcedure
      .input(
        z.object({
          marketplace: z.string(),
          apiKey: z.string().optional(),
          apiSecret: z.string().optional(),
          accessToken: z.string().optional(),
          refreshToken: z.string().optional(),
          sellerId: z.string().optional(),
          marketplaceId: z.string().optional(),
          customEndpoint: z.string().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        try {
          await insertApiCredential({
            userId: ctx.user.id,
            marketplace: input.marketplace,
            apiKey: input.apiKey || "none",
            apiSecret: input.apiSecret,
            accessToken: input.accessToken,
            refreshToken: input.refreshToken,
            isActive: 1,
          });
          return { success: true };
        } catch (error) {
          console.error("Error adding API credential:", error);
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to add API credential" });
        }
      }),
  }),

  // API Connections router
  apiConnections: router(apiConnectionsRouter),

  // Admin router
  admin: adminRouter,

  // Dashboard Analytics router
  dashboardAnalytics: dashboardAnalyticsRouter,

  // Platform Connections router
  platformConnections: platformConnectionsRouter,

  // Team Management router
  team: teamRouter,

  // Advanced Analytics router
  advancedAnalytics: advancedAnalyticsRouter,

  // Dashboard Customization router
  dashboardCustomization: dashboardCustomizationRouter,

  // Webstore Metrics router
  webstoreMetrics: webstoreMetricsRouter,
  // Export router
  export: exportRouter,
  // Export Scheduling router
  exportScheduling: exportSchedulingRouter,
  // Search and Filters router
  searchFilters: searchFiltersRouter,
  // Marketplace Comparison router
  marketplaceComparison: marketplaceComparisonRouter,
  // Teams router (team management, members, roles)
  teams: teamsRouter,
  // Dashboards router (custom dashboards, sharing, preferences)
  dashboards: dashboardsRouter,
  // BigCommerce router
  bigcommerce: bigcommerceRouter,
  // Dashboard sharing router
  dashboardSharing: dashboardSharingRouter,
  // RBAC management router
  rbacManagement: rbacManagementRouter,
  // Team invitations router
  teamInvitations: teamInvitationsRouter,
  // Team management router
  teamManagement: teamManagementRouter,
  // Activity logs router
  activityLogs: activityLogsRouter,
  // Analytics aggregation router
  analyticsAggregation: analyticsAggregationRouter,
  // Notifications router
  notifications: notificationsRouter,
  // OAuth2 router
  oauth2: oauth2Router,
  // Realtime router
  realtime: realtimeRouter,
});

export type AppRouter = typeof appRouter;
