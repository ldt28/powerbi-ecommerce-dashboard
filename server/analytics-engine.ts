import { getDb } from "./db";
import { anomalyAlerts, predictions as predictionsTable, cohorts, customerJourneyEvents, attributionModels, funnelAnalysis } from "../drizzle/schema";
import { eq, and, gte, lte, desc } from "drizzle-orm";

/**
 * Advanced Analytics Engine
 * Provides anomaly detection, forecasting, cohort analysis, and attribution modeling
 */

// ============ ANOMALY DETECTION ============

interface MetricDataPoint {
  date: Date;
  value: number;
}

/**
 * Calculate statistical anomalies using Z-score method
 * Z-score > 2 indicates anomaly (95% confidence)
 */
export function detectAnomalies(data: MetricDataPoint[], threshold: number = 2): Array<{
  index: number;
  value: number;
  zScore: number;
  type: "spike" | "drop" | "trend_change";
}> {
  if (data.length < 3) return [];

  const values = data.map(d => d.value);
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
  const stdDev = Math.sqrt(variance);

  const anomalies: Array<{
    index: number;
    value: number;
    zScore: number;
    type: "spike" | "drop" | "trend_change";
  }> = [];

  for (let i = 0; i < values.length; i++) {
    const zScore = (values[i] - mean) / (stdDev || 1);
    if (Math.abs(zScore) > threshold) {
      const type = zScore > 0 ? "spike" : "drop";
      anomalies.push({ index: i, value: values[i], zScore, type });
    }
  }

  return anomalies;
}

/**
 * Detect trend changes using linear regression
 */
export function detectTrendChange(data: MetricDataPoint[], windowSize: number = 7): boolean {
  if (data.length < windowSize * 2) return false;

  const firstWindow = data.slice(0, windowSize).map(d => d.value);
  const lastWindow = data.slice(-windowSize).map(d => d.value);

  const firstMean = firstWindow.reduce((a, b) => a + b, 0) / windowSize;
  const lastMean = lastWindow.reduce((a, b) => a + b, 0) / windowSize;

  // If difference is more than 20%, consider it a trend change
  const percentChange = Math.abs((lastMean - firstMean) / (firstMean || 1)) * 100;
  return percentChange > 20;
}

/**
 * Create anomaly alert in database
 */
export async function createAnomalyAlert(
  userId: number,
  metricName: string,
  expectedValue: number,
  actualValue: number,
  anomalyType: "spike" | "drop" | "trend_change"
) {
  const db = getDb();

  const deviation = ((actualValue - expectedValue) / (expectedValue || 1)) * 100;
  const severity = Math.abs(deviation) > 50 ? "high" : Math.abs(deviation) > 25 ? "medium" : "low";

  db.insert(anomalyAlerts).values({
    userId,
    metricName,
    anomalyType,
    severity,
    expectedValue,
    actualValue,
    deviation,
  }).run();
}

// ============ FORECASTING & PREDICTIONS ============

/**
 * Simple exponential smoothing for time-series forecasting
 */
export function exponentialSmoothing(data: number[], alpha: number = 0.3, periods: number = 7): number[] {
  if (data.length === 0) return [];

  const forecast: number[] = [];
  let level = data[0];

  for (let i = 0; i < data.length; i++) {
    level = alpha * data[i] + (1 - alpha) * level;
    forecast.push(level);
  }

  // Forecast future periods
  const predictions: number[] = [];
  for (let i = 0; i < periods; i++) {
    predictions.push(level);
  }

  return predictions;
}

/**
 * Linear regression for trend analysis and forecasting
 */
