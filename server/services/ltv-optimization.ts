/**
 * LTV Optimization Recommendations Service
 * Provides customer lifetime value analysis and optimization strategies
 */

export interface CustomerLTVSegment {
  segment: 'high-value' | 'at-risk' | 'growth' | 'dormant';
  customerId: string;
  customerName: string;
  currentLTV: number;
  predictedLTV: number;
  ltv30Day: number;
  ltv90Day: number;
  ltv365Day: number;
  purchaseFrequency: number;
  avgOrderValue: number;
  churnRisk: number;
  recommendations: LTVRecommendation[];
  nextBestAction: string;
  estimatedPotentialValue: number;
}

export interface LTVRecommendation {
  action: 'upsell' | 'cross-sell' | 'retention' | 'reactivation' | 'premium-upgrade';
  description: string;
  estimatedLTVIncrease: number;
  confidence: number;
  productIds?: string[];
  discountSuggestion?: number;
  priority: 'high' | 'medium' | 'low';
}

/**
 * Calculate customer lifetime value
 */
export function calculateLTV(
  totalRevenue: number,
  totalOrders: number,
  accountAgeMonths: number,
  churnRate: number = 0.05
): number {
  if (accountAgeMonths === 0) return 0;

  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
  const purchaseFrequency = totalOrders / accountAgeMonths;
  const customerLifespan = 1 / Math.max(churnRate, 0.01); // months

  return avgOrderValue * purchaseFrequency * customerLifespan;
}

/**
 * Segment customers by LTV
 */
export function segmentCustomerByLTV(
  ltv: number,
  churnRisk: number,
  purchaseFrequency: number,
  avgOrderValue: number,
  ltv90Day: number,
  ltv365Day: number
): 'high-value' | 'at-risk' | 'growth' | 'dormant' {
  // High-value: High LTV and low churn risk
  if (ltv > 5000 && churnRisk < 0.2) return 'high-value';

  // At-risk: High LTV but high churn risk
  if (ltv > 2000 && churnRisk > 0.4) return 'at-risk';

  // Growth: Increasing LTV trend
  if (ltv90Day > ltv365Day * 0.25 && purchaseFrequency > 2) return 'growth';

  // Dormant: Low recent activity
  if (ltv90Day < 100 && ltv365Day > 500) return 'dormant';

  return 'growth';
}

/**
 * Generate LTV optimization recommendations
 */
export function generateLTVRecommendations(
  segment: 'high-value' | 'at-risk' | 'growth' | 'dormant',
  ltv: number,
  churnRisk: number,
  purchaseFrequency: number,
  avgOrderValue: number,
  recentPurchases: string[] = []
): LTVRecommendation[] {
  const recommendations: LTVRecommendation[] = [];

  switch (segment) {
    case 'high-value':
      // Premium upgrade
      recommendations.push({
        action: 'premium-upgrade',
        description: 'Offer premium tier subscription or VIP benefits',
        estimatedLTVIncrease: ltv * 0.15,
        confidence: 0.75,
        priority: 'high',
      });

      // Exclusive products
      recommendations.push({
        action: 'upsell',
        description: 'Introduce exclusive/limited edition products',
        estimatedLTVIncrease: ltv * 0.1,
        confidence: 0.7,
        priority: 'medium',
      });
      break;

    case 'at-risk':
      // Retention offer
      recommendations.push({
        action: 'retention',
        description: 'Send personalized retention offer (10-15% discount)',
        estimatedLTVIncrease: ltv * 0.2,
        confidence: 0.8,
        discountSuggestion: 12,
        priority: 'high',
      });

      // Win-back campaign
      recommendations.push({
        action: 'retention',
        description: 'Launch targeted win-back campaign with exclusive benefits',
        estimatedLTVIncrease: ltv * 0.25,
        confidence: 0.65,
        priority: 'high',
      });
      break;

    case 'growth':
      // Cross-sell
      recommendations.push({
        action: 'cross-sell',
        description: 'Recommend complementary products based on purchase history',
        estimatedLTVIncrease: ltv * 0.18,
        confidence: 0.72,
        priority: 'high',
      });

      // Upsell
      recommendations.push({
        action: 'upsell',
        description: 'Suggest premium variants of frequently purchased items',
        estimatedLTVIncrease: ltv * 0.12,
        confidence: 0.68,
        priority: 'medium',
      });
      break;

    case 'dormant':
      // Reactivation
      recommendations.push({
        action: 'reactivation',
        description: 'Send "We miss you" campaign with special offer (15-20% discount)',
        estimatedLTVIncrease: ltv * 0.3,
        confidence: 0.6,
        discountSuggestion: 18,
        priority: 'high',
      });

      // Win-back
      recommendations.push({
        action: 'reactivation',
        description: 'Offer free shipping or gift with next purchase',
        estimatedLTVIncrease: ltv * 0.25,
        confidence: 0.55,
        priority: 'medium',
      });
      break;
  }

  return recommendations;
}

/**
 * Calculate churn risk score (0-1)
 */
export function calculateChurnRisk(
  daysSinceLastPurchase: number,
  purchaseFrequency: number,
  avgOrderValue: number,
  accountAgeMonths: number
): number {
  let risk = 0;

  // Recency factor (most important)
  const expectedDaysBetweenPurchases = 30 / Math.max(purchaseFrequency, 0.1);
  risk += Math.min(daysSinceLastPurchase / (expectedDaysBetweenPurchases * 2), 0.5);

  // Frequency factor
  if (purchaseFrequency < 0.5) risk += 0.3;
  else if (purchaseFrequency < 1) risk += 0.15;

  // Order value factor
  if (avgOrderValue < 50) risk += 0.1;

  // Account age factor (newer accounts have higher churn)
  if (accountAgeMonths < 3) risk += 0.2;
  else if (accountAgeMonths < 6) risk += 0.1;

  return Math.min(risk, 1);
}

/**
 * Estimate potential LTV increase from recommendations
 */
export function estimatePotentialLTVIncrease(
  recommendations: LTVRecommendation[]
): number {
  if (recommendations.length === 0) return 0;

  // Calculate weighted average of potential increases
  const totalConfidence = recommendations.reduce((sum, r) => sum + r.confidence, 0);
  if (totalConfidence === 0) return 0;

  return recommendations.reduce((sum, r) => sum + r.estimatedLTVIncrease * r.confidence, 0) / totalConfidence;
}

/**
 * Determine next best action for customer
 */
export function determineNextBestAction(recommendations: LTVRecommendation[]): string {
  if (recommendations.length === 0) return 'Monitor customer activity';

  const sorted = [...recommendations].sort((a, b) => {
    const scoreA = a.estimatedLTVIncrease * a.confidence;
    const scoreB = b.estimatedLTVIncrease * b.confidence;
    return scoreB - scoreA;
  });

  return sorted[0].description;
}
