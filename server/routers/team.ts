import { z } from "zod";
import { protectedProcedure, publicProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { teams, teamMembers, teamInvitations, activityLog, sharedDashboards, dashboardAccess, customDashboards } from "../../drizzle/schema";
import { eq, and, desc } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { getDashboardAccessLevel } from "../db/dashboards";

/**
 * Team Management Router
 * Handles team creation, member management, invitations, and activity logging
 */

/**
 * Accepted team membership row for (teamId, userId), or null. Every endpoint
 * below that takes a bare teamId must check this before returning or
 * mutating anything scoped to that team --- several previously didn't, which
 * let any authenticated user read (or in one case, act on) any other team's
 * data just by guessing/incrementing the teamId.
 */
function getMembership(db: ReturnType<typeof getDb>, teamId: number, userId: number) {
  const rows = db
    .select()
    .from(teamMembers)
    .where(
      and(
        eq(teamMembers.teamId, teamId),
        eq(teamMembers.userId, userId),
        eq(teamMembers.status, "accepted")
      )
    )
    .limit(1)
    .all();

  return rows[0] || null;
}

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
      const db = getDb();

      const team = db.insert(teams).values({
        ownerId: ctx.user.id,
        name: input.name,
        description: input.description,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }).run();

      const newTeamId = Number(team.lastInsertRowid);

      // Add owner to team_members
      db.insert(teamMembers).values({
        teamId: newTeamId,
        userId: ctx.user.id,
        role: "admin",
        status: "accepted",
        acceptedAt: new Date().toISOString(),
        joinedAt: new Date().toISOString(),
      }).run();

      const createTeamActivity: any = {
        teamId: newTeamId,
        userId: ctx.user.id,
        action: "CREATE_TEAM",
        resourceType: "team",
        resourceId: newTeamId,
        details: JSON.stringify({ teamName: input.name }),
        timestamp: new Date().toISOString(),
      };
      db.insert(activityLog).values(createTeamActivity).run();

      return { id: newTeamId, name: input.name };
    }),

  /**
   * Get user's teams
   */
  getMyTeams: protectedProcedure.query(async ({ ctx }) => {
    const db = getDb();

    const userTeams = db
      .select()
      .from(teams)
      .where(eq(teams.ownerId, ctx.user.id))
      .all();

    const memberTeams = db
      .select({
        id: teams.id,
        ownerId: teams.ownerId,
        name: teams.name,
        description: teams.description,
        createdAt: teams.createdAt,
        updatedAt: teams.updatedAt,
        role: teamMembers.role,
      })
      .from(teamMembers)
      .innerJoin(teams, eq(teamMembers.teamId, teams.id))
      .where(
        and(
          eq(teamMembers.userId, ctx.user.id),
          eq(teamMembers.status, "accepted")
        )
      )
      .all();

    const ownerTeamMap = new Map(userTeams.map((t) => [t.id, { ...t, role: "owner" as const }]));
    for (const m of memberTeams) {
      if (!ownerTeamMap.has(m.id)) {
        ownerTeamMap.set(m.id, { ...m, role: (m.role || "viewer") as any });
      }
    }

    return Array.from(ownerTeamMap.values());
  }),

  /**
   * Get team details
   */
  getTeam: protectedProcedure
    .input(z.object({ teamId: z.number() }))
    .query(async ({ ctx, input }) => {
      const db = getDb();

      const team = db.select().from(teams).where(eq(teams.id, input.teamId)).all();

      if (!team.length) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Team not found" });
      }

      const membership = getMembership(db, input.teamId, ctx.user.id);
      const hasAccess = team[0].ownerId === ctx.user.id || membership !== null;

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
      const db = getDb();

      const team = db.select().from(teams).where(eq(teams.id, input.teamId)).limit(1).all();
      const isOwner = team.length > 0 && team[0].ownerId === ctx.user.id;

      if (!isOwner && !getMembership(db, input.teamId, ctx.user.id)) {
        throw new TRPCError({ code: "FORBIDDEN", message: "You are not a member of this team" });
      }

      const members = db
        .select()
        .from(teamMembers)
        .where(eq(teamMembers.teamId, input.teamId))
        .all();

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
      const db = getDb();

      const team = db.select().from(teams).where(eq(teams.id, input.teamId)).all();

      if (!team.length || team[0].ownerId !== ctx.user.id) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Only team owner can invite members" });
      }

      const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

      const invitation = db.insert(teamInvitations).values({
        teamId: input.teamId,
        email: input.email,
        role: input.role,
        token,
        invitedBy: ctx.user.id,
        expiresAt,
        invitedAt: new Date().toISOString(),
      }).run();

      const inviteActivity: any = {
        teamId: input.teamId,
        userId: ctx.user.id,
        action: "INVITE_MEMBER",
        resourceType: "team",
        resourceId: input.teamId,
        details: JSON.stringify({ email: input.email, role: input.role }),
        timestamp: new Date().toISOString(),
      };
      db.insert(activityLog).values(inviteActivity).run();

      return {
        id: Number(invitation.lastInsertRowid),
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
      const db = getDb();

      const invitation = db
        .select()
        .from(teamInvitations)
        .where(eq(teamInvitations.token, input.token))
        .all();

      if (!invitation.length) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Invitation not found" });
      }

      const inv = invitation[0];

      if (inv.status !== "pending") {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Invitation already processed" });
      }

      if (inv.expiresAt && new Date().toISOString() > inv.expiresAt) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Invitation expired" });
      }

      db.insert(teamMembers).values({
        teamId: inv.teamId,
        userId: ctx.user.id,
        role: inv.role,
        invitedBy: inv.invitedBy,
        invitedAt: inv.invitedAt,
        acceptedAt: new Date().toISOString(),
        joinedAt: new Date().toISOString(),
        status: "accepted",
      }).run();

      db
        .update(teamInvitations)
        .set({ status: "accepted", acceptedAt: new Date().toISOString() })
        .where(eq(teamInvitations.id, inv.id))
        .run();

      const acceptActivity: any = {
        teamId: inv.teamId,
        userId: ctx.user.id,
        action: "ACCEPT_INVITATION",
        resourceType: "team",
        resourceId: inv.teamId,
        timestamp: new Date().toISOString(),
      };
      db.insert(activityLog).values(acceptActivity).run();

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
      const db = getDb();

      const team = db.select().from(teams).where(eq(teams.id, input.teamId)).all();

      if (!team.length || team[0].ownerId !== ctx.user.id) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Only team owner can update roles" });
      }

      db
        .update(teamMembers)
        .set({ role: input.role })
        .where(eq(teamMembers.id, input.memberId))
        .run();

      const updateRoleActivity: any = {
        teamId: input.teamId,
        userId: ctx.user.id,
        action: "UPDATE_MEMBER_ROLE",
        resourceType: "team",
        resourceId: input.teamId,
        details: JSON.stringify({ memberId: input.memberId, newRole: input.role }),
        timestamp: new Date().toISOString(),
      };
      db.insert(activityLog).values(updateRoleActivity).run();

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
      const db = getDb();

      const team = db.select().from(teams).where(eq(teams.id, input.teamId)).all();

      if (!team.length || team[0].ownerId !== ctx.user.id) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Only team owner can remove members" });
      }

      db.delete(teamMembers).where(eq(teamMembers.id, input.memberId)).run();

      const removeActivity: any = {
        teamId: input.teamId,
        userId: ctx.user.id,
        action: "REMOVE_MEMBER",
        resourceType: "team",
        resourceId: input.teamId,
        details: JSON.stringify({ memberId: input.memberId }),
        timestamp: new Date().toISOString(),
      };
      db.insert(activityLog).values(removeActivity).run();

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
      const db = getDb();

      const team = db.select().from(teams).where(eq(teams.id, input.teamId)).limit(1).all();
      const isOwner = team.length > 0 && team[0].ownerId === ctx.user.id;

      if (!isOwner && !getMembership(db, input.teamId, ctx.user.id)) {
        throw new TRPCError({ code: "FORBIDDEN", message: "You are not a member of this team" });
      }

      const logs = db
        .select()
        .from(activityLog)
        .where(eq(activityLog.teamId, input.teamId))
        .orderBy(desc(activityLog.timestamp))
        .limit(input.limit)
        .offset(input.offset)
        .all();

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
      const db = getDb();

      const team = db.select().from(teams).where(eq(teams.id, input.teamId)).limit(1).all();
      const isOwner = team.length > 0 && team[0].ownerId === ctx.user.id;

      if (!isOwner && !getMembership(db, input.teamId, ctx.user.id)) {
        throw new TRPCError({ code: "FORBIDDEN", message: "You are not a member of this team" });
      }

      const dashboard = db.insert(sharedDashboards).values({
        teamId: input.teamId,
        name: input.name,
        description: input.description,
        createdBy: ctx.user.id,
        config: JSON.stringify(input.config),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }).run();

      const dashboardId = Number(dashboard.lastInsertRowid);

      const createDashActivity: any = {
        teamId: input.teamId,
        userId: ctx.user.id,
        action: "CREATE_DASHBOARD",
        resourceType: "dashboard",
        resourceId: dashboardId,
        details: JSON.stringify({ dashboardName: input.name }),
        timestamp: new Date().toISOString(),
      };
      db.insert(activityLog).values(createDashActivity).run();

      return { id: dashboardId, name: input.name };
    }),

  /**
   * Get shared dashboards for team
   */
  getSharedDashboards: protectedProcedure
    .input(z.object({ teamId: z.number() }))
    .query(async ({ ctx, input }) => {
      const db = getDb();

      const team = db.select().from(teams).where(eq(teams.id, input.teamId)).limit(1).all();
      const isOwner = team.length > 0 && team[0].ownerId === ctx.user.id;

      if (!isOwner && !getMembership(db, input.teamId, ctx.user.id)) {
        throw new TRPCError({ code: "FORBIDDEN", message: "You are not a member of this team" });
      }

      const dashboards = db
        .select()
        .from(sharedDashboards)
        .where(eq(sharedDashboards.teamId, input.teamId))
        .all();

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
      const db = getDb();

      // Previously this had no check at all: any authenticated user could grant
      // themselves (or anyone) access to any dashboardId. Only the dashboard's
      // owner can hand out access to it.
      const accessLevel = await getDashboardAccessLevel(input.dashboardId, ctx.user.id);
      if (accessLevel !== "admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only the dashboard owner or admin can grant access to it",
        });
      }

      const accessData: any = {
        dashboardId: input.dashboardId,
        role: input.role,
        grantedBy: ctx.user.id,
        grantedAt: new Date().toISOString(),
      };
      if (input.userId) accessData.userId = input.userId;
      if (input.teamId) accessData.teamId = input.teamId;

      const access = db.insert(dashboardAccess).values(accessData).run();

      if (input.teamId) {
        const activityData: any = {
          teamId: input.teamId,
          userId: ctx.user.id,
          action: "GRANT_ACCESS",
          resourceType: "dashboard",
          resourceId: input.dashboardId,
          details: JSON.stringify({ role: input.role }),
          timestamp: new Date().toISOString(),
        };
        db.insert(activityLog).values(activityData).run();
      }

      return { id: Number(access.lastInsertRowid), success: true };
    }),

  /**
   * Get dashboard access list
   */
  getDashboardAccess: protectedProcedure
    .input(z.object({ dashboardId: z.number() }))
    .query(async ({ ctx, input }) => {
      const accessLevel = await getDashboardAccessLevel(input.dashboardId, ctx.user.id);
      if (accessLevel === "none") {
        throw new TRPCError({ code: "NOT_FOUND", message: "Dashboard not found" });
      }

      const db = getDb();

      const access = db
        .select()
        .from(dashboardAccess)
        .where(eq(dashboardAccess.dashboardId, input.dashboardId))
        .all();

      return access;
    }),
});
