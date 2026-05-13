import { router, protectedProcedure } from "@/server/_core/trpc";
import { z } from "zod";
import {
  shareDashboard,
  getSharedDashboards,
  getDashboardShares,
  updateShareRole,
  revokeDashboardShare,
  canAccessDashboard,
  getShareRole,
} from "@/server/db/dashboard-sharing";
import { TRPCError } from "@trpc/server";

export const dashboardSharingRouter = router({
  shareDashboard: protectedProcedure
    .input(
      z.object({
        dashboardId: z.string(),
        sharedWithUserId: z.string(),
        role: z.enum(["viewer", "editor", "admin"]),
      })
    )
    .mutation(async ({ input, ctx }) => {
      if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED" });

      await shareDashboard(
        input.dashboardId,
        ctx.user.id,
        input.sharedWithUserId,
        input.role
      );

      return { success: true };
    }),

  getSharedDashboards: protectedProcedure.query(async ({ ctx }) => {
    if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED" });

    return getSharedDashboards(ctx.user.id);
  }),

  getDashboardShares: protectedProcedure
    .input(z.object({ dashboardId: z.string() }))
    .query(async ({ input, ctx }) => {
      if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED" });

      return getDashboardShares(input.dashboardId);
    }),

  updateShareRole: protectedProcedure
    .input(
      z.object({
        dashboardId: z.string(),
        sharedWithUserId: z.string(),
        role: z.enum(["viewer", "editor", "admin"]),
      })
    )
    .mutation(async ({ input, ctx }) => {
      if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED" });

      await updateShareRole(input.dashboardId, input.sharedWithUserId, input.role);

      return { success: true };
    }),

  revokeDashboardShare: protectedProcedure
    .input(
      z.object({
        dashboardId: z.string(),
        sharedWithUserId: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED" });

      await revokeDashboardShare(input.dashboardId, input.sharedWithUserId);

      return { success: true };
    }),

  canAccessDashboard: protectedProcedure
    .input(z.object({ dashboardId: z.string() }))
    .query(async ({ input, ctx }) => {
      if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED" });

      return canAccessDashboard(input.dashboardId, ctx.user.id);
    }),

  getShareRole: protectedProcedure
    .input(z.object({ dashboardId: z.string() }))
    .query(async ({ input, ctx }) => {
      if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED" });

      return getShareRole(input.dashboardId, ctx.user.id);
    }),
});
