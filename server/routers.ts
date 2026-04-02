import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import { getSalesDataByUser, getAdSpendDataByUser, getApiCredentialsByUser, insertSalesData, insertAdSpendData, insertApiCredential, getApiCredentialByMarketplace } from "./db";
import { TRPCError } from "@trpc/server";
import { apiConnectionsRouter } from "./routers/api-connections";
import { adminRouter } from "./routers/admin";
import { dashboardAnalyticsRouter } from "./routers/dashboard-analytics";
import { platformConnectionsRouter } from "./routers/platform-connections";
import { teamRouter } from "./routers/team";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
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
      .input(z.object({
        startDate: z.date().optional(),
        endDate: z.date().optional(),
      }))
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
      .input(z.object({
        startDate: z.date().optional(),
        endDate: z.date().optional(),
      }))
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
      .input(z.object({
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
      }))
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
      .input(z.object({
        marketplace: z.string(),
        adSpend: z.number().positive(),
        impressions: z.number().int().nonnegative(),
        clicks: z.number().int().nonnegative(),
        conversions: z.number().int().nonnegative(),
        revenueFromAds: z.number().positive(),
        date: z.date(),
      }))
      .mutation(async ({ ctx, input }) => {
        try {
          await insertAdSpendData({
            userId: ctx.user.id,
            marketplace: input.marketplace,
            adSpend: input.adSpend.toString(),
            impressions: input.impressions,
            clicks: input.clicks,
            conversions: input.conversions,
            revenueFromAds: input.revenueFromAds.toString(),
            date: input.date,
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
    // Get all API credentials for user
    getAll: protectedProcedure
      .query(async ({ ctx }) => {
        try {
          const creds = await getApiCredentialsByUser(ctx.user.id);
          // Don't return sensitive data to frontend
          return creds.map(c => ({
            id: c.id,
            marketplace: c.marketplace,
            isActive: c.isActive,
            lastSyncedAt: c.lastSyncedAt,
          }));
        } catch (error) {
          console.error("Error fetching API credentials:", error);
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to fetch API credentials" });
        }
      }),

    // Add API credential
    add: protectedProcedure
      .input(z.object({
        marketplace: z.string(),
        apiKey: z.string(),
        apiSecret: z.string().optional(),
        accessToken: z.string().optional(),
        refreshToken: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        try {
          // In production, encrypt these values before storing
          await insertApiCredential({
            userId: ctx.user.id,
            marketplace: input.marketplace,
            apiKey: input.apiKey,
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
});

export type AppRouter = typeof appRouter;
