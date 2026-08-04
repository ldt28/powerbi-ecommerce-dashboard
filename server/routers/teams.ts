import { router, protectedProcedure } from "../_core/trpc";
import { z } from "zod";
import * as teamDb from "../db/teams";
import { TRPCError } from "@trpc/server";

async function requireMembership(teamId: number, userId: number) {
  const membership = await teamDb.getTeamMembership(teamId, userId);
  if (!membership) {
    throw new TRPCError({ code: "FORBIDDEN", message: "You do not have access to this team" });
  }
  return membership;
}

async function requireAdmin(teamId: number, userId: number) {
  const membership = await requireMembership(teamId, userId);
  if (membership.role !== "admin") {
    throw new TRPCError({ code: "FORBIDDEN", message: "Only team admins can perform this action" });
  }
  return membership;
}

export const teamsRouter = router({
  createTeam: protectedProcedure
    .input(z.object({ name: z.string().trim().min(1).max(255), description: z.string().max(2000).optional() }))
    .mutation(async ({ ctx, input }) => {
      const team = await teamDb.createTeam(ctx.user.id, input.name, input.description);
      return { success: true, team };
    }),

  getUserTeams: protectedProcedure.query(({ ctx }) => teamDb.getUserTeams(ctx.user.id)),

  getTeam: protectedProcedure
    .input(z.object({ teamId: z.number().int().positive() }))
    .query(async ({ ctx, input }) => {
      await requireMembership(input.teamId, ctx.user.id);
      const team = await teamDb.getTeamById(input.teamId);
      if (!team) throw new TRPCError({ code: "NOT_FOUND", message: "Team not found" });
      return team;
    }),

  getTeamMembers: protectedProcedure
    .input(z.object({ teamId: z.number().int().positive() }))
    .query(async ({ ctx, input }) => {
      await requireMembership(input.teamId, ctx.user.id);
      return teamDb.getTeamMembers(input.teamId);
    }),

  addTeamMember: protectedProcedure
    .input(z.object({
      teamId: z.number().int().positive(),
      userId: z.number().int().positive(),
      role: z.enum(["admin", "editor", "viewer"]),
    }))
    .mutation(async ({ ctx, input }) => {
      await requireAdmin(input.teamId, ctx.user.id);
      const member = await teamDb.addTeamMember(input.teamId, input.userId, input.role, ctx.user.id);
      return { success: true, member };
    }),

  updateTeamMemberRole: protectedProcedure
    .input(z.object({
      teamId: z.number().int().positive(),
      memberId: z.number().int().positive(),
      role: z.enum(["admin", "editor", "viewer"]),
    }))
    .mutation(async ({ ctx, input }) => {
      await requireAdmin(input.teamId, ctx.user.id);
      await teamDb.updateTeamMemberRole(input.teamId, input.memberId, input.role, ctx.user.id);
      return { success: true };
    }),

  removeTeamMember: protectedProcedure
    .input(z.object({ teamId: z.number().int().positive(), memberId: z.number().int().positive() }))
    .mutation(async ({ ctx, input }) => {
      await requireAdmin(input.teamId, ctx.user.id);
      await teamDb.removeTeamMember(input.teamId, input.memberId, ctx.user.id);
      return { success: true };
    }),

  getActivityLog: protectedProcedure
    .input(z.object({
      teamId: z.number().int().positive(),
      limit: z.number().int().min(1).max(100).default(50),
    }))
    .query(async ({ ctx, input }) => {
      await requireMembership(input.teamId, ctx.user.id);
      return teamDb.getTeamActivityLog(input.teamId, input.limit);
    }),
});
