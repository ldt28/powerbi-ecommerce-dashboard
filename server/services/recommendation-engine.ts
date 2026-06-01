/**
 * Product Recommendation Engine
 * Generates personalized product recommendations based on purchase patterns
 */

export interface ProductRecommendation {
  productId: string;
  sku: string;
  productName: string;
  category: string;
  price: number;
  score: number;
  reason: string;
  type: 'collaborative' | 'content-based' | 'hybrid';
  complementaryProducts?: string[];
  estimatedConversionLift: number;
}

export interface RecommendationStrategy {
  strategy: 'upsell' | 'cross-sell' | 'bundle' | 'similar' | 'trending';
  products: ProductRecommendation[];
  expectedLift: number;
}

/**
 * Calculate product similarity based on attributes
 */
export function calculateProductSimilarity(
  product1: ProductAttributes,
  product2: ProductAttributes
): number {
  let similarity = 0;
  let factors = 0;

  // Category similarity (40% weight)
  if (product1.category === product2.category) {
    similarity += 0.4;
  }
  factors += 0.4;

  // Price range similarity (30% weight)
  const priceDiff = Math.abs(product1.price - product2.price) / Math.max(product1.price, product2.price);
  if (priceDiff < 0.2) {
    similarity += 0.3 * (1 - priceDiff);
  }
  factors += 0.3;

  // Tag/attribute similarity (30% weight)
  const commonTags = product1.tags.filter((tag) => product2.tags.includes(tag)).length;
  const totalTags = new Set([...product1.tags, ...product2.tags]).size;
  if (totalTags > 0) {
    similarity += 0.3 * (commonTags / totalTags);
  }
  factors += 0.3;

  return factors > 0 ? similarity / factors : 0;
}

/**
 * Collaborative filtering: Find similar customers and their purchases
 */
export function findSimilarCustomers(
  customerPurchaseHistory: string[],
  allCustomerHistories: Map<string, string[]>,
  topN: number = 5
): string[] {
  const similarities: { customerId: string; score: number }[] = [];

  for (const [customerId, history] of allCustomerHistories.entries()) {
    const commonProducts = customerPurchaseHistory.filter((p) => history.includes(p)).length;
    const similarity = commonProducts / Math.max(customerPurchaseHistory.length, history.length);

    if (similarity > 0) {
      similarities.push({ customerId, score: similarity });
    }
  }

  return similarities
    .sort((a, b) => b.score - a.score)
    .slice(0, topN)
    .map((s) => s.customerId);
}

/**
 * Get products purchased by similar customers
 */
export function getProductsFromSimilarCustomers(
  similarCustomerIds: string[],
  allCustomerHistories: Map<string, string[]>,
  currentCustomerProducts: Set<string>,
  topN: number = 10
): string[] {
  const productScores: Map<string, number> = new Map();

  for (const customerId of similarCustomerIds) {
    const history = allCustomerHistories.get(customerId) || [];
    for (const product of history) {
      if (!currentCustomerProducts.has(product)) {
        productScores.set(product, (productScores.get(product) || 0) + 1);
      }
    }
  }

  return Array.from(productScores.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, topN)
    .map(([product]) => product);
}

/**
 * Content-based recommendation: Find similar products
 */
export function getContentBasedRecommendations(
  productId: string,
  product: ProductAttributes,
  allProducts: Map<string, ProductAttributes>,
  topN: number = 10
): { productId: string; score: number }[] {
  const recommendations: { productId: string; score: number }[] = [];

  for (const [otherId, otherProduct] of allProducts.entries()) {
    if (otherId !== productId) {
      const similarity = calculateProductSimilarity(product, otherProduct);
      if (similarity > 0.3) {
        recommendations.push({ productId: otherId, score: similarity });
      }
    }
  }

  return recommendations.sort((a, b) => b.score - a.score).slice(0, topN);
}

/**
 * Identify upsell opportunities
 */
export function identifyUpsellOpportunities(
  customerSpend: number,
  purchaseFrequency: number,
  allProducts: ProductAttributes[]
): ProductRecommendation[] {
  const avgProductPrice = allProducts.reduce((sum, p) => sum + p.price, 0) / allProducts.length;
  const recommendations: ProductRecommendation[] = [];

  // Look for premium products
  const premiumProducts = allProducts.filter((p) => p.price > avgProductPrice * 1.5);

  for (const product of premiumProducts.slice(0, 5)) {
    recommendations.push({
      productId: product.id,
      sku: product.sku,
      productName: product.name,
      category: product.category,
      price: product.price,
      score: 0.7 + Math.random() * 0.3,
      reason: `Premium upgrade - customers like you often purchase this`,
      type: 'content-based',
      estimatedConversionLift: 0.15,
    });
  }

  return recommendations;
}

