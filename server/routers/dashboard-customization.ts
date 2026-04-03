import { router, protectedProcedure } from "../_core/trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { getDb } from "../db";
import {
  dashboardConfigs,
  metricCards,
  metricFilters,
  metricThresholds,
  dashboardTemplates,
  dashboardExports,
  dashboardAlerts,
} from "../../drizzle/schema";
import { eq, and, desc } from "drizzle-orm";

export const dashboardCustomizationRouter = router({
  // ============ DASHBOARD CONFIGURATIONS ============

  /**
   * Create a new dashboard configuration
   */
  createDashboardConfig: protectedProcedure
    .input(
      z.object({
        configName: z.string(),
        layout: z.object({
          columns: z.number().default(3),
          gap: z.number().default(16),
          responsive: z.boolean().default(true),
        }),
        metrics: z.array(z.string()),
        isDefault: z.boolean().default(false),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

        const configData: any = {
          userId: ctx.user.id,
          configName: input.configName,
          layout: JSON.stringify(input.layout),
          metrics: JSON.stringify(input.metrics),
          isDefault: input.isDefault ? 1 : 0,
        };

        const result = await db.insert(dashboardConfigs).values(configData);
        return { id: result[0], ...input, message: "Dashboard configuration created" };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create dashboard configuration",
        });
      }
    }),

  /**
   * Get all dashboard configurations for user
   */
  getDashboardConfigs: protectedProcedure.query(async ({ ctx }) => {
    try {
      const db = await getDb();
      if (!db) return [];

      const configs = await db
        .select()
        .from(dashboardConfigs)
        .where(eq(dashboardConfigs.userId, ctx.user.id)) as any;

      return configs.map((c: any) => ({
        ...c,
        layout: JSON.parse(c.layout),
        metrics: JSON.parse(c.metrics),
      }));
    } catch (error) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to fetch dashboard configurations",
      });
    }
  }),

  /**
   * Update dashboard configuration
   */
  updateDashboardConfig: protectedProcedure
    .input(
      z.object({
        configId: z.number(),
        configName: z.string().optional(),
        layout: z.object({
          columns: z.number(),
          gap: z.number(),
          responsive: z.boolean(),
        }).optional(),
        metrics: z.array(z.string()).optional(),
        isDefault: z.boolean().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

        const updateData: any = {};
        if (input.configName) updateData.configName = input.configName;
        if (input.layout) updateData.layout = JSON.stringify(input.layout);
        if (input.metrics) updateData.metrics = JSON.stringify(input.metrics);
        if (input.isDefault !== undefined) updateData.isDefault = input.isDefault ? 1 : 0;

        await db
          .update(dashboardConfigs)
          .set(updateData)
          .where(and(eq(dashboardConfigs.id, input.configId), eq(dashboardConfigs.userId, ctx.user.id)));

        return { message: "Dashboard configuration updated" };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update dashboard configuration",
        });
      }
    }),

  /**
   * Delete dashboard configuration
   */
  deleteDashboardConfig: protectedProcedure
    .input(z.object({ configId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      try {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

        await db
          .delete(dashboardConfigs)
          .where(and(eq(dashboardConfigs.id, input.configId), eq(dashboardConfigs.userId, ctx.user.id)));

        return { message: "Dashboard configuration deleted" };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to delete dashboard configuration",
        });
      }
    }),

  // ============ METRIC CARDS ============

  /**
   * Create metric card customization
   */
  createMetricCard: protectedProcedure
    .input(
      z.object({
        configId: z.number(),
        metricKey: z.string(),
        metricName: z.string(),
        cardColor: z.string().default("#ffffff"),
        backgroundColor: z.string().default("#f5f5f5"),
        textColor: z.string().default("#000000"),
        cardSize: z.enum(["small", "medium", "large"]).default("medium"),
        showTrend: z.boolean().default(true),
        showComparison: z.boolean().default(false),
        comparisonPeriod: z.enum(["day", "week", "month", "quarter", "year"]).default("month"),
        sortOrder: z.number().default(0),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

        const cardData: any = {
          userId: ctx.user.id,
          configId: input.configId,
          metricKey: input.metricKey,
          metricName: input.metricName,
          cardColor: input.cardColor,
          backgroundColor: input.backgroundColor,
          textColor: input.textColor,
          cardSize: input.cardSize,
          showTrend: input.showTrend ? 1 : 0,
          showComparison: input.showComparison ? 1 : 0,
          comparisonPeriod: input.comparisonPeriod,
          sortOrder: input.sortOrder,
          isVisible: 1,
        };

        const result = await db.insert(metricCards).values(cardData);
        return { id: result[0], ...input, message: "Metric card created" };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create metric card",
        });
      }
    }),

  /**
   * Update metric card customization
   */
  updateMetricCard: protectedProcedure
    .input(
      z.object({
        cardId: z.number(),
        cardColor: z.string().optional(),
        backgroundColor: z.string().optional(),
        textColor: z.string().optional(),
        cardSize: z.enum(["small", "medium", "large"]).optional(),
        showTrend: z.boolean().optional(),
        showComparison: z.boolean().optional(),
        comparisonPeriod: z.enum(["day", "week", "month", "quarter", "year"]).optional(),
        isVisible: z.boolean().optional(),
        sortOrder: z.number().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

        const updateData: any = {};
        if (input.cardColor) updateData.cardColor = input.cardColor;
        if (input.backgroundColor) updateData.backgroundColor = input.backgroundColor;
        if (input.textColor) updateData.textColor = input.textColor;
        if (input.cardSize) updateData.cardSize = input.cardSize;
        if (input.showTrend !== undefined) updateData.showTrend = input.showTrend ? 1 : 0;
        if (input.showComparison !== undefined) updateData.showComparison = input.showComparison ? 1 : 0;
        if (input.comparisonPeriod) updateData.comparisonPeriod = input.comparisonPeriod;
        if (input.isVisible !== undefined) updateData.isVisible = input.isVisible ? 1 : 0;
        if (input.sortOrder !== undefined) updateData.sortOrder = input.sortOrder;

        await db
          .update(metricCards)
          .set(updateData)
          .where(and(eq(metricCards.id, input.cardId), eq(metricCards.userId, ctx.user.id)));

        return { message: "Metric card updated" };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update metric card",
        });
      }
    }),

  /**
   * Get metric cards for a dashboard config
   */
  getMetricCards: protectedProcedure
    .input(z.object({ configId: z.number() }))
    .query(async ({ ctx, input }) => {
      try {
        const db = await getDb();
        if (!db) return [];

        const cards = await db
          .select()
          .from(metricCards)
          .where(and(eq(metricCards.configId, input.configId), eq(metricCards.userId, ctx.user.id))) as any;

        return cards;
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch metric cards",
        });
      }
    }),

  // ============ METRIC FILTERS ============

  /**
   * Add filter to metric card
   */
  addMetricFilter: protectedProcedure
    .input(
      z.object({
        metricCardId: z.number(),
        filterType: z.enum(["date_range", "category", "region", "product", "custom"]),
        filterValue: z.record(z.string(), z.any()),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

        const filterData: any = {
          userId: ctx.user.id,
          metricCardId: input.metricCardId,
          filterType: input.filterType,
          filterValue: JSON.stringify(input.filterValue),
          isActive: 1,
        };

        const result = await db.insert(metricFilters).values(filterData);
        return { id: result[0], ...input, message: "Filter added" };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to add filter",
        });
      }
    }),

  /**
   * Get filters for a metric card
   */
  getMetricFilters: protectedProcedure
    .input(z.object({ metricCardId: z.number() }))
    .query(async ({ ctx, input }) => {
      try {
        const db = await getDb();
        if (!db) return [];

        const filters = await db
          .select()
          .from(metricFilters)
          .where(and(eq(metricFilters.metricCardId, input.metricCardId), eq(metricFilters.userId, ctx.user.id))) as any;

        return filters.map((f: any) => ({
          ...f,
          filterValue: JSON.parse(f.filterValue),
        }));
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch filters",
        });
      }
    }),

  // ============ METRIC THRESHOLDS ============

  /**
   * Set threshold and alerts for metric
   */
  setMetricThreshold: protectedProcedure
    .input(
      z.object({
        metricCardId: z.number(),
        targetValue: z.number().optional(),
        warningThreshold: z.number().optional(),
        criticalThreshold: z.number().optional(),
        thresholdType: z.enum(["above", "below", "range"]).default("above"),
        alertEnabled: z.boolean().default(true),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

        const thresholdData: any = {
          userId: ctx.user.id,
          metricCardId: input.metricCardId,
          targetValue: input.targetValue,
          warningThreshold: input.warningThreshold,
          criticalThreshold: input.criticalThreshold,
          thresholdType: input.thresholdType,
          alertEnabled: input.alertEnabled ? 1 : 0,
        };

        const result = await db.insert(metricThresholds).values(thresholdData);
        return { id: result[0], ...input, message: "Threshold set" };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to set threshold",
        });
      }
    }),

  /**
   * Get threshold for a metric
   */
  getMetricThreshold: protectedProcedure
    .input(z.object({ metricCardId: z.number() }))
    .query(async ({ ctx, input }) => {
      try {
        const db = await getDb();
        if (!db) return null;

        const threshold = await db
          .select()
          .from(metricThresholds)
          .where(and(eq(metricThresholds.metricCardId, input.metricCardId), eq(metricThresholds.userId, ctx.user.id)))
          .limit(1) as any;

        return threshold[0] || null;
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch threshold",
        });
      }
    }),

  // ============ DASHBOARD TEMPLATES ============

  /**
   * Save dashboard configuration as template
   */
  saveDashboardTemplate: protectedProcedure
    .input(
      z.object({
        templateName: z.string(),
        templateDescription: z.string().optional(),
        configId: z.number(),
        isPublic: z.boolean().default(false),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

        // Get the config to save as template
        const config = await db
          .select()
          .from(dashboardConfigs)
          .where(and(eq(dashboardConfigs.id, input.configId), eq(dashboardConfigs.userId, ctx.user.id)))
          .limit(1) as any;

        if (!config[0]) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Dashboard configuration not found" });
        }

        const templateData: any = {
          userId: ctx.user.id,
          templateName: input.templateName,
          templateDescription: input.templateDescription,
          templateConfig: JSON.stringify(config[0]),
          isPublic: input.isPublic ? 1 : 0,
          usageCount: 0,
        };

        const result = await db.insert(dashboardTemplates).values(templateData);
        return { id: result[0], ...input, message: "Template saved" };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to save template",
        });
      }
    }),

  /**
   * Get all templates for user
   */
  getDashboardTemplates: protectedProcedure.query(async ({ ctx }) => {
    try {
      const db = await getDb();
      if (!db) return [];

      const templates = await db
        .select()
        .from(dashboardTemplates)
        .where(eq(dashboardTemplates.userId, ctx.user.id)) as any;

      return templates.map((t: any) => ({
        ...t,
        templateConfig: JSON.parse(t.templateConfig),
      }));
    } catch (error) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to fetch templates",
      });
    }
  }),

  /**
   * Load template and create new config from it
   */
  loadDashboardTemplate: protectedProcedure
    .input(
      z.object({
        templateId: z.number(),
        newConfigName: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

        // Get template
        const template = await db
          .select()
          .from(dashboardTemplates)
          .where(eq(dashboardTemplates.id, input.templateId))
          .limit(1) as any;

        if (!template[0]) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Template not found" });
        }

        const templateConfig = JSON.parse(template[0].templateConfig);

        // Create new config from template
        const configData: any = {
          userId: ctx.user.id,
          configName: input.newConfigName,
          layout: templateConfig.layout,
          metrics: templateConfig.metrics,
          isDefault: 0,
        };

        const result = await db.insert(dashboardConfigs).values(configData);

        // Increment template usage count
        await db
          .update(dashboardTemplates)
          .set({ usageCount: template[0].usageCount + 1 })
          .where(eq(dashboardTemplates.id, input.templateId));

        return { id: result[0], message: "Template loaded and new config created" };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to load template",
        });
      }
    }),

  // ============ DASHBOARD EXPORTS ============

  /**
   * Record dashboard export
   */
  recordDashboardExport: protectedProcedure
    .input(
      z.object({
        configId: z.number(),
        exportFormat: z.enum(["csv", "pdf", "json"]),
        fileName: z.string(),
        fileSize: z.number().optional(),
        fileUrl: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

        const exportData: any = {
          userId: ctx.user.id,
          configId: input.configId,
          exportFormat: input.exportFormat,
          fileName: input.fileName,
          fileSize: input.fileSize,
          fileUrl: input.fileUrl,
        };

        const result = await db.insert(dashboardExports).values(exportData);
        return { id: result[0], ...input, message: "Export recorded" };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to record export",
        });
      }
    }),

  /**
   * Get export history
   */
  getExportHistory: protectedProcedure
    .input(
      z.object({
        limit: z.number().default(50),
        offset: z.number().default(0),
      })
    )
    .query(async ({ ctx, input }) => {
      try {
        const db = await getDb();
        if (!db) return [];

        const exports = await db
          .select()
          .from(dashboardExports)
          .where(eq(dashboardExports.userId, ctx.user.id))
          .orderBy(desc(dashboardExports.exportedAt))
          .limit(input.limit)
          .offset(input.offset) as any;

        return exports;
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch export history",
        });
      }
    }),

  // ============ DASHBOARD ALERTS ============

  /**
   * Get active alerts
   */
  getActiveAlerts: protectedProcedure.query(async ({ ctx }) => {
    try {
      const db = await getDb();
      if (!db) return [];

      const alerts = await db
        .select()
        .from(dashboardAlerts)
        .where(and(eq(dashboardAlerts.userId, ctx.user.id), eq(dashboardAlerts.isResolved, 0)))
        .orderBy(desc(dashboardAlerts.createdAt)) as any;

      return alerts;
    } catch (error) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to fetch alerts",
      });
    }
  }),

  /**
   * Resolve alert
   */
  resolveAlert: protectedProcedure
    .input(z.object({ alertId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      try {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

        await db
          .update(dashboardAlerts)
          .set({ isResolved: 1, resolvedAt: new Date() })
          .where(and(eq(dashboardAlerts.id, input.alertId), eq(dashboardAlerts.userId, ctx.user.id)));

        return { message: "Alert resolved" };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to resolve alert",
        });
      }
    }),
});
