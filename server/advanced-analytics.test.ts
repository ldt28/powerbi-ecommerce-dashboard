import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  detectAnomalies,
  detectTrendChange,
  exponentialSmoothing,
  linearRegression,
  firstTouchAttribution,
  lastTouchAttribution,
  linearAttribution,
  timeDecayAttribution,
  positionBasedAttribution,
  calculateFunnelMetrics,
} from "./analytics-engine";

describe("Advanced Analytics Engine", () => {
  describe("Anomaly Detection", () => {
    it("should detect spikes in data", () => {
      const data = [
        { date: new Date("2024-01-01"), value: 100 },
        { date: new Date("2024-01-02"), value: 105 },
        { date: new Date("2024-01-03"), value: 102 },
        { date: new Date("2024-01-04"), value: 500 }, // Spike
        { date: new Date("2024-01-05"), value: 103 },
      ];

      const anomalies = detectAnomalies(data, 1.5);
      expect(anomalies.length).toBeGreaterThan(0);
      expect(anomalies.some(a => a.type === "spike")).toBe(true);
    });

    it("should detect drops in data", () => {
      const data = [
        { date: new Date("2024-01-01"), value: 100 },
        { date: new Date("2024-01-02"), value: 105 },
        { date: new Date("2024-01-03"), value: 102 },
        { date: new Date("2024-01-04"), value: 10 }, // Drop
        { date: new Date("2024-01-05"), value: 103 },
      ];

      const anomalies = detectAnomalies(data, 1.5);
      expect(anomalies.length).toBeGreaterThan(0);
      expect(anomalies.some(a => a.type === "drop")).toBe(true);
    });

    it("should return empty array for normal data", () => {
      const data = [
        { date: new Date("2024-01-01"), value: 100 },
        { date: new Date("2024-01-02"), value: 101 },
        { date: new Date("2024-01-03"), value: 102 },
        { date: new Date("2024-01-04"), value: 103 },
        { date: new Date("2024-01-05"), value: 104 },
      ];

      const anomalies = detectAnomalies(data, 2);
      expect(anomalies.length).toBe(0);
    });

    it("should handle empty data", () => {
      const anomalies = detectAnomalies([], 2);
      expect(anomalies).toEqual([]);
    });
  });

  describe("Trend Detection", () => {
    it("should detect upward trend change", () => {
      const data = [
        { date: new Date("2024-01-01"), value: 100 },
        { date: new Date("2024-01-02"), value: 101 },
        { date: new Date("2024-01-03"), value: 102 },
        { date: new Date("2024-01-04"), value: 200 },
        { date: new Date("2024-01-05"), value: 201 },
        { date: new Date("2024-01-06"), value: 202 },
        { date: new Date("2024-01-07"), value: 203 },
        { date: new Date("2024-01-08"), value: 204 },
        { date: new Date("2024-01-09"), value: 205 },
        { date: new Date("2024-01-10"), value: 206 },
        { date: new Date("2024-01-11"), value: 207 },
        { date: new Date("2024-01-12"), value: 208 },
        { date: new Date("2024-01-13"), value: 209 },
        { date: new Date("2024-01-14"), value: 210 },
      ];

      const trendChanged = detectTrendChange(data, 7);
      expect(trendChanged).toBe(true);
    });

    it("should not detect trend change for stable data", () => {
      const data = Array.from({ length: 20 }, (_, i) => ({
        date: new Date(`2024-01-${i + 1}`),
        value: 100,
      }));

      const trendChanged = detectTrendChange(data, 7);
      expect(trendChanged).toBe(false);
    });
  });

  describe("Forecasting", () => {
    it("should apply exponential smoothing", () => {
      const data = [100, 102, 101, 103, 102, 104, 103, 105];
      const forecast = exponentialSmoothing(data, 0.3, 5);

      expect(forecast.length).toBe(5);
      expect(forecast.every(v => typeof v === "number")).toBe(true);
      expect(forecast.every(v => v > 0)).toBe(true);
    });

    it("should calculate linear regression", () => {
      const data = [10, 20, 30, 40, 50];
      const { slope, intercept, r2 } = linearRegression(data);

      expect(slope).toBeGreaterThan(0);
      expect(r2).toBeGreaterThanOrEqual(0);
      expect(r2).toBeLessThanOrEqual(1);
    });

    it("should handle constant data in linear regression", () => {
      const data = [100, 100, 100, 100, 100];
      const { slope, r2 } = linearRegression(data);

      expect(slope).toBe(0);
      expect(r2).toBe(0);
    });

    it("should handle single data point", () => {
      const data = [100];
      const { slope, intercept, r2 } = linearRegression(data);

      expect(slope).toBe(0);
      expect(intercept).toBe(0); // With single point, mean is 0
      expect(r2).toBe(0);
    });
  });

  describe("Attribution Modeling", () => {
    const touchpoints = [
      { source: "organic", value: 0 },
      { source: "email", value: 0 },
      { source: "paid_search", value: 0 },
    ];
    const conversionValue = 100;

    it("should calculate first-touch attribution", () => {
      const attributed = firstTouchAttribution(touchpoints, conversionValue);
      expect(attributed).toBe(conversionValue);
    });

    it("should calculate last-touch attribution", () => {
      const attributed = lastTouchAttribution(touchpoints, conversionValue);
      expect(attributed).toBe(conversionValue);
    });

    it("should calculate linear attribution", () => {
      const attributed = linearAttribution(touchpoints, conversionValue);
      expect(attributed).toBe(conversionValue / touchpoints.length);
    });

    it("should calculate time-decay attribution", () => {
      const touchpointsWithTime = [
        { source: "organic", value: 0, timestamp: new Date("2024-01-01") },
        { source: "email", value: 0, timestamp: new Date("2024-01-02") },
        { source: "paid_search", value: 0, timestamp: new Date("2024-01-03") },
      ];

      const attributed = timeDecayAttribution(touchpointsWithTime, conversionValue);
      expect(attributed).toBeGreaterThan(0);
      expect(attributed).toBeLessThanOrEqual(conversionValue);
    });

    it("should calculate position-based attribution", () => {
      const attributed = positionBasedAttribution(touchpoints, conversionValue);
      expect(attributed).toBeGreaterThan(0);
      expect(attributed).toBeLessThanOrEqual(conversionValue);
    });

    it("should handle single touchpoint", () => {
      const singleTouchpoint = [{ source: "direct", value: 0 }];
      const attributed = positionBasedAttribution(singleTouchpoint, conversionValue);
      expect(attributed).toBe(conversionValue);
    });

    it("should handle empty touchpoints", () => {
      const attributed = firstTouchAttribution([], conversionValue);
      expect(attributed).toBe(0);
    });
  });

  describe("Funnel Analysis", () => {
    it("should calculate funnel metrics", async () => {
      const funnelSteps = ["view", "add_to_cart", "checkout", "purchase"];
      const events = [
        { customerId: "user1", eventType: "view", timestamp: new Date() },
        { customerId: "user1", eventType: "add_to_cart", timestamp: new Date() },
        { customerId: "user1", eventType: "checkout", timestamp: new Date() },
        { customerId: "user1", eventType: "purchase", timestamp: new Date() },
        { customerId: "user2", eventType: "view", timestamp: new Date() },
        { customerId: "user2", eventType: "add_to_cart", timestamp: new Date() },
        { customerId: "user3", eventType: "view", timestamp: new Date() },
      ];

      const metrics = await calculateFunnelMetrics(1, funnelSteps, events);

      expect(metrics.stepCounts).toHaveLength(4);
      expect(metrics.stepCounts[0]).toBe(3); // 3 views
      expect(metrics.stepCounts[1]).toBe(2); // 2 add to cart
      expect(metrics.stepCounts[2]).toBe(1); // 1 checkout
      expect(metrics.stepCounts[3]).toBe(1); // 1 purchase
      expect(metrics.conversionRate).toBeGreaterThan(0);
      expect(metrics.dropoffRate).toBeGreaterThan(0);
    });

    it("should calculate conversion rate correctly", async () => {
      const funnelSteps = ["step1", "step2"];
      const events = [
        { customerId: "user1", eventType: "step1", timestamp: new Date() },
        { customerId: "user1", eventType: "step2", timestamp: new Date() },
        { customerId: "user2", eventType: "step1", timestamp: new Date() },
      ];

      const metrics = await calculateFunnelMetrics(1, funnelSteps, events);

      expect(metrics.conversionRate).toBe(50); // 1 out of 2 converted
      expect(metrics.dropoffRate).toBe(50);
    });

    it("should handle empty events", async () => {
      const funnelSteps = ["step1", "step2"];
      const events: any[] = [];

      const metrics = await calculateFunnelMetrics(1, funnelSteps, events);

      expect(metrics.stepCounts).toEqual([0, 0]);
      expect(metrics.conversionRate).toBe(0);
      expect(metrics.dropoffRate).toBe(100);
    });
  });

  describe("Data Validation", () => {
    it("should handle negative values in anomaly detection", () => {
      const data = [
        { date: new Date("2024-01-01"), value: -100 },
        { date: new Date("2024-01-02"), value: -105 },
        { date: new Date("2024-01-03"), value: -102 },
      ];

      const anomalies = detectAnomalies(data, 2);
      expect(Array.isArray(anomalies)).toBe(true);
    });

    it("should handle zero values in linear regression", () => {
      const data = [0, 0, 0, 0, 0];
      const { slope, intercept, r2 } = linearRegression(data);

      expect(slope).toBe(0);
      expect(intercept).toBe(0);
      expect(r2).toBe(0);
    });

    it("should handle very large numbers", () => {
      const data = [1000000, 1000001, 1000002, 1000003, 1000004];
      const { slope, r2 } = linearRegression(data);

      expect(slope).toBeGreaterThan(0);
      expect(r2).toBeGreaterThan(0.9);
    });

    it("should handle very small numbers", () => {
      const data = [0.001, 0.002, 0.003, 0.004, 0.005];
      const { slope, r2 } = linearRegression(data);

      expect(slope).toBeGreaterThan(0);
      expect(r2).toBeGreaterThan(0.9);
    });
  });

  describe("Edge Cases", () => {
    it("should handle threshold of 0 in anomaly detection", () => {
      const data = [
        { date: new Date("2024-01-01"), value: 100 },
        { date: new Date("2024-01-02"), value: 101 },
      ];

      const anomalies = detectAnomalies(data, 0);
      expect(Array.isArray(anomalies)).toBe(true);
    });

    it("should handle negative threshold in anomaly detection", () => {
      const data = [
        { date: new Date("2024-01-01"), value: 100 },
        { date: new Date("2024-01-02"), value: 101 },
      ];

      const anomalies = detectAnomalies(data, -1);
      expect(Array.isArray(anomalies)).toBe(true);
    });

    it("should handle very large window size in trend detection", () => {
      const data = Array.from({ length: 5 }, (_, i) => ({
        date: new Date(),
        value: i + 1,
      }));

      const trendChanged = detectTrendChange(data, 100);
      expect(typeof trendChanged).toBe("boolean");
    });
  });
});