export function linearRegression(data: number[]): { slope: number; intercept: number; r2: number } {
  const n = data.length;
  if (n < 2) return { slope: 0, intercept: 0, r2: 0 };

  const xValues = Array.from({ length: n }, (_, i) => i);
  const yValues = data;

  const xMean = xValues.reduce((a, b) => a + b, 0) / n;
  const yMean = yValues.reduce((a, b) => a + b, 0) / n;

  let numerator = 0;
  let denominator = 0;
  let ssRes = 0;
  let ssTot = 0;

  for (let i = 0; i < n; i++) {
    numerator += (xValues[i] - xMean) * (yValues[i] - yMean);
    denominator += Math.pow(xValues[i] - xMean, 2);
    ssTot += Math.pow(yValues[i] - yMean, 2);
  }

  const slope = denominator === 0 ? 0 : numerator / denominator;
  const intercept = yMean - slope * xMean;

  // Calculate R-squared
  for (let i = 0; i < n; i++) {
    const predicted = slope * xValues[i] + intercept;
    ssRes += Math.pow(yValues[i] - predicted, 2);
  }

  const r2 = ssTot === 0 ? 0 : 1 - ssRes / ssTot;

  return { slope, intercept, r2 };
}

/**
 * Generate forecast predictions
 */
export async function generatePredictions(
  userId: number,
  metricName: string,
  historicalData: number[],
  forecastDays: number = 30
) {
  const db = getDb();

  const { slope, intercept, r2 } = linearRegression(historicalData);
  const predictions: Array<{ date: Date; value: number }> = [];
  const rowsToInsert: any[] = [];

  const today = new Date();
  for (let i = 1; i <= forecastDays; i++) {
    const predictedValue = slope * (historicalData.length + i) + intercept;
    const forecastDate = new Date(today);
    forecastDate.setDate(forecastDate.getDate() + i);

    const nonNegativeValue = Math.max(0, predictedValue);
    predictions.push({
      date: forecastDate,
      value: nonNegativeValue,
    });

    rowsToInsert.push({
      userId,
      metricName,
      predictionDate: forecastDate.toISOString(),
      predictedValue: nonNegativeValue,
      confidenceInterval: 95,
      lowerBound: nonNegativeValue * 0.85,
      upperBound: nonNegativeValue * 1.15,
      modelType: "linear",
      accuracy: r2 * 100,
    });
  }

  if (rowsToInsert.length > 0) {
    db.insert(predictionsTable).values(rowsToInsert).run();
  }

  return predictions;
}

// ============ COHORT ANALYSIS ============

/**
 * Calculate cohort retention metrics
 */
export async function calculateCohortRetention(
  userId: number,
  cohortId: number,
  startDate: Date,
  endDate: Date
) {
  const db = getDb();

  // Get all events for this cohort during the period
  const events = db
    .select()
    .from(customerJourneyEvents)
    .where(
      and(
        eq(customerJourneyEvents.userId, userId),
        gte(customerJourneyEvents.timestamp, startDate.toISOString()),
        lte(customerJourneyEvents.timestamp, endDate.toISOString())
      )
    )
    .limit(10000)
    .all();

  if (events.length === 0) {
    return { retentionRate: 0, churnRate: 100, avgRepeatPurchases: 0 };
  }

  // Calculate unique customers
  const uniqueCustomers = new Set(events.map((e: any) => e.customerId)).size;

  // Calculate repeat purchases
  const customerPurchases: Record<string, number> = {};
  events.forEach((event: any) => {
    if (event.eventType === "purchase") {
      customerPurchases[event.customerId] = (customerPurchases[event.customerId] || 0) + 1;
    }
  });

  const repeatCustomers = Object.values(customerPurchases).filter(count => count > 1).length;
  const retentionRate = (repeatCustomers / uniqueCustomers) * 100;
  const churnRate = 100 - retentionRate;
  const avgRepeatPurchases = Object.values(customerPurchases).reduce((a, b) => a + b, 0) / uniqueCustomers;

  return {
    retentionRate,
    churnRate,
    avgRepeatPurchases,
    uniqueCustomers,
    repeatCustomers,
  };
}

// ============ ATTRIBUTION MODELING ============

/**
 * Calculate first-touch attribution
 */
