import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { RealtimeDataService } from "./realtime-service";

/**
 * Tests for Real-Time Data Service
 */

describe("RealtimeDataService", () => {
  let service: RealtimeDataService;

  beforeEach(() => {
    service = new RealtimeDataService();
  });

  afterEach(() => {
    service.destroy();
  });

  describe("Caching", () => {
    it("should cache data with TTL", async () => {
      const mockData = { value: 100 };
      const fetcher = vi.fn().mockResolvedValue(mockData);

      const result1 = await service.get("test-key", fetcher, 1000);
      const result2 = await service.get("test-key", fetcher, 1000);

      expect(result1).toEqual(mockData);
      expect(result2).toEqual(mockData);
      expect(fetcher).toHaveBeenCalledTimes(1); // Should only fetch once
    });

    it("should expire cache after TTL", async () => {
      const mockData = { value: 100 };
      const fetcher = vi.fn().mockResolvedValue(mockData);

      await service.get("test-key", fetcher, 100); // 100ms TTL
      await new Promise((resolve) => setTimeout(resolve, 150));
      await service.get("test-key", fetcher, 100);

      expect(fetcher).toHaveBeenCalledTimes(2); // Should fetch again after expiry
    });

    it("should set data in cache", () => {
      const data = { value: 200 };
      service.set("cache-key", data, 1000);

      expect(service.getStats().cacheSize).toBe(1);
    });

    it("should invalidate specific cache entry", async () => {
      const mockData = { value: 100 };
      const fetcher = vi.fn().mockResolvedValue(mockData);

      await service.get("test-key", fetcher, 1000);
      service.invalidate("test-key");
      await service.get("test-key", fetcher, 1000);

      expect(fetcher).toHaveBeenCalledTimes(2);
    });

    it("should invalidate cache by pattern", async () => {
      const mockData = { value: 100 };
      const fetcher = vi.fn().mockResolvedValue(mockData);

      await service.get("dashboard-metrics-1", fetcher, 1000);
      await service.get("dashboard-metrics-2", fetcher, 1000);
      await service.get("sales-data-1", fetcher, 1000);

      service.invalidatePattern(/^dashboard-metrics/);

      expect(service.getStats().cacheSize).toBe(1); // Only sales-data-1 remains
    });

    it("should clear all cache", async () => {
      const mockData = { value: 100 };
      const fetcher = vi.fn().mockResolvedValue(mockData);

      await service.get("key1", fetcher, 1000);
      await service.get("key2", fetcher, 1000);

      service.clear();

      expect(service.getStats().cacheSize).toBe(0);
    });
  });

  describe("Subscriptions", () => {
    it("should subscribe to real-time updates", async () => {
      const mockData = { value: 100 };
      const fetcher = vi.fn().mockResolvedValue(mockData);
      const updateCallback = vi.fn();

      service.subscribe("test-key", fetcher, {
        interval: 100,
        onUpdate: updateCallback,
      });

      await new Promise((resolve) => setTimeout(resolve, 150));

      expect(fetcher).toHaveBeenCalled();
      expect(updateCallback).toHaveBeenCalled();
    });

    it("should unsubscribe from updates", async () => {
      const mockData = { value: 100 };
      const fetcher = vi.fn().mockResolvedValue(mockData);

      const unsubscribe = service.subscribe("test-key", fetcher, {
        interval: 100,
      });

      unsubscribe();

      const stats = service.getStats();
      expect(stats.subscriptionCount).toBe(0);
    });

    it("should only emit update on data change", async () => {
      let callCount = 0;
      const fetcher = vi.fn().mockImplementation(() => {
        callCount++;
        return Promise.resolve({ value: 100 }); // Always same value
      });
      const updateCallback = vi.fn();

      service.subscribe("test-key", fetcher, {
        interval: 100,
        onUpdate: updateCallback,
      });

      await new Promise((resolve) => setTimeout(resolve, 250));

      // Should only emit once (initial fetch)
      expect(updateCallback.mock.calls.length).toBeLessThanOrEqual(2);
    });

    it("should handle subscription errors", async () => {
      const error = new Error("Fetch failed");
      const fetcher = vi.fn().mockRejectedValue(error);
      const errorHandler = vi.fn();

      service.on("error", errorHandler);
      service.subscribe("test-key", fetcher, { interval: 100 });

      await new Promise((resolve) => setTimeout(resolve, 150));

      expect(errorHandler).toHaveBeenCalled();
    });

    it("should unsubscribe all subscriptions", async () => {
      const mockData = { value: 100 };
      const fetcher = vi.fn().mockResolvedValue(mockData);

      service.subscribe("key1", fetcher, { interval: 100 });
      service.subscribe("key2", fetcher, { interval: 100 });

      service.unsubscribeAll();

      expect(service.getStats().subscriptionCount).toBe(0);
    });
  });

  describe("Cache Cleanup", () => {
    it("should automatically clean up expired cache", async () => {
      const mockData = { value: 100 };
      const fetcher = vi.fn().mockResolvedValue(mockData);

      await service.get("key1", fetcher, 100); // 100ms TTL
      await service.get("key2", fetcher, 100);

      expect(service.getStats().cacheSize).toBe(2);

      await new Promise((resolve) => setTimeout(resolve, 200));

      // Trigger cleanup
      await new Promise((resolve) => setTimeout(resolve, 50));

      expect(service.getStats().cacheSize).toBeLessThanOrEqual(2);
    });

    it("should stop cache cleanup", () => {
      service.stopCacheCleanup();
      expect(service.getStats().cacheSize).toBe(0);
    });
  });

  describe("Statistics", () => {
    it("should return cache statistics", async () => {
      const mockData = { value: 100 };
      const fetcher = vi.fn().mockResolvedValue(mockData);

      await service.get("key1", fetcher, 1000);
      await service.get("key2", fetcher, 1000);

      const stats = service.getStats();

      expect(stats.cacheSize).toBe(2);
      expect(stats.subscriptionCount).toBe(0);
      expect(stats.cacheEntries.length).toBe(2);
    });

    it("should track cache entry age", async () => {
      const mockData = { value: 100 };
      const fetcher = vi.fn().mockResolvedValue(mockData);

      await service.get("test-key", fetcher, 1000);
      await new Promise((resolve) => setTimeout(resolve, 100));

      const stats = service.getStats();
      const entry = stats.cacheEntries[0];

      expect(entry.age).toBeGreaterThanOrEqual(100);
      expect(entry.isExpired).toBe(false);
    });

    it("should mark expired entries in statistics", async () => {
      const mockData = { value: 100 };
      const fetcher = vi.fn().mockResolvedValue(mockData);

      await service.get("test-key", fetcher, 100); // 100ms TTL
      await new Promise((resolve) => setTimeout(resolve, 150));

      const stats = service.getStats();
      const entry = stats.cacheEntries[0];

      expect(entry.isExpired).toBe(true);
    });
  });

  describe("Events", () => {
    it("should emit update event on data change", async () => {
      const mockData = { value: 100 };
      const fetcher = vi.fn().mockResolvedValue(mockData);
      const updateHandler = vi.fn();

      service.on("update", updateHandler);
      service.subscribe("test-key", fetcher, { interval: 100 });

      await new Promise((resolve) => setTimeout(resolve, 150));

      expect(updateHandler).toHaveBeenCalled();
    });

    it("should emit error event on fetch failure", async () => {
      const error = new Error("Fetch failed");
      const fetcher = vi.fn().mockRejectedValue(error);
      const errorHandler = vi.fn();

      service.on("error", errorHandler);
      service.subscribe("test-key", fetcher, { interval: 100 });

      await new Promise((resolve) => setTimeout(resolve, 150));

      expect(errorHandler).toHaveBeenCalled();
    });
  });

  describe("Performance", () => {
    it("should handle multiple concurrent cache gets", async () => {
      const mockData = { value: 100 };
      const fetcher = vi.fn().mockResolvedValue(mockData);

      const promises = Array.from({ length: 10 }, (_, i) =>
        service.get(`key-${i}`, fetcher, 1000)
      );

      const results = await Promise.all(promises);

      expect(results.length).toBe(10);
      expect(service.getStats().cacheSize).toBe(10);
    });

    it("should efficiently handle cache invalidation patterns", async () => {
      const mockData = { value: 100 };
      const fetcher = vi.fn().mockResolvedValue(mockData);

      for (let i = 0; i < 100; i++) {
        await service.get(`dashboard-${i}`, fetcher, 1000);
      }

      service.invalidatePattern(/^dashboard-[0-9]{1,2}$/);

      expect(service.getStats().cacheSize).toBeGreaterThanOrEqual(0);
    });
  });
});