/**
 * Identify cross-sell opportunities
 */
export function identifyCrossSellOpportunities(
  purchasedCategories: Set<string>,
  allProducts: ProductAttributes[],
  categoryAffinities: Map<string, number>
): ProductRecommendation[] {
  const recommendations: ProductRecommendation[] = [];

  // Find complementary categories
  const complementaryCategories = new Map<string, number>();

  for (const category of purchasedCategories) {
    const affinity = categoryAffinities.get(category) || 0.5;
    // Find categories that go well with this one
    for (const entry of Array.from(categoryAffinities.entries())) {
    const [otherCategory, otherAffinity] = entry;
    if (!purchasedCategories.has(otherCategory)) {
      const score = affinity * otherAffinity;
      complementaryCategories.set(otherCategory, (complementaryCategories.get(otherCategory) || 0) + score);
    }
  }
  }

  // Get top products from complementary categories
  const topComplementary = Array.from(complementaryCategories.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([category]) => category);

  for (const category of topComplementary) {
    const categoryProducts = allProducts.filter((p) => p.category === category).slice(0, 2);
    for (const product of categoryProducts) {
      recommendations.push({
        productId: product.id,
        sku: product.sku,
        productName: product.name,
        category: product.category,
        price: product.price,
        score: 0.65 + Math.random() * 0.25,
        reason: `Customers who bought ${Array.from(purchasedCategories)[0]} also bought this`,
        type: 'collaborative',
        estimatedConversionLift: 0.2,
      });
    }
  }

  return recommendations;
}

/**
 * Identify bundle opportunities
 */
export function identifyBundleOpportunities(
  purchasedProducts: string[],
  frequentBundles: Map<string, number>,
  allProducts: Map<string, ProductAttributes>
): ProductRecommendation[] {
  const recommendations: ProductRecommendation[] = [];

  for (const entry of Array.from(frequentBundles.entries())) {
    const [bundleKey, frequency] = entry;
    const bundleProducts = bundleKey.split(',');
    const missingProducts = bundleProducts.filter((p: string) => !purchasedProducts.includes(p));

    if (missingProducts.length > 0 && missingProducts.length < bundleProducts.length) {
      for (const productId of missingProducts) {
        const product = allProducts.get(productId);
        if (product) {
          recommendations.push({
            productId,
            sku: product.sku,
            productName: product.name,
            category: product.category,
            price: product.price,
            score: Math.min(1, frequency / 100),
            reason: `Complete the popular bundle - frequently bought together`,
            type: 'collaborative',
            complementaryProducts: bundleProducts.filter((p: string) => p !== productId),
            estimatedConversionLift: 0.25,
          });
        }
      }
    }
  }

  return recommendations;
}

/**
 * Get trending products
 */
export function getTrendingProducts(
  allProducts: ProductAttributes[],
  trendingScores: Map<string, number>,
  topN: number = 5
): ProductRecommendation[] {
  const recommendations: ProductRecommendation[] = [];

  const sortedTrending = Array.from(trendingScores.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, topN);

  for (const [productId, score] of sortedTrending) {
    const product = allProducts.find((p) => p.id === productId);
    if (product) {
      recommendations.push({
        productId,
        sku: product.sku,
        productName: product.name,
        category: product.category,
        price: product.price,
        score: Math.min(1, score / 100),
        reason: `Trending now - popular with customers like you`,
        type: 'content-based',
        estimatedConversionLift: 0.1,
      });
    }
  }

  return recommendations;
}

/**
 * Generate hybrid recommendations combining multiple strategies
 */
export function generateHybridRecommendations(
  collaborativeRecs: ProductRecommendation[],
  contentRecs: ProductRecommendation[],
  upsellRecs: ProductRecommendation[],
  crossSellRecs: ProductRecommendation[]
): ProductRecommendation[] {
  const allRecs = [...collaborativeRecs, ...contentRecs, ...upsellRecs, ...crossSellRecs];

  // Deduplicate and merge scores
  const merged = new Map<string, ProductRecommendation>();

  for (const rec of allRecs) {
    if (merged.has(rec.productId)) {
      const existing = merged.get(rec.productId)!;
      existing.score = (existing.score + rec.score) / 2;
    } else {
      merged.set(rec.productId, rec);
    }
  }

  return Array.from(merged.values())
    .sort((a, b) => b.score - a.score)
    .slice(0, 10);
}

// Types
export interface ProductAttributes {
  id: string;
  sku: string;
  name: string;
  category: string;
  price: number;
  tags: string[];
}