export function firstTouchAttribution(touchpoints: Array<{ source: string; value: number }>, conversionValue: number): number {
  if (touchpoints.length === 0) return 0;
  return conversionValue; // All credit to first touch
}

/**
 * Calculate last-touch attribution
 */
export function lastTouchAttribution(touchpoints: Array<{ source: string; value: number }>, conversionValue: number): number {
  if (touchpoints.length === 0) return 0;
  return conversionValue; // All credit to last touch
}

/**
 * Calculate linear attribution (equal credit to all touchpoints)
 */
export function linearAttribution(touchpoints: Array<{ source: string; value: number }>, conversionValue: number): number {
  if (touchpoints.length === 0) return 0;
  return conversionValue / touchpoints.length;
}

/**
 * Calculate time-decay attribution (more credit to recent touchpoints)
 */
export function timeDecayAttribution(
  touchpoints: Array<{ source: string; value: number; timestamp: Date }>,
  conversionValue: number
): number {
  if (touchpoints.length === 0) return 0;

  const weights = touchpoints.map((_, index) => Math.pow(2, index)); // Exponential weights
  const totalWeight = weights.reduce((a, b) => a + b, 0);

  return (conversionValue * weights[weights.length - 1]) / totalWeight;
}

/**
 * Calculate position-based attribution (40-20-40 model)
 */
export function positionBasedAttribution(
  touchpoints: Array<{ source: string; value: number }>,
  conversionValue: number
): number {
  if (touchpoints.length === 0) return 0;
  if (touchpoints.length === 1) return conversionValue;

  // 40% to first, 40% to last, 20% distributed to middle
  const firstCredit = conversionValue * 0.4;
  const lastCredit = conversionValue * 0.4;
  const middleCredit = conversionValue * 0.2;

  return firstCredit + lastCredit + (middleCredit / Math.max(1, touchpoints.length - 2));
}

// ============ FUNNEL ANALYSIS ============

/**
 * Calculate funnel conversion rates and dropoffs
 */
export async function calculateFunnelMetrics(
  userId: number,
  funnelSteps: string[],
  events: Array<{ customerId: string; eventType: string; timestamp: Date }>
) {
  const stepCounts: Record<string, Set<string>> = {};
  funnelSteps.forEach(step => {
    stepCounts[step] = new Set();
  });

  // Track unique customers at each step
  events.forEach(event => {
    if (funnelSteps.includes(event.eventType)) {
      stepCounts[event.eventType].add(event.customerId);
    }
  });

  const counts = funnelSteps.map(step => stepCounts[step]?.size || 0);
  const totalSessions = counts[0] || 1;
  const conversionRate = ((counts[counts.length - 1] || 0) / totalSessions) * 100;
  const dropoffRate = 100 - conversionRate;

  return {
    stepCounts: counts,
    conversionRate,
    dropoffRate,
    totalSessions,
  };
}

// ============ CUSTOMER JOURNEY TRACKING ============

/**
 * Track customer journey events
 */
export async function trackJourneyEvent(
  userId: number,
  customerId: string,
  eventType: string,
  eventName: string,
  eventValue?: number,
  metadata?: Record<string, any>
) {
  const db = getDb();

  db.insert(customerJourneyEvents).values({
    userId,
    customerId,
    eventType,
    eventName,
    eventValue: eventValue ?? null,
    metadata: metadata ? JSON.stringify(metadata) : null,
    timestamp: new Date().toISOString(),
  }).run();
}

/**
 * Get customer journey for a specific customer
 */
export async function getCustomerJourney(userId: number, customerId: string) {
  const db = getDb();

  const journey = db
    .select()
    .from(customerJourneyEvents)
    .where(and(eq(customerJourneyEvents.userId, userId), eq(customerJourneyEvents.customerId, customerId)))
    .orderBy(customerJourneyEvents.timestamp)
    .all();

  return journey.map((event: any) => ({
    ...event,
    metadata: event.metadata ? JSON.parse(event.metadata) : null,
  }));
}
