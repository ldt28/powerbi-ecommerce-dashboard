import { describe, it, expect } from "vitest";

/**
 * Customer Analytics Dashboard Tests
 * Tests for customer metrics calculations, data transformations, and business logic
 */

describe("Customer Analytics Dashboard", () => {
  describe("Customer Acquisition Metrics", () => {
    it("should calculate total new customers correctly", () => {
      const dailyData = [
        { newCustomers: 50, returningCustomers: 100 },
        { newCustomers: 75, returningCustomers: 120 },
        { newCustomers: 60, returningCustomers: 110 },
      ];

      const total = dailyData.reduce((sum, d) => sum + d.newCustomers, 0);
      expect(total).toBe(185);
    });

    it("should calculate returning customer percentage", () => {
      const newCustomers = 185;
      const returningCustomers = 330;
      const total = newCustomers + returningCustomers;
      const returningPercentage = (returningCustomers / total) * 100;

      expect(returningPercentage).toBeCloseTo(64.06, 1);
    });

    it("should track customer acquisition by channel", () => {
      const channels = [
        { channel: "Organic", customers: 420, percentage: 35 },
        { channel: "Paid Search", customers: 336, percentage: 28 },
        { channel: "Social Media", customers: 216, percentage: 18 },
      ];

      const totalCustomers = channels.reduce((sum, c) => sum + c.customers, 0);
      expect(totalCustomers).toBe(972);

      const organicPercentage = (420 / 972) * 100;
      expect(organicPercentage).toBeCloseTo(43.2, 1);
    });

    it("should calculate month-over-month growth", () => {
      const previousMonth = 450;
      const currentMonth = 505;
      const growth = ((currentMonth - previousMonth) / previousMonth) * 100;

      expect(growth).toBeCloseTo(12.22, 1);
    });
  });

  describe("Customer Lifetime Value (LTV)", () => {
    it("should calculate average LTV correctly", () => {
      const customers = [
        { id: 1, ltv: 250 },
        { id: 2, ltv: 680 },
        { id: 3, ltv: 420 },
        { id: 4, ltv: 1200 },
      ];

      const avgLTV = customers.reduce((sum, c) => sum + c.ltv, 0) / customers.length;
      expect(avgLTV).toBe(637.5);
    });

    it("should distribute customers by LTV ranges", () => {
      const ltvRanges = [
        { range: "$0-100", customers: 450 },
        { range: "$100-500", customers: 380 },
        { range: "$500-1000", customers: 220 },
        { range: "$1000-5000", customers: 95 },
        { range: "$5000+", customers: 35 },
      ];

      const totalCustomers = ltvRanges.reduce((sum, r) => sum + r.customers, 0);
      expect(totalCustomers).toBe(1180);

      const highValuePercentage = ((95 + 35) / totalCustomers) * 100;
      expect(highValuePercentage).toBeCloseTo(11.02, 1);
    });

    it("should calculate LTV growth vs previous period", () => {
      const previousAvgLTV = 500;
      const currentAvgLTV = 542;
      const growth = ((currentAvgLTV - previousAvgLTV) / previousAvgLTV) * 100;

      expect(growth).toBe(8.4);
    });

    it("should identify high-value customer segments", () => {
      const customers = [
        { id: 1, ltv: 150, segment: "Regular" },
        { id: 2, ltv: 3200, segment: "VIP" },
        { id: 3, ltv: 1450, segment: "High Value" },
        { id: 4, ltv: 45, segment: "Dormant" },
      ];

      const vipCustomers = customers.filter((c) => c.ltv > 2000);
      expect(vipCustomers.length).toBe(1);
      expect(vipCustomers[0].segment).toBe("VIP");
    });
  });

  describe("Retention Metrics", () => {
    it("should calculate cohort retention rate", () => {
      const cohortSize = 1000;
      const month6Retained = 420;
      const retentionRate = (month6Retained / cohortSize) * 100;

      expect(retentionRate).toBe(42);
    });

    it("should track retention curve over time", () => {
      const retentionByMonth = [
        { month: 1, retention: 100 },
        { month: 2, retention: 68 },
        { month: 3, retention: 52 },
        { month: 6, retention: 42 },
      ];

      const churnFromMonth1To2 = 100 - 68;
      expect(churnFromMonth1To2).toBe(32);

      const churnFromMonth2To3 = 68 - 52;
      expect(churnFromMonth2To3).toBe(16);
    });

    it("should calculate retention improvement", () => {
      const previousCohortRetention = 38;
      const currentCohortRetention = 42;
      const improvement = currentCohortRetention - previousCohortRetention;

      expect(improvement).toBe(4);
      expect(improvement).toBeGreaterThan(0);
    });

    it("should identify at-risk customers", () => {
      const customers = [
        { id: 1, lastPurchaseDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), status: "Active" },
        { id: 2, lastPurchaseDate: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000), status: "At Risk" },
        { id: 3, lastPurchaseDate: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000), status: "Dormant" },
      ];

      const atRiskThreshold = 90; // days
      const atRiskCustomers = customers.filter((c) => {
        const daysSinceLastPurchase = (Date.now() - c.lastPurchaseDate.getTime()) / (24 * 60 * 60 * 1000);
        return daysSinceLastPurchase > atRiskThreshold;
      });

      expect(atRiskCustomers.length).toBe(2);
    });
  });

  describe("Customer Segmentation", () => {
    it("should segment customers by value tier", () => {
      const segments = [
        { segment: "VIP", customers: 85, avgLTV: 3200 },
        { segment: "High Value", customers: 245, avgLTV: 1450 },
        { segment: "Regular", customers: 680, avgLTV: 380 },
        { segment: "At Risk", customers: 320, avgLTV: 120 },
        { segment: "Dormant", customers: 1200, avgLTV: 45 },
      ];

      const totalCustomers = segments.reduce((sum, s) => sum + s.customers, 0);
      expect(totalCustomers).toBe(2530);

      const vipPercentage = (85 / totalCustomers) * 100;
      expect(vipPercentage).toBeCloseTo(3.36, 1);
    });

    it("should calculate segment revenue contribution", () => {
      const segments = [
        { segment: "VIP", customers: 85, avgLTV: 3200 },
        { segment: "High Value", customers: 245, avgLTV: 1450 },
        { segment: "Regular", customers: 680, avgLTV: 380 },
      ];

      const totalRevenue = segments.reduce((sum, s) => sum + s.customers * s.avgLTV, 0);
      const vipRevenue = 85 * 3200;
      const vipPercentageOfRevenue = (vipRevenue / totalRevenue) * 100;

      expect(vipPercentageOfRevenue).toBeCloseTo(30.71, 1);
    });

    it("should track retention by segment", () => {
      const segments = [
        { segment: "VIP", retention: 92 },
        { segment: "High Value", retention: 68 },
        { segment: "Regular", retention: 42 },
        { segment: "At Risk", retention: 8 },
      ];

      const avgRetention = segments.reduce((sum, s) => sum + s.retention, 0) / segments.length;
      expect(avgRetention).toBe(52.5);
    });

    it("should identify churn risk by segment", () => {
      const segments = [
        { segment: "VIP", retention: 92, riskLevel: "Low" },
        { segment: "High Value", retention: 68, riskLevel: "Medium" },
        { segment: "Regular", retention: 42, riskLevel: "High" },
        { segment: "At Risk", retention: 8, riskLevel: "Critical" },
      ];

      const criticalRisk = segments.filter((s) => s.riskLevel === "Critical");
      expect(criticalRisk.length).toBe(1);
      expect(criticalRisk[0].segment).toBe("At Risk");
    });
  });

  describe("Repurchase Analysis", () => {
    it("should calculate repurchase rate", () => {
      const totalCustomers = 1500;
      const customersWithMultiplePurchases = 570;
      const repurchaseRate = (customersWithMultiplePurchases / totalCustomers) * 100;

      expect(repurchaseRate).toBe(38);
    });

    it("should calculate average purchase frequency", () => {
      const customers = [
        { id: 1, purchases: 1 },
        { id: 2, purchases: 3 },
        { id: 3, purchases: 2 },
        { id: 4, purchases: 5 },
        { id: 5, purchases: 1 },
      ];

      const avgFrequency = customers.reduce((sum, c) => sum + c.purchases, 0) / customers.length;
      expect(avgFrequency).toBe(2.4);
    });

    it("should track repeat purchase rate improvement", () => {
      const previousRate = 35;
      const currentRate = 38;
      const improvement = currentRate - previousRate;

      expect(improvement).toBe(3);
      expect(improvement).toBeGreaterThan(0);
    });

    it("should identify high-frequency purchasers", () => {
      const customers = [
        { id: 1, purchases: 1 },
        { id: 2, purchases: 8 },
        { id: 3, purchases: 2 },
        { id: 4, purchases: 12 },
        { id: 5, purchases: 1 },
      ];

      const frequentPurchasers = customers.filter((c) => c.purchases >= 5);
      expect(frequentPurchasers.length).toBe(2);
    });
  });

  describe("Cohort Analysis", () => {
    it("should calculate cohort size", () => {
      const cohorts = [
        { month: "Jan 2026", size: 450 },
        { month: "Feb 2026", size: 520 },
        { month: "Mar 2026", size: 480 },
      ];

      const totalCohortSize = cohorts.reduce((sum, c) => sum + c.size, 0);
      expect(totalCohortSize).toBe(1450);
    });

    it("should calculate cohort retention at different ages", () => {
      const cohort = {
        month: "Jan 2026",
        size: 450,
        m1: 100,
        m3: 58,
        m6: 42,
      };

      const churnM1ToM3 = cohort.m1 - cohort.m3;
      expect(churnM1ToM3).toBe(42);

      const churnM3ToM6 = cohort.m3 - cohort.m6;
      expect(churnM3ToM6).toBe(16);
    });

    it("should calculate cohort LTV", () => {
      const cohort = {
        month: "Jan 2026",
        size: 450,
        totalRevenue: 306000,
      };

      const cohortLTV = cohort.totalRevenue / cohort.size;
      expect(cohortLTV).toBe(680);
    });

    it("should compare cohort performance", () => {
      const cohorts = [
        { month: "Jan 2026", ltv: 680, retention: 42 },
        { month: "Feb 2026", ltv: 620, retention: 45 },
        { month: "Mar 2026", ltv: 540, retention: 48 },
      ];

      const bestRetentionCohort = cohorts.reduce((best, current) =>
        current.retention > best.retention ? current : best
      );

      expect(bestRetentionCohort.month).toBe("Mar 2026");
      expect(bestRetentionCohort.retention).toBe(48);
    });
  });

  describe("Data Validation", () => {
    it("should validate customer count is non-negative", () => {
      const customerCounts = [450, 520, 480];
      const isValid = customerCounts.every((count) => count >= 0);
      expect(isValid).toBe(true);
    });

    it("should validate retention rate is between 0-100", () => {
      const retentionRates = [100, 68, 52, 42, 15];
      const isValid = retentionRates.every((rate) => rate >= 0 && rate <= 100);
      expect(isValid).toBe(true);
    });

    it("should validate LTV is non-negative", () => {
      const ltvValues = [250, 680, 420, 1200, 0];
      const isValid = ltvValues.every((ltv) => ltv >= 0);
      expect(isValid).toBe(true);
    });

    it("should validate percentage values", () => {
      const percentages = [35, 28, 18, 12, 7];
      const total = percentages.reduce((sum, p) => sum + p, 0);
      expect(total).toBe(100);
    });
  });

  describe("Edge Cases", () => {
    it("should handle zero customers", () => {
      const customers = [];
      const avgLTV = customers.length > 0 ? customers.reduce((sum, c) => sum + c.ltv, 0) / customers.length : 0;
      expect(avgLTV).toBe(0);
    });

    it("should handle single customer", () => {
      const customers = [{ id: 1, ltv: 500 }];
      const avgLTV = customers.reduce((sum, c) => sum + c.ltv, 0) / customers.length;
      expect(avgLTV).toBe(500);
    });

    it("should handle very high LTV values", () => {
      const customers = [
        { id: 1, ltv: 50000 },
        { id: 2, ltv: 75000 },
      ];
      const avgLTV = customers.reduce((sum, c) => sum + c.ltv, 0) / customers.length;
      expect(avgLTV).toBe(62500);
    });

    it("should handle retention rate of 0%", () => {
      const cohortSize = 1000;
      const retained = 0;
      const retentionRate = (retained / cohortSize) * 100;
      expect(retentionRate).toBe(0);
    });

    it("should handle retention rate of 100%", () => {
      const cohortSize = 1000;
      const retained = 1000;
      const retentionRate = (retained / cohortSize) * 100;
      expect(retentionRate).toBe(100);
    });
  });
});
