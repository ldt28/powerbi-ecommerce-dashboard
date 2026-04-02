import { z } from "zod";
import { protectedProcedure, publicProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { teams, teamMembers, teamInvitations, activityLog, sharedDashboards, dashboardAccess } from "../../drizzle/schema";
import { eq, and, desc } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

/**
 * Team Management Router
 * Handles team creation, member management, invitations, and activity logging
 */

export const teamRouter = router({
  /**
   * Create a new team
   */
  createTeam: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1).max(255),
        description: z.string().max(1000).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      const team = await db.insert(teams).values({
        ownerId: ctx.user.id,
        name: input.name,
        description: input.description,
      });

      const createTeamActivity: any = {
        teamId: team[0],
        userId: ctx.user.id,
        action: "CREATE_TEAM",
        resourceType: "team",
        resourceId: team[0],
        details: JSON.stringify({ teamName: input.name }),
      };
      await db.insert(activityLog).values(createTeamActivity);

      return { id: team[0], name: input.name };
    }),

  /**
   * Get user's teams
   */
  getMyTeams: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return [];

    const userTeams = await db
      .select()
      .from(teams)
      .where(eq(teams.ownerId, ctx.user.id));

    const memberTeams = await db
      .select({ teams: teams })
      .from(teamMembers)
      .innerJoin(teams, eq(teamMembers.teamId, teams.id))
      .where(eq(teamMembers.userId, ctx.user.id));

    return [
      ...userTeams.map((t: typeof teams.$inferSelect) => ({ ...t, role: "owner" as const })),
      ...memberTeams.map((m: any) => ({ ...m.teams, role: m.teamMembers.role })),
    ];
  }),

  /**
   * Get team details
   */
  getTeam: protectedProcedure
    .input(z.object({ teamId: z.number() }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      const team = await db.select().from(teams).where(eq(teams.id, input.teamId));

      if (!team.length) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Team not found" });
      }

      const hasAccess =
        team[0].ownerId === ctx.user.id ||
        (await db
          .select()
          .from(teamMembers)
          .where(and(eq(teamMembers.teamId, input.teamId), eq(teamMembers.userId, ctx.user.id))));

      if (!hasAccess) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Access denied" });
      }

      return team[0];
    }),

  /**
   * Get team members
   */
  getTeamMembers: protectedProcedure
    .input(z.object({ teamId: z.number() }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) return [];

      const members = await db
        .select()
        .from(teamMembers)
        .where(eq(teamMembers.teamId, input.teamId));

      return members;
    }),

  /**
   * Invite team member by email
   */
  inviteTeamMember: protectedProcedure
    .input(
      z.object({
        teamId: z.number(),
        email: z.string().email(),
        role: z.enum(["admin", "editor", "viewer"]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      const team = await db.select().from(teams).where(eq(teams.id, input.teamId));

      if (!team.length || team[0].ownerId !== ctx.user.id) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Only team owner can invite members" });
      }

      const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

      const invitation = await db.insert(teamInvitations).values({
        teamId: input.teamId,
        email: input.email,
        role: input.role,
        token,
        invitedBy: ctx.user.id,
        expiresAt,
      });

      const inviteActivity: any = {
        teamId: input.teamId,
        userId: ctx.user.id,
        action: "INVITE_MEMBER",
        resourceType: "team",
        resourceId: input.teamId,
        details: JSON.stringify({ email: input.email, role: input.role }),
      };
      await db.insert(activityLog).values(inviteActivity);

      return {
        id: invitation[0],
        email: input.email,
        role: input.role,
        token,
        expiresAt,
      };
    }),

  /**
   * Accept team invitation
   */
  acceptInvitation: protectedProcedure
    .input(z.object({ token: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      const invitation = await db
        .select()
        .from(teamInvitations)
        .where(eq(teamInvitations.token, input.token));

      if (!invitation.length) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Invitation not found" });
      }

      const inv = invitation[0];

      if (inv.status !== "pending") {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Invitation already processed" });
      }

      if (new Date() > inv.expiresAt) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Invitation expired" });
      }

      const member = await db.insert(teamMembers).values({
        teamId: inv.teamId,
        userId: ctx.user.id,
        role: inv.role,
        invitedBy: inv.invitedBy,
        invitedAt: inv.invitedAt,
        acceptedAt: new Date(),
        status: "accepted",
      });

      await db
        .update(teamInvitations)
        .set({ status: "accepted", acceptedAt: new Date() })
        .where(eq(teamInvitations.id, inv.id));

      const acceptActivity: any = {
        teamId: inv.teamId,
        userId: ctx.user.id,
        action: "ACCEPT_INVITATION",
        resourceType: "team",
        resourceId: inv.teamId,
      };
      await db.insert(activityLog).values(acceptActivity);

      return { success: true, teamId: inv.teamId };
    }),

  /**
   * Update team member role
   */
  updateMemberRole: protectedProcedure
    .input(
      z.object({
        teamId: z.number(),
        memberId: z.number(),
        role: z.enum(["admin", "editor", "viewer"]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      const team = await db.select().from(teams).where(eq(teams.id, input.teamId));

      if (!team.length || team[0].ownerId !== ctx.user.id) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Only team owner can update roles" });
      }

      await db
        .update(teamMembers)
        .set({ role: input.role })
        .where(eq(teamMembers.id, input.memberId));

      const updateRoleActivity: any = {
        teamId: input.teamId,
        userId: ctx.user.id,
        action: "UPDATE_MEMBER_ROLE",
        resourceType: "team",
        resourceId: input.teamId,
        details: JSON.stringify({ memberId: input.memberId, newRole: input.role }),
      };
      await db.insert(activityLog).values(updateRoleActivity);

      return { success: true };
    }),

  /**
   * Remove team member
   */
  removeMember: protectedProcedure
    .input(
      z.object({
        teamId: z.number(),
        memberId: z.number(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      const team = await db.select().from(teams).where(eq(teams.id, input.teamId));

      if (!team.length || team[0].ownerId !== ctx.user.id) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Only team owner can remove members" });
      }

      await db.delete(teamMembers).where(eq(teamMembers.id, input.memberId));

      const removeActivity: any = {
        teamId: input.teamId,
        userId: ctx.user.id,
        action: "REMOVE_MEMBER",
        resourceType: "team",
        resourceId: input.teamId,
        details: JSON.stringify({ memberId: input.memberId }),
      };
      await db.insert(activityLog).values(removeActivity);

      return { success: true };
    }),

  /**
   * Get activity log for team
   */
  getActivityLog: protectedProcedure
    .input(
      z.object({
        teamId: z.number(),
        limit: z.number().default(50),
        offset: z.number().default(0),
      })
    )
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) return [];

      const logs = await db
        .select()
        .from(activityLog)
        .where(eq(activityLog.teamId, input.teamId))
        .orderBy(desc(activityLog.timestamp))
        .limit(input.limit)
        .offset(input.offset) as any;

      return logs;
    }),

  /**
   * Create shared dashboard
   */
  createSharedDashboard: protectedProcedure
    .input(
      z.object({
        teamId: z.number(),
        name: z.string().min(1).max(255),
        description: z.string().max(1000).optional(),
        config: z.record(z.string(), z.any()),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      const dashboard = await db.insert(sharedDashboards).values({
        teamId: input.teamId,
        name: input.name,
        description: input.description,
        createdBy: ctx.user.id,
        config: JSON.stringify(input.config),
      });

      const createDashActivity: any = {
        teamId: input.teamId,
        userId: ctx.user.id,
        action: "CREATE_DASHBOARD",
        resourceType: "dashboard",
        resourceId: dashboard[0],
        details: JSON.stringify({ dashboardName: input.name }),
      };
      await db.insert(activityLog).values(createDashActivity);

      return { id: dashboard[0], name: input.name };
    }),

  /**
   * Get shared dashboards for team
   */
  getSharedDashboards: protectedProcedure
    .input(z.object({ teamId: z.number() }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) return [];

      const dashboards = await db
        .select()
        .from(sharedDashboards)
        .where(eq(sharedDashboards.teamId, input.teamId));

      return dashboards.map((d: typeof sharedDashboards.$inferSelect) => ({
        ...d,
        config: JSON.parse(d.config || "{}"),
      }));
    }),

  /**
   * Grant dashboard access
   */
  grantDashboardAccess: protectedProcedure
    .input(
      z.object({
        dashboardId: z.number(),
        userId: z.number().optional(),
        teamId: z.number().optional(),
        role: z.enum(["viewer", "editor", "owner"]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      const accessData: any = {
        dashboardId: input.dashboardId,
        role: input.role,
        grantedBy: ctx.user.id,
      };
      if (input.userId) accessData.userId = input.userId;
      if (input.teamId) accessData.teamId = input.teamId;

      const access = await db.insert(dashboardAccess).values(accessData);

      if (input.teamId) {
        const activityData: any = {
          teamId: input.teamId,
          userId: ctx.user.id,
          action: "GRANT_ACCESS",
          resourceType: "dashboard",
          resourceId: input.dashboardId,
          details: JSON.stringify({ role: input.role }),
        };
        await db.insert(activityLog).values(activityData);
      }

      return { id: access[0], success: true };
    }),

  /**
   * Get dashboard access list
   */
  getDashboardAccess: protectedProcedure
    .input(z.object({ dashboardId: z.number() }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) return [];

      const access = await db
        .select()
        .from(dashboardAccess)
        .where(eq(dashboardAccess.dashboardId, input.dashboardId));

      return access;
    }),
});
