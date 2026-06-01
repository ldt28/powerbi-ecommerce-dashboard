/**
 * Competitor Price Monitoring and Benchmarking Service
 */

export interface CompetitorPrice {
  productId: string;
  sku: string;
  productName: string;
  ourPrice: number;
  competitors: CompetitorPriceData[];
  avgCompetitorPrice: number;
  minCompetitorPrice: number;
  maxCompetitorPrice: number;
  pricePosition: 'premium' | 'competitive' | 'discount';
  priceGap: number; // Our price - average competitor price
  priceGapPercent: number;
  recommendation: PriceRecommendation;
  lastUpdated: Date;
}

export interface CompetitorPriceData {
  competitorName: string;
  price: number;
  url?: string;
  inStock: boolean;
  lastChecked: Date;
}

export interface PriceRecommendation {
  action: 'increase' | 'decrease' | 'maintain';
  suggestedPrice: number;
  rationale: string;
  potentialImpact: string;
  confidence: number;
}

export interface PriceElasticity {
  productId: string;
  elasticity: number; // -0.5 to -2.0 (negative = normal)
  demandSensitivity: 'high' | 'medium' | 'low';
  recommendedPriceRange: { min: number; max: number };
}

/**
 * Calculate price position relative to competitors
 */
export function calculatePricePosition(
  ourPrice: number,
  avgCompetitorPrice: number
): 'premium' | 'competitive' | 'discount' {
  const priceDiff = ourPrice - avgCompetitorPrice;
  const priceDiffPercent = (priceDiff / avgCompetitorPrice) * 100;

  if (priceDiffPercent > 5) return 'premium';
  if (priceDiffPercent < -5) return 'discount';
  return 'competitive';
}

/**
 * Calculate price gap
 */
export function calculatePriceGap(ourPrice: number, avgCompetitorPrice: number): number {
  return ourPrice - avgCompetitorPrice;
}

/**
 * Calculate price gap percentage
 */
export function calculatePriceGapPercent(ourPrice: number, avgCompetitorPrice: number): number {
  if (avgCompetitorPrice === 0) return 0;
  return ((ourPrice - avgCompetitorPrice) / avgCompetitorPrice) * 100;
}

/**
 * Generate price recommendation
 */
export function generatePriceRecommendation(
  ourPrice: number,
  avgCompetitorPrice: number,
  minCompetitorPrice: number,
  maxCompetitorPrice: number,
  demandTrend: 'increasing' | 'decreasing' | 'stable',
  salesVolume: number,
  elasticity: number = -1.5
): PriceRecommendation {
  const priceGapPercent = calculatePriceGapPercent(ourPrice, avgCompetitorPrice);
  const position = calculatePricePosition(ourPrice, avgCompetitorPrice);

  let action: 'increase' | 'decrease' | 'maintain' = 'maintain';
  let suggestedPrice = ourPrice;
  let rationale = '';
  let potentialImpact = '';

  // Premium positioning with strong demand
  if (position === 'premium' && demandTrend === 'increasing' && salesVolume > 100) {
    action = 'maintain';
    rationale = 'Strong demand justifies premium positioning';
    potentialImpact = 'Maintain market share and margins';
  }
  // Premium positioning with weak demand
  else if (position === 'premium' && demandTrend === 'decreasing') {
    action = 'decrease';
    suggestedPrice = avgCompetitorPrice * 0.98;
    rationale = 'Decreasing demand suggests price reduction needed';
    potentialImpact = 'Potential 10-15% volume increase';
  }
  // Discount positioning with high volume
  else if (position === 'discount' && salesVolume > 200) {
    action = 'increase';
    suggestedPrice = avgCompetitorPrice * 0.95;
    rationale = 'High volume at discount suggests room for price increase';
    potentialImpact = 'Potential 5-10% margin improvement';
  }
  // Competitive positioning
  else if (position === 'competitive') {
    if (demandTrend === 'increasing') {
      action = 'increase';
      suggestedPrice = avgCompetitorPrice * 1.02;
      rationale = 'Increasing demand allows for slight price increase';
      potentialImpact = 'Potential 2-3% margin improvement';
    } else if (demandTrend === 'decreasing') {
      action = 'decrease';
      suggestedPrice = avgCompetitorPrice * 0.98;
      rationale = 'Decreasing demand requires competitive pricing';
      potentialImpact = 'Potential 5-8% volume increase';
    }
  }

  return {
    action,
    suggestedPrice: Math.round(suggestedPrice * 100) / 100,
    rationale,
    potentialImpact,
    confidence: Math.abs(elasticity) > 1.5 ? 0.85 : 0.65,
  };
}

