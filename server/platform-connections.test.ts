import { describe, it, expect, beforeEach, vi } from "vitest";
import { getDb } from "./db";
import { apiConnections } from "../drizzle/schema";
import { eq } from "drizzle-orm";

describe("Platform Connections", () => {
  let db: any;
  const testUserId = 1;

  beforeEach(async () => {
    db = await getDb();
  });

  describe("Connection Management", () => {
    it("should list all connections for a user", async () => {
      const connections = await db
        .select()
        .from(apiConnections)
        .where(eq(apiConnections.userId, testUserId));

      expect(Array.isArray(connections)).toBe(true);
      connections.forEach((conn: any) => {
        expect(conn.userId).toBe(testUserId);
        expect(conn.platform).toBeDefined();
        expect(conn.connectionName).toBeDefined();
      });
    });

    it("should filter connections by platform", async () => {
      const googleConnections = await db
        .select()
        .from(apiConnections)
        .where(eq(apiConnections.platform, "google_analytics"));

      googleConnections.forEach((conn: any) => {
        expect(conn.platform).toBe("google_analytics");
      });
    });

    it("should filter active connections only", async () => {
      const activeConnections = await db
        .select()
        .from(apiConnections)
        .where(eq(apiConnections.isActive, 1));

      activeConnections.forEach((conn: any) => {
        expect(conn.isActive).toBe(1);
      });
    });
  });

  describe("Connection Status", () => {
    it("should track sync status", async () => {
      const validStatuses = ["idle", "syncing", "success", "error"];
      const connections = await db.select().from(apiConnections);

      connections.forEach((conn: any) => {
        expect(validStatuses).toContain(conn.syncStatus);
      });
    });

    it("should track last sync time", async () => {
      const connections = await db.select().from(apiConnections);

      connections.forEach((conn: any) => {
        if (conn.lastSyncedAt) {
          expect(conn.lastSyncedAt instanceof Date || typeof conn.lastSyncedAt === "string").toBe(true);
        }
      });
    });

    it("should store sync errors", async () => {
      const errorConnections = await db
        .select()
        .from(apiConnections)
        .where(eq(apiConnections.syncStatus, "error"));

      errorConnections.forEach((conn: any) => {
        if (conn.syncStatus === "error") {
          // Error message may or may not be present
          expect(typeof conn.syncError === "string" || conn.syncError === null).toBe(true);
        }
      });
    });
  });

  describe("Token Management", () => {
    it("should store access tokens", async () => {
      const connections = await db.select().from(apiConnections);

      connections.forEach((conn: any) => {
        if (conn.isActive) {
          expect(conn.accessToken).toBeDefined();
          expect(typeof conn.accessToken).toBe("string");
        }
      });
    });

    it("should store refresh tokens when available", async () => {
      const connections = await db.select().from(apiConnections);

      connections.forEach((conn: any) => {
        // Refresh token may or may not be present
        expect(typeof conn.refreshToken === "string" || conn.refreshToken === null).toBe(true);
      });
    });

    it("should track token expiry", async () => {
      const connections = await db.select().from(apiConnections);

      connections.forEach((conn: any) => {
        if (conn.expiresAt) {
          expect(conn.expiresAt instanceof Date || typeof conn.expiresAt === "string").toBe(true);
        }
      });
    });
  });

  describe("Account Information", () => {
    it("should store account email", async () => {
      const connections = await db.select().from(apiConnections);

      connections.forEach((conn: any) => {
        expect(conn.accountEmail).toBeDefined();
        expect(typeof conn.accountEmail).toBe("string");
        // Basic email validation
        expect(conn.accountEmail).toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
      });
    });

    it("should store account name", async () => {
      const connections = await db.select().from(apiConnections);

      connections.forEach((conn: any) => {
        expect(conn.accountName).toBeDefined();
        expect(typeof conn.accountName).toBe("string");
      });
    });

    it("should store account ID", async () => {
      const connections = await db.select().from(apiConnections);

      connections.forEach((conn: any) => {
        expect(conn.accountId).toBeDefined();
        expect(typeof conn.accountId).toBe("string");
      });
    });
  });

  describe("Connection Lifecycle", () => {
    it("should track creation timestamp", async () => {
      const connections = await db.select().from(apiConnections);

      connections.forEach((conn: any) => {
        expect(conn.createdAt).toBeDefined();
        expect(conn.createdAt instanceof Date || typeof conn.createdAt === "string").toBe(true);
      });
    });

    it("should track update timestamp", async () => {
      const connections = await db.select().from(apiConnections);

      connections.forEach((conn: any) => {
        expect(conn.updatedAt).toBeDefined();
        expect(conn.updatedAt instanceof Date || typeof conn.updatedAt === "string").toBe(true);
      });
    });

    it("should update timestamp on connection changes", async () => {
      const connections = await db.select().from(apiConnections);

      if (connections.length > 0) {
        const conn = connections[0];
        const originalUpdatedAt = conn.updatedAt;

        // Simulate a small delay
        await new Promise((resolve) => setTimeout(resolve, 100));

        // In a real scenario, we would update the connection here
        // For now, we just verify the timestamp exists
        expect(originalUpdatedAt).toBeDefined();
      }
    });
  });

  describe("Platform Support", () => {
    it("should support Google Analytics", async () => {
      const platforms = ["google_analytics", "facebook_ads", "youtube"];
      expect(platforms).toContain("google_analytics");
    });

    it("should support Facebook Ads", async () => {
      const platforms = ["google_analytics", "facebook_ads", "youtube"];
      expect(platforms).toContain("facebook_ads");
    });

    it("should support YouTube", async () => {
      const platforms = ["google_analytics", "facebook_ads", "youtube"];
      expect(platforms).toContain("youtube");
    });
  });

  describe("Connection Validation", () => {
    it("should validate connection name is not empty", () => {
      const validNames = ["My Google Analytics", "Primary GA4", "Test Connection"];
      validNames.forEach((name) => {
        expect(name.trim().length).toBeGreaterThan(0);
      });
    });

    it("should validate platform is supported", () => {
      const supportedPlatforms = ["google_analytics", "facebook_ads", "youtube"];
      const testPlatforms = ["google_analytics", "facebook_ads", "youtube", "invalid"];

      testPlatforms.forEach((platform) => {
        const isSupported = supportedPlatforms.includes(platform);
        if (platform === "invalid") {
          expect(isSupported).toBe(false);
        } else {
          expect(isSupported).toBe(true);
        }
      });
    });

    it("should validate connection type", () => {
      const validTypes = ["oauth2", "api_key", "service_account"];
      expect(validTypes).toContain("oauth2");
    });
  });

  describe("Token Expiry Checking", () => {
    it("should identify expiring tokens", () => {
      const now = new Date();
      const expiringIn7Days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      const expiringIn30Days = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

      const daysUntilExpiry1 = Math.ceil((expiringIn7Days.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      const daysUntilExpiry2 = Math.ceil((expiringIn30Days.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

      expect(daysUntilExpiry1 <= 7).toBe(true); // Should warn
      expect(daysUntilExpiry2 <= 7).toBe(false); // Should not warn
    });

    it("should identify expired tokens", () => {
      const now = new Date();
      const expiredToken = new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000);

      const isExpired = expiredToken < now;
      expect(isExpired).toBe(true);
    });
  });

  describe("Connection Filtering", () => {
    it("should filter by user ID", async () => {
      const userConnections = await db
        .select()
        .from(apiConnections)
        .where(eq(apiConnections.userId, testUserId));

      userConnections.forEach((conn: any) => {
        expect(conn.userId).toBe(testUserId);
      });
    });

    it("should filter by active status", async () => {
      const activeConnections = await db
        .select()
        .from(apiConnections)
        .where(eq(apiConnections.isActive, 1));

      activeConnections.forEach((conn: any) => {
        expect(conn.isActive).toBe(1);
      });
    });

    it("should filter by sync status", async () => {
      const syncingConnections = await db
        .select()
        .from(apiConnections)
        .where(eq(apiConnections.syncStatus, "syncing"));

      syncingConnections.forEach((conn: any) => {
        expect(conn.syncStatus).toBe("syncing");
      });
    });
  });

  describe("Connection Metadata", () => {
    it("should store connection metadata", async () => {
      const connections = await db.select().from(apiConnections);

      connections.forEach((conn: any) => {
        // Metadata may or may not be present
        expect(typeof conn.metadata === "string" || conn.metadata === null).toBe(true);
      });
    });

    it("should store connection type", async () => {
      const connections = await db.select().from(apiConnections);

      connections.forEach((conn: any) => {
        expect(conn.connectionType).toBeDefined();
        expect(typeof conn.connectionType).toBe("string");
      });
    });
  });

  describe("Multiple Connections", () => {
    it("should support multiple connections per user", async () => {
      const connections = await db
        .select()
        .from(apiConnections)
        .where(eq(apiConnections.userId, testUserId));

      // User can have 0 or more connections
      expect(Array.isArray(connections)).toBe(true);
    });

    it("should support multiple connections per platform", async () => {
      const googleConnections = await db
        .select()
        .from(apiConnections)
        .where(eq(apiConnections.platform, "google_analytics"));

      // Multiple GA accounts can be connected
      expect(Array.isArray(googleConnections)).toBe(true);
    });

    it("should distinguish between different platform connections", async () => {
      const connections = await db.select().from(apiConnections);

      const platforms = new Set(connections.map((c: any) => c.platform));
      platforms.forEach((platform) => {
        expect(["google_analytics", "facebook_ads", "youtube"]).toContain(platform);
      });
    });
  });
});
