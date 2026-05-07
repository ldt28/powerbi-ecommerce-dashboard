import { describe, it, expect } from "vitest";
import {
  performFullTextSearch,
  applyFilters,
  generateAutocompleteSuggestions,
  calculateFilterRelevance,
  rankFiltersByUsage,
} from "./search-utils";

describe("Search and Filter Utilities", () => {
  describe("performFullTextSearch", () => {
    it("should find exact title match", () => {
      const items = [
        { id: "1", title: "Revenue Dashboard", description: "Total revenue", type: "dashboard" },
        { id: "2", title: "Order Analytics", description: "Order data", type: "dashboard" },
      ];

      const results = performFullTextSearch("Revenue Dashboard", items);
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].id).toBe("1");
    });

    it("should find partial matches", () => {
      const items = [
        { id: "1", title: "Revenue Dashboard", description: "Total revenue", type: "dashboard" },
        { id: "2", title: "Order Analytics", description: "Order data", type: "dashboard" },
      ];

      const results = performFullTextSearch("revenue", items);
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].score).toBeGreaterThan(0);
    });

    it("should rank results by relevance", () => {
      const items = [
        { id: "1", title: "Revenue Dashboard", description: "Total revenue metrics", type: "dashboard" },
        { id: "2", title: "Dashboard", description: "Generic dashboard", type: "dashboard" },
      ];

      const results = performFullTextSearch("Revenue", items);
      expect(results[0].id).toBe("1");
      expect(results.length).toBeGreaterThanOrEqual(1);
      if (results.length > 1) {
        expect(results[0].score).toBeGreaterThan(results[1].score);
      }
    });

    it("should return empty array for no matches", () => {
      const items = [
        { id: "1", title: "Revenue Dashboard", description: "Total revenue", type: "dashboard" },
      ];

      const results = performFullTextSearch("xyz123", items);
      expect(results.length).toBe(0);
    });
  });

  describe("applyFilters", () => {
    it("should apply equality filter", () => {
      const data = [
        { marketplace: "Amazon", revenue: 1000 },
        { marketplace: "eBay", revenue: 500 },
      ];

      const filtered = applyFilters(data, [
        { field: "marketplace", operator: "eq", value: "Amazon" },
      ]);

      expect(filtered.length).toBe(1);
      expect(filtered[0].marketplace).toBe("Amazon");
    });

    it("should apply numeric comparison filters", () => {
      const data = [
        { marketplace: "Amazon", revenue: 1000 },
        { marketplace: "eBay", revenue: 500 },
        { marketplace: "Walmart", revenue: 1500 },
      ];

      const filtered = applyFilters(data, [
        { field: "revenue", operator: "gt", value: 800 },
      ]);

      expect(filtered.length).toBe(2);
    });

    it("should apply contains filter", () => {
      const data = [
        { name: "Electronics", category: "Tech" },
        { name: "Clothing", category: "Fashion" },
      ];

      const filtered = applyFilters(data, [
        { field: "name", operator: "contains", value: "tron" },
      ]);

      expect(filtered.length).toBe(1);
      expect(filtered[0].name).toBe("Electronics");
    });

    it("should apply multiple filters with AND logic", () => {
      const data = [
        { marketplace: "Amazon", status: "Active", revenue: 1000 },
        { marketplace: "Amazon", status: "Inactive", revenue: 500 },
        { marketplace: "eBay", status: "Active", revenue: 1500 },
      ];

      const filtered = applyFilters(data, [
        { field: "marketplace", operator: "eq", value: "Amazon" },
        { field: "status", operator: "eq", value: "Active" },
      ]);

      expect(filtered.length).toBe(1);
      expect(filtered[0].marketplace).toBe("Amazon");
      expect(filtered[0].status).toBe("Active");
    });

    it("should return all data when no filters applied", () => {
      const data = [
        { marketplace: "Amazon", revenue: 1000 },
        { marketplace: "eBay", revenue: 500 },
      ];

      const filtered = applyFilters(data, []);
      expect(filtered.length).toBe(2);
    });
  });

  describe("generateAutocompleteSuggestions", () => {
    it("should generate suggestions starting with query", () => {
      const fields = [
        { name: "marketplace", values: ["Amazon", "eBay", "Walmart", "WebStores"] },
      ];

      const suggestions = generateAutocompleteSuggestions("A", fields);
      expect(suggestions.length).toBeGreaterThan(0);
      expect(suggestions[0].toLowerCase().startsWith("a")).toBe(true);
    });

    it("should return empty array for no matches", () => {
      const fields = [{ name: "marketplace", values: ["Amazon", "eBay", "Walmart"] }];

      const suggestions = generateAutocompleteSuggestions("xyz", fields);
      expect(suggestions.length).toBe(0);
    });

    it("should limit suggestions to 5 per field", () => {
      const fields = [
        {
          name: "marketplace",
          values: ["A1", "A2", "A3", "A4", "A5", "A6", "A7"],
        },
      ];

      const suggestions = generateAutocompleteSuggestions("A", fields);
      expect(suggestions.length).toBeLessThanOrEqual(5);
    });
  });

  describe("calculateFilterRelevance", () => {
    it("should calculate relevance score based on matching conditions", () => {
      const filter = {
        id: "1",
        name: "Test",
        conditions: [
          { field: "marketplace", operator: "eq", value: "Amazon" },
          { field: "status", operator: "eq", value: "Active" },
        ],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const currentConditions = [
        { field: "marketplace", operator: "eq", value: "Amazon" },
      ];

      const score = calculateFilterRelevance(filter, currentConditions);
      expect(score).toBeGreaterThan(0);
    });

    it("should return 0 for no matching conditions", () => {
      const filter = {
        id: "1",
        name: "Test",
        conditions: [{ field: "marketplace", operator: "eq", value: "Amazon" }],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const currentConditions = [{ field: "category", operator: "eq", value: "Electronics" }];

      const score = calculateFilterRelevance(filter, currentConditions);
      expect(score).toBe(0);
    });
  });

  describe("rankFiltersByUsage", () => {
    it("should rank filters by usage frequency", () => {
      const filters = [
        {
          id: "1",
          name: "Filter 1",
          conditions: [{ field: "marketplace", operator: "eq", value: "Amazon" }],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: "2",
          name: "Filter 2",
          conditions: [{ field: "status", operator: "eq", value: "Active" }],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      const history = [
        {
          id: "h1",
          userId: "user1",
          conditions: [{ field: "marketplace", operator: "eq", value: "Amazon" }],
          timestamp: new Date(),
          resultCount: 100,
        },
        {
          id: "h2",
          userId: "user1",
          conditions: [{ field: "marketplace", operator: "eq", value: "Amazon" }],
          timestamp: new Date(),
          resultCount: 100,
        },
      ];

      const ranked = rankFiltersByUsage(filters, history);
      expect(ranked[0].id).toBe("1");
    });
  });
});
