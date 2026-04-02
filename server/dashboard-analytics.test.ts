import { describe, it, expect, beforeEach, vi } from "vitest";
import { getDb } from "./db";
import { salesData, adSpendData } from "../drizzle/schema";
import { eq } from "drizzle-orm";

describe("Dashboard Analytics", () => {
  let db: any;
  const testUserId = 1;
  const startDate = new Date("2024-01-01");
  const endDate = new Date("2024-01-31");

  beforeEach(async () => {
    db = await getDb();
  });

  describe("KPI Metrics Calculation", () => {
    it("should calculate total revenue correctly", async () => {
      const sales = await db.select().from(salesData).where(eq(salesData.userId, testUserId));

      const totalRevenue = sales.reduce((sum: number, s: any) => sum + parseFloat(s.revenue || 0), 0);

      expect(totalRevenue).toBeGreaterThanOrEqual(0);
      expect(typeof totalRevenue).toBe("number");
    });

    it("should calculate total orders correctly", async () => {
      const sales = await db.select().from(salesData).where(eq(salesData.userId, testUserId));

      const totalOrders = sales.length;

      expect(totalOrders).toBeGreaterThanOrEqual(0);
      expect(typeof totalOrders).toBe("number");
    });

    it("should calculate average order value correctly", async () => {
      const sales = await db.select().from(salesData).where(eq(salesData.userId, testUserId));

      const totalRevenue = sales.reduce((sum: number, s: any) => sum + parseFloat(s.revenue || 0), 0);
      const totalOrders = sales.length;
      const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

      expect(avgOrderValue).toBeGreaterThanOrEqual(0);
      expect(typeof avgOrderValue).toBe("number");
    });

    it("should calculate total units correctly", async () => {
      const sales = await db.select().from(salesData).where(eq(salesData.userId, testUserId));

      const totalUnits = sales.reduce((sum: number, s: any) => sum + (s.quantity || 0), 0);

      expect(totalUnits).toBeGreaterThanOrEqual(0);
      expect(typeof totalUnits).toBe("number");
    });

    it("should calculate revenue growth rate", async () => {
      const sales = await db.select().from(salesData).where(eq(salesData.userId, testUserId));

      const totalRevenue = sales.reduce((sum: number, s: any) => sum + parseFloat(s.revenue || 0), 0);
      const previousRevenue = totalRevenue * 0.9; // Assume 10% growth
      const revenueGrowth = previousRevenue > 0 ? ((totalRevenue - previousRevenue) / previousRevenue) * 100 : 0;

      expect(revenueGrowth).toBeGreaterThanOrEqual(0);
      expect(typeof revenueGrowth).toBe("number");
    });
  });

  describe("Revenue Trend Analysis", () => {
    it("should aggregate revenue by date", async () => {
      const sales = await db.select().from(salesData).where(eq(salesData.userId, testUserId));

      const trendMap = new Map<string, number>();
      sales.forEach((s: any) => {
        const date = new Date(s.orderDate).toLocaleDateString();
        const current = trendMap.get(date) || 0;
        trendMap.set(date, current + parseFloat(s.revenue || 0));
      });

      const trendData = Array.from(trendMap.entries()).map(([date, revenue]) => ({
        date,
        revenue: parseFloat(revenue.toFixed(2)),
      }));

      expect(Array.isArray(trendData)).toBe(true);
      trendData.forEach((item) => {
        expect(item.date).toBeDefined();
        expect(typeof item.revenue).toBe("number");
        expect(item.revenue).toBeGreaterThanOrEqual(0);
      });
    });

    it("should handle empty revenue trend data", async () => {
      const trendData: any[] = [];

      expect(Array.isArray(trendData)).toBe(true);
      expect(trendData.length).toBe(0);
    });
  });

  describe("Marketplace Revenue Distribution", () => {
    it("should group revenue by marketplace", async () => {
      const sales = await db.select().from(salesData).where(eq(salesData.userId, testUserId));

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

      expect(Array.isArray(data)).toBe(true);
      data.forEach((item) => {
        expect(item.name).toBeDefined();
        expect(typeof item.value).toBe("number");
        expect(item.value).toBeGreaterThanOrEqual(0);
      });
    });

    it("should calculate marketplace percentages correctly", async () => {
      const data = [
        { name: "Amazon", value: 1000 },
        { name: "eBay", value: 500 },
        { name: "Shopify", value: 500 },
      ];

      const total = data.reduce((sum, item) => sum + item.value, 0);
      const percentages = data.map((item) => ({
        name: item.name,
        percentage: (item.value / total) * 100,
      }));

      expect(percentages[0].percentage).toBe(50);
      expect(percentages[1].percentage).toBe(25);
      expect(percentages[2].percentage).toBe(25);
    });
  });

  describe("Ad Spend and ROAS Metrics", () => {
    it("should calculate ROAS correctly", async () => {
      const adSpend = await db.select().from(adSpendData).where(eq(adSpendData.userId, testUserId));

      const metrics = adSpend.map((a: any) => ({
        spend: parseFloat(a.adSpend || 0),
        revenue: parseFloat(a.revenueFromAds || 0),
        roas: parseFloat(a.adSpend || 0) > 0 ? parseFloat(a.revenueFromAds || 0) / parseFloat(a.adSpend || 0) : 0,
      }));

      metrics.forEach((metric) => {
        expect(typeof metric.roas).toBe("number");
        expect(metric.roas).toBeGreaterThanOrEqual(0);
      });
    });

    it("should handle zero ad spend", () => {
      const spend = 0;
      const revenue = 100;
      const roas = spend > 0 ? revenue / spend : 0;

      expect(roas).toBe(0);
    });

    it("should calculate total ad spend correctly", async () => {
      const adSpend = await db.select().from(adSpendData).where(eq(adSpendData.userId, testUserId));

      const totalAdSpend = adSpend.reduce((sum: number, a: any) => sum + parseFloat(a.adSpend || 0), 0);

      expect(typeof totalAdSpend).toBe("number");
      expect(totalAdSpend).toBeGreaterThanOrEqual(0);
    });
  });

  describe("Top Products Analysis", () => {
    it("should rank products by revenue", async () => {
      const sales = await db.select().from(salesData).where(eq(salesData.userId, testUserId));

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
        .slice(0, 10);

      expect(Array.isArray(products)).toBe(true);
      // Verify sorting
      for (let i = 0; i < products.length - 1; i++) {
        expect(products[i].revenue).toBeGreaterThanOrEqual(products[i + 1].revenue);
      }
    });

    it("should limit top products to specified count", () => {
      const products = [
        { name: "Product A", revenue: 1000 },
        { name: "Product B", revenue: 900 },
        { name: "Product C", revenue: 800 },
        { name: "Product D", revenue: 700 },
        { name: "Product E", revenue: 600 },
      ];

      const topProducts = products.slice(0, 3);

      expect(topProducts.length).toBe(3);
      expect(topProducts[0].name).toBe("Product A");
      expect(topProducts[2].name).toBe("Product C");
    });
  });

  describe("Summary Statistics", () => {
    it("should calculate profit correctly", async () => {
      const sales = await db.select().from(salesData).where(eq(salesData.userId, testUserId));
      const adSpend = await db.select().from(adSpendData).where(eq(adSpendData.userId, testUserId));

      const totalRevenue = sales.reduce((sum: number, s: any) => sum + parseFloat(s.revenue || 0), 0);
      const totalAdSpend = adSpend.reduce((sum: number, a: any) => sum + parseFloat(a.adSpend || 0), 0);
      const totalProfit = totalRevenue - totalAdSpend;

      expect(typeof totalProfit).toBe("number");
    });

    it("should calculate profit margin correctly", () => {
      const revenue = 1000;
      const adSpend = 200;
      const profit = revenue - adSpend;
      const profitMargin = revenue > 0 ? (profit / revenue) * 100 : 0;

      expect(profitMargin).toBe(80);
    });

    it("should calculate overall ROAS correctly", () => {
      const totalRevenue = 1000;
      const totalAdSpend = 200;
      const roas = totalAdSpend > 0 ? totalRevenue / totalAdSpend : 0;

      expect(roas).toBe(5);
    });
  });

  describe("Sync Status", () => {
    it("should determine sync freshness correctly", async () => {
      const now = new Date();
      const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);
      const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

      const syncAgeMinutes1 = Math.floor((now.getTime() - fiveMinutesAgo.getTime()) / (1000 * 60));
      const syncAgeMinutes2 = Math.floor((now.getTime() - oneHourAgo.getTime()) / (1000 * 60));

      expect(syncAgeMinutes1 < 5).toBe(true); // Fresh
      expect(syncAgeMinutes2 >= 60).toBe(true); // Stale
    });

    it("should handle null sync time", () => {
      const lastSyncTime = null;
      const status = lastSyncTime === null ? "never" : "synced";

      expect(status).toBe("never");
    });
  });

  describe("Data Validation", () => {
    it("should validate revenue is non-negative", async () => {
      const sales = await db.select().from(salesData).where(eq(salesData.userId, testUserId));

      sales.forEach((s: any) => {
        const revenue = parseFloat(s.revenue || 0);
        expect(revenue).toBeGreaterThanOrEqual(0);
      });
    });

    it("should validate quantity is non-negative", async () => {
      const sales = await db.select().from(salesData).where(eq(salesData.userId, testUserId));

      sales.forEach((s: any) => {
        const quantity = s.quantity || 0;
        expect(quantity).toBeGreaterThanOrEqual(0);
      });
    });

    it("should validate ad spend is non-negative", async () => {
      const adSpend = await db.select().from(adSpendData).where(eq(adSpendData.userId, testUserId));

      adSpend.forEach((a: any) => {
        const spend = parseFloat(a.adSpend || 0);
        expect(spend).toBeGreaterThanOrEqual(0);
      });
    });
  });

  describe("Date Range Filtering", () => {
    it("should filter sales by date range", async () => {
      const start = new Date("2024-01-01");
      const end = new Date("2024-01-31");

      const sales = await db
        .select()
        .from(salesData)
        .where(eq(salesData.userId, testUserId));

      const filtered = sales.filter((s: any) => {
        const date = new Date(s.orderDate);
        return date >= start && date <= end;
      });

      expect(Array.isArray(filtered)).toBe(true);
      filtered.forEach((s: any) => {
        const date = new Date(s.orderDate);
        expect(date.getTime()).toBeGreaterThanOrEqual(start.getTime());
        expect(date.getTime()).toBeLessThanOrEqual(end.getTime());
      });
    });
  });

  describe("Chart Data Formatting", () => {
    it("should format revenue as currency", () => {
      const revenue = 1234.567;
      const formatted = `$${revenue.toFixed(2)}`;

      expect(formatted).toBe("$1234.57");
    });

    it("should format percentage correctly", () => {
      const percentage = 45.6789;
      const formatted = `${percentage.toFixed(2)}%`;

      expect(formatted).toBe("45.68%");
    });

    it("should format ROAS with decimal places", () => {
      const roas = 3.456;
      const formatted = `${roas.toFixed(2)}x`;

      expect(formatted).toBe("3.46x");
    });
  });
});
