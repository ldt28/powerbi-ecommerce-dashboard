/**
 * Analytics Utilities for Period-over-Period and Predictive Analysis
 */

export interface PeriodMetrics {
  date: string;
  revenue: number;
  orders: number;
  conversionRate: number;
  aov: number;
}

export interface PeriodComparison {
  platform: string;
  currentPeriod: PeriodMetrics;
  previousPeriod: PeriodMetrics;
  revenueGrowth: number;
  revenueGrowthPercent: string;
  ordersGrowth: number;
  ordersGrowthPercent: string;
  conversionRateChange: number;
  aovGrowth: number;
  aovGrowthPercent: string;
}

export interface PredictivePoint {
  date: string;
  actual: number;
  predicted: number;
  confidence: number;
}

export interface GrowthMetrics {
  platform: string;
  currentRevenue: number;
  previousRevenue: number;
  growthRate: number;
  growthPercent: string;
  trend: "up" | "down" | "stable";
  trendStrength: "strong" | "moderate" | "weak";
}

/**
 * Calculate period-over-period comparison for a platform
 */
export function calculatePeriodComparison(
  platform: string,
  currentPeriod: PeriodMetrics,
  previousPeriod: PeriodMetrics
): PeriodComparison {
  const revenueGrowth = currentPeriod.revenue - previousPeriod.revenue;
  const revenueGrowthPercent = calculatePercent(revenueGrowth, previousPeriod.revenue);

  const ordersGrowth = currentPeriod.orders - previousPeriod.orders;
  const ordersGrowthPercent = calculatePercent(ordersGrowth, previousPeriod.orders);

  const conversionRateChange = currentPeriod.conversionRate - previousPeriod.conversionRate;

  const aovGrowth = currentPeriod.aov - previousPeriod.aov;
  const aovGrowthPercent = calculatePercent(aovGrowth, previousPeriod.aov);

  return {
    platform,
    currentPeriod,
    previousPeriod,
    revenueGrowth,
    revenueGrowthPercent,
    ordersGrowth,
    ordersGrowthPercent,
    conversionRateChange,
    aovGrowth,
    aovGrowthPercent,
  };
}

/**
 * Calculate growth metrics for multiple platforms
 */
export function calculateGrowthMetrics(comparisons: PeriodComparison[]): GrowthMetrics[] {
  return comparisons.map(comp => {
    const growthRate = comp.revenueGrowth;
    const growthPercent = comp.revenueGrowthPercent;

    // Determine trend based on growth percentage
    let trend: "up" | "down" | "stable" = "stable";
    let trendStrength: "strong" | "moderate" | "weak" = "weak";

    const growthValue = parseFloat(growthPercent.replace("%", ""));

    if (growthValue > 5) {
      trend = "up";
      trendStrength = growthValue > 15 ? "strong" : growthValue > 10 ? "moderate" : "weak";
    } else if (growthValue < -5) {
      trend = "down";
      trendStrength = growthValue < -15 ? "strong" : growthValue < -10 ? "moderate" : "weak";
    } else {
      trend = "stable";
      trendStrength = "weak";
    }

    return {
      platform: comp.platform,
      currentRevenue: comp.currentPeriod.revenue,
      previousRevenue: comp.previousPeriod.revenue,
      growthRate,
      growthPercent,
      trend,
      trendStrength,
    };
  });
}

/**
 * Linear regression for trend prediction
 * Returns slope and intercept for y = mx + b
 */
export function linearRegression(
  data: Array<{ x: number; y: number }>
): { slope: number; intercept: number; r2: number } {
  const n = data.length;

  if (n < 2) {
    return { slope: 0, intercept: 0, r2: 0 };
  }

  const sumX = data.reduce((sum, point) => sum + point.x, 0);
  const sumY = data.reduce((sum, point) => sum + point.y, 0);
  const sumXY = data.reduce((sum, point) => sum + point.x * point.y, 0);
  const sumX2 = data.reduce((sum, point) => sum + point.x * point.x, 0);
  const sumY2 = data.reduce((sum, point) => sum + point.y * point.y, 0);

  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;

  // Calculate R² (coefficient of determination)
  const yMean = sumY / n;
  const ssRes = data.reduce((sum, point) => {
    const predicted = slope * point.x + intercept;
    return sum + Math.pow(point.y - predicted, 2);
  }, 0);
  const ssTot = data.reduce((sum, point) => sum + Math.pow(point.y - yMean, 2), 0);
  const r2 = ssTot === 0 ? 0 : 1 - ssRes / ssTot;

  return { slope, intercept, r2 };
}

/**
 * Generate predictive points using linear regression
 */
