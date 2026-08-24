import { router, protectedProcedure } from "../_core/trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { getDb } from "../db";
import { users, dashboardSharing, customDashboards } from "../../drizzle/schema";
import { eq, and } from "drizzle-orm";
import {
  getSharedDashboards,
  getDashboardShares,
  shareDashboard,
  updateDashboardShareRole,
  revokeDashboardShare,
  getDashboardAccessLevel,
} from "../db/dashboards";

export const dashboardSharingRouter = router({
  shareDashboard: protectedProcedure
    .input(
      z.object({
        dashboardId: z.union([z.string(), z.number()]),
        sharedWithUserId: z.union([z.string(), z.number()]),
        role: z.enum(["viewer", "editor", "admin"]).default("viewer"),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
        const numericDashboardId = typeof input.dashboardId === "string" ? parseInt(input.dashboardId, 10) : input.dashboardId;

        let targetUserId: number | undefined;
        if (typeof input.sharedWithUserId === "number") {
          targetUserId = input.sharedWithUserId;
        } else if (/^\d+$/.test(input.sharedWithUserId)) {
          targetUserId = parseInt(input.sharedWithUserId, 10);
        } else {
          // Treat as email lookup
          const userRows = await db
            .select()
            .from(users)
            .where(eq(users.email, input.sharedWithUserId))
            .limit(1);
          if (userRows.length > 0) {
            targetUserId = userRows[0].id;
          }
        }

        const permission: "view" | "edit" | "admin" =
          input.role === "viewer" ? "view" : input.role === "editor" ? "edit" : "admin";

        const share = await shareDashboard(
          numericDashboardId,
          targetUserId,
          undefined,
          permission,
          ctx.user.id
        );
        return { success: true, share };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error instanceof Error ? error.message : "Failed to share dashboard",
        });
      }
    }),

  getSharedDashboards: protectedProcedure.query(async ({ ctx }) => {
    try {
      const db = await getDb();
      if (!db) return [];
      const shares = await getSharedDashboards(ctx.user.id);
      return shares.map((s: any) => ({
        id: s.id,
        dashboardId: s.dashboardId,
        dashboardName: s.name || `Dashboard #${s.dashboardId}`,
        description: s.description || "",
        role: s.permission || "viewer",
        sharedBy: `User #${s.sharedBy || s.userId}`,
        createdAt: s.createdAt,
      }));
    } catch (error) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to fetch shared dashboards",
      });
    }
  }),

  getDashboardShares: protectedProcedure
    .input(z.object({ dashboardId: z.union([z.string(), z.number()]) }))
    .query(async ({ input }) => {
      try {
        const numericDashboardId = typeof input.dashboardId === "string" ? parseInt(input.dashboardId, 10) : input.dashboardId;
        const shares = await getDashboardShares(numericDashboardId);
        return shares.map((s: any) => ({
          id: s.id,
          userId: s.sharedWithUserId ? String(s.sharedWithUserId) : String(s.id),
          email: s.userEmail || `user${s.sharedWithUserId || s.id}@example.com`,
          name: s.userName || `Team Member`,
          role: s.permission || "viewer",
          sharedAt: s.createdAt,
        }));
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch dashboard shares",
        });
      }
    }),

  updateShareRole: protectedProcedure
    .input(
      z.object({
        shareId: z.number().optional(),
        dashboardId: z.union([z.string(), z.number()]).optional(),
        sharedWithUserId: z.union([z.string(), z.number()]).optional(),
        role: z.enum(["viewer", "editor", "admin"]).optional(),
        permission: z.enum(["view", "edit", "admin"]).optional(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
        const perm = input.role || input.permission || "view";

        if (input.shareId) {
          const updated = await updateDashboardShareRole(input.shareId, perm as any);
          return { success: true, share: updated };
        }

        if (input.dashboardId && input.sharedWithUserId) {
          const numericDashboardId = typeof input.dashboardId === "string" ? parseInt(input.dashboardId, 10) : input.dashboardId;
          const numericUserId = typeof input.sharedWithUserId === "string" ? parseInt(input.sharedWithUserId, 10) : input.sharedWithUserId;
          
          if (!isNaN(numericUserId)) {
            await db
              .update(dashboardSharing)
              .set({ permission: perm as any })
              .where(
                and(
                  eq(dashboardSharing.dashboardId, numericDashboardId),
                  eq(dashboardSharing.sharedWithUserId, numericUserId)
                )
              );
          }
          return { success: true };
        }

        return { success: true };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error instanceof Error ? error.message : "Failed to update share role",
        });
      }
    }),

  revokeDashboardShare: protectedProcedure
    .input(
      z.object({
        shareId: z.number().optional(),
        dashboardId: z.union([z.string(), z.number()]),
        sharedWithUserId: z.union([z.string(), z.number()]).optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
        const numericDashboardId = typeof input.dashboardId === "string" ? parseInt(input.dashboardId, 10) : input.dashboardId;

        if (input.shareId) {
          await revokeDashboardShare(input.shareId, numericDashboardId, ctx.user.id);
          return { success: true };
        }

        if (input.sharedWithUserId) {
          const numericUserId = typeof input.sharedWithUserId === "string" ? parseInt(input.sharedWithUserId, 10) : input.sharedWithUserId;
          if (!isNaN(numericUserId)) {
            await db
              .delete(dashboardSharing)
              .where(
                and(
                  eq(dashboardSharing.dashboardId, numericDashboardId),
                  eq(dashboardSharing.sharedWithUserId, numericUserId)
                )
              );
          }
        }

        return { success: true };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error instanceof Error ? error.message : "Failed to revoke share",
        });
      }
    }),

  canAccessDashboard: protectedProcedure
    .input(z.object({ dashboardId: z.union([z.string(), z.number()]) }))
    .query(async ({ input, ctx }) => {
      try {
        const numericDashboardId = typeof input.dashboardId === "string" ? parseInt(input.dashboardId, 10) : input.dashboardId;
        const access = await getDashboardAccessLevel(numericDashboardId, ctx.user.id);
        return { hasAccess: access !== "none", accessLevel: access };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to check dashboard access",
        });
      }
    }),
});
