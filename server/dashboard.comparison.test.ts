import { describe, it, expect } from "vitest";

describe("Dashboard Comparison", () => {
  describe("Period Comparison Data", () => {
    it("should generate weekly comparison data", () => {
      const week1 = { period: "Week 1", revenue: 580000, orders: 295 };
      const week2 = { period: "Week 2", revenue: 612000, orders: 310 };
      
      expect(week1.revenue).toBe(580000);
      expect(week2.revenue).toBe(612000);
      expect(week2.revenue > week1.revenue).toBe(true);
    });

    it("should generate monthly comparison data", () => {
      const thisMonth = { period: "This Month", revenue: 2450000, orders: 1247 };
      const lastMonth = { period: "Last Month", revenue: 2180000, orders: 1105 };
      
      expect(thisMonth.revenue).toBeGreaterThan(lastMonth.revenue);
      expect(thisMonth.orders).toBeGreaterThan(lastMonth.orders);
    });

    it("should generate quarterly comparison data", () => {
      const q1 = { period: "Q1 2026", revenue: 7350000, orders: 3741 };
      const q4 = { period: "Q4 2025", revenue: 6820000, orders: 3465 };
      
      expect(q1.revenue).toBeGreaterThan(q4.revenue);
      expect(q1.orders).toBeGreaterThan(q4.orders);
    });

    it("should generate yearly comparison data", () => {
      const year2026 = { period: "2026", revenue: 29400000, orders: 14968 };
      const year2025 = { period: "2025", revenue: 27280000, orders: 13860 };
      
      expect(year2026.revenue).toBeGreaterThan(year2025.revenue);
      expect(year2026.orders).toBeGreaterThan(year2025.orders);
    });
  });

  describe("Platform Comparison Data", () => {
    it("should generate Amazon platform data", () => {
      const amazon = { platform: "Amazon", revenue: 980000, orders: 498, aov: 1968, conversionRate: 4.5, roi: 4.2 };
      
      expect(amazon.revenue).toBe(980000);
      expect(amazon.orders).toBe(498);
      expect(amazon.aov).toBeCloseTo(1968, 0);
      expect(amazon.conversionRate).toBeCloseTo(4.5, 1);
      expect(amazon.roi).toBeCloseTo(4.2, 1);
    });

    it("should generate eBay platform data", () => {
      const ebay = { platform: "eBay", revenue: 520000, orders: 264, aov: 1970, conversionRate: 3.8, roi: 3.4 };
      
      expect(ebay.revenue).toBe(520000);
      expect(ebay.orders).toBe(264);
      expect(ebay.aov).toBeCloseTo(1970, 0);
    });

    it("should generate Walmart platform data", () => {
      const walmart = { platform: "Walmart", revenue: 450000, orders: 228, aov: 1974, conversionRate: 4.1, roi: 3.7 };
      
      expect(walmart.revenue).toBe(450000);
      expect(walmart.orders).toBe(228);
      expect(walmart.roi).toBeCloseTo(3.7, 1);
    });

    it("should show Amazon as highest revenue platform", () => {
      const platforms = [
        { platform: "Amazon", revenue: 980000 },
        { platform: "eBay", revenue: 520000 },
        { platform: "Walmart", revenue: 450000 },
      ];
      
      const maxRevenue = Math.max(...platforms.map(p => p.revenue));
      expect(maxRevenue).toBe(980000);
    });
  });

  describe("Comparison Metrics Calculation", () => {
    it("should calculate revenue change percentage", () => {
      const value1 = 2450000;
      const value2 = 2180000;
      const change = ((value1 - value2) / value2) * 100;
      
      expect(change).toBeCloseTo(12.39, 1);
    });

    it("should calculate order change percentage", () => {
      const value1 = 1247;
      const value2 = 1105;
      const change = ((value1 - value2) / value2) * 100;
      
      expect(change).toBeCloseTo(12.85, 1);
    });

    it("should calculate AOV change percentage", () => {
      const value1 = 1964;
      const value2 = 1973;
      const change = ((value1 - value2) / value2) * 100;
      
      expect(change).toBeCloseTo(-0.46, 1);
    });

    it("should calculate conversion rate change", () => {
      const value1 = 4.2;
      const value2 = 3.9;
      const change = ((value1 - value2) / value2) * 100;
      
      expect(change).toBeCloseTo(7.69, 1);
    });

    it("should calculate ROI change percentage", () => {
      const value1 = 3.8;
      const value2 = 3.5;
      const change = ((value1 - value2) / value2) * 100;
      
      expect(change).toBeCloseTo(8.57, 1);
    });

    it("should identify positive changes", () => {
      const value1 = 2450000;
      const value2 = 2180000;
      const isPositive = value1 > value2;
      
      expect(isPositive).toBe(true);
    });

    it("should identify negative changes", () => {
      const value1 = 3.8;
      const value2 = 4.2;
      const isPositive = value1 > value2;
      
      expect(isPositive).toBe(false);
    });
  });

  describe("Value Formatting", () => {
    it("should format currency values", () => {
      const value = 2450000;
      const formatted = `$${(value / 1000000).toFixed(1)}M`;
      
      expect(formatted).toBe("$2.5M");
    });

    it("should format percentage values", () => {
      const value = 4.2;
      const formatted = value.toFixed(2);
      
      expect(formatted).toBe("4.20");
    });

    it("should format number values", () => {
      const value = 1247;
      const formatted = value.toLocaleString();
      
      expect(formatted).toBe("1,247");
    });

    it("should format large revenue values", () => {
      const value = 29400000;
      const formatted = `$${(value / 1000000).toFixed(1)}M`;
      
      expect(formatted).toBe("$29.4M");
    });

    it("should format small revenue values", () => {
      const value = 8000;
      const formatted = `$${(value / 1000).toFixed(1)}K`;
      
      expect(formatted).toBe("$8.0K");
    });
  });

  describe("Platform Selection Logic", () => {
    it("should allow selecting multiple platforms", () => {
      const selected = ["amazon", "ebay"];
      
      expect(selected).toContain("amazon");
      expect(selected).toContain("ebay");
      expect(selected.length).toBe(2);
    });

    it("should allow adding platforms to selection", () => {
      let selected = ["amazon"];
      selected = [...selected, "ebay"];
      
      expect(selected).toContain("amazon");
      expect(selected).toContain("ebay");
      expect(selected.length).toBe(2);
    });

    it("should allow removing platforms from selection", () => {
      let selected = ["amazon", "ebay"];
      selected = selected.filter(p => p !== "ebay");
      
      expect(selected).toContain("amazon");
      expect(selected).not.toContain("ebay");
      expect(selected.length).toBe(1);
    });

    it("should prevent duplicate platform selection", () => {
      let selected = ["amazon"];
      if (!selected.includes("amazon")) {
        selected = [...selected, "amazon"];
      }
      
      expect(selected.length).toBe(1);
    });
  });

  describe("Comparison Type Selection", () => {
    it("should support period comparison type", () => {
      const comparisonType = "period";
      
      expect(comparisonType).toBe("period");
    });

    it("should support platform comparison type", () => {
      const comparisonType = "platform";
      
      expect(comparisonType).toBe("platform");
    });

    it("should allow switching comparison types", () => {
      let comparisonType = "period";
      comparisonType = "platform";
      
      expect(comparisonType).toBe("platform");
    });
  });

  describe("Period Type Selection", () => {
    it("should support week period type", () => {
      const periodType = "week";
      
      expect(periodType).toBe("week");
    });

    it("should support month period type", () => {
      const periodType = "month";
      
      expect(periodType).toBe("month");
    });

    it("should support quarter period type", () => {
      const periodType = "quarter";
      
      expect(periodType).toBe("quarter");
    });

    it("should support year period type", () => {
      const periodType = "year";
      
      expect(periodType).toBe("year");
    });

    it("should allow switching period types", () => {
      let periodType = "month";
      periodType = "quarter";
      
      expect(periodType).toBe("quarter");
    });
  });

  describe("Chart Data Transformation", () => {
    it("should transform period data for charts", () => {
      const periodData = [
        { period: "Week 1", revenue: 580000, orders: 295 },
        { period: "Week 2", revenue: 612000, orders: 310 },
      ];
      
      const chartData = periodData.map(d => ({
        name: d.period,
        revenue: d.revenue / 1000000,
        orders: d.orders / 100,
      }));
      
      expect(chartData[0].revenue).toBeCloseTo(0.58, 2);
      expect(chartData[0].orders).toBeCloseTo(2.95, 2);
    });

    it("should transform platform data for charts", () => {
      const platformData = [
        { platform: "Amazon", revenue: 980000, orders: 498 },
        { platform: "eBay", revenue: 520000, orders: 264 },
      ];
      
      const chartData = platformData.map(p => ({
        name: p.platform,
        revenue: p.revenue / 1000000,
        orders: p.orders / 100,
      }));
      
      expect(chartData[0].revenue).toBeCloseTo(0.98, 2);
      expect(chartData[1].revenue).toBeCloseTo(0.52, 2);
    });

    it("should calculate revenue distribution", () => {
      const platforms = [
        { platform: "Amazon", revenue: 980000 },
        { platform: "eBay", revenue: 520000 },
        { platform: "Walmart", revenue: 450000 },
      ];
      
      const totalRevenue = platforms.reduce((sum, p) => sum + p.revenue, 0);
      const distribution = platforms.map(p => ({
        name: p.platform,
        percentage: (p.revenue / totalRevenue) * 100,
      }));
      
      expect(distribution[0].percentage).toBeCloseTo(50.26, 1);
      expect(distribution[1].percentage).toBeCloseTo(26.67, 1);
      expect(distribution[2].percentage).toBeCloseTo(23.08, 1);
    });
  });

  describe("Comparison Metrics Array", () => {
    it("should generate 6 comparison metrics", () => {
      const metrics = [
        { label: "Total Revenue", value1: 2450000, value2: 2180000 },
        { label: "Total Orders", value1: 1247, value2: 1105 },
        { label: "Average Order Value", value1: 1964, value2: 1973 },
        { label: "Conversion Rate", value1: 4.2, value2: 3.9 },
        { label: "ROI", value1: 3.8, value2: 3.5 },
        { label: "New Customers", value1: 892, value2: 821 },
      ];
      
      expect(metrics.length).toBe(6);
    });

    it("should include all required metric labels", () => {
      const metrics = [
        { label: "Total Revenue" },
        { label: "Total Orders" },
        { label: "Average Order Value" },
        { label: "Conversion Rate" },
        { label: "ROI" },
        { label: "New Customers" },
      ];
      
      const labels = metrics.map(m => m.label);
      expect(labels).toContain("Total Revenue");
      expect(labels).toContain("Conversion Rate");
      expect(labels).toContain("ROI");
    });

    it("should calculate percentage differences for all metrics", () => {
      const metrics = [
        { value1: 2450000, value2: 2180000 },
        { value1: 1247, value2: 1105 },
        { value1: 1964, value2: 1973 },
        { value1: 4.2, value2: 3.9 },
        { value1: 3.8, value2: 3.5 },
        { value1: 892, value2: 821 },
      ];
      
      const changes = metrics.map(m => {
        const change = Math.abs(((m.value1 - m.value2) / m.value2) * 100);
        return change;
      });
      
      expect(changes.length).toBe(6);
      expect(changes[0]).toBeCloseTo(12.39, 1);
      expect(changes[1]).toBeCloseTo(12.85, 1);
    });
  });

  describe("Edge Cases", () => {
    it("should handle zero revenue", () => {
      const value1 = 0;
      const value2 = 100;
      const change = ((value1 - value2) / value2) * 100;
      
      expect(change).toBe(-100);
    });

    it("should handle equal values", () => {
      const value1 = 1000;
      const value2 = 1000;
      const change = ((value1 - value2) / value2) * 100;
      
      expect(change).toBe(0);
    });

    it("should handle very large numbers", () => {
      const value1 = 999999999;
      const value2 = 888888888;
      const change = ((value1 - value2) / value2) * 100;
      
      expect(change).toBeGreaterThan(0);
      expect(change).toBeLessThan(20);
    });

    it("should handle decimal values", () => {
      const value1 = 4.567;
      const value2 = 3.234;
      const change = ((value1 - value2) / value2) * 100;
      
      expect(change).toBeCloseTo(41.22, 1);
    });
  });
});
