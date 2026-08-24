import { describe, it, expect } from "vitest";
import { AIAdvisorService } from "./services/ai-advisor-service";

describe("AI Advisor Service", () => {
  const testUserId = 1;

  describe("Natural Language Queries", () => {
    it("should process ROAS and marketing ad spend inquiries", async () => {
      const result = await AIAdvisorService.answerQuery(testUserId, "What is our current ROAS and ad spend?");
      expect(result).toBeDefined();
      expect(result.intent).toBe("roas");
      expect(result.answer).toContain("ROAS");
      expect(result.keyMetrics).toBeDefined();
      expect(result.keyMetrics?.length).toBeGreaterThan(0);
      expect(result.recommendations.length).toBeGreaterThan(0);
      expect(result.suggestedFollowUps.length).toBeGreaterThan(0);
    });

    it("should process channel and marketplace comparisons", async () => {
      const result = await AIAdvisorService.answerQuery(testUserId, "Which marketplace channel is driving the most sales?");
      expect(result).toBeDefined();
      expect(result.intent).toBe("channels");
      expect(result.keyMetrics).toBeDefined();
      expect(result.chartData).toBeDefined();
      expect(result.chartData?.type).toBe("bar");
      expect(result.recommendations.length).toBeGreaterThan(0);
    });

    it("should process product margin and inventory inquiries", async () => {
      const result = await AIAdvisorService.answerQuery(testUserId, "Which products have the highest gross profit margin?");
      expect(result).toBeDefined();
      expect(result.intent).toBe("products");
      expect(result.keyMetrics?.some((m) => m.label.includes("Margin"))).toBe(true);
      expect(result.chartData).toBeDefined();
      expect(result.recommendations.length).toBeGreaterThan(0);
    });

    it("should detect anomalies and performance risks", async () => {
      const result = await AIAdvisorService.answerQuery(testUserId, "Are there any anomalies or sudden drops in sales?");
      expect(result).toBeDefined();
      expect(result.intent).toBe("anomalies");
      expect(result.answer).toContain("anomalies");
      expect(result.recommendations.length).toBeGreaterThan(0);
    });

    it("should provide general revenue overview on generic inquiries", async () => {
      const result = await AIAdvisorService.answerQuery(testUserId, "Give me a general store summary");
      expect(result).toBeDefined();
      expect(result.intent).toBe("revenue");
      expect(result.keyMetrics).toBeDefined();
      expect(result.chartData?.type).toBe("line");
    });
  });

  describe("Executive Summary & Weekly Briefing", () => {
    it("should generate a structured 7-day executive briefing", async () => {
      const summary = await AIAdvisorService.getExecutiveSummary(testUserId, "7d");
      expect(summary).toBeDefined();
      expect(summary.period).toBe("Trailing 7 Days");
      expect(summary.totalRevenue).toBeGreaterThan(0);
      expect(summary.overallRoas).toBeGreaterThan(0);
      expect(summary.channelPerformance.length).toBeGreaterThan(0);
      expect(summary.keyInsights.length).toBeGreaterThan(0);
      expect(summary.anomalyAlerts.length).toBeGreaterThan(0);
      expect(summary.strategicRecommendations.length).toBeGreaterThan(0);
    });

    it("should support 30-day and 90-day timeframes", async () => {
      const summary30 = await AIAdvisorService.getExecutiveSummary(testUserId, "30d");
      expect(summary30.period).toBe("Trailing 30 Days");

      const summary90 = await AIAdvisorService.getExecutiveSummary(testUserId, "90d");
      expect(summary90.period).toBe("Trailing 90 Days");
    });
  });

  describe("Contextual Prompt Suggestions", () => {
    it("should return actionable prompt suggestions", () => {
      const suggestions = AIAdvisorService.getPromptSuggestions();
      expect(suggestions).toBeInstanceOf(Array);
      expect(suggestions.length).toBeGreaterThan(3);
      expect(suggestions.some((s) => s.includes("ROAS"))).toBe(true);
    });
  });
});
