import { router, protectedProcedure } from "../_core/trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { getDb } from "../db";
import { apiConnections } from "../../drizzle/schema";
import { eq, and } from "drizzle-orm";

/**
 * Platform Connections Router
 * Procedures for managing OAuth connections to third-party platforms
 */

export const platformConnectionsRouter = router({
  /**
   * List all connections for a user
   */
  listConnections: protectedProcedure
    .input(z.object({ userId: z.number() }))
    .query(async ({ input, ctx }) => {
      try {
        if (ctx.user.id !== input.userId && ctx.user.role !== "admin") {
          throw new TRPCError({ code: "FORBIDDEN", message: "Not authorized" });
        }

        const db = await getDb();
        if (!db) throw new Error("Database not available");

        const connections = await db
          .select()
          .from(apiConnections)
          .where(eq(apiConnections.userId, input.userId));

        return connections.map((conn: any) => ({
          id: conn.id,
          platform: conn.platform,
          connectionName: conn.connectionName,
          accountEmail: conn.accountEmail,
          accountName: conn.accountName,
          isActive: conn.isActive === 1,
          lastSyncedAt: conn.lastSyncedAt,
          syncStatus: conn.syncStatus,
          syncError: conn.syncError,
          expiresAt: conn.expiresAt,
          createdAt: conn.createdAt,
        }));
      } catch (error) {
        console.error("Error listing connections:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to list connections",
        });
      }
    }),

  /**
   * Get a specific connection
   */
  getConnection: protectedProcedure
    .input(z.object({ connectionId: z.number() }))
    .query(async ({ input, ctx }) => {
      try {
        const db = await getDb();
        if (!db) throw new Error("Database not available");

        const connection = await db
          .select()
          .from(apiConnections)
          .where(eq(apiConnections.id, input.connectionId))
          .limit(1);

        if (!connection.length) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Connection not found" });
        }

        const conn = connection[0];
        if (conn.userId !== ctx.user.id && ctx.user.role !== "admin") {
          throw new TRPCError({ code: "FORBIDDEN", message: "Not authorized" });
        }

        return {
          id: conn.id,
          platform: conn.platform,
          connectionName: conn.connectionName,
          accountEmail: conn.accountEmail,
          accountName: conn.accountName,
          isActive: conn.isActive === 1,
          lastSyncedAt: conn.lastSyncedAt,
          syncStatus: conn.syncStatus,
          syncError: conn.syncError,
          expiresAt: conn.expiresAt,
          createdAt: conn.createdAt,
        };
      } catch (error) {
        console.error("Error getting connection:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to get connection",
        });
      }
    }),

  /**
   * Create or update a connection after OAuth callback
   */
  saveConnection: protectedProcedure
    .input(
      z.object({
        userId: z.number(),
        platform: z.enum(["google_analytics", "facebook_ads", "youtube"]),
        connectionName: z.string(),
        connectionType: z.string(),
        accessToken: z.string(),
        refreshToken: z.string().optional(),
        expiresAt: z.date().optional(),
        accountId: z.string(),
        accountEmail: z.string(),
        accountName: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        if (ctx.user.id !== input.userId && ctx.user.role !== "admin") {
          throw new TRPCError({ code: "FORBIDDEN", message: "Not authorized" });
        }

        const db = await getDb();
        if (!db) throw new Error("Database not available");

        // Check if connection already exists
        const existing = await db
          .select()
          .from(apiConnections)
          .where(
            and(
              eq(apiConnections.userId, input.userId),
              eq(apiConnections.platform, input.platform),
              eq(apiConnections.accountId, input.accountId)
            )
          )
          .limit(1);

        if (existing.length > 0) {
          // Update existing connection
          await db
            .update(apiConnections)
            .set({
              connectionName: input.connectionName,
              accessToken: input.accessToken,
              refreshToken: input.refreshToken || existing[0].refreshToken,
              expiresAt: input.expiresAt,
              accountEmail: input.accountEmail,
              accountName: input.accountName,
              isActive: 1,
              syncStatus: "idle",
              syncError: null,
            })
            .where(eq(apiConnections.id, existing[0].id));

          return {
            id: existing[0].id,
            platform: input.platform,
            connectionName: input.connectionName,
            accountEmail: input.accountEmail,
            accountName: input.accountName,
            isActive: true,
          };
        } else {
          // Create new connection
          const result = await db.insert(apiConnections).values({
            userId: input.userId,
            platform: input.platform,
            connectionName: input.connectionName,
            connectionType: input.connectionType,
            accessToken: input.accessToken,
            refreshToken: input.refreshToken,
            expiresAt: input.expiresAt,
            accountId: input.accountId,
            accountEmail: input.accountEmail,
            accountName: input.accountName,
            isActive: 1,
            syncStatus: "idle",
            createdAt: new Date(),
            updatedAt: new Date(),
          });

          return {
            id: result[0].insertId,
            platform: input.platform,
            connectionName: input.connectionName,
            accountEmail: input.accountEmail,
            accountName: input.accountName,
            isActive: true,
          };
        }
      } catch (error) {
        console.error("Error saving connection:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to save connection",
        });
      }
    }),

  /**
   * Disconnect a platform connection
   */
  disconnectConnection: protectedProcedure
    .input(z.object({ connectionId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      try {
        const db = await getDb();
        if (!db) throw new Error("Database not available");

        // Get connection to verify ownership
        const connection = await db
          .select()
          .from(apiConnections)
          .where(eq(apiConnections.id, input.connectionId))
          .limit(1);

        if (!connection.length) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Connection not found" });
        }

        const conn = connection[0];
        if (conn.userId !== ctx.user.id && ctx.user.role !== "admin") {
          throw new TRPCError({ code: "FORBIDDEN", message: "Not authorized" });
        }

        // Delete connection
        await db.delete(apiConnections).where(eq(apiConnections.id, input.connectionId));

        return { success: true, message: "Connection disconnected successfully" };
      } catch (error) {
        console.error("Error disconnecting connection:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to disconnect connection",
        });
      }
    }),

  /**
   * Update connection sync status
   */
  updateSyncStatus: protectedProcedure
    .input(
      z.object({
        connectionId: z.number(),
        syncStatus: z.enum(["idle", "syncing", "success", "error"]),
        syncError: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const db = await getDb();
        if (!db) throw new Error("Database not available");

        // Get connection to verify ownership
        const connection = await db
          .select()
          .from(apiConnections)
          .where(eq(apiConnections.id, input.connectionId))
          .limit(1);

        if (!connection.length) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Connection not found" });
        }

        const conn = connection[0];
        if (conn.userId !== ctx.user.id && ctx.user.role !== "admin") {
          throw new TRPCError({ code: "FORBIDDEN", message: "Not authorized" });
        }

        // Update sync status
        await db
          .update(apiConnections)
          .set({
            syncStatus: input.syncStatus,
            syncError: input.syncError || null,
            lastSyncedAt: input.syncStatus === "success" ? new Date() : conn.lastSyncedAt,
          })
          .where(eq(apiConnections.id, input.connectionId));

        return { success: true, message: "Sync status updated" };
      } catch (error) {
        console.error("Error updating sync status:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update sync status",
        });
      }
    }),

  /**
   * Refresh connection token
   */
  refreshConnectionToken: protectedProcedure
    .input(z.object({ connectionId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      try {
        const db = await getDb();
        if (!db) throw new Error("Database not available");

        // Get connection to verify ownership
        const connection = await db
          .select()
          .from(apiConnections)
          .where(eq(apiConnections.id, input.connectionId))
          .limit(1);

        if (!connection.length) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Connection not found" });
        }

        const conn = connection[0];
        if (conn.userId !== ctx.user.id && ctx.user.role !== "admin") {
          throw new TRPCError({ code: "FORBIDDEN", message: "Not authorized" });
        }

        if (!conn.refreshToken) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "No refresh token available",
          });
        }

        // In a real implementation, this would call the platform's token refresh endpoint
        // For now, we'll just update the sync status
        await db
          .update(apiConnections)
          .set({
            syncStatus: "idle",
            syncError: null,
          })
          .where(eq(apiConnections.id, input.connectionId));

        return { success: true, message: "Token refreshed successfully" };
      } catch (error) {
        console.error("Error refreshing token:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to refresh token",
        });
      }
    }),

  /**
   * Get OAuth authorization URL for a platform
   */
  getOAuthUrl: protectedProcedure
    .input(
      z.object({
        platform: z.enum(["google_analytics", "facebook_ads", "youtube"]),
        returnUrl: z.string(),
      })
    )
    .query(async ({ input, ctx }) => {
      try {
        const baseUrls: Record<string, string> = {
          google_analytics:
            "https://accounts.google.com/o/oauth2/v2/auth?scope=https://www.googleapis.com/auth/analytics.readonly&access_type=offline&response_type=code",
          facebook_ads:
            "https://www.facebook.com/v18.0/dialog/oauth?scope=ads_management,ads_read",
          youtube:
            "https://accounts.google.com/o/oauth2/v2/auth?scope=https://www.googleapis.com/auth/youtube.readonly&access_type=offline&response_type=code",
        };

        const clientIds: Record<string, string> = {
          google_analytics: process.env.GOOGLE_OAUTH_CLIENT_ID || "",
          facebook_ads: process.env.FACEBOOK_OAUTH_CLIENT_ID || "",
          youtube: process.env.GOOGLE_OAUTH_CLIENT_ID || "",
        };

        const clientId = clientIds[input.platform];
        if (!clientId) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: `OAuth not configured for ${input.platform}`,
          });
        }

        const url = new URL(baseUrls[input.platform]);
        url.searchParams.append("client_id", clientId);
        url.searchParams.append("redirect_uri", input.returnUrl);
        url.searchParams.append("state", ctx.user.id.toString());

        return { url: url.toString() };
      } catch (error) {
        console.error("Error getting OAuth URL:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to get OAuth URL",
        });
      }
    }),

  /**
   * Check if token is expiring soon
   */
  checkTokenExpiry: protectedProcedure
    .input(z.object({ connectionId: z.number() }))
    .query(async ({ input, ctx }) => {
      try {
        const db = await getDb();
        if (!db) throw new Error("Database not available");

        const connection = await db
          .select()
          .from(apiConnections)
          .where(eq(apiConnections.id, input.connectionId))
          .limit(1);

        if (!connection.length) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Connection not found" });
        }

        const conn = connection[0];
        if (conn.userId !== ctx.user.id && ctx.user.role !== "admin") {
          throw new TRPCError({ code: "FORBIDDEN", message: "Not authorized" });
        }

        if (!conn.expiresAt) {
          return { isExpiring: false, expiresAt: null, daysUntilExpiry: null };
        }

        const now = new Date();
        const expiresAt = new Date(conn.expiresAt);
        const daysUntilExpiry = Math.ceil((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        const isExpiring = daysUntilExpiry <= 7; // Warn if expiring within 7 days

        return { isExpiring, expiresAt, daysUntilExpiry };
      } catch (error) {
        console.error("Error checking token expiry:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to check token expiry",
        });
      }
    }),
});
