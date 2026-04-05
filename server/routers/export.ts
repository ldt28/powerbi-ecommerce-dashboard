import { router, protectedProcedure } from "../_core/trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import {
  convertToCSV,
  generateCSVContent,
  formatDataForExcel,
  formatMarketplaceComparisonForExcel,
  exportMarketplaceComparisonToCSV,
} from "../export-utils";

/**
 * Export Router
 * Handles PDF, Excel, and CSV export operations for dashboard data
 */
export const exportRouter = router({
  /**
   * Export dashboard data to CSV
   */
  exportDashboardToCSV: protectedProcedure
    .input(
      z.object({
        title: z.string(),
        dateRange: z.string().optional(),
        metrics: z.record(z.string(), z.union([z.string(), z.number()])),
        tables: z
          .array(
            z.object({
              name: z.string(),
              headers: z.array(z.string()),
              rows: z.array(z.array(z.union([z.string(), z.number()]))),
            })
          )
          .optional(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const csvContent = generateCSVContent(input);
        return {
          success: true,
          content: csvContent,
          filename: `${input.title.replace(/\s+/g, "_")}_${new Date().toISOString().split("T")[0]}.csv`,
        };
      } catch (error) {
        console.error("Error exporting to CSV:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to export to CSV",
        });
      }
    }),

  /**
   * Export dashboard data to Excel
   */
  exportDashboardToExcel: protectedProcedure
    .input(
      z.object({
        title: z.string(),
        dateRange: z.string().optional(),
        metrics: z.record(z.string(), z.union([z.string(), z.number()])),
        tables: z
          .array(
            z.object({
              name: z.string(),
              headers: z.array(z.string()),
              rows: z.array(z.array(z.union([z.string(), z.number()]))),
            })
          )
          .optional(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const excelData = formatDataForExcel(input);
        return {
          success: true,
          data: excelData,
          filename: `${input.title.replace(/\s+/g, "_")}_${new Date().toISOString().split("T")[0]}.xlsx`,
        };
      } catch (error) {
        console.error("Error exporting to Excel:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to export to Excel",
        });
      }
    }),

  /**
   * Export marketplace comparison to CSV
   */
  exportMarketplaceComparisonToCSV: protectedProcedure
    .input(
      z.object({
        platforms: z.array(
          z.object({
            name: z.string(),
            metrics: z.record(z.string(), z.union([z.string(), z.number()])),
          })
        ),
        dateRange: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const csvContent = exportMarketplaceComparisonToCSV(
          input.platforms,
          input.dateRange
        );
        return {
          success: true,
          content: csvContent,
          filename: `marketplace_comparison_${new Date().toISOString().split("T")[0]}.csv`,
        };
      } catch (error) {
        console.error("Error exporting marketplace comparison to CSV:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to export marketplace comparison",
        });
      }
    }),

  /**
   * Export marketplace comparison to Excel
   */
  exportMarketplaceComparisonToExcel: protectedProcedure
    .input(
      z.object({
        platforms: z.array(
          z.object({
            name: z.string(),
            metrics: z.record(z.string(), z.union([z.string(), z.number()])),
          })
        ),
        dateRange: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const excelData = formatMarketplaceComparisonForExcel(
          input.platforms,
          input.dateRange
        );
        return {
          success: true,
          data: excelData,
          filename: `marketplace_comparison_${new Date().toISOString().split("T")[0]}.xlsx`,
        };
      } catch (error) {
        console.error("Error exporting marketplace comparison to Excel:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to export marketplace comparison",
        });
      }
    }),

  /**
   * Get export formats available
   */
  getAvailableFormats: protectedProcedure.query(() => {
    return {
      formats: ["csv", "xlsx"],
      description: "Available export formats for dashboard data",
    };
  }),
});
