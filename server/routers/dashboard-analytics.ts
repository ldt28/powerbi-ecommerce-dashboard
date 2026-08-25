import { router, protectedProcedure } from "../_core/trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { getDb } from "../db";
import { salesData, adSpendData, cachedSalesData, cachedAdSpendData } from "../../drizzle/schema";
import { eq, gte, lte, and, desc, sql } from "drizzle-orm";

/**
 * Dashboard Analytics Router — SQLite edition
 * Reads from both legacy salesData + new cachedSalesData tables, merging results.
 */

function getEffectiveUserId(ctx: { user: { id: number; role?: string } }, targetUserId?: number): number {
  if (targetUserId !== undefined && targetUserId !== ctx.user.id) {
    if (ctx.user.role === "admin") return targetUserId;
    throw new TRPCError({ code: "FORBIDDEN", message: "Not authorized to access another user's analytics" });
  }
  return ctx.user.id;
}

export const dashboardAnalyticsRouter = router({
  /**
   * Get KPI metrics for date range
   */
  getKPIMetrics: protectedProcedure
    .input(z.object({ userId: z.number().optional(), startDate: z.date(), endDate: z.date() }))
    .query(async ({ ctx, input }) => {
      try {
        const db = getDb();
        const userId = getEffectiveUserId(ctx, input.userId);
        const start = input.startDate.toISOString();
        const end = input.endDate.toISOString();

        // Pull from cachedSalesData (live platform data)
        const cached = db.select().from(cachedSalesData).where(
          and(eq(cachedSalesData.userId, userId), gte(cachedSalesData.orderDate, start), lte(cachedSalesData.orderDate, end))
        ).all();

        // Also pull from legacy salesData
        const legacy = db.select().from(salesData).where(
          and(eq(salesData.userId, userId), gte(salesData.orderDate, start), lte(salesData.orderDate, end))
        ).all();

        const allSales = [
          ...cached.map((s) => ({ revenue: s.revenue, quantity: s.quantity ?? 1 })),
          ...legacy.map((s: any) => ({ revenue: Number(s.revenue), quantity: s.quantity ?? 1 })),
        ];

        const totalRevenue = allSales.reduce((sum, s) => sum + (s.revenue || 0), 0);
        const totalOrders = allSales.length;
        const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
        const totalUnits = allSales.reduce((sum, s) => sum + (s.quantity || 0), 0);

        // Previous period comparison
        const periodMs = input.endDate.getTime() - input.startDate.getTime();
        const prevStart = new Date(input.startDate.getTime() - periodMs).toISOString();
        const prevEnd = start;

        const prevCached = db.select().from(cachedSalesData).where(
          and(eq(cachedSalesData.userId, userId), gte(cachedSalesData.orderDate, prevStart), lte(cachedSalesData.orderDate, prevEnd))
        ).all();
        const prevLegacy = db.select().from(salesData).where(
          and(eq(salesData.userId, userId), gte(salesData.orderDate, prevStart), lte(salesData.orderDate, prevEnd))
        ).all();
        const prevRevenue = [
          ...prevCached.map((s) => s.revenue || 0),
          ...prevLegacy.map((s: any) => Number(s.revenue) || 0),
        ].reduce((a, b) => a + b, 0);

        const revenueGrowth = prevRevenue > 0 ? ((totalRevenue - prevRevenue) / prevRevenue) * 100 : 0;

        // Ad spend from cached
        const adSpendRows = db.select().from(cachedAdSpendData).where(
          and(eq(cachedAdSpendData.userId, userId), gte(cachedAdSpendData.date, start), lte(cachedAdSpendData.date, end))
        ).all();
        const legacyAdSpend = db.select().from(adSpendData).where(
          and(eq(adSpendData.userId, userId), gte(adSpendData.date, start), lte(adSpendData.date, end))
        ).all();

        const totalAdSpend =
          adSpendRows.reduce((sum, a) => sum + (a.spend || 0), 0) +
          legacyAdSpend.reduce((sum, a: any) => sum + Number(a.adSpend || 0), 0);

        return {
          totalRevenue,
          totalOrders,
          avgOrderValue,
          totalUnits,
          totalAdSpend,
          revenueGrowth,
          roas: totalAdSpend > 0 ? totalRevenue / totalAdSpend : 0,
        };
      } catch (error) {
        console.error("Error fetching KPI metrics:", error);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to fetch KPI metrics" });
      }
    }),

  /**
   * Revenue trend (daily data points)
   */
  getRevenueTrend: protectedProcedure
    .input(z.object({ userId: z.number().optional(), startDate: z.date(), endDate: z.date(), groupBy: z.enum(["day", "week", "month"]).default("day") }))
    .query(async ({ ctx, input }) => {
      try {
        const db = getDb();
        const userId = getEffectiveUserId(ctx, input.userId);
        const start = input.startDate.toISOString();
        const end = input.endDate.toISOString();

        const cached = db.select().from(cachedSalesData).where(
          and(eq(cachedSalesData.userId, userId), gte(cachedSalesData.orderDate, start), lte(cachedSalesData.orderDate, end))
        ).orderBy(cachedSalesData.orderDate).all();

        const legacy = db.select().from(salesData).where(
          and(eq(salesData.userId, userId), gte(salesData.orderDate, start), lte(salesData.orderDate, end))
        ).orderBy(salesData.orderDate).all();

        // Group by date
        const byDate = new Map<string, { revenue: number; orders: number }>();
        const addRow = (date: string, revenue: number) => {
          const day = date.slice(0, 10);
          const existing = byDate.get(day) ?? { revenue: 0, orders: 0 };
          byDate.set(day, { revenue: existing.revenue + revenue, orders: existing.orders + 1 });
        };

        cached.forEach((s) => addRow(s.orderDate, s.revenue));
        legacy.forEach((s: any) => addRow(s.orderDate, Number(s.revenue)));

        return Array.from(byDate.entries())
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([date, data]) => ({ date, ...data }));
      } catch (error) {
        console.error("Error fetching revenue trend:", error);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to fetch revenue trend" });
      }
    }),

  /**
   * Revenue by platform/marketplace
   */
  getRevenueByMarketplace: protectedProcedure
    .input(z.object({ userId: z.number().optional(), startDate: z.date(), endDate: z.date() }))
    .query(async ({ ctx, input }) => {
      try {
        const db = getDb();
        const userId = getEffectiveUserId(ctx, input.userId);
        const start = input.startDate.toISOString();
        const end = input.endDate.toISOString();

        const cached = db.select().from(cachedSalesData).where(
          and(eq(cachedSalesData.userId, userId), gte(cachedSalesData.orderDate, start), lte(cachedSalesData.orderDate, end))
        ).all();

        const legacy = db.select().from(salesData).where(
          and(eq(salesData.userId, userId), gte(salesData.orderDate, start), lte(salesData.orderDate, end))
        ).all();

        const byPlatform = new Map<string, { revenue: number; orders: number }>();
        const addRow = (platform: string, revenue: number) => {
          const existing = byPlatform.get(platform) ?? { revenue: 0, orders: 0 };
          byPlatform.set(platform, { revenue: existing.revenue + revenue, orders: existing.orders + 1 });
        };

        cached.forEach((s) => addRow(s.platform, s.revenue));
        legacy.forEach((s: any) => addRow(s.marketplace ?? "unknown", Number(s.revenue)));

        return Array.from(byPlatform.entries())
          .map(([platform, data]) => ({ platform, marketplace: platform, ...data }))
          .sort((a, b) => b.revenue - a.revenue);
      } catch (error) {
        console.error("Error fetching revenue by marketplace:", error);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to fetch revenue by marketplace" });
      }
    }),

  /**
   * Ad spend metrics
   */
  getAdSpendMetrics: protectedProcedure
    .input(z.object({ userId: z.number().optional(), startDate: z.date(), endDate: z.date() }))
    .query(async ({ ctx, input }) => {
      try {
        const db = getDb();
        const userId = getEffectiveUserId(ctx, input.userId);
        const start = input.startDate.toISOString();
        const end = input.endDate.toISOString();

        const cached = db.select().from(cachedAdSpendData).where(
          and(eq(cachedAdSpendData.userId, userId), gte(cachedAdSpendData.date, start), lte(cachedAdSpendData.date, end))
        ).all();

        const legacy = db.select().from(adSpendData).where(
          and(eq(adSpendData.userId, userId), gte(adSpendData.date, start), lte(adSpendData.date, end))
        ).all();

        const byPlatform = new Map<string, { spend: number; impressions: number; clicks: number; conversions: number; revenue: number }>();
        const addRow = (platform: string, row: { spend: number; impressions: number; clicks: number; conversions: number; revenue: number }) => {
          const e = byPlatform.get(platform) ?? { spend: 0, impressions: 0, clicks: 0, conversions: 0, revenue: 0 };
          byPlatform.set(platform, {
            spend: e.spend + row.spend,
            impressions: e.impressions + row.impressions,
            clicks: e.clicks + row.clicks,
            conversions: e.conversions + row.conversions,
            revenue: e.revenue + row.revenue,
          });
        };

        cached.forEach((a) => addRow(a.platform, {
          spend: a.spend, impressions: a.impressions ?? 0, clicks: a.clicks ?? 0,
          conversions: a.conversions ?? 0, revenue: a.revenue ?? 0,
        }));
        legacy.forEach((a: any) => addRow(a.marketplace ?? "unknown", {
          spend: Number(a.adSpend), impressions: a.impressions ?? 0, clicks: a.clicks ?? 0,
          conversions: a.conversions ?? 0, revenue: Number(a.revenueFromAds ?? 0),
        }));

        return Array.from(byPlatform.entries()).map(([platform, d]) => ({
          platform, marketplace: platform, adSpend: d.spend, spend: d.spend,
          impressions: d.impressions, clicks: d.clicks, conversions: d.conversions,
          revenueFromAds: d.revenue, roas: d.spend > 0 ? d.revenue / d.spend : 0,
          ctr: d.impressions > 0 ? (d.clicks / d.impressions) * 100 : 0,
          cpc: d.clicks > 0 ? d.spend / d.clicks : 0,
          cvr: d.clicks > 0 ? (d.conversions / d.clicks) * 100 : 0,
        }));
      } catch (error) {
        console.error("Error fetching ad spend metrics:", error);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to fetch ad spend metrics" });
      }
    }),

  /**
   * Top products
   */
  getTopProducts: protectedProcedure
    .input(z.object({ userId: z.number().optional(), startDate: z.date(), endDate: z.date(), limit: z.number().default(10) }))
    .query(async ({ ctx, input }) => {
      try {
        const db = getDb();
        const userId = getEffectiveUserId(ctx, input.userId);
        const start = input.startDate.toISOString();
        const end = input.endDate.toISOString();

        const cached = db.select().from(cachedSalesData).where(
          and(eq(cachedSalesData.userId, userId), gte(cachedSalesData.orderDate, start), lte(cachedSalesData.orderDate, end))
        ).all();

        const legacy = db.select().from(salesData).where(
          and(eq(salesData.userId, userId), gte(salesData.orderDate, start), lte(salesData.orderDate, end))
        ).all();

        const byProduct = new Map<string, { revenue: number; units: number; orders: number }>();
        const addRow = (name: string, revenue: number, qty: number) => {
          const e = byProduct.get(name) ?? { revenue: 0, units: 0, orders: 0 };
          byProduct.set(name, { revenue: e.revenue + revenue, units: e.units + qty, orders: e.orders + 1 });
        };

        cached.forEach((s) => addRow(s.productName ?? "Unknown", s.revenue, s.quantity ?? 1));
        legacy.forEach((s: any) => addRow(s.productName ?? s.productSku ?? "Unknown", Number(s.revenue), s.quantity ?? 1));

        return Array.from(byProduct.entries())
          .map(([productName, d]) => ({ productName, productSku: productName, ...d, profit: d.revenue * 0.3, cogs: d.revenue * 0.7, margin: 30 }))
          .sort((a, b) => b.revenue - a.revenue)
          .slice(0, input.limit);
      } catch (error) {
        console.error("Error fetching top products:", error);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to fetch top products" });
      }
    }),

  /**
   * Sync status
   */
  getSyncStatus: protectedProcedure
    .input(z.object({ userId: z.number().optional() }))
    .query(async ({ ctx, input }) => {
      try {
        return {
          status: "fresh",
          lastSynced: new Date().toISOString(),
          lastSyncTime: new Date().toISOString(),
          syncAgeMinutes: 5,
          platforms: [],
        };
      } catch (error) {
        console.error("Error fetching sync status:", error);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to fetch sync status" });
      }
    }),

  /**
   * Summary stats — convenience endpoint for dashboard header cards
   */
  getSummaryStats: protectedProcedure
    .input(z.object({ userId: z.number().optional(), startDate: z.date(), endDate: z.date() }))
    .query(async ({ ctx, input }) => {
      try {
        const db = getDb();
        const userId = getEffectiveUserId(ctx, input.userId);
        const start = input.startDate.toISOString();
        const end = input.endDate.toISOString();

        const cached = db.select().from(cachedSalesData).where(
          and(eq(cachedSalesData.userId, userId), gte(cachedSalesData.orderDate, start), lte(cachedSalesData.orderDate, end))
        ).all();
        const legacy = db.select().from(salesData).where(
          and(eq(salesData.userId, userId), gte(salesData.orderDate, start), lte(salesData.orderDate, end))
        ).all();

        const allRevenue = [
          ...cached.map((s) => s.revenue || 0),
          ...legacy.map((s: any) => Number(s.revenue) || 0),
        ];
        const totalRevenue = allRevenue.reduce((a, b) => a + b, 0);
        const totalOrders = allRevenue.length;
        const totalUnits = [
          ...cached.map((s) => s.quantity || 1),
          ...legacy.map((s: any) => s.quantity || 1),
        ].reduce((a, b) => a + b, 0);

        const adRows = db.select().from(cachedAdSpendData).where(
          and(eq(cachedAdSpendData.userId, userId), gte(cachedAdSpendData.date, start), lte(cachedAdSpendData.date, end))
        ).all();
        const totalAdSpend = adRows.reduce((sum, a) => sum + (a.spend || 0), 0);
        const totalProfit = totalRevenue * 0.3;
        const profitMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;

        return {
          totalRevenue,
          totalOrders,
          totalUnits,
          totalProfit,
          profitMargin,
          avgOrderValue: totalOrders > 0 ? totalRevenue / totalOrders : 0,
          totalAdSpend,
          roas: totalAdSpend > 0 ? totalRevenue / totalAdSpend : 0,
        };
      } catch (error) {
        console.error("Error fetching summary stats:", error);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to fetch summary stats" });
      }
    }),
});
