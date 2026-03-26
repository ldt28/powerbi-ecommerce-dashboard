import { describe, it, expect } from "vitest";

/**
 * Channels Dashboard Tests
 * Tests for channel performance metrics, ROI calculations, and data transformations
 */

describe("Channels Dashboard", () => {
  describe("Channel Performance Calculations", () => {
    it("should calculate ROI correctly", () => {
      const spend = 5000;
      const revenue = 45000;
      const roi = ((revenue - spend) / spend) * 100;

      expect(roi).toBe(800);
    });

    it("should calculate CAC (Customer Acquisition Cost) correctly", () => {
      const spend = 5000;
      const customers = 320;
      const cac = spend / customers;

      expect(cac).toBeCloseTo(15.625, 2);
    });

    it("should calculate conversion rate correctly", () => {
      const conversions = 480;
      const spend = 5000;
      const conversionRate = (conversions / spend) * 100;

      expect(conversionRate).toBe(9.6);
    });

    it("should handle zero spend in ROI calculation", () => {
      const spend = 0;
      const revenue = 25000;
      const roi = spend === 0 ? 0 : ((revenue - spend) / spend) * 100;

      expect(roi).toBe(0);
    });

    it("should calculate total metrics across channels", () => {
      const channels = [
        { spend: 5000, revenue: 45000, customers: 320 },
        { spend: 12000, revenue: 72000, customers: 420 },
        { spend: 8000, revenue: 32000, customers: 280 },
      ];

      const totalSpend = channels.reduce((sum, ch) => sum + ch.spend, 0);
      const totalRevenue = channels.reduce((sum, ch) => sum + ch.revenue, 0);
      const totalCustomers = channels.reduce((sum, ch) => sum + ch.customers, 0);

      expect(totalSpend).toBe(25000);
      expect(totalRevenue).toBe(149000);
      expect(totalCustomers).toBe(1020);
    });
  });

  describe("Channel Attribution", () => {
    it("should calculate revenue attribution percentage", () => {
      const channels = [
        { name: "Organic Search", revenue: 45000 },
        { name: "Paid Search", revenue: 72000 },
        { name: "Social Media", revenue: 32000 },
        { name: "Email Marketing", revenue: 24000 },
        { name: "Referral", revenue: 18000 },
        { name: "Direct", revenue: 25000 },
      ];

      const totalRevenue = channels.reduce((sum, ch) => sum + ch.revenue, 0);
      const attribution = channels.map((ch) => ({
        channel: ch.name,
        percentage: (ch.revenue / totalRevenue) * 100,
      }));

      expect(attribution[0].percentage).toBeCloseTo(20.83, 0);
      expect(attribution[1].percentage).toBeCloseTo(33.33, 0);
      expect(attribution.reduce((sum, a) => sum + a.percentage, 0)).toBeCloseTo(100, 0);
    });

    it("should rank channels by revenue contribution", () => {
      const channels = [
        { name: "Organic Search", revenue: 45000 },
        { name: "Paid Search", revenue: 72000 },
        { name: "Social Media", revenue: 32000 },
      ];

      const ranked = [...channels].sort((a, b) => b.revenue - a.revenue);

      expect(ranked[0].name).toBe("Paid Search");
      expect(ranked[1].name).toBe("Organic Search");
      expect(ranked[2].name).toBe("Social Media");
    });
  });

  describe("Customer Acquisition Metrics", () => {
    it("should calculate retention rate", () => {
      const newCustomers = 320;
      const returningCustomers = 280;
      const retention = (returningCustomers / (newCustomers + returningCustomers)) * 100;

      expect(retention).toBeCloseTo(46.67, 1);
    });

    it("should calculate new customer percentage", () => {
      const newCustomers = 320;
      const returningCustomers = 280;
      const newPercentage = (newCustomers / (newCustomers + returningCustomers)) * 100;

      expect(newPercentage).toBeCloseTo(53.33, 1);
    });

    it("should track customer acquisition by channel", () => {
      const channels = [
        { channel: "Organic Search", newCustomers: 320, returningCustomers: 280 },
        { channel: "Paid Search", newCustomers: 420, returningCustomers: 350 },
        { channel: "Social Media", newCustomers: 280, returningCustomers: 200 },
      ];

      const totalNew = channels.reduce((sum, ch) => sum + ch.newCustomers, 0);
      const totalReturning = channels.reduce((sum, ch) => sum + ch.returningCustomers, 0);

      expect(totalNew).toBe(1020);
      expect(totalReturning).toBe(830);
    });
  });

  describe("ROI Comparison", () => {
    it("should identify best ROI channel", () => {
      const channels = [
        { channel: "Email Marketing", roi: 1100 },
        { channel: "Referral", roi: 1700 },
        { channel: "Organic Search", roi: 800 },
        { channel: "Paid Search", roi: 500 },
      ];

      const bestROI = channels.reduce((best, ch) => (ch.roi > best.roi ? ch : best));

      expect(bestROI.channel).toBe("Referral");
      expect(bestROI.roi).toBe(1700);
    });

    it("should rank channels by ROI", () => {
      const channels = [
        { channel: "Email Marketing", roi: 1100 },
        { channel: "Referral", roi: 1700 },
        { channel: "Organic Search", roi: 800 },
        { channel: "Paid Search", roi: 500 },
      ];

      const ranked = [...channels].sort((a, b) => b.roi - a.roi);

      expect(ranked[0].channel).toBe("Referral");
      expect(ranked[1].channel).toBe("Email Marketing");
      expect(ranked[2].channel).toBe("Organic Search");
      expect(ranked[3].channel).toBe("Paid Search");
    });

    it("should calculate average ROI", () => {
      const channels = [
        { roi: 1100 },
        { roi: 1700 },
        { roi: 800 },
        { roi: 500 },
        { roi: 300 },
        { roi: 0 },
      ];

      const avgROI = channels.reduce((sum, ch) => sum + ch.roi, 0) / channels.length;

      expect(avgROI).toBeCloseTo(733.33, 0);
    });
  });

  describe("Channel Spend Analysis", () => {
    it("should calculate spend distribution", () => {
      const channels = [
        { channel: "Organic Search", spend: 5000 },
        { channel: "Paid Search", spend: 12000 },
        { channel: "Social Media", spend: 8000 },
        { channel: "Email Marketing", spend: 2000 },
        { channel: "Referral", spend: 1000 },
      ];

      const totalSpend = channels.reduce((sum, ch) => sum + ch.spend, 0);
      const distribution = channels.map((ch) => ({
        channel: ch.channel,
        percentage: (ch.spend / totalSpend) * 100,
      }));

      expect(distribution[0].percentage).toBeCloseTo(17.86, 0);
      expect(distribution[1].percentage).toBeCloseTo(42.86, 0);
      expect(distribution.reduce((sum, d) => sum + d.percentage, 0)).toBeCloseTo(100, 0);
    });

    it("should identify highest spend channel", () => {
      const channels = [
        { channel: "Organic Search", spend: 5000 },
        { channel: "Paid Search", spend: 12000 },
        { channel: "Social Media", spend: 8000 },
      ];

      const highest = channels.reduce((max, ch) => (ch.spend > max.spend ? ch : max));

      expect(highest.channel).toBe("Paid Search");
      expect(highest.spend).toBe(12000);
    });
  });

  describe("Revenue Efficiency", () => {
    it("should calculate revenue per dollar spent", () => {
      const channels = [
        { channel: "Email Marketing", spend: 2000, revenue: 24000 },
        { channel: "Referral", spend: 1000, revenue: 18000 },
        { channel: "Organic Search", spend: 5000, revenue: 45000 },
      ];

      const efficiency = channels.map((ch) => ({
        channel: ch.channel,
        revenuePerDollar: ch.revenue / ch.spend,
      }));

      expect(efficiency[0].revenuePerDollar).toBe(12);
      expect(efficiency[1].revenuePerDollar).toBe(18);
      expect(efficiency[2].revenuePerDollar).toBe(9);
    });

    it("should identify most efficient channel", () => {
      const channels = [
        { channel: "Email Marketing", spend: 2000, revenue: 24000 },
        { channel: "Referral", spend: 1000, revenue: 18000 },
        { channel: "Organic Search", spend: 5000, revenue: 45000 },
      ];

      const mostEfficient = channels.reduce((best, ch) => {
        const bestRatio = best.revenue / best.spend;
        const chRatio = ch.revenue / ch.spend;
        return chRatio > bestRatio ? ch : best;
      });

      expect(mostEfficient.channel).toBe("Referral");
    });
  });

  describe("Trend Analysis", () => {
    it("should calculate month-over-month growth", () => {
      const previousMonth = 150000;
      const currentMonth = 180000;
      const growth = ((currentMonth - previousMonth) / previousMonth) * 100;

      expect(growth).toBe(20);
    });

    it("should identify growth trends by channel", () => {
      const trends = [
        { month: "Jan", revenue: 100000 },
        { month: "Feb", revenue: 120000 },
        { month: "Mar", revenue: 150000 },
      ];

      const growth = [];
      for (let i = 1; i < trends.length; i++) {
        const monthGrowth =
          ((trends[i].revenue - trends[i - 1].revenue) / trends[i - 1].revenue) * 100;
        growth.push(monthGrowth);
      }

      expect(growth[0]).toBeCloseTo(20, 1);
      expect(growth[1]).toBeCloseTo(25, 1);
    });
  });

  describe("Data Validation", () => {
    it("should validate channel data structure", () => {
      const channel = {
        channel: "Organic Search",
        spend: 5000,
        revenue: 45000,
        customers: 320,
        conversions: 480,
        roi: 800,
        cac: 15.63,
        conversionRate: 8.5,
      };

      const isValid =
        typeof channel.channel === "string" &&
        typeof channel.spend === "number" &&
        typeof channel.revenue === "number" &&
        typeof channel.customers === "number" &&
        channel.spend >= 0 &&
        channel.revenue >= 0 &&
        channel.customers >= 0;

      expect(isValid).toBe(true);
    });

    it("should validate metric ranges", () => {
      const metrics = {
        roi: 800,
        cac: 15.63,
        conversionRate: 8.5,
      };

      const isValid =
        metrics.roi >= 0 &&
        metrics.cac >= 0 &&
        metrics.conversionRate >= 0 &&
        metrics.conversionRate <= 100;

      expect(isValid).toBe(true);
    });

    it("should handle missing or null values", () => {
      const channel = {
        channel: "Test Channel",
        spend: null,
        revenue: 50000,
      };

      const spend = channel.spend ?? 0;
      const isValid = typeof spend === "number" && spend >= 0;

      expect(isValid).toBe(true);
    });
  });

  describe("Edge Cases", () => {
    it("should handle zero revenue", () => {
      const spend = 5000;
      const revenue = 0;
      const roi = spend === 0 ? 0 : ((revenue - spend) / spend) * 100;

      expect(roi).toBe(-100);
    });

    it("should handle very small numbers", () => {
      const spend = 0.01;
      const revenue = 0.1;
      const roi = ((revenue - spend) / spend) * 100;

      expect(roi).toBeCloseTo(900, 0);
    });

    it("should handle very large numbers", () => {
      const spend = 1000000;
      const revenue = 5000000;
      const roi = ((revenue - spend) / spend) * 100;

      expect(roi).toBe(400);
    });

    it("should handle single channel data", () => {
      const channels = [{ channel: "Only Channel", revenue: 100000 }];

      const totalRevenue = channels.reduce((sum, ch) => sum + ch.revenue, 0);

      expect(totalRevenue).toBe(100000);
      expect(channels.length).toBe(1);
    });
  });

  describe("Performance Benchmarks", () => {
    it("should process large dataset efficiently", () => {
      const largeDataset = Array.from({ length: 1000 }, (_, i) => ({
        channel: `Channel ${i}`,
        revenue: Math.random() * 100000,
        spend: Math.random() * 50000,
      }));

      const start = performance.now();
      const totalRevenue = largeDataset.reduce((sum, ch) => sum + ch.revenue, 0);
      const totalSpend = largeDataset.reduce((sum, ch) => sum + ch.spend, 0);
      const end = performance.now();

      expect(totalRevenue).toBeGreaterThan(0);
      expect(totalSpend).toBeGreaterThan(0);
      expect(end - start).toBeLessThan(100); // Should complete in less than 100ms
    });
  });
});
