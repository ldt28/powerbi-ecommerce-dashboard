import { router, protectedProcedure } from "../_core/trpc";
import { z } from "zod";
import * as dashboardDb from "../db/dashboards";
import { TRPCError } from "@trpc/server";

export const dashboardsRouter = router({
  /**
   * Create custom dashboard
   */
  createDashboard: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1).max(255),
        description: z.string().optional(),
        layout: z.any(),
        widgets: z.array(z.any()),
        teamId: z.number().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const dashboard = await dashboardDb.createCustomDashboard(
          ctx.user.id,
          input.name,
          input.layout,
          input.widgets,
          input.teamId,
          input.description
        );
        return { success: true, dashboard };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error instanceof Error ? error.message : "Failed to create dashboard",
        });
      }
    }),

  /**
   * Get user's dashboards
   */
  getUserDashboards: protectedProcedure.query(async ({ ctx }) => {
    try {
      const dashboards = await dashboardDb.getUserDashboards(ctx.user.id);
      return dashboards;
    } catch (error) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to fetch dashboards",
      });
    }
  }),

  /**
   * Get dashboard by ID
   */
  getDashboard: protectedProcedure
    .input(z.object({ dashboardId: z.number() }))
    .query(async ({ ctx, input }) => {
      try {
        const dashboard = await dashboardDb.getDashboardById(input.dashboardId);
        if (!dashboard) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Dashboard not found",
          });
        }

        // Increment view count
        await dashboardDb.incrementDashboardViews(input.dashboardId);

        return dashboard;
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch dashboard",
        });
      }
    }),

  /**
   * Update dashboard
   */
  updateDashboard: protectedProcedure
    .input(
      z.object({
        dashboardId: z.number(),
        name: z.string().optional(),
        description: z.string().optional(),
        layout: z.any().optional(),
        widgets: z.array(z.any()).optional(),
        isPublic: z.number().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const dashboard = await dashboardDb.updateDashboard(input.dashboardId, {
          name: input.name,
          description: input.description,
          layout: input.layout,
          widgets: input.widgets,
          isPublic: input.isPublic,
        });
        return { success: true, dashboard };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error instanceof Error ? error.message : "Failed to update dashboard",
        });
      }
    }),

  /**
   * Delete dashboard
   */
  deleteDashboard: protectedProcedure
    .input(z.object({ dashboardId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      try {
        await dashboardDb.deleteDashboard(input.dashboardId);
        return { success: true };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error instanceof Error ? error.message : "Failed to delete dashboard",
        });
      }
    }),

  /**
   * Share dashboard
   */
  shareDashboard: protectedProcedure
    .input(
      z.object({
        dashboardId: z.number(),
        sharedWithUserId: z.number().optional(),
        sharedWithTeamId: z.number().optional(),
        permission: z.enum(["view", "edit", "admin"]).default("view"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const sharing = await dashboardDb.shareDashboard(
          input.dashboardId,
          ctx.user.id,
          input.sharedWithUserId,
          input.sharedWithTeamId,
          input.permission
        );
        return { success: true, sharing };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error instanceof Error ? error.message : "Failed to share dashboard",
        });
      }
    }),

  /**
   * Get shared dashboards
   */
  getSharedDashboards: protectedProcedure.query(async ({ ctx }) => {
    try {
      const dashboards = await dashboardDb.getSharedDashboards(ctx.user.id);
      return dashboards;
    } catch (error) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to fetch shared dashboards",
      });
    }
  }),

  /**
   * Get user preferences
   */
  getUserPreferences: protectedProcedure.query(async ({ ctx }) => {
    try {
      const prefs = await dashboardDb.getUserPreferences(ctx.user.id);
      return prefs;
    } catch (error) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to fetch preferences",
      });
    }
  }),

  /**
   * Update user preferences
   */
  updateUserPreferences: protectedProcedure
    .input(
      z.object({
        theme: z.enum(["light", "dark", "auto"]).optional(),
        timezone: z.string().optional(),
        language: z.string().optional(),
        dateFormat: z.string().optional(),
        currencySymbol: z.string().optional(),
        emailNotifications: z.number().optional(),
        defaultDashboardId: z.number().optional(),
        autoRefreshInterval: z.number().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const prefs = await dashboardDb.updateUserPreferences(ctx.user.id, input);
        return { success: true, preferences: prefs[0] };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error instanceof Error ? error.message : "Failed to update preferences",
        });
      }
    }),
});
