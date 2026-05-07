import { router, protectedProcedure } from "../_core/trpc";
import { z } from "zod";
import { getDb } from "../db";
import { performFullTextSearch, applyFilters, generateAutocompleteSuggestions, rankFiltersByUsage } from "../search-utils";

/**
 * Search and Filter Router
 * Handles full-text search, filtering, and saved filter presets
 */
export const searchFiltersRouter = router({
  /**
   * Full-text search across dashboards
   */
  search: protectedProcedure
    .input(z.object({ query: z.string().min(1) }))
    .query(async ({ input }) => {
      // Mock search results (replace with real data from database)
      const mockItems = [
        { id: "1", title: "Revenue Dashboard", description: "Total revenue metrics", type: "dashboard" },
        { id: "2", title: "Order Analytics", description: "Order processing and trends", type: "dashboard" },
        { id: "3", title: "Customer Revenue Metric", description: "Revenue per customer", type: "metric" },
        { id: "4", title: "Revenue Forecast Report", description: "30-day revenue forecast", type: "report" },
      ];

      const results = performFullTextSearch(input.query, mockItems);
      return results.slice(0, 10);
    }),

  /**
   * Get autocomplete suggestions
   */
  getAutocompleteSuggestions: protectedProcedure
    .input(z.object({ query: z.string(), field: z.string() }))
    .query(async ({ input }) => {
      // Mock field values (replace with real data from database)
      const mockFields = [
        { name: "marketplace", values: ["Amazon", "eBay", "Walmart", "WebStores", "Tractor Supply"] },
        { name: "category", values: ["Electronics", "Clothing", "Home & Garden", "Sports", "Toys"] },
        { name: "status", values: ["Active", "Inactive", "Pending", "Archived"] },
      ];

      const field = mockFields.find((f) => f.name === input.field);
      if (!field) return [];

      return generateAutocompleteSuggestions(input.query, [field]);
    }),

  /**
   * Save filter preset
   */
  saveFilterPreset: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1),
        description: z.string().optional(),
        conditions: z.array(
          z.object({
            field: z.string(),
            operator: z.enum(["eq", "neq", "gt", "lt", "gte", "lte", "contains", "in", "between"]),
            value: z.unknown(),
          })
        ),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Mock save (replace with real database insert)
      const presetId = `preset_${Date.now()}`;
      return { success: true, id: presetId };
    }),

  /**
   * List saved filter presets
   */
  listFilterPresets: protectedProcedure.query(async ({ ctx }) => {
    // Mock presets (replace with real database query)
    return [
      {
        id: "preset_1",
        name: "High Revenue Items",
        description: "Items with revenue > $1000",
        conditions: [{ field: "revenue", operator: "gt", value: 1000 }],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "preset_2",
        name: "Active Amazon Products",
        description: "Active products on Amazon",
        conditions: [
          { field: "marketplace", operator: "eq", value: "Amazon" },
          { field: "status", operator: "eq", value: "Active" },
        ],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];
  }),

  /**
   * Delete filter preset
   */
  deleteFilterPreset: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Mock delete (replace with real database delete)
      return { success: true };
    }),

  /**
   * Get filter history
   */
  getFilterHistory: protectedProcedure.query(async ({ ctx }) => {
    // Mock history (replace with real database query)
    return [
      {
        id: "hist_1",
        timestamp: new Date(Date.now() - 60000),
        conditions: [{ field: "marketplace", operator: "eq", value: "Amazon" }],
        resultCount: 245,
      },
      {
        id: "hist_2",
        timestamp: new Date(Date.now() - 300000),
        conditions: [{ field: "status", operator: "eq", value: "Active" }],
        resultCount: 1203,
      },
      {
        id: "hist_3",
        timestamp: new Date(Date.now() - 3600000),
        conditions: [
          { field: "revenue", operator: "gte", value: 500 },
          { field: "category", operator: "eq", value: "Electronics" },
        ],
        resultCount: 89,
      },
    ];
  }),

  /**
   * Clear filter history
   */
  clearFilterHistory: protectedProcedure.mutation(async ({ ctx }) => {
    // Mock clear (replace with real database delete)
    return { success: true };
  }),

  /**
   * Get filter suggestions based on history
   */
  getFilterSuggestions: protectedProcedure.query(async ({ ctx }) => {
    // Mock suggestions (replace with real logic)
    return [
      { name: "High Revenue Items", usage: 5 },
      { name: "Active Amazon Products", usage: 3 },
      { name: "Electronics Category", usage: 2 },
    ];
  }),
});