export function generatePredictivePoints(
  historicalData: Array<{ date: string; value: number }>,
  forecastDays: number = 30
): PredictivePoint[] {
  // Convert dates to numeric indices
  const data = historicalData.map((point, index) => ({
    x: index,
    y: point.value,
  }));

  const { slope, intercept, r2 } = linearRegression(data);

  // Generate predictions
  const predictions: PredictivePoint[] = [];
  const startIndex = data.length;

  for (let i = 0; i < forecastDays; i++) {
    const x = startIndex + i;
    const predicted = slope * x + intercept;
    const confidence = Math.max(0, Math.min(1, r2)); // Confidence based on R²

    // Calculate approximate date
    const lastDate = new Date(historicalData[historicalData.length - 1].date);
    const forecastDate = new Date(lastDate);
    forecastDate.setDate(forecastDate.getDate() + i + 1);

    predictions.push({
      date: forecastDate.toISOString().split("T")[0],
      actual: historicalData[historicalData.length - 1].value, // Last actual value
      predicted: Math.max(0, predicted), // Ensure non-negative
      confidence,
    });
  }

  return predictions;
}

/**
 * Calculate percent change between two values
 */
export function calculatePercent(current: number, previous: number): string {
  if (previous === 0) {
    return current > 0 ? "+100%" : "0%";
  }

  const percent = ((current - previous) / Math.abs(previous)) * 100;
  const sign = percent >= 0 ? "+" : "";
  return `${sign}${percent.toFixed(1)}%`;
}

/**
 * Get trend indicator emoji/text
 */
export function getTrendIndicator(
  trend: "up" | "down" | "stable",
  strength: "strong" | "moderate" | "weak"
): string {
  if (trend === "up") {
    return strength === "strong" ? "📈 Strong Growth" : strength === "moderate" ? "📈 Growing" : "↗️ Slight Growth";
  } else if (trend === "down") {
    return strength === "strong" ? "📉 Sharp Decline" : strength === "moderate" ? "📉 Declining" : "↘️ Slight Decline";
  }
  return "➡️ Stable";
}

/**
 * Format growth metrics for display
 */
export function formatGrowthMetrics(metrics: GrowthMetrics[]): Array<{
  platform: string;
  currentRevenue: string;
  previousRevenue: string;
  growthPercent: string;
  trend: string;
}> {
  return metrics.map(m => ({
    platform: m.platform,
    currentRevenue: `$${m.currentRevenue.toLocaleString()}`,
    previousRevenue: `$${m.previousRevenue.toLocaleString()}`,
    growthPercent: m.growthPercent,
    trend: getTrendIndicator(m.trend, m.trendStrength),
  }));
}

/**
 * Calculate average growth rate across platforms
 */
export function calculateAverageGrowth(metrics: GrowthMetrics[]): {
  avgGrowthPercent: string;
  topGrower: GrowthMetrics | null;
  topDecliner: GrowthMetrics | null;
} {
  if (metrics.length === 0) {
    return {
      avgGrowthPercent: "0%",
      topGrower: null,
      topDecliner: null,
    };
  }

  const avgGrowth =
    metrics.reduce((sum, m) => sum + parseFloat(m.growthPercent.replace("%", "")), 0) / metrics.length;

  const topGrower = metrics.reduce((max, m) => {
    const currentGrowth = parseFloat(m.growthPercent.replace("%", ""));
    const maxGrowth = parseFloat(max.growthPercent.replace("%", ""));
    return currentGrowth > maxGrowth ? m : max;
  });

  const topDecliner = metrics.reduce((min, m) => {
    const currentGrowth = parseFloat(m.growthPercent.replace("%", ""));
    const minGrowth = parseFloat(min.growthPercent.replace("%", ""));
    return currentGrowth < minGrowth ? m : min;
  });

  return {
    avgGrowthPercent: `${avgGrowth >= 0 ? "+" : ""}${avgGrowth.toFixed(1)}%`,
    topGrower: topGrower.growthRate !== 0 ? topGrower : null,
    topDecliner: topDecliner.growthRate !== 0 ? topDecliner : null,
  };
}

/**
 * Combine historical and predictive data for charting
 */
export function mergeHistoricalAndPredictive(
  historical: Array<{ date: string; value: number }>,
  predictive: PredictivePoint[]
): Array<{
  date: string;
  actual: number;
  predicted: number | null;
  isPredicted: boolean;
}> {
  const merged: Array<{
    date: string;
    actual: number;
    predicted: number | null;
    isPredicted: boolean;
  }> = historical.map(h => ({
    date: h.date,
    actual: h.value,
    predicted: null as number | null,
    isPredicted: false,
  }));

  predictive.forEach(p => {
    merged.push({
      date: p.date,
      actual: p.actual,
      predicted: p.predicted,
      isPredicted: true,
    });
  });

  return merged;
}

/**
 * Calculate confidence interval for predictions
 */
export function calculateConfidenceInterval(
  predicted: number,
  confidence: number,
  stdDev: number = 0.1
): { upper: number; lower: number } {
  const margin = predicted * stdDev * (1 - confidence);
  return {
    upper: predicted + margin,
    lower: Math.max(0, predicted - margin),
  };
}
