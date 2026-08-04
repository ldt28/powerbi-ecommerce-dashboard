import { router, protectedProcedure } from "../_core/trpc";
import { hasDashboardAccess, type RequiredDashboardAccess } from "../_core/authorization";
import { z } from "zod";
import * as dashboardDb from "../db/dashboards";
import { TRPCError } from "@trpc/server";

async function requireDashboardAccess(
  dashboardId: number,
  userId: number,
  required: RequiredDashboardAccess
) {
  const permission = await dashboardDb.getDashboardPermission(dashboardId, userId);
  if (!hasDashboardAccess(permission, required)) {
    throw new TRPCError({ code: "FORBIDDEN", message: "You do not have access to this dashboard" });
  }
  return permission;
}

export const dashboardsRouter = router({
  createDashboard: protectedProcedure
    .input(z.object({
      name: z.string().trim().min(1).max(255),
      description: z.string().max(2000).optional(),
      layout: z.record(z.string(), z.unknown()),
      widgets: z.array(z.unknown()),
      teamId: z.number().int().positive().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const dashboard = await dashboardDb.createCustomDashboard(ctx.user.id, input.name, input.layout, input.widgets, input.teamId, input.description);
      return { success: true, dashboard };
    }),

  getUserDashboards: protectedProcedure.query(({ ctx }) => dashboardDb.getUserDashboards(ctx.user.id)),

  getDashboard: protectedProcedure
    .input(z.object({ dashboardId: z.number().int().positive() }))
    .query(async ({ ctx, input }) => {
      await requireDashboardAccess(input.dashboardId, ctx.user.id, "view");
      const dashboard = await dashboardDb.getDashboardById(input.dashboardId);
      if (!dashboard) throw new TRPCError({ code: "NOT_FOUND", message: "Dashboard not found" });
      await dashboardDb.incrementDashboardViews(input.dashboardId);
      return dashboard;
    }),

  updateDashboard: protectedProcedure
    .input(z.object({
      dashboardId: z.number().int().positive(),
      name: z.string().trim().min(1).max(255).optional(),
      description: z.string().max(2000).optional(),
      layout: z.record(z.string(), z.unknown()).optional(),
      widgets: z.array(z.unknown()).optional(),
      isPublic: z.union([z.literal(0), z.literal(1)]).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      await requireDashboardAccess(input.dashboardId, ctx.user.id, "edit");
      const dashboard = await dashboardDb.updateDashboard(input.dashboardId, {
        name: input.name, description: input.description, layout: input.layout,
        widgets: input.widgets, isPublic: input.isPublic,
      });
      return { success: true, dashboard };
    }),

  deleteDashboard: protectedProcedure
    .input(z.object({ dashboardId: z.number().int().positive() }))
    .mutation(async ({ ctx, input }) => {
      await requireDashboardAccess(input.dashboardId, ctx.user.id, "admin");
      await dashboardDb.deleteDashboard(input.dashboardId);
      return { success: true };
    }),

  shareDashboard: protectedProcedure
    .input(z.object({
      dashboardId: z.number().int().positive(),
      sharedWithUserId: z.number().int().positive().optional(),
      sharedWithTeamId: z.number().int().positive().optional(),
      permission: z.enum(["view", "edit", "admin"]).default("view"),
    }).refine(
      (value) => Boolean(value.sharedWithUserId) !== Boolean(value.sharedWithTeamId),
      { message: "Choose exactly one user or team to share with" }
    ))
    .mutation(async ({ ctx, input }) => {
      await requireDashboardAccess(input.dashboardId, ctx.user.id, "admin");
      const sharing = await dashboardDb.shareDashboard(
        input.dashboardId, ctx.user.id, input.sharedWithUserId,
        input.sharedWithTeamId, input.permission
      );
      return { success: true, sharing };
    }),

  getSharedDashboards: protectedProcedure.query(({ ctx }) => dashboardDb.getSharedDashboards(ctx.user.id)),
  getUserPreferences: protectedProcedure.query(({ ctx }) => dashboardDb.getUserPreferences(ctx.user.id)),

  updateUserPreferences: protectedProcedure
    .input(z.object({
      theme: z.enum(["light", "dark", "auto"]).optional(),
      timezone: z.string().max(64).optional(),
      language: z.string().max(10).optional(),
      dateFormat: z.string().max(20).optional(),
      currencySymbol: z.string().max(5).optional(),
      emailNotifications: z.union([z.literal(0), z.literal(1)]).optional(),
      defaultDashboardId: z.number().int().positive().optional(),
      autoRefreshInterval: z.number().int().min(0).max(86400).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      if (input.defaultDashboardId) {
        await requireDashboardAccess(input.defaultDashboardId, ctx.user.id, "view");
      }
      const preferences = await dashboardDb.updateUserPreferences(ctx.user.id, input);
      return { success: true, preferences: preferences[0] };
    }),
});
