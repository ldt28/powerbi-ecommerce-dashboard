import { router, protectedProcedure } from "../_core/trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { getDb } from "../db";
import { salesData, adSpendData } from "../../drizzle/schema";
import { eq, gte, lte, and, sum, desc } from "drizzle-orm";

/**
 * Dashboard Analytics Router
 * Procedures for aggregating and filtering analytics data for user-facing dashboard
 */

export const dashboardAnalyticsRouter = router({
  /**
   * Get KPI metrics for date range
   */
  getKPIMetrics: protectedProcedure
    .input(
      z.object({
        userId: z.number(),
        startDate: z.date(),
        endDate: z.date(),
      })
    )
    .query(async ({ input }) => {
      try {
        const db = await getDb();
        if (!db) throw new Error("Database not available");

        // Get sales data for date range
        const sales = await db
          .select()
          .from(salesData)
          .where(
            and(
              eq(salesData.userId, input.userId),
              gte(salesData.orderDate, input.startDate),
              lte(salesData.orderDate, input.endDate)
            )
          );

        // Calculate KPI metrics
        const totalRevenue = sales.reduce((sum, s: any) => sum + parseFloat(s.revenue || 0), 0);
        const totalOrders = sales.length;
        const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
        const totalUnits = sales.reduce((sum, s: any) => sum + (s.quantity || 0), 0);

        // Calculate growth rate (compare with previous period)
        const periodLength = Math.ceil(
          (input.endDate.getTime() - input.startDate.getTime()) / (1000 * 60 * 60 * 24)
        );
        const previousStart = new Date(input.startDate.getTime() - periodLength * 24 * 60 * 60 * 1000);
        const previousEnd = new Date(input.startDate.getTime());

        const previousSales = await db
          .select()
          .from(salesData)
          .where(
            and(
              eq(salesData.userId, input.userId),
              gte(salesData.orderDate, previousStart),
              lte(salesData.orderDate, previousEnd)
            )
          );

        const previousRevenue = previousSales.reduce(
          (sum, s: any) => sum + parseFloat(s.revenue || 0),
          0
        );
        const revenueGrowth = previousRevenue > 0 ? ((totalRevenue - previousRevenue) / previousRevenue) * 100 : 0;

        return {
          totalRevenue: parseFloat(totalRevenue.toFixed(2)),
          totalOrders,
          avgOrderValue: parseFloat(avgOrderValue.toFixed(2)),
          totalUnits,
          revenueGrowth: parseFloat(revenueGrowth.toFixed(2)),
        };
      } catch (error) {
        console.error("Error fetching KPI metrics:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch KPI metrics",
        });
      }
    }),

  /**
   * Get revenue trend data for line chart
   */
  getRevenueTrend: protectedProcedure
    .input(
      z.object({
        userId: z.number(),
        startDate: z.date(),
        endDate: z.date(),
      })
    )
    .query(async ({ input }) => {
      try {
        const db = await getDb();
        if (!db) throw new Error("Database not available");

        const sales = await db
          .select()
          .from(salesData)
          .where(
            and(
              eq(salesData.userId, input.userId),
              gte(salesData.orderDate, input.startDate),
              lte(salesData.orderDate, input.endDate)
            )
          )
          .orderBy(salesData.orderDate);

        // Group by date and aggregate
        const trendData = sales.map((s: any) => ({
          date: new Date(s.orderDate).toLocaleDateString(),
          revenue: parseFloat(s.revenue || 0),
          quantity: s.quantity || 0,
        }));

        return trendData;
      } catch (error) {
        console.error("Error fetching revenue trend:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch revenue trend",
        });
      }
    }),

  /**
   * Get revenue by marketplace for pie chart
   */
  getRevenueByMarketplace: protectedProcedure
    .input(
      z.object({
        userId: z.number(),
        startDate: z.date(),
        endDate: z.date(),
      })
    )
    .query(async ({ input }) => {
      try {
        const db = await getDb();
        if (!db) throw new Error("Database not available");

        const sales = await db
          .select()
          .from(salesData)
          .where(
            and(
              eq(salesData.userId, input.userId),
              gte(salesData.orderDate, input.startDate),
              lte(salesData.orderDate, input.endDate)
            )
          );

        // Group by marketplace
        const marketplaceMap = new Map<string, number>();
        sales.forEach((s: any) => {
          const marketplace = s.marketplace || "Unknown";
          const current = marketplaceMap.get(marketplace) || 0;
          marketplaceMap.set(marketplace, current + parseFloat(s.revenue || 0));
        });

        const data = Array.from(marketplaceMap.entries()).map(([name, value]) => ({
          name,
          value: parseFloat(value.toFixed(2)),
        }));

        return data;
      } catch (error) {
        console.error("Error fetching revenue by marketplace:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch revenue by marketplace",
        });
      }
    }),

  /**
   * Get ad spend and ROAS data
   */
  getAdSpendMetrics: protectedProcedure
    .input(
      z.object({
        userId: z.number(),
        startDate: z.date(),
        endDate: z.date(),
      })
    )
    .query(async ({ input }) => {
      try {
        const db = await getDb();
        if (!db) throw new Error("Database not available");

        const adSpend = await db
          .select()
          .from(adSpendData)
          .where(
            and(
              eq(adSpendData.userId, input.userId),
              gte(adSpendData.date, input.startDate),
              lte(adSpendData.date, input.endDate)
            )
          )
          .orderBy(adSpendData.date);

        const metrics = adSpend.map((a: any) => ({
          date: new Date(a.date).toLocaleDateString(),
          spend: parseFloat(a.adSpend || 0),
          revenue: parseFloat(a.revenueFromAds || 0),
          roas: parseFloat(a.adSpend || 0) > 0 ? parseFloat(a.revenueFromAds || 0) / parseFloat(a.adSpend || 0) : 0,
          platform: a.platform || "Unknown",
        }));

        return metrics;
      } catch (error) {
        console.error("Error fetching ad spend metrics:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch ad spend metrics",
        });
      }
    }),

  /**
   * Get top products by revenue
   */
  getTopProducts: protectedProcedure
    .input(
      z.object({
        userId: z.number(),
        startDate: z.date(),
        endDate: z.date(),
        limit: z.number().default(10),
      })
    )
    .query(async ({ input }) => {
      try {
        const db = await getDb();
        if (!db) throw new Error("Database not available");

        const sales = await db
          .select()
          .from(salesData)
          .where(
            and(
              eq(salesData.userId, input.userId),
              gte(salesData.orderDate, input.startDate),
              lte(salesData.orderDate, input.endDate)
            )
          );

        // Group by product and aggregate
        const productMap = new Map<string, { revenue: number; quantity: number }>();
        sales.forEach((s: any) => {
          const product = s.productName || "Unknown";
          const current = productMap.get(product) || { revenue: 0, quantity: 0 };
          productMap.set(product, {
            revenue: current.revenue + parseFloat(s.revenue || 0),
            quantity: current.quantity + (s.quantity || 0),
          });
        });

        const products = Array.from(productMap.entries())
          .map(([name, data]) => ({
            name,
            revenue: parseFloat(data.revenue.toFixed(2)),
            quantity: data.quantity,
          }))
          .sort((a, b) => b.revenue - a.revenue)
          .slice(0, input.limit);

        return products;
      } catch (error) {
        console.error("Error fetching top products:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch top products",
        });
      }
    }),

  /**
   * Get sync status for real-time indicator
   */
  getSyncStatus: protectedProcedure
    .input(z.object({ userId: z.number() }))
    .query(async ({ input }) => {
      try {
        const db = await getDb();
        if (!db) throw new Error("Database not available");

        // Get last sync time from sales data
        const lastSale = await db
          .select()
          .from(salesData)
          .where(eq(salesData.userId, input.userId))
          .orderBy(desc(salesData.createdAt))
          .limit(1);

        const lastSyncTime = lastSale.length > 0 ? lastSale[0].updatedAt : null;
        const now = new Date();
        const syncAgeMinutes = lastSyncTime ? Math.floor((now.getTime() - lastSyncTime.getTime()) / (1000 * 60)) : null;

        return {
          lastSyncTime,
          syncAgeMinutes,
          isSyncing: syncAgeMinutes !== null && syncAgeMinutes < 5,
          status: syncAgeMinutes === null ? "never" : syncAgeMinutes < 5 ? "fresh" : syncAgeMinutes < 60 ? "recent" : "stale",
        };
      } catch (error) {
        console.error("Error fetching sync status:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch sync status",
        });
      }
    }),

  /**
   * Get summary statistics
   */
  getSummaryStats: protectedProcedure
    .input(
      z.object({
        userId: z.number(),
        startDate: z.date(),
        endDate: z.date(),
      })
    )
    .query(async ({ input }) => {
      try {
        const db = await getDb();
        if (!db) throw new Error("Database not available");

        const sales = await db
          .select()
          .from(salesData)
          .where(
            and(
              eq(salesData.userId, input.userId),
              gte(salesData.orderDate, input.startDate),
              lte(salesData.orderDate, input.endDate)
            )
          );

        const adSpend = await db
          .select()
          .from(adSpendData)
          .where(
            and(
              eq(adSpendData.userId, input.userId),
              gte(adSpendData.date, input.startDate),
              lte(adSpendData.date, input.endDate)
            )
          );

        const totalRevenue = sales.reduce((sum, s: any) => sum + parseFloat(s.revenue || 0), 0);
        const totalAdSpend = adSpend.reduce((sum, a: any) => sum + parseFloat(a.adSpend || 0), 0);
        const totalOrders = sales.length;
        const totalUnits = sales.reduce((sum, s: any) => sum + (s.quantity || 0), 0);
        const totalProfit = totalRevenue - totalAdSpend;
        const profitMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;

        return {
          totalRevenue: parseFloat(totalRevenue.toFixed(2)),
          totalAdSpend: parseFloat(totalAdSpend.toFixed(2)),
          totalOrders,
          totalUnits,
          totalProfit: parseFloat(totalProfit.toFixed(2)),
          profitMargin: parseFloat(profitMargin.toFixed(2)),
          roas: totalAdSpend > 0 ? parseFloat((totalRevenue / totalAdSpend).toFixed(2)) : 0,
        };
      } catch (error) {
        console.error("Error fetching summary stats:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch summary stats",
        });
      }
    }),
});