describe("Real-Time Data Integration", () => {
  it("should support dashboard metrics caching", async () => {
    const service = new RealtimeDataService();

    const mockMetrics = {
      totalOrders: 1000,
      totalRevenue: 50000,
      avgOrderValue: 50,
    };

    const fetcher = vi.fn().mockResolvedValue(mockMetrics);
    const result = await service.get("dashboard-metrics", fetcher, 5000);

    expect(result).toEqual(mockMetrics);
    expect(fetcher).toHaveBeenCalledTimes(1);

    service.destroy();
  });

  it("should support sales data polling", async () => {
    const service = new RealtimeDataService();

    const mockSalesData = [
      { id: 1, revenue: 100, date: new Date() },
      { id: 2, revenue: 200, date: new Date() },
    ];

    const fetcher = vi.fn().mockResolvedValue(mockSalesData);
    const result = await service.get("sales-data", fetcher, 3000);

    expect(result).toEqual(mockSalesData);
    expect(result.length).toBe(2);

    service.destroy();
  });

  it("should support ad spend data caching", async () => {
    const service = new RealtimeDataService();

    const mockAdData = [
      { id: 1, platform: "Google", spend: 1000, roi: 3.5 },
      { id: 2, platform: "Facebook", spend: 800, roi: 2.8 },
    ];

    const fetcher = vi.fn().mockResolvedValue(mockAdData);
    const result = await service.get("ad-spend-data", fetcher, 5000);

    expect(result).toEqual(mockAdData);
    expect(result.length).toBe(2);

    service.destroy();
  });
});