/**
 * Estimate price elasticity
 */
export function estimatePriceElasticity(
  historicalPrices: number[],
  historicalQuantities: number[]
): number {
  if (historicalPrices.length < 2 || historicalQuantities.length < 2) {
    return -1.5; // Default elasticity
  }

  // Simple linear regression to estimate elasticity
  const n = historicalPrices.length;
  const sumX = historicalPrices.reduce((a, b) => a + b, 0);
  const sumY = historicalQuantities.reduce((a, b) => a + b, 0);
  const sumXY = historicalPrices.reduce((sum, price, i) => sum + price * historicalQuantities[i], 0);
  const sumX2 = historicalPrices.reduce((sum, price) => sum + price * price, 0);

  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);

  // Elasticity = (% change in quantity) / (% change in price)
  const avgPrice = sumX / n;
  const avgQuantity = sumY / n;

  const elasticity = slope * (avgPrice / avgQuantity);

  return Math.max(-3, Math.min(-0.5, elasticity)); // Clamp between -3 and -0.5
}

/**
 * Determine demand sensitivity based on elasticity
 */
export function determineDemandSensitivity(elasticity: number): 'high' | 'medium' | 'low' {
  if (Math.abs(elasticity) > 1.5) return 'high';
  if (Math.abs(elasticity) > 0.8) return 'medium';
  return 'low';
}

/**
 * Calculate recommended price range
 */
export function calculateRecommendedPriceRange(
  ourPrice: number,
  minCompetitorPrice: number,
  maxCompetitorPrice: number,
  elasticity: number
): { min: number; max: number } {
  const avgCompetitorPrice = (minCompetitorPrice + maxCompetitorPrice) / 2;
  const margin = (maxCompetitorPrice - minCompetitorPrice) / 2;

  // Adjust range based on elasticity
  const elasticityFactor = Math.abs(elasticity) / 2; // 0.25 to 1.5

  return {
    min: Math.max(minCompetitorPrice * 0.9, avgCompetitorPrice - margin * elasticityFactor),
    max: Math.min(maxCompetitorPrice * 1.1, avgCompetitorPrice + margin * elasticityFactor),
  };
}

/**
 * Analyze price trends
 */
export function analyzePriceTrends(
  historicalPrices: number[]
): { trend: 'increasing' | 'decreasing' | 'stable'; avgChange: number } {
  if (historicalPrices.length < 2) {
    return { trend: 'stable', avgChange: 0 };
  }

  const changes = [];
  for (let i = 1; i < historicalPrices.length; i++) {
    const change = (historicalPrices[i] - historicalPrices[i - 1]) / historicalPrices[i - 1];
    changes.push(change);
  }

  const avgChange = changes.reduce((a, b) => a + b, 0) / changes.length;

  let trend: 'increasing' | 'decreasing' | 'stable' = 'stable';
  if (avgChange > 0.02) trend = 'increasing';
  else if (avgChange < -0.02) trend = 'decreasing';

  return { trend, avgChange };
}

/**
 * Identify price opportunities
 */
export function identifyPriceOpportunities(
  competitors: CompetitorPriceData[],
  ourPrice: number,
  salesVolume: number
): string[] {
  const opportunities: string[] = [];

  const inStockCompetitors = competitors.filter((c) => c.inStock);
  if (inStockCompetitors.length === 0) {
    opportunities.push('Opportunity: All competitors out of stock - consider price increase');
    return opportunities;
  }

  const avgPrice = inStockCompetitors.reduce((sum, c) => sum + c.price, 0) / inStockCompetitors.length;
  const priceGap = ourPrice - avgPrice;

  if (priceGap > avgPrice * 0.1 && salesVolume < 50) {
    opportunities.push('Opportunity: Price too high relative to demand - consider reduction');
  }

  if (priceGap < -avgPrice * 0.1 && salesVolume > 200) {
    opportunities.push('Opportunity: Price too low relative to demand - consider increase');
  }

  const highestPrice = Math.max(...inStockCompetitors.map((c) => c.price));
  if (ourPrice < highestPrice * 0.95 && salesVolume > 150) {
    opportunities.push('Opportunity: Room to increase price while maintaining competitiveness');
  }

  return opportunities;
}
