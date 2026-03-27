import { z } from "zod";
import { protectedProcedure } from "../_core/trpc";
import {
  createApiConnection,
  getUserApiConnections,
  getApiConnectionById,
  getApiConnectionsByPlatform,
  updateApiConnection,
  deleteApiConnection,
  updateSyncStatus,
  getActiveApiConnections,
} from "../db-api-connections";
import { TRPCError } from "@trpc/server";

export const apiConnectionsRouter = {
  // Create a new API connection
  create: protectedProcedure
    .input(
      z.object({
        platform: z.enum(["google", "facebook", "amazon", "ebay", "walmart", "instagram"]),
        connectionName: z.string().min(1).max(255),
        connectionType: z.enum(["analytics", "ads", "commerce", "social"]),
        accessToken: z.string(),
        refreshToken: z.string().optional(),
        accountId: z.string().optional(),
        accountEmail: z.string().email().optional(),
        accountName: z.string().optional(),
        metadata: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const connection = await createApiConnection(ctx.user.id, {
        platform: input.platform,
        connectionName: input.connectionName,
        connectionType: input.connectionType,
        accessToken: input.accessToken,
        refreshToken: input.refreshToken,
        accountId: input.accountId,
        accountEmail: input.accountEmail,
        accountName: input.accountName,
        metadata: input.metadata,
        isActive: 1,
      });

      if (!connection) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create API connection",
        });
      }

      return connection;
    }),

  // Get all connections for current user
  list: protectedProcedure.query(async ({ ctx }) => {
    return getUserApiConnections(ctx.user.id);
  }),

  // Get connections by platform
  getByPlatform: protectedProcedure
    .input(z.object({ platform: z.string() }))
    .query(async ({ ctx, input }) => {
      return getApiConnectionsByPlatform(ctx.user.id, input.platform);
    }),

  // Get active connections only
  getActive: protectedProcedure.query(async ({ ctx }) => {
    return getActiveApiConnections(ctx.user.id);
  }),

  // Get single connection
  getById: protectedProcedure
    .input(z.object({ connectionId: z.number() }))
    .query(async ({ ctx, input }) => {
      const connection = await getApiConnectionById(input.connectionId, ctx.user.id);
      if (!connection) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Connection not found",
        });
      }
      return connection;
    }),

  // Update connection
  update: protectedProcedure
    .input(
      z.object({
        connectionId: z.number(),
        connectionName: z.string().min(1).max(255).optional(),
        accessToken: z.string().optional(),
        refreshToken: z.string().optional(),
        accountId: z.string().optional(),
        accountEmail: z.string().email().optional(),
        accountName: z.string().optional(),
        isActive: z.number().optional(),
        metadata: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { connectionId, ...updateData } = input;
      const connection = await updateApiConnection(connectionId, ctx.user.id, updateData);

      if (!connection) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Connection not found",
        });
      }

      return connection;
    }),

  // Delete connection
  delete: protectedProcedure
    .input(z.object({ connectionId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const success = await deleteApiConnection(input.connectionId, ctx.user.id);

      if (!success) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Connection not found",
        });
      }

      return { success: true };
    }),

  // Update sync status
  updateSyncStatus: protectedProcedure
    .input(
      z.object({
        connectionId: z.number(),
        status: z.enum(["idle", "syncing", "error"]),
        error: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const connection = await updateSyncStatus(
        input.connectionId,
        ctx.user.id,
        input.status,
        input.error
      );

      if (!connection) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Connection not found",
        });
      }

      return connection;
    }),

  // Test connection (verify credentials work)
  testConnection: protectedProcedure
    .input(
      z.object({
        connectionId: z.number(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const connection = await getApiConnectionById(input.connectionId, ctx.user.id);

      if (!connection) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Connection not found",
        });
      }

      try {
        // Test based on platform
        if (connection.platform === "google") {
          // Test Google API connection
          const response = await fetch("https://www.googleapis.com/oauth2/v1/tokeninfo", {
            headers: {
              Authorization: `Bearer ${connection.accessToken}`,
            },
          });

          if (!response.ok) {
            throw new Error("Invalid Google access token");
          }
        } else if (connection.platform === "facebook") {
          // Test Facebook API connection
          const response = await fetch(
            `https://graph.facebook.com/me?access_token=${connection.accessToken}`
          );

          if (!response.ok) {
            throw new Error("Invalid Facebook access token");
          }
        }

        return { success: true, message: "Connection test successful" };
      } catch (error) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `Connection test failed: ${error instanceof Error ? error.message : "Unknown error"}`,
        });
      }
    }),
};
