import { router, protectedProcedure } from "../_core/trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { getDb } from "../db";
import {
  detectAnomalies,
  detectTrendChange,
  createAnomalyAlert,
  exponentialSmoothing,
  linearRegression,
  generatePredictions,
  calculateCohortRetention,
  firstTouchAttribution,
  lastTouchAttribution,
  linearAttribution,
  timeDecayAttribution,
  positionBasedAttribution,
  calculateFunnelMetrics,
  trackJourneyEvent,
  getCustomerJourney,
} from "../analytics-engine";
import { anomalyAlerts, predictions, cohorts, customerJourneyEvents, attributionModels, funnelAnalysis } from "../../drizzle/schema";
import { eq, desc } from "drizzle-orm";

export const advancedAnalyticsRouter = router({
  // ============ ANOMALY DETECTION ============

  /**
   * Detect anomalies in metric data
   */
  detectAnomalies: protectedProcedure
    .input(
      z.object({
        metricName: z.string(),
        data: z.array(z.object({ date: z.date(), value: z.number() })),
        threshold: z.number().default(2),
      })
    )
    .query(({ input }) => {
      try {
        const anomalies = detectAnomalies(input.data, input.threshold);
        return {
          metricName: input.metricName,
          totalDataPoints: input.data.length,
          anomaliesFound: anomalies.length,
          anomalies,
        };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to detect anomalies",
        });
      }
    }),

  /**
   * Detect trend changes in metric data
   */
  detectTrendChange: protectedProcedure
    .input(
      z.object({
        metricName: z.string(),
        data: z.array(z.number()),
        windowSize: z.number().default(7),
      })
    )
    .query(({ input }) => {
      try {
        const trendChanged = detectTrendChange(
          input.data.map((v, i) => ({ date: new Date(), value: v })),
          input.windowSize
        );
        return {
          metricName: input.metricName,
          trendChanged,
          message: trendChanged ? "Significant trend change detected" : "No significant trend change",
        };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to detect trend change",
        });
      }
    }),

  /**
   * Get recent anomaly alerts
   */
  getAnomalyAlerts: protectedProcedure
    .input(
      z.object({
        limit: z.number().default(50),
        offset: z.number().default(0),
        severity: z.enum(["low", "medium", "high"]).optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      try {
        const db = await getDb();
        if (!db) return [];

        const alerts = await db
          .select()
          .from(anomalyAlerts)
          .where(eq(anomalyAlerts.userId, ctx.user.id))
          .orderBy(desc(anomalyAlerts.detectedAt))
          .limit(input.limit)
          .offset(input.offset) as any;

        return alerts;
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch anomaly alerts",
        });
      }
    }),

  // ============ FORECASTING & PREDICTIONS ============

  /**
   * Generate forecast predictions
   */
  generateForecast: protectedProcedure
    .input(
      z.object({
        metricName: z.string(),
        historicalData: z.array(z.number()),
        forecastDays: z.number().default(30),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const predictions = await generatePredictions(
          ctx.user.id,
          input.metricName,
          input.historicalData,
          input.forecastDays
        );

        return {
          metricName: input.metricName,
          forecastDays: input.forecastDays,
          predictions,
          message: `Generated ${predictions.length} predictions`,
        };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to generate forecast",
        });
      }
    }),

  /**
   * Get predictions for a metric
   */
  getPredictions: protectedProcedure
    .input(
      z.object({
        metricName: z.string(),
        limit: z.number().default(30),
      })
    )
    .query(async ({ ctx, input }) => {
      try {
        const db = await getDb();
        if (!db) return [];

        const preds = await db
          .select()
          .from(predictions)
          .where(eq(predictions.userId, ctx.user.id))
          .limit(input.limit) as any;

        return preds;
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch predictions",
        });
      }
    }),

  // ============ COHORT ANALYSIS ============

  /**
   * Create a new cohort
   */
  createCohort: protectedProcedure
    .input(
      z.object({
        cohortName: z.string(),
        cohortType: z.enum(["acquisition_date", "first_purchase_value", "geographic", "demographic", "behavioral"]),
        startDate: z.date(),
        endDate: z.date().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

        const cohortData: any = {
          userId: ctx.user.id,
          cohortName: input.cohortName,
          cohortType: input.cohortType,
          startDate: input.startDate,
          endDate: input.endDate,
          memberCount: 0,
        };

        const result = await db.insert(cohorts).values(cohortData);
        return { id: result[0], ...input, message: "Cohort created successfully" };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create cohort",
        });
      }
    }),

  /**
   * Get cohort retention metrics
   */
  getCohortRetention: protectedProcedure
    .input(
      z.object({
        cohortId: z.number(),
        startDate: z.date(),
        endDate: z.date(),
      })
    )
    .query(async ({ ctx, input }) => {
      try {
        const retention = await calculateCohortRetention(
          ctx.user.id,
          input.cohortId,
          input.startDate,
          input.endDate
        );

        return {
          cohortId: input.cohortId,
          ...retention,
        };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to calculate cohort retention",
        });
      }
    }),

  /**
   * List all cohorts
   */
  listCohorts: protectedProcedure
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

        const userCohorts = await db
          .select()
          .from(cohorts)
          .where(eq(cohorts.userId, ctx.user.id))
          .limit(input.limit)
          .offset(input.offset) as any;

        return userCohorts;
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch cohorts",
        });
      }
    }),

  // ============ CUSTOMER JOURNEY TRACKING ============

  /**
   * Track a customer journey event
   */
  trackEvent: protectedProcedure
    .input(
      z.object({
        customerId: z.string(),
        eventType: z.string(),
        eventName: z.string(),
        eventValue: z.number().optional(),
        metadata: z.record(z.string(), z.any()).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        await trackJourneyEvent(
          ctx.user.id,
          input.customerId,
          input.eventType,
          input.eventName,
          input.eventValue,
          input.metadata
        );

        return { success: true, message: "Event tracked successfully" };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to track event",
        });
      }
    }),

  /**
   * Get customer journey
   */
  getCustomerJourney: protectedProcedure
    .input(z.object({ customerId: z.string() }))
    .query(async ({ ctx, input }) => {
      try {
        const journey = await getCustomerJourney(ctx.user.id, input.customerId);
        return { customerId: input.customerId, events: journey };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch customer journey",
        });
      }
    }),

  // ============ ATTRIBUTION MODELING ============

  /**
   * Calculate attribution for a conversion
   */
  calculateAttribution: protectedProcedure
    .input(
      z.object({
        conversionId: z.string(),
        customerId: z.string(),
        modelType: z.enum(["first_touch", "last_touch", "linear", "time_decay", "position_based"]),
        touchpoints: z.array(
          z.object({
            source: z.string(),
            value: z.number(),
            timestamp: z.date().optional(),
          })
        ),
        conversionValue: z.number(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

        let attributedValue = 0;

        switch (input.modelType) {
          case "first_touch":
            attributedValue = firstTouchAttribution(input.touchpoints, input.conversionValue);
            break;
          case "last_touch":
            attributedValue = lastTouchAttribution(input.touchpoints, input.conversionValue);
            break;
          case "linear":
            attributedValue = linearAttribution(input.touchpoints, input.conversionValue);
            break;
          case "time_decay":
            attributedValue = timeDecayAttribution(
              input.touchpoints as any,
              input.conversionValue
            );
            break;
          case "position_based":
            attributedValue = positionBasedAttribution(input.touchpoints, input.conversionValue);
            break;
        }

        const attributionData: any = {
          userId: ctx.user.id,
          conversionId: input.conversionId,
          customerId: input.customerId,
          modelType: input.modelType,
          touchpointCount: input.touchpoints.length,
          conversionValue: input.conversionValue.toString(),
          attributedValue: attributedValue.toString(),
          touchpoints: JSON.stringify(input.touchpoints),
          firstTouchSource: input.touchpoints[0]?.source,
          lastTouchSource: input.touchpoints[input.touchpoints.length - 1]?.source,
        };

        await db.insert(attributionModels).values(attributionData);

        return {
          conversionId: input.conversionId,
          modelType: input.modelType,
          attributedValue,
          message: "Attribution calculated successfully",
        };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to calculate attribution",
        });
      }
    }),

  // ============ FUNNEL ANALYSIS ============

  /**
   * Create funnel analysis
   */
  createFunnel: protectedProcedure
    .input(
      z.object({
        funnelName: z.string(),
        funnelSteps: z.array(z.string()),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

        const funnelData: any = {
          userId: ctx.user.id,
          funnelName: input.funnelName,
          funnelSteps: JSON.stringify(input.funnelSteps),
          totalSessions: 0,
          step1Count: 0,
          step2Count: 0,
          step3Count: 0,
          step4Count: 0,
          step5Count: 0,
          conversionRate: "0",
          dropoffRate: "0",
        };

        const result = await db.insert(funnelAnalysis).values(funnelData);
        return { id: result[0], ...input, message: "Funnel created successfully" };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create funnel",
        });
      }
    }),

  /**
   * Get funnel metrics
   */
  getFunnelMetrics: protectedProcedure
    .input(
      z.object({
        funnelId: z.number(),
        funnelSteps: z.array(z.string()),
        events: z.array(
          z.object({
            customerId: z.string(),
            eventType: z.string(),
            timestamp: z.date(),
          })
        ),
      })
    )
    .query(async ({ input }) => {
      try {
        const metrics = await calculateFunnelMetrics(0, input.funnelSteps, input.events);
        return {
          funnelId: input.funnelId,
          ...metrics,
        };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to calculate funnel metrics",
        });
      }
    }),
});
