import { z } from "zod";
import { publicProcedure, router } from "../_core/trpc";
import { realtimeService } from "../realtime-service";
import { getDb } from "../db";
import { eq, sql } from "drizzle-orm";
import { salesData, adSpendData, dataSyncLog } from "../../drizzle/schema";

/**
 * Real-time Data Router
 * Provides procedures for subscribing to real-time dashboard updates
 */

export const realtimeRouter = router({
  /**
   * Get real-time dashboard metrics
   */
  getDashboardMetrics: publicProcedure
    .input(
      z.object({
        storeId: z.string().optional(),
        startDate: z.date().optional(),
        endDate: z.date().optional(),
      })
    )
    .query(async ({ input }) => {
      const cacheKey = `dashboard-metrics-${input.storeId || "all"}`;

      return realtimeService.get(
        cacheKey,
        async () => {
          const database = await getDb();
          if (!database) throw new Error("Database connection failed");
          const whereConditions = [];

          if (input.storeId) {
            whereConditions.push(eq(salesData.marketplace, input.storeId));
          }

          if (input.startDate) {
            whereConditions.push(
              sql`${salesData.orderDate} >= ${input.startDate.toISOString()}`
            );
          }

          if (input.endDate) {
            whereConditions.push(
              sql`${salesData.orderDate} <= ${input.endDate.toISOString()}`
            );
          }

          const salesDataResult = await database
            .select({
              totalOrders: sql<number>`COUNT(*)`,
              totalRevenue: sql<number>`COALESCE(SUM(${salesData.revenue}), 0)`,
              avgOrderValue: sql<number>`COALESCE(AVG(${salesData.revenue}), 0)`,
            })
            .from(salesData)
            .where(whereConditions.length > 0 ? sql`${whereConditions}` : undefined);

          return {
            totalOrders: salesDataResult[0]?.totalOrders || 0,
            totalRevenue: salesDataResult[0]?.totalRevenue || 0,
            avgOrderValue: salesDataResult[0]?.avgOrderValue || 0,
            timestamp: new Date(),
          };
        },
        5000 // 5 second cache
      );
    }),

  /**
   * Get real-time sales data
   */
  getSalesData: publicProcedure
    .input(
      z.object({
        storeId: z.string().optional(),
        limit: z.number().default(10),
      })
    )
    .query(async ({ input }) => {
      const cacheKey = `sales-data-${input.storeId || "all"}`;

      return realtimeService.get(
        cacheKey,
        async () => {
          const database = await getDb();
          if (!database) throw new Error("Database connection failed");
          const whereConditions = [];

          if (input.storeId) {
            whereConditions.push(eq(salesData.marketplace, input.storeId));
          }

          const salesDataResult = await database
            .select({
              id: salesData.id,
              orderId: salesData.orderId,
              marketplace: salesData.marketplace,
              productName: salesData.productName,
              quantity: salesData.quantity,
              revenue: salesData.revenue,
              profit: salesData.profit,
              orderDate: salesData.orderDate,
            })
            .from(salesData)
            .where(whereConditions.length > 0 ? sql`${whereConditions}` : undefined)
            .orderBy(sql`${salesData.orderDate} DESC`)
            .limit(input.limit);

          return salesDataResult;
        },
        3000 // 3 second cache
      );
    }),

  /**
   * Get real-time product performance
   */
  getProductPerformance: publicProcedure
    .input(
      z.object({
        storeId: z.string().optional(),
        limit: z.number().default(10),
      })
    )
    .query(async ({ input }) => {
      const cacheKey = `product-performance-${input.storeId || "all"}`;

      return realtimeService.get(
        cacheKey,
        async () => {
          const database = await getDb();
          if (!database) throw new Error("Database connection failed");
          const whereConditions = [];

          if (input.storeId) {
            whereConditions.push(eq(adSpendData.marketplace, input.storeId));
          }

          const productData = await database
            .select({
              id: adSpendData.id,
              marketplace: adSpendData.marketplace,
              adSpend: adSpendData.adSpend,
              impressions: adSpendData.impressions,
              clicks: adSpendData.clicks,
              conversions: adSpendData.conversions,
              revenueFromAds: adSpendData.revenueFromAds,
            })
            .from(adSpendData)
            .where(whereConditions.length > 0 ? sql`${whereConditions}` : undefined)
            .orderBy(sql`${adSpendData.revenueFromAds} DESC`)
            .limit(input.limit);

          return productData;
        },
        5000 // 5 second cache
      );
    }),

  /**
   * Get cache statistics
   */
  getCacheStats: publicProcedure.query(() => {
    return realtimeService.getStats();
  }),

  /**
   * Invalidate specific cache entry
   */
  invalidateCache: publicProcedure
    .input(z.object({ key: z.string() }))
    .mutation(({ input }) => {
      realtimeService.invalidate(input.key);
      return { success: true, message: `Cache invalidated for key: ${input.key}` };
    }),

  /**
   * Invalidate cache by pattern
   */
  invalidateCachePattern: publicProcedure
    .input(z.object({ pattern: z.string() }))
    .mutation(({ input }) => {
      try {
        const regex = new RegExp(input.pattern);
        realtimeService.invalidatePattern(regex);
        return { success: true, message: `Cache invalidated for pattern: ${input.pattern}` };
      } catch (error) {
        return { success: false, message: `Invalid regex pattern: ${input.pattern}` };
      }
    }),

  /**
   * Clear all cache
   */
  clearAllCache: publicProcedure.mutation(() => {
    realtimeService.clear();
    return { success: true, message: "All cache cleared" };
  }),
});
