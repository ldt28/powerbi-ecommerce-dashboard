import { router, protectedProcedure } from "../_core/trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";

/**
 * Marketplace Comparison Router
 * Handles marketplace metrics comparison and aggregation
 */
export const marketplaceComparisonRouter = router({
  /**
   * Get metrics for all platforms
   */
  getAllPlatformsMetrics: protectedProcedure
    .input(
      z.object({
        startDate: z.date().optional(),
        endDate: z.date().optional(),
      })
    )
    .query(async () => {
      try {
        // Define all platforms with their metrics
        const platforms = [
          {
            name: "Amazon",
            metrics: {
              "Gross Revenue": "$156,000",
              "Total Orders": "3,120",
              "Avg Order Value": "$50",
              "Conversion Rate": "3.2%",
              "New Customers": "468",
              "Returning Customer Revenue": "$101,400",
              "Units Sold": "4,680",
              "Returns": "56",
            },
          },
          {
            name: "eBay",
            metrics: {
              "Gross Revenue": "$98,500",
              "Total Orders": "2,100",
              "Avg Order Value": "$47",
              "Conversion Rate": "2.8%",
              "New Customers": "320",
              "Returning Customer Revenue": "$62,400",
              "Units Sold": "2,950",
              "Returns": "42",
            },
          },
          {
            name: "Walmart",
            metrics: {
              "Gross Revenue": "$142,000",
              "Total Orders": "2,840",
              "Avg Order Value": "$50",
              "Conversion Rate": "3.5%",
              "New Customers": "520",
              "Returning Customer Revenue": "$85,200",
              "Units Sold": "4,260",
              "Returns": "38",
            },
          },
          {
            name: "WebStores",
            metrics: {
              "Gross Revenue": "$89,200",
              "Total Orders": "1,780",
              "Avg Order Value": "$50",
              "Conversion Rate": "2.9%",
              "New Customers": "280",
              "Returning Customer Revenue": "$53,520",
              "Units Sold": "2,670",
              "Returns": "25",
            },
          },
          {
            name: "Tractor Supply",
            metrics: {
              "Gross Revenue": "$125,600",
              "Total Orders": "2,512",
              "Avg Order Value": "$50",
              "Conversion Rate": "3.1%",
              "New Customers": "420",
              "Returning Customer Revenue": "$75,360",
              "Units Sold": "3,768",
              "Returns": "32",
            },
          },
          {
            name: "AutoZone",
            metrics: {
              "Gross Revenue": "$112,400",
              "Total Orders": "2,248",
              "Avg Order Value": "$50",
              "Conversion Rate": "3.0%",
              "New Customers": "380",
              "Returning Customer Revenue": "$67,440",
              "Units Sold": "3,372",
              "Returns": "28",
            },
          },
          {
            name: "Northern Tool",
            metrics: {
              "Gross Revenue": "$98,800",
              "Total Orders": "1,976",
              "Avg Order Value": "$50",
              "Conversion Rate": "2.7%",
              "New Customers": "320",
              "Returning Customer Revenue": "$59,280",
              "Units Sold": "2,964",
              "Returns": "24",
            },
          },
          {
            name: "Lowe's",
            metrics: {
              "Gross Revenue": "$134,200",
              "Total Orders": "2,684",
              "Avg Order Value": "$50",
              "Conversion Rate": "3.3%",
              "New Customers": "480",
              "Returning Customer Revenue": "$80,520",
              "Units Sold": "4,026",
              "Returns": "35",
            },
          },
        ];

        return {
          platforms,
          totalPlatforms: platforms.length,
        };
      } catch (error) {
        console.error("Error fetching marketplace metrics:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch marketplace metrics",
        });
      }
    }),

  /**
   * Get comparison summary statistics
   */
  getComparisonSummary: protectedProcedure
    .input(
      z.object({
        startDate: z.date().optional(),
        endDate: z.date().optional(),
      })
    )
    .query(async () => {
      try {
        const summary = {
          totalRevenue: "$956,700",
          totalOrders: "18,160",
          avgOrderValue: "$52.67",
          totalNewCustomers: "3,268",
          totalReturningRevenue: "$485,120",
          totalUnitsSold: "28,640",
          totalReturns: "280",
          topPlatform: {
            name: "Amazon",
            revenue: "$156,000",
            percentage: "16.3%",
          },
          lowestPerformingPlatform: {
            name: "WebStores",
            revenue: "$89,200",
            percentage: "9.3%",
          },
          averageConversionRate: "3.1%",
          totalRevenueGrowth: "+18.5%",
        };

        return summary;
      } catch (error) {
        console.error("Error fetching comparison summary:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch comparison summary",
        });
      }
    }),

  /**
   * Get platform comparison for specific metrics
   */
  getPlatformComparison: protectedProcedure
    .input(
      z.object({
        metrics: z.array(z.string()),
        startDate: z.date().optional(),
        endDate: z.date().optional(),
      })
    )
    .query(async ({ input }) => {
      try {
        const allMetrics: Record<string, Record<string, string | number>> = {
          Amazon: {
            "Gross Revenue": "$156,000",
            "Total Orders": "3,120",
            "Avg Order Value": "$50",
            "Conversion Rate": "3.2%",
          },
          eBay: {
            "Gross Revenue": "$98,500",
            "Total Orders": "2,100",
            "Avg Order Value": "$47",
            "Conversion Rate": "2.8%",
          },
          Walmart: {
            "Gross Revenue": "$142,000",
            "Total Orders": "2,840",
            "Avg Order Value": "$50",
            "Conversion Rate": "3.5%",
          },
          WebStores: {
            "Gross Revenue": "$89,200",
            "Total Orders": "1,780",
            "Avg Order Value": "$50",
            "Conversion Rate": "2.9%",
          },
          "Tractor Supply": {
            "Gross Revenue": "$125,600",
            "Total Orders": "2,512",
            "Avg Order Value": "$50",
            "Conversion Rate": "3.1%",
          },
          AutoZone: {
            "Gross Revenue": "$112,400",
            "Total Orders": "2,248",
            "Avg Order Value": "$50",
            "Conversion Rate": "3.0%",
          },
          "Northern Tool": {
            "Gross Revenue": "$98,800",
            "Total Orders": "1,976",
            "Avg Order Value": "$50",
            "Conversion Rate": "2.7%",
          },
          "Lowe's": {
            "Gross Revenue": "$134,200",
            "Total Orders": "2,684",
            "Avg Order Value": "$50",
            "Conversion Rate": "3.3%",
          },
        };

        // Filter metrics based on input
        const comparison = Object.entries(allMetrics).map(([platform, metrics]) => {
          const filteredMetrics: Record<string, string | number> = {};
          input.metrics.forEach(metric => {
            if (metric in metrics) {
              filteredMetrics[metric] = metrics[metric as keyof typeof metrics];
            }
          });
          return {
            platform,
            metrics: filteredMetrics,
          };
        });

        return comparison;
      } catch (error) {
        console.error("Error fetching platform comparison:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch platform comparison",
        });
      }
    }),

  /**
   * Get top and bottom performers
   */
  getTopPerformers: protectedProcedure
    .input(
      z.object({
        metric: z.string(),
        limit: z.number().optional().default(5),
      })
    )
    .query(async ({ input }) => {
      try {
        const performers = {
          topPerformers: [
            { platform: "Amazon", value: "$156,000", rank: 1 },
            { platform: "Walmart", value: "$142,000", rank: 2 },
            { platform: "Lowe's", value: "$134,200", rank: 3 },
            { platform: "Tractor Supply", value: "$125,600", rank: 4 },
            { platform: "AutoZone", value: "$112,400", rank: 5 },
          ],
          bottomPerformers: [
            { platform: "WebStores", value: "$89,200", rank: 8 },
            { platform: "Northern Tool", value: "$98,800", rank: 7 },
            { platform: "eBay", value: "$98,500", rank: 6 },
          ],
        };

        return performers;
      } catch (error) {
        console.error("Error fetching top performers:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch top performers",
        });
      }
    }),

  /**
   * Get trend data for marketplace comparison
   */
  getMarketplaceTrends: protectedProcedure
    .input(
      z.object({
        days: z.number().optional().default(30),
      })
    )
    .query(async ({ input }) => {
      try {
        // Generate sample trend data
        const trends = Array.from({ length: input.days }, (_, i) => {
          const date = new Date();
          date.setDate(date.getDate() - (input.days - i));
          return {
            date: date.toISOString().split("T")[0],
            amazon: Math.floor(Math.random() * 10000) + 4000,
            ebay: Math.floor(Math.random() * 6000) + 2500,
            walmart: Math.floor(Math.random() * 9000) + 3500,
            webstores: Math.floor(Math.random() * 5000) + 2000,
            tractorSupply: Math.floor(Math.random() * 8000) + 3000,
            autozone: Math.floor(Math.random() * 7000) + 2500,
            northernTool: Math.floor(Math.random() * 6000) + 2000,
            lowes: Math.floor(Math.random() * 8500) + 3200,
          };
        });

        return trends;
      } catch (error) {
        console.error("Error fetching marketplace trends:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch marketplace trends",
        });
      }
    }),
});
