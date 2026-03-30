import { EventEmitter } from "events";

/**
 * Real-time Data Service
 * Handles WebSocket connections, database polling, caching, and auto-refresh
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

interface SubscriptionOptions {
  interval?: number;
  ttl?: number;
  onUpdate?: (data: any) => void;
}

export class RealtimeDataService extends EventEmitter {
  private cache: Map<string, CacheEntry<any>> = new Map();
  private subscriptions: Map<string, NodeJS.Timeout> = new Map();
  private cacheCleanupInterval: NodeJS.Timeout | null = null;
  private readonly DEFAULT_TTL = 60000; // 1 minute
  private readonly DEFAULT_POLL_INTERVAL = 5000; // 5 seconds
  private readonly CACHE_CLEANUP_INTERVAL = 30000; // 30 seconds

  constructor() {
    super();
    this.startCacheCleanup();
  }

  /**
   * Get data from cache or fetch from database
   */
  async get<T>(
    key: string,
    fetcher: () => Promise<T>,
    ttl: number = this.DEFAULT_TTL
  ): Promise<T> {
    const cached = this.cache.get(key);

    // Return cached data if still valid
    if (cached && Date.now() - cached.timestamp < cached.ttl) {
      return cached.data;
    }

    // Fetch fresh data
    const data = await fetcher();
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    });

    return data;
  }

  /**
   * Set data in cache
   */
  set<T>(key: string, data: T, ttl: number = this.DEFAULT_TTL): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    });
  }

  /**
   * Invalidate cache entry
   */
  invalidate(key: string): void {
    this.cache.delete(key);
  }

  /**
   * Invalidate all cache entries matching pattern
   */
  invalidatePattern(pattern: RegExp): void {
    const keysToDelete: string[] = [];
    this.cache.forEach((_, key) => {
      if (pattern.test(key)) {
        keysToDelete.push(key);
      }
    });
    keysToDelete.forEach((key) => this.cache.delete(key));
  }

  /**
   * Subscribe to real-time updates with polling
   */
  subscribe<T>(
    key: string,
    fetcher: () => Promise<T>,
    options: SubscriptionOptions = {}
  ): () => void {
    const interval = options.interval || this.DEFAULT_POLL_INTERVAL;
    const ttl = options.ttl || this.DEFAULT_TTL;

    // Initial fetch
    fetcher()
      .then((data) => {
        this.set(key, data, ttl);
        this.emit("update", { key, data });
        options.onUpdate?.(data);
      })
      .catch((error) => {
        this.emit("error", { key, error });
      });

    // Set up polling
    const timeoutId = setInterval(async () => {
      try {
        const data = await fetcher();
        const cached = this.cache.get(key);

        // Only emit if data changed
        if (!cached || JSON.stringify(cached.data) !== JSON.stringify(data)) {
          this.set(key, data, ttl);
          this.emit("update", { key, data });
          options.onUpdate?.(data);
        }
      } catch (error) {
        this.emit("error", { key, error });
      }
    }, interval);

    this.subscriptions.set(key, timeoutId);

    // Return unsubscribe function
    return () => this.unsubscribe(key);
  }

  /**
   * Unsubscribe from real-time updates
   */
  unsubscribe(key: string): void {
    const timeoutId = this.subscriptions.get(key);
    if (timeoutId) {
      clearInterval(timeoutId);
      this.subscriptions.delete(key);
    }
  }

  /**
   * Unsubscribe all subscriptions
   */
  unsubscribeAll(): void {
    const timeoutIds: NodeJS.Timeout[] = [];
    this.subscriptions.forEach((timeoutId) => {
      timeoutIds.push(timeoutId);
    });
    timeoutIds.forEach((timeoutId) => clearInterval(timeoutId));
    this.subscriptions.clear();
  }

  /**
   * Get cache statistics
   */
  getStats() {
    const cacheEntries: any[] = [];
    this.cache.forEach((entry, key) => {
      cacheEntries.push({
        key,
        age: Date.now() - entry.timestamp,
        ttl: entry.ttl,
        isExpired: Date.now() - entry.timestamp > entry.ttl,
      });
    });
    return {
      cacheSize: this.cache.size,
      subscriptionCount: this.subscriptions.size,
      cacheEntries,
    };
  }

  /**
   * Clear all cache and subscriptions
   */
  clear(): void {
    this.cache.clear();
    this.unsubscribeAll();
  }

  /**
   * Start automatic cache cleanup
   */
  private startCacheCleanup(): void {
    this.cacheCleanupInterval = setInterval(() => {
      const now = Date.now();
      const keysToDelete: string[] = [];
      this.cache.forEach((entry, key) => {
        if (now - entry.timestamp > entry.ttl) {
          keysToDelete.push(key);
        }
      });
      keysToDelete.forEach((key) => this.cache.delete(key));
    }, this.CACHE_CLEANUP_INTERVAL);
  }

  /**
   * Stop cache cleanup
   */
  stopCacheCleanup(): void {
    if (this.cacheCleanupInterval) {
      clearInterval(this.cacheCleanupInterval);
      this.cacheCleanupInterval = null;
    }
  }

  /**
   * Destroy service
   */
  destroy(): void {
    this.unsubscribeAll();
    this.stopCacheCleanup();
    this.cache.clear();
    this.removeAllListeners();
  }
}

// Export singleton instance
export const realtimeService = new RealtimeDataService();
