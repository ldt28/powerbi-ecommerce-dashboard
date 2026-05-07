/**
 * Search and Filter Utilities
 * Provides full-text search, filtering, and autocomplete functionality
 */

export interface SearchResult {
  id: string;
  type: "dashboard" | "metric" | "report" | "config";
  title: string;
  description?: string;
  score: number;
  metadata?: Record<string, unknown>;
}

export interface FilterCondition {
  field: string;
  operator: "eq" | "neq" | "gt" | "lt" | "gte" | "lte" | "contains" | "in" | "between";
  value: unknown;
}

export interface SavedFilter {
  id: string;
  name: string;
  description?: string;
  conditions: FilterCondition[];
  createdAt: Date;
  updatedAt: Date;
}

export interface FilterHistory {
  id: string;
  userId: string;
  conditions: FilterCondition[];
  timestamp: Date;
  resultCount: number;
}

/**
 * Full-text search implementation
 * Searches across dashboard names, metrics, and descriptions
 */
export function performFullTextSearch(
  query: string,
  items: Array<{ id: string; title: string; description?: string; type: string }>
): SearchResult[] {
  const lowerQuery = query.toLowerCase();
  const words = lowerQuery.split(/\s+/).filter((w) => w.length > 0);

  const results = items
    .map((item) => {
      let score = 0;

      // Exact match in title
      if (item.title.toLowerCase() === lowerQuery) {
        score += 100;
      }

      // Title contains query
      if (item.title.toLowerCase().includes(lowerQuery)) {
        score += 50;
      }

      // Word matches in title
      words.forEach((word) => {
        if (item.title.toLowerCase().includes(word)) {
          score += 10;
        }
      });

      // Description matches
      if (item.description) {
        if (item.description.toLowerCase().includes(lowerQuery)) {
          score += 25;
        }
        words.forEach((word) => {
          if (item.description!.toLowerCase().includes(word)) {
            score += 5;
          }
        });
      }

      return {
        id: item.id,
        type: item.type as SearchResult["type"],
        title: item.title,
        description: item.description,
        score,
      };
    })
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score);

  return results;
}

/**
 * Apply filters to data
 */
export function applyFilters<T extends Record<string, unknown>>(
  data: T[],
  conditions: FilterCondition[]
): T[] {
  if (conditions.length === 0) return data;

  return data.filter((item) => {
    return conditions.every((condition) => {
      const value = item[condition.field];

      switch (condition.operator) {
        case "eq":
          return value === condition.value;
        case "neq":
          return value !== condition.value;
        case "gt":
          return (value as number) > (condition.value as number);
        case "lt":
          return (value as number) < (condition.value as number);
        case "gte":
          return (value as number) >= (condition.value as number);
        case "lte":
          return (value as number) <= (condition.value as number);
        case "contains":
          return String(value).toLowerCase().includes(String(condition.value).toLowerCase());
        case "in":
          return (condition.value as unknown[]).includes(value);
        case "between":
          const [min, max] = condition.value as [number, number];
          return (value as number) >= min && (value as number) <= max;
        default:
          return true;
      }
    });
  });
}

/**
 * Generate autocomplete suggestions
 */
export function generateAutocompleteSuggestions(
  query: string,
  fields: Array<{ name: string; values: string[] }>
): string[] {
  const lowerQuery = query.toLowerCase();
  const suggestions = new Set<string>();

  fields.forEach(({ values }) => {
    values
      .filter((v) => v.toLowerCase().startsWith(lowerQuery))
      .slice(0, 5)
      .forEach((v) => suggestions.add(v));
  });

  return Array.from(suggestions).sort();
}

/**
 * Calculate filter relevance score
 */
export function calculateFilterRelevance(
  filter: SavedFilter,
  currentConditions: FilterCondition[]
): number {
  let score = 0;

  // Matching conditions
  currentConditions.forEach((current) => {
    filter.conditions.forEach((saved) => {
      if (saved.field === current.field && saved.operator === current.operator) {
        score += 10;
      }
    });
  });

  return score;
}

/**
 * Deduplicate and rank filters by usage
 */
export function rankFiltersByUsage(
  filters: SavedFilter[],
  history: FilterHistory[]
): SavedFilter[] {
  const usageMap = new Map<string, number>();

  history.forEach(({ conditions }) => {
    filters.forEach(({ id, conditions: filterConditions }) => {
      const matches = filterConditions.every((fc) =>
        conditions.some((c) => c.field === fc.field && c.operator === fc.operator)
      );
      if (matches) {
        usageMap.set(id, (usageMap.get(id) || 0) + 1);
      }
    });
  });

  return filters.sort((a, b) => (usageMap.get(b.id) || 0) - (usageMap.get(a.id) || 0));
}
