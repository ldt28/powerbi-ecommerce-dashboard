import { router, protectedProcedure } from "../_core/trpc";
import { z } from "zod";
import * as teamDb from "../db/teams";
import { TRPCError } from "@trpc/server";

export const teamsRouter = router({
  /**
   * Create a new team
   */
  createTeam: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1).max(255),
        description: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const team = await teamDb.createTeam(ctx.user.id, input.name, input.description);
        return { success: true, team };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error instanceof Error ? error.message : "Failed to create team",
        });
      }
    }),

  /**
   * Get user's teams
   */
  getUserTeams: protectedProcedure.query(async ({ ctx }) => {
    try {
      const teams = await teamDb.getUserTeams(ctx.user.id);
      return teams;
    } catch (error) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to fetch teams",
      });
    }
  }),

  /**
   * Get team details
   */
  getTeam: protectedProcedure
    .input(z.object({ teamId: z.number() }))
    .query(async ({ ctx, input }) => {
      try {
        const team = await teamDb.getTeamById(input.teamId);
        if (!team) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Team not found",
          });
        }

        // This previously returned any team's details to any authenticated
        // user, since nothing checked the caller was actually part of it.
        if (!(await teamDb.hasTeamAccess(input.teamId, ctx.user.id))) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Team not found",
          });
        }

        return team;
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch team",
        });
      }
    }),

  /**
   * Get team members
   */
  getTeamMembers: protectedProcedure
    .input(z.object({ teamId: z.number() }))
    .query(async ({ ctx, input }) => {
      try {
        if (!(await teamDb.hasTeamAccess(input.teamId, ctx.user.id))) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "You are not a member of this team",
          });
        }

        const members = await teamDb.getTeamMembers(input.teamId);
        return members;
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch team members",
        });
      }
    }),

  /**
   * Add team member
   */
  addTeamMember: protectedProcedure
    .input(
      z.object({
        teamId: z.number(),
        userId: z.number(),
        role: z.enum(["admin", "editor", "viewer"]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        // Verify caller is team admin
        const members = await teamDb.getTeamMembers(input.teamId);
        const callerMember = members.find((m) => m.userId === ctx.user.id);

        if (!callerMember || callerMember.role !== "admin") {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Only team admins can add members",
          });
        }

        const member = await teamDb.addTeamMember(input.teamId, input.userId, input.role, ctx.user.id);
        return { success: true, member };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error instanceof Error ? error.message : "Failed to add member",
        });
      }
    }),

  /**
   * Update team member role
   */
  updateTeamMemberRole: protectedProcedure
    .input(
      z.object({
        teamId: z.number(),
        memberId: z.number(),
        role: z.enum(["admin", "editor", "viewer"]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        await teamDb.updateTeamMemberRole(input.teamId, input.memberId, input.role, ctx.user.id);
        return { success: true };
      } catch (error) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: error instanceof Error ? error.message : "Failed to update member role",
        });
      }
    }),

  /**
   * Remove team member
   */
  removeTeamMember: protectedProcedure
    .input(
      z.object({
        teamId: z.number(),
        memberId: z.number(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        await teamDb.removeTeamMember(input.teamId, input.memberId, ctx.user.id);
        return { success: true };
      } catch (error) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: error instanceof Error ? error.message : "Failed to remove member",
        });
      }
    }),

  /**
   * Get team activity log
   */
  getActivityLog: protectedProcedure
    .input(
      z.object({
        teamId: z.number(),
        limit: z.number().default(50),
      })
    )
    .query(async ({ ctx, input }) => {
      try {
        if (!(await teamDb.hasTeamAccess(input.teamId, ctx.user.id))) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "You are not a member of this team",
          });
        }

        const logs = await teamDb.getTeamActivityLog(input.teamId, input.limit);
        return logs;
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch activity log",
        });
      }
    }),
});
