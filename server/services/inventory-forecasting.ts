import { db } from '../db';
import { inventoryForecasts, products } from '../../drizzle/schema';
import { eq, and, gte, lte } from 'drizzle-orm';

export interface DemandForecast {
  productId: string;
  sku: string;
  productName: string;
  currentStock: number;
  forecastedDemand: number;
  recommendedReorderPoint: number;
  recommendedOrderQuantity: number;
  daysUntilStockout: number;
  confidence: number;
  trend: 'increasing' | 'decreasing' | 'stable';
  seasonalFactor: number;
  lastRestockDate: Date | null;
  urgency: 'critical' | 'high' | 'medium' | 'low';
}

/**
 * Calculate simple moving average for demand
 */
export function calculateMovingAverage(values: number[], period: number = 7): number {
  if (values.length === 0) return 0;
  const recentValues = values.slice(-period);
  return recentValues.reduce((a, b) => a + b, 0) / recentValues.length;
}

/**
 * Calculate exponential smoothing for trend
 */
export function calculateExponentialSmoothing(
  values: number[],
  alpha: number = 0.3
): number {
  if (values.length === 0) return 0;
  let smoothed = values[0];
  for (let i = 1; i < values.length; i++) {
    smoothed = alpha * values[i] + (1 - alpha) * smoothed;
  }
  return smoothed;
}

/**
 * Calculate seasonal factor based on historical patterns
 */
export function calculateSeasonalFactor(
  historicalDemand: number[],
  currentPeriod: number
): number {
  if (historicalDemand.length === 0) return 1;
  const avgDemand = historicalDemand.reduce((a, b) => a + b, 0) / historicalDemand.length;
  const periodDemand = historicalDemand[currentPeriod % historicalDemand.length] || avgDemand;
  return avgDemand > 0 ? periodDemand / avgDemand : 1;
}

/**
 * Forecast demand using multiple methods
 */
export function forecastDemand(
  historicalDemand: number[],
  leadTime: number = 7,
  seasonalFactor: number = 1
): { forecast: number; confidence: number; trend: 'increasing' | 'decreasing' | 'stable' } {
  if (historicalDemand.length === 0) {
    return { forecast: 0, confidence: 0, trend: 'stable' };
  }

  // Method 1: Moving average
  const ma = calculateMovingAverage(historicalDemand, 7);

  // Method 2: Exponential smoothing
  const es = calculateExponentialSmoothing(historicalDemand, 0.3);

  // Method 3: Linear trend
  const n = historicalDemand.length;
  const sumX = (n * (n + 1)) / 2;
  const sumY = historicalDemand.reduce((a, b) => a + b, 0);
  const sumXY = historicalDemand.reduce((sum, val, i) => sum + val * (i + 1), 0);
  const sumX2 = (n * (n + 1) * (2 * n + 1)) / 6;

  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;
  const trendForecast = intercept + slope * (n + leadTime);

  // Weighted average of methods
  const forecast = (ma * 0.4 + es * 0.35 + Math.max(0, trendForecast) * 0.25) * seasonalFactor;

  // Calculate confidence based on data consistency
  const variance =
    historicalDemand.reduce((sum, val) => sum + Math.pow(val - ma, 2), 0) / historicalDemand.length;
  const stdDev = Math.sqrt(variance);
  const cv = ma > 0 ? stdDev / ma : 0; // Coefficient of variation
  const confidence = Math.max(0, Math.min(1, 1 - cv * 0.5));

  // Determine trend
  let trend: 'increasing' | 'decreasing' | 'stable' = 'stable';
  if (slope > 0.1) trend = 'increasing';
  else if (slope < -0.1) trend = 'decreasing';

  return { forecast: Math.ceil(forecast), confidence, trend };
}

/**
 * Calculate reorder point (ROP) = (Average Daily Demand × Lead Time) + Safety Stock
 */
export function calculateReorderPoint(
  avgDailyDemand: number,
  leadTime: number,
  safetyStock: number
): number {
  return avgDailyDemand * leadTime + safetyStock;
}

/**
 * Calculate economic order quantity (EOQ)
 */
export function calculateEOQ(
  annualDemand: number,
  orderingCost: number = 50,
  holdingCostPerUnit: number = 2
): number {
  if (holdingCostPerUnit === 0) return Math.ceil(Math.sqrt((2 * annualDemand * orderingCost) / 1));
  return Math.ceil(Math.sqrt((2 * annualDemand * orderingCost) / holdingCostPerUnit));
}

/**
 * Calculate days until stockout
 */
export function calculateDaysUntilStockout(
  currentStock: number,
  avgDailyDemand: number
): number {
  if (avgDailyDemand === 0) return Infinity;
  return Math.ceil(currentStock / avgDailyDemand);
}

/**
 * Determine urgency level
 */
export function determineUrgency(
  daysUntilStockout: number,
  leadTime: number
): 'critical' | 'high' | 'medium' | 'low' {
  if (daysUntilStockout <= leadTime) return 'critical';
  if (daysUntilStockout <= leadTime * 1.5) return 'high';
  if (daysUntilStockout <= leadTime * 2) return 'medium';
  return 'low';
}

/**
 * Generate inventory forecast for a product
 */
export async function generateInventoryForecast(
  productId: string,
  historicalDays: number = 90
): Promise<DemandForecast | null> {
  try {
    // Get product info
    const product = await db.query.products.findFirst({
      where: eq(products.id, productId),
    });

    if (!product) return null;

    // Get historical demand data (simplified - in production would query sales data)
    const historicalDemand = Array.from({ length: historicalDays }, (_, i) => {
      // Simulate demand data - in production would come from actual sales
      const base = 10 + Math.random() * 20;
      const seasonal = Math.sin((i / 30) * Math.PI * 2) * 5;
      return Math.max(0, Math.floor(base + seasonal));
    });

    const avgDailyDemand = calculateMovingAverage(historicalDemand, 7);
    const seasonalFactor = calculateSeasonalFactor(historicalDemand, new Date().getDate());
    const { forecast: forecastedDemand, confidence, trend } = forecastDemand(
      historicalDemand,
      7,
      seasonalFactor
    );

    const leadTime = 7; // days
    const safetyStock = avgDailyDemand * 2; // 2 days of safety stock
    const reorderPoint = calculateReorderPoint(avgDailyDemand, leadTime, safetyStock);
    const eoq = calculateEOQ(avgDailyDemand * 365);
    const daysUntilStockout = calculateDaysUntilStockout(product.currentStock || 0, avgDailyDemand);
    const urgency = determineUrgency(daysUntilStockout, leadTime);

    return {
      productId,
      sku: product.sku || '',
      productName: product.name,
      currentStock: product.currentStock || 0,
      forecastedDemand,
      recommendedReorderPoint: Math.ceil(reorderPoint),
      recommendedOrderQuantity: eoq,
      daysUntilStockout: isFinite(daysUntilStockout) ? daysUntilStockout : 999,
      confidence,
      trend,
      seasonalFactor,
      lastRestockDate: product.lastRestockDate,
      urgency,
    };
  } catch (error) {
    console.error(`Error generating forecast for product ${productId}:`, error);
    return null;
  }
}

/**
 * Generate forecasts for all products
 */
export async function generateAllInventoryForecasts(): Promise<DemandForecast[]> {
  try {
    const allProducts = await db.query.products.findMany();
    const forecasts = await Promise.all(
      allProducts.map((product) => generateInventoryForecast(product.id))
    );
    return forecasts.filter((f) => f !== null) as DemandForecast[];
  } catch (error) {
    console.error('Error generating all forecasts:', error);
    return [];
  }
}
