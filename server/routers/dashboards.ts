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
          input.description,
          input.layout || { columns: 12, rows: 12, gap: 16, padding: 16 },
          input.widgets || [],
          input.teamId
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
          throw new TRPCError({ code: "NOT_FOUND", message: "Dashboard not found" });
        }

        // Check access level
        const accessLevel = await dashboardDb.getDashboardAccessLevel(input.dashboardId, ctx.user.id);
        if (accessLevel === "none") {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "You do not have access to this dashboard",
          });
        }

        // Increment view count asynchronously
        dashboardDb.incrementDashboardViews(input.dashboardId).catch(console.error);

        return {
          ...dashboard,
          accessLevel,
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error instanceof Error ? error.message : "Failed to fetch dashboard",
        });
      }
    }),

  /**
   * Update custom dashboard
   */
  updateDashboard: protectedProcedure
    .input(
      z.object({
        dashboardId: z.number(),
        name: z.string().min(1).max(255).optional(),
        description: z.string().optional(),
        layout: z.any().optional(),
        widgets: z.array(z.any()).optional(),
        isPublic: z.boolean().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const accessLevel = await dashboardDb.getDashboardAccessLevel(input.dashboardId, ctx.user.id);
        if (accessLevel === "none") {
          throw new TRPCError({ code: "NOT_FOUND", message: "Dashboard not found" });
        }
        if (accessLevel === "view") {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "You do not have permission to edit this dashboard",
          });
        }

        const dashboard = await dashboardDb.updateCustomDashboard(input.dashboardId, ctx.user.id, {
          name: input.name,
          description: input.description,
          layout: input.layout,
          widgets: input.widgets,
          isPublic: input.isPublic,
        });
        return { success: true, dashboard };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
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
        const accessLevel = await dashboardDb.getDashboardAccessLevel(input.dashboardId, ctx.user.id);
        if (accessLevel === "none") {
          throw new TRPCError({ code: "NOT_FOUND", message: "Dashboard not found" });
        }
        if (accessLevel !== "admin") {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Only the dashboard owner or admin can delete it",
          });
        }

        await dashboardDb.deleteCustomDashboard(input.dashboardId, ctx.user.id);
        return { success: true };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
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
          input.sharedWithUserId,
          input.sharedWithTeamId,
          input.permission,
          ctx.user.id
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
        return { success: true, preferences: prefs };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error instanceof Error ? error.message : "Failed to update preferences",
        });
      }
    }),
});
