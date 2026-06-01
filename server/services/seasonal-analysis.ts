/**
 * Seasonal Trend Analysis Service
 * Analyzes seasonal patterns and holiday impact on sales
 */

export interface SeasonalTrend {
  period: string; // e.g., "2024-Q1", "2024-January", "2024-Week-01"
  baselineRevenue: number;
  actualRevenue: number;
  seasonalFactor: number;
  holidayImpact: number;
  trend: 'increasing' | 'decreasing' | 'stable';
  confidence: number;
  anomalies: Anomaly[];
}

export interface Anomaly {
  date: string;
  value: number;
  expectedValue: number;
  deviation: number;
  cause: string;
}

export interface HolidayImpact {
  holiday: string;
  date: string;
  impactType: 'positive' | 'negative' | 'neutral';
  revenueChange: number;
  revenueChangePercent: number;
  affectedCategories: string[];
}

// Major holidays and shopping events
const HOLIDAYS_AND_EVENTS: Record<string, { date: string; name: string; expectedImpact: number }[]> = {
  US: [
    { date: '01-01', name: 'New Year', expectedImpact: 0.15 },
    { date: '02-14', name: 'Valentine Day', expectedImpact: 0.25 },
    { date: '03-17', name: 'St. Patrick Day', expectedImpact: 0.1 },
    { date: '05-27', name: 'Memorial Day', expectedImpact: 0.2 },
    { date: '07-04', name: 'Independence Day', expectedImpact: 0.2 },
    { date: '09-02', name: 'Labor Day', expectedImpact: 0.15 },
    { date: '10-31', name: 'Halloween', expectedImpact: 0.3 },
    { date: '11-28', name: 'Thanksgiving', expectedImpact: 0.35 },
    { date: '12-26', name: 'Boxing Day', expectedImpact: 0.4 },
    { date: '12-25', name: 'Christmas', expectedImpact: 0.5 },
  ],
};

/**
 * Calculate seasonal factor (0-2, where 1 is average)
 */
export function calculateSeasonalFactor(
  historicalData: number[],
  periodIndex: number,
  periodLength: number = 365
): number {
  if (historicalData.length === 0) return 1;

  const avgRevenue = historicalData.reduce((a, b) => a + b, 0) / historicalData.length;
  const periodData = historicalData.filter((_, i) => i % periodLength === periodIndex);

  if (periodData.length === 0) return 1;

  const periodAvg = periodData.reduce((a, b) => a + b, 0) / periodData.length;
  return avgRevenue > 0 ? periodAvg / avgRevenue : 1;
}

/**
 * Detect holiday impact on sales
 */
export function detectHolidayImpact(
  date: string,
  actualRevenue: number,
  baselineRevenue: number,
  country: string = 'US'
): HolidayImpact | null {
  const holidays = HOLIDAYS_AND_EVENTS[country] || [];
  const dateStr = date.substring(5, 10); // MM-DD format

  const holiday = holidays.find((h) => h.date === dateStr);
  if (!holiday) return null;

  const revenueChange = actualRevenue - baselineRevenue;
  const revenueChangePercent = baselineRevenue > 0 ? (revenueChange / baselineRevenue) * 100 : 0;

  let impactType: 'positive' | 'negative' | 'neutral' = 'neutral';
  if (revenueChangePercent > 10) impactType = 'positive';
  else if (revenueChangePercent < -10) impactType = 'negative';

  return {
    holiday: holiday.name,
    date,
    impactType,
    revenueChange,
    revenueChangePercent,
    affectedCategories: [],
  };
}

/**
 * Analyze seasonal patterns
 */
export function analyzeSeasonalPatterns(
  historicalData: number[],
  labels: string[]
): SeasonalTrend[] {
  const trends: SeasonalTrend[] = [];

  if (historicalData.length < 30) {
    return trends; // Not enough data
  }

  // Calculate baseline (average of all data)
  const baseline = historicalData.reduce((a, b) => a + b, 0) / historicalData.length;

  // Analyze each period
  for (let i = 0; i < historicalData.length; i++) {
    const actual = historicalData[i];
    const seasonalFactor = baseline > 0 ? actual / baseline : 1;
    const deviation = actual - baseline;

    // Calculate trend (simple: compare to previous period)
    let trend: 'increasing' | 'decreasing' | 'stable' = 'stable';
    if (i > 0) {
      const prevValue = historicalData[i - 1];
      if (actual > prevValue * 1.05) trend = 'increasing';
      else if (actual < prevValue * 0.95) trend = 'decreasing';
    }

    // Calculate confidence based on consistency
    const recentValues = historicalData.slice(Math.max(0, i - 7), i + 1);
    const variance =
      recentValues.reduce((sum, val) => sum + Math.pow(val - baseline, 2), 0) / recentValues.length;
    const stdDev = Math.sqrt(variance);
    const confidence = Math.max(0, Math.min(1, 1 - stdDev / (baseline + 1)));

    trends.push({
      period: labels[i] || `Period ${i}`,
      baselineRevenue: baseline,
      actualRevenue: actual,
      seasonalFactor,
      holidayImpact: 0,
      trend,
      confidence,
      anomalies: [],
    });
  }

  return trends;
}

/**
 * Identify anomalies in seasonal data
 */
export function identifyAnomalies(
  historicalData: number[],
  threshold: number = 2.5 // Standard deviations
): Anomaly[] {
  const anomalies: Anomaly[] = [];

  if (historicalData.length < 10) return anomalies;

  const mean = historicalData.reduce((a, b) => a + b, 0) / historicalData.length;
  const variance = historicalData.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / historicalData.length;
  const stdDev = Math.sqrt(variance);

  historicalData.forEach((value, index) => {
    const zScore = Math.abs((value - mean) / (stdDev + 1));

    if (zScore > threshold) {
      anomalies.push({
        date: `Day ${index}`,
        value,
        expectedValue: mean,
        deviation: value - mean,
        cause: value > mean ? 'Spike in sales' : 'Drop in sales',
      });
    }
  });

  return anomalies;
}

/**
 * Forecast seasonal demand for next period
 */
export function forecastSeasonalDemand(
  historicalData: number[],
  seasonalFactors: number[],
  nextPeriods: number = 30
): number[] {
  const forecast: number[] = [];

  if (historicalData.length === 0) return forecast;

  const baseline = historicalData.reduce((a, b) => a + b, 0) / historicalData.length;

  for (let i = 0; i < nextPeriods; i++) {
    const seasonalIndex = i % seasonalFactors.length;
    const factor = seasonalFactors[seasonalIndex] || 1;
    const trend = i > 0 ? forecast[i - 1] * 1.01 : baseline; // 1% growth trend
    forecast.push(Math.round(trend * factor));
  }

  return forecast;
}

/**
 * Get expected seasonal factors for a year
 */
export function getAnnualSeasonalFactors(): number[] {
  // Typical seasonal pattern (monthly)
  return [
    1.15, // January - New Year boost
    1.0, // February
    1.05, // March - Spring
    1.1, // April
    1.2, // May - Summer prep
    1.25, // June - Summer
    1.2, // July
    1.15, // August
    1.1, // September
    1.3, // October - Halloween
    1.5, // November - Black Friday/Thanksgiving
    1.8, // December - Christmas
  ];
}

/**
 * Analyze category-specific seasonal trends
 */
export function analyzeCategorySeasonality(
  categoryData: Record<string, number[]>
): Record<string, SeasonalTrend[]> {
  const results: Record<string, SeasonalTrend[]> = {};

  for (const [category, data] of Object.entries(categoryData)) {
    results[category] = analyzeSeasonalPatterns(data, []);
  }

  return results;
}
