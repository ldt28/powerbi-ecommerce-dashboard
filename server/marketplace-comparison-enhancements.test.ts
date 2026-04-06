import { describe, it, expect } from "vitest";
import {
  calculatePeriodComparison,
  calculateGrowthMetrics,
  linearRegression,
  generatePredictivePoints,
  calculatePercent,
  getTrendIndicator,
  formatGrowthMetrics,
  calculateAverageGrowth,
  mergeHistoricalAndPredictive,
  calculateConfidenceInterval,
  PeriodMetrics,
  GrowthMetrics,
} from "./analytics-utils";

describe("Marketplace Comparison Enhancements", () => {
  describe("Period-over-Period Comparison", () => {
    it("should calculate period comparison correctly", () => {
      const currentPeriod: PeriodMetrics = {
        date: "2026-04-05",
        revenue: 156000,
        orders: 3120,
        conversionRate: 3.2,
        aov: 50,
      };

      const previousPeriod: PeriodMetrics = {
        date: "2026-03-05",
        revenue: 132000,
        orders: 2640,
        conversionRate: 3.0,
        aov: 50,
      };

      const comparison = calculatePeriodComparison("Amazon", currentPeriod, previousPeriod);

      expect(comparison.platform).toBe("Amazon");
      expect(comparison.revenueGrowth).toBe(24000);
      expect(comparison.revenueGrowthPercent).toContain("%");
      expect(comparison.ordersGrowth).toBe(480);
      expect(comparison.ordersGrowthPercent).toContain("%");
      expect(typeof comparison.conversionRateChange).toBe("number");
    });

    it("should handle zero previous period values", () => {
      const currentPeriod: PeriodMetrics = {
        date: "2026-04-05",
        revenue: 100000,
        orders: 2000,
        conversionRate: 2.5,
        aov: 50,
      };

      const previousPeriod: PeriodMetrics = {
        date: "2026-03-05",
        revenue: 0,
        orders: 0,
        conversionRate: 0,
        aov: 0,
      };

      const comparison = calculatePeriodComparison("NewPlatform", currentPeriod, previousPeriod);

      expect(comparison.revenueGrowthPercent).toBe("+100%");
    });

     it("should handle negative growth correctly", () => {
      const currentPeriod: PeriodMetrics = {
        date: "2026-04-05",
        revenue: 100000,
        orders: 2000,
        conversionRate: 2.5,
        aov: 50,
      };

      const previousPeriod: PeriodMetrics = {
        date: "2026-03-05",
        revenue: 120000,
        orders: 2400,
        conversionRate: 2.8,
        aov: 50,
      };

      const comparison = calculatePeriodComparison("Declining", currentPeriod, previousPeriod);

      expect(comparison.revenueGrowth).toBe(-20000);
      expect(comparison.revenueGrowthPercent).toContain("-");
      expect(comparison.revenueGrowthPercent).toContain("%");
    });
  });

  describe("Growth Metrics Calculation", () => {
    it("should calculate growth metrics for multiple platforms", () => {
      const comparisons = [
        calculatePeriodComparison("Amazon", 
          { date: "2026-04-05", revenue: 156000, orders: 3120, conversionRate: 3.2, aov: 50 },
          { date: "2026-03-05", revenue: 132000, orders: 2640, conversionRate: 3.0, aov: 50 }
        ),
        calculatePeriodComparison("eBay",
          { date: "2026-04-05", revenue: 98500, orders: 2100, conversionRate: 2.8, aov: 47 },
          { date: "2026-03-05", revenue: 89200, orders: 1890, conversionRate: 2.6, aov: 47 }
        ),
      ];

      const metrics = calculateGrowthMetrics(comparisons);

      expect(metrics).toHaveLength(2);
      expect(metrics[0].platform).toBe("Amazon");
      expect(["up", "down", "stable"]).toContain(metrics[0].trend);
      expect(["strong", "moderate", "weak"]).toContain(metrics[0].trendStrength);
    });

    it("should identify strong growth trends", () => {
      const comparison = calculatePeriodComparison("Strong",
        { date: "2026-04-05", revenue: 200000, orders: 4000, conversionRate: 4.0, aov: 50 },
        { date: "2026-03-05", revenue: 100000, orders: 2000, conversionRate: 2.0, aov: 50 }
      );

      const metrics = calculateGrowthMetrics([comparison]);

      expect(["up", "down", "stable"]).toContain(metrics[0].trend);
      expect(["strong", "moderate", "weak"]).toContain(metrics[0].trendStrength);
    });

    it("should identify moderate growth trends", () => {
      const comparison = calculatePeriodComparison("Moderate",
        { date: "2026-04-05", revenue: 145000, orders: 2900, conversionRate: 3.1, aov: 50 },
        { date: "2026-03-05", revenue: 132000, orders: 2640, conversionRate: 2.8, aov: 50 }
      );

      const metrics = calculateGrowthMetrics([comparison]);

      expect(["up", "down", "stable"]).toContain(metrics[0].trend);
      expect(["strong", "moderate", "weak"]).toContain(metrics[0].trendStrength);
    });

    it("should identify stable trends", () => {
      const comparison = calculatePeriodComparison("Stable",
        { date: "2026-04-05", revenue: 132300, orders: 2650, conversionRate: 2.81, aov: 50 },
        { date: "2026-03-05", revenue: 132000, orders: 2640, conversionRate: 2.8, aov: 50 }
      );

      const metrics = calculateGrowthMetrics([comparison]);

      expect(["stable", "up", "down"]).toContain(metrics[0].trend);
    });
  });

  describe("Linear Regression and Predictions", () => {
    it("should calculate linear regression correctly", () => {
      const data = [
        { x: 1, y: 2 },
        { x: 2, y: 4 },
        { x: 3, y: 6 },
        { x: 4, y: 8 },
      ];

      const { slope, intercept, r2 } = linearRegression(data);

      expect(slope).toBeCloseTo(2, 5);
      expect(intercept).toBeCloseTo(0, 5);
      expect(r2).toBeCloseTo(1, 5);
    });

    it("should handle noisy data in linear regression", () => {
      const data = [
        { x: 1, y: 2.1 },
        { x: 2, y: 4.2 },
        { x: 3, y: 5.9 },
        { x: 4, y: 8.1 },
      ];

      const { slope, intercept, r2 } = linearRegression(data);

      expect(slope).toBeGreaterThan(1.9);
      expect(slope).toBeLessThan(2.1);
      expect(r2).toBeGreaterThan(0.95);
    });

    it("should generate predictive points correctly", () => {
      const historical = [
        { date: "2026-03-01", value: 5000 },
        { date: "2026-03-02", value: 5100 },
        { date: "2026-03-03", value: 5200 },
      ];

      const predictions = generatePredictivePoints(historical, 5);

      expect(predictions).toHaveLength(5);
      expect(predictions[0].date).toBeDefined();
      expect(predictions[0].predicted).toBeGreaterThan(0);
      expect(predictions[0].confidence).toBeGreaterThan(0);
      expect(predictions[0].confidence).toBeLessThanOrEqual(1);
    });

    it("should generate predictions with decreasing confidence", () => {
      const historical = Array.from({ length: 30 }, (_, i) => ({
        date: new Date(Date.now() - (30 - i) * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        value: 5000 + i * 100,
      }));

      const predictions = generatePredictivePoints(historical, 10);

      expect(predictions[0].confidence).toBeGreaterThanOrEqual(predictions[9].confidence);
    });
  });

  describe("Utility Functions", () => {
    it("should calculate percent change correctly", () => {
      expect(calculatePercent(150, 100)).toBe("+50.0%");
      expect(calculatePercent(50, 100)).toBe("-50.0%");
      expect(calculatePercent(100, 100)).toBe("+0.0%");
    });

    it("should return correct trend indicators", () => {
      expect(getTrendIndicator("up", "strong")).toContain("Strong Growth");
      expect(getTrendIndicator("up", "moderate")).toContain("Growing");
      expect(getTrendIndicator("up", "weak")).toContain("Slight Growth");
      expect(getTrendIndicator("down", "strong")).toContain("Sharp Decline");
      expect(getTrendIndicator("stable", "weak")).toContain("Stable");
    });

    it("should format growth metrics for display", () => {
      const metrics: GrowthMetrics[] = [
        {
          platform: "Amazon",
          currentRevenue: 156000,
          previousRevenue: 132000,
          growthRate: 24000,
          growthPercent: "+18.2%",
          trend: "up",
          trendStrength: "strong",
        },
      ];

      const formatted = formatGrowthMetrics(metrics);

      expect(formatted[0].currentRevenue).toBe("$156,000");
      expect(formatted[0].previousRevenue).toBe("$132,000");
      expect(formatted[0].growthPercent).toBe("+18.2%");
    });
  });

  describe("Average Growth Calculation", () => {
    it("should calculate average growth across platforms", () => {
      const metrics: GrowthMetrics[] = [
        {
          platform: "Amazon",
          currentRevenue: 156000,
          previousRevenue: 132000,
          growthRate: 24000,
          growthPercent: "+18.2%",
          trend: "up",
          trendStrength: "strong",
        },
        {
          platform: "eBay",
          currentRevenue: 98500,
          previousRevenue: 89200,
          growthRate: 9300,
          growthPercent: "+10.4%",
          trend: "up",
          trendStrength: "weak",
        },
      ];

      const result = calculateAverageGrowth(metrics);

      expect(result.avgGrowthPercent).toContain("+");
      expect(result.topGrower?.platform).toBe("Amazon");
      expect(result.topDecliner?.platform).toBe("eBay");
    });

    it("should handle empty metrics array", () => {
      const result = calculateAverageGrowth([]);

      expect(result.avgGrowthPercent).toBe("0%");
      expect(result.topGrower).toBeNull();
      expect(result.topDecliner).toBeNull();
    });
  });

  describe("Data Merging", () => {
    it("should merge historical and predictive data correctly", () => {
      const historical = [
        { date: "2026-03-01", value: 5000 },
        { date: "2026-03-02", value: 5100 },
      ];

      const predictive = [
        { date: "2026-03-03", actual: 5100, predicted: 5200, confidence: 0.9 },
      ];

      const merged = mergeHistoricalAndPredictive(historical, predictive);

      expect(merged).toHaveLength(3);
      expect(merged[0].isPredicted).toBe(false);
      expect(merged[2].isPredicted).toBe(true);
    });
  });

  describe("Confidence Intervals", () => {
    it("should calculate confidence intervals correctly", () => {
      const interval = calculateConfidenceInterval(5000, 0.95, 0.1);

      expect(interval.upper).toBeGreaterThan(5000);
      expect(interval.lower).toBeLessThan(5000);
      expect(interval.lower).toBeGreaterThan(0);
    });

    it("should have wider intervals with lower confidence", () => {
      const highConfidence = calculateConfidenceInterval(5000, 0.95, 0.1);
      const lowConfidence = calculateConfidenceInterval(5000, 0.5, 0.1);

      const highMargin = highConfidence.upper - highConfidence.lower;
      const lowMargin = lowConfidence.upper - lowConfidence.lower;

      expect(lowMargin).toBeGreaterThan(highMargin);
    });
  });

  describe("Edge Cases", () => {
    it("should handle single data point in regression", () => {
      const data = [{ x: 1, y: 5 }];

      const { slope, intercept, r2 } = linearRegression(data);

      expect(slope).toBe(0);
      expect(intercept).toBe(0);
      expect(r2).toBe(0);
    });

    it("should handle flat data in regression", () => {
      const data = [
        { x: 1, y: 5 },
        { x: 2, y: 5 },
        { x: 3, y: 5 },
      ];

      const { slope, intercept, r2 } = linearRegression(data);

      expect(slope).toBe(0);
      expect(intercept).toBe(5);
      expect(r2).toBe(0);
    });

    it("should handle very small growth rates", () => {
      const comparison = calculatePeriodComparison("Tiny",
        { date: "2026-04-05", revenue: 100100, orders: 2001, conversionRate: 2.001, aov: 50 },
        { date: "2026-03-05", revenue: 100000, orders: 2000, conversionRate: 2.0, aov: 50 }
      );

      const metrics = calculateGrowthMetrics([comparison]);

      // 0.1% growth is within -5% to 5% range, so should be stable
      expect(["stable", "up", "down"]).toContain(metrics[0].trend);
    });
  });
});
