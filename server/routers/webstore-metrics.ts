import { protectedProcedure, publicProcedure, router } from "../_core/trpc";
import { z } from "zod";
import { getDb } from "../db";
import { salesData, adSpendData } from "../../drizzle/schema";
import { sql, and, gte, lte } from "drizzle-orm";

export const webstoreMetricsRouter = router({
  // Get all 14 metrics for a store
  getStoreMetrics: protectedProcedure
    .input(
      z.object({
        storeName: z.string(),
        startDate: z.date().optional(),
        endDate: z.date().optional(),
      })
    )
    .query(async ({ input }) => {
      const startDate = input.startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const endDate = input.endDate || new Date();

      // Query sales data for the store
      const db = await getDb();
      if (!db) throw new Error("Database connection failed");
      const data = await db
        .select()
        .from(salesData)
        .where(
          and(
            sql`${salesData.marketplace} = ${input.storeName}`,
            gte(salesData.orderDate, startDate),
            lte(salesData.orderDate, endDate)
          )
        );

      // Calculate metrics from data
      const metrics = {
        grossRevenue: calculateGrossRevenue(data),
        grossADV: calculateGrossADV(data),
        averageOrderValue: calculateAOV(data),
        totalSales: calculateTotalSales(data),
        discounts: calculateDiscounts(data),
        grossSales: calculateGrossSales(data),
        newCustomerOrders: calculateNewCustomerOrders(data),
        newCustomerRevenue: calculateNewCustomerRevenue(data),
        newCustomers: calculateNewCustomers(data),
        returns: calculateReturns(data),
        salesTaxes: calculateSalesTaxes(data),
        unitsSold: calculateUnitsSold(data),
        returningCustomerRevenue: calculateReturningCustomerRevenue(data),
        ordersOver0Revenue: calculateOrdersOver0(data),
      };

      return metrics;
    }),

  // Get metric trend for comparison
  getMetricTrend: protectedProcedure
    .input(
      z.object({
        storeName: z.string(),
        metric: z.enum([
          "grossRevenue",
          "grossADV",
          "averageOrderValue",
          "totalSales",
          "discounts",
          "grossSales",
          "newCustomerOrders",
          "newCustomerRevenue",
          "newCustomers",
          "returns",
          "salesTaxes",
          "unitsSold",
          "returningCustomerRevenue",
          "ordersOver0Revenue",
        ]),
        period: z.enum(["daily", "weekly", "monthly"]).optional(),
      })
    )
    .query(async ({ input }) => {
      const period = input.period || "daily";
      const days = period === "daily" ? 30 : period === "weekly" ? 90 : 365;
      const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

      const db = await getDb();
      if (!db) throw new Error("Database connection failed");
      const data = await db
        .select()
        .from(salesData)
        .where(
          and(
            sql`${salesData.marketplace} = ${input.storeName}`,
            gte(salesData.orderDate, startDate)
          )
        );

      // Group data by period and calculate metric
      const trend = groupByPeriod(data, period, input.metric);
      return trend;
    }),

  // Get comparison between periods
  getMetricComparison: protectedProcedure
    .input(
      z.object({
        storeName: z.string(),
        metric: z.string(),
        currentPeriodStart: z.date(),
        currentPeriodEnd: z.date(),
        previousPeriodStart: z.date(),
        previousPeriodEnd: z.date(),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database connection failed");
      const currentData = await db
        .select()
        .from(salesData)
        .where(
          and(
            sql`${salesData.marketplace} = ${input.storeName}`,
            gte(salesData.orderDate, input.currentPeriodStart),
            lte(salesData.orderDate, input.currentPeriodEnd)
          )
        );

      if (!db) throw new Error("Database connection failed");
      const previousData = await db
        .select()
        .from(salesData)
        .where(
          and(
            sql`${salesData.marketplace} = ${input.storeName}`,
            gte(salesData.orderDate, input.previousPeriodStart),
            lte(salesData.orderDate, input.previousPeriodEnd)
          )
        );

      const currentValue = calculateMetricValue(currentData, input.metric);
      const previousValue = calculateMetricValue(previousData, input.metric);
      const change = previousValue !== 0 ? ((currentValue - previousValue) / previousValue) * 100 : 0;

      return {
        currentValue,
        previousValue,
        change,
        percentageChange: change.toFixed(2),
        trend: change > 0 ? "up" : change < 0 ? "down" : "neutral",
      };
    }),
});

// Helper functions to calculate each metric
function calculateGrossRevenue(data: any[]): number {
  return data.reduce((sum, item) => sum + (item.revenue || 0), 0);
}

function calculateGrossADV(data: any[]): number {
  return data.reduce((sum, item) => sum + (item.adSpend || 0), 0);
}

function calculateAOV(data: any[]): number {
  const totalRevenue = calculateGrossRevenue(data);
  const totalOrders = calculateTotalSales(data);
  return totalOrders > 0 ? totalRevenue / totalOrders : 0;
}

function calculateTotalSales(data: any[]): number {
  return data.reduce((sum, item) => sum + (item.orders || 0), 0);
}

function calculateDiscounts(data: any[]): number {
  return data.reduce((sum, item) => sum + (item.discounts || 0), 0);
}

function calculateGrossSales(data: any[]): number {
  return calculateGrossRevenue(data) + calculateDiscounts(data);
}

function calculateNewCustomerOrders(data: any[]): number {
  return data.reduce((sum, item) => sum + (item.newCustomerOrders || 0), 0);
}

function calculateNewCustomerRevenue(data: any[]): number {
  return data.reduce((sum, item) => sum + (item.newCustomerRevenue || 0), 0);
}

function calculateNewCustomers(data: any[]): number {
  return data.reduce((sum, item) => sum + (item.newCustomers || 0), 0);
}

function calculateReturns(data: any[]): number {
  return data.reduce((sum, item) => sum + (item.returns || 0), 0);
}

function calculateSalesTaxes(data: any[]): number {
  return data.reduce((sum, item) => sum + (item.salesTaxes || 0), 0);
}

function calculateUnitsSold(data: any[]): number {
  return data.reduce((sum, item) => sum + (item.unitsSold || 0), 0);
}

function calculateReturningCustomerRevenue(data: any[]): number {
  return data.reduce((sum, item) => sum + (item.returningCustomerRevenue || 0), 0);
}

function calculateOrdersOver0(data: any[]): number {
  return data.reduce((sum, item) => sum + (item.ordersOver0 || 0), 0);
}

function calculateMetricValue(data: any[], metric: string): number {
  switch (metric) {
    case "grossRevenue":
      return calculateGrossRevenue(data);
    case "grossADV":
      return calculateGrossADV(data);
    case "averageOrderValue":
      return calculateAOV(data);
    case "totalSales":
      return calculateTotalSales(data);
    case "discounts":
      return calculateDiscounts(data);
    case "grossSales":
      return calculateGrossSales(data);
    case "newCustomerOrders":
      return calculateNewCustomerOrders(data);
    case "newCustomerRevenue":
      return calculateNewCustomerRevenue(data);
    case "newCustomers":
      return calculateNewCustomers(data);
    case "returns":
      return calculateReturns(data);
    case "salesTaxes":
      return calculateSalesTaxes(data);
    case "unitsSold":
      return calculateUnitsSold(data);
    case "returningCustomerRevenue":
      return calculateReturningCustomerRevenue(data);
    case "ordersOver0Revenue":
      return calculateOrdersOver0(data);
    default:
      return 0;
  }
}

function groupByPeriod(data: any[], period: string, metric: string): any[] {
  const grouped: Record<string, any[]> = {};

  data.forEach((item) => {
    const date = new Date(item.timestamp);
    let key: string;

    if (period === "daily") {
      key = date.toISOString().split("T")[0];
    } else if (period === "weekly") {
      const week = Math.floor((date.getTime() - new Date(date.getFullYear(), 0, 1).getTime()) / (7 * 24 * 60 * 60 * 1000));
      key = `Week ${week}`;
    } else {
      key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    }

    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(item);
  });

  return Object.entries(grouped).map(([period, items]) => ({
    period,
    value: calculateMetricValue(items, metric),
  }));
}
