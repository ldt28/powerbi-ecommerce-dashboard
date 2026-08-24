import { router, protectedProcedure } from "../_core/trpc";
import { z } from "zod";
import { getDb } from "../db";
import { teamMembers, teamInvitations, activityLog, teams } from "../../drizzle/schema";
import { eq, and, desc } from "drizzle-orm";
import crypto from "crypto";

/**
 * Team Management Router
 * Handles team invitations, member management, and activity logging
 */
export const teamManagementRouter = router({
  /**
   * List invitations for current user or team
   */
  listInvitations: protectedProcedure
    .input(z.object({ teamId: z.number().optional() }).optional())
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) return [];

      try {
        const teamId = input?.teamId || 1;
        const invitations = await db
          .select()
          .from(teamInvitations)
          .where(eq(teamInvitations.teamId, teamId))
          .orderBy(desc(teamInvitations.invitedAt));

        return invitations.map((inv) => ({
          id: String(inv.id),
          email: inv.email,
          role: inv.role as "admin" | "editor" | "viewer",
          status: inv.status as "pending" | "accepted" | "expired",
          createdAt: inv.invitedAt ? inv.invitedAt.toISOString() : new Date().toISOString(),
          expiresAt: inv.expiresAt ? inv.expiresAt.toISOString() : new Date().toISOString(),
        }));
      } catch (err) {
        console.error("Error listing team invitations:", err);
        return [];
      }
    }),

  /**
   * Send team invitation
   */
  sendInvitation: protectedProcedure
    .input(
      z.object({
        email: z.string().email(),
        role: z.enum(["admin", "editor", "viewer"]),
        message: z.string().optional(),
        teamId: z.number().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database connection failed");

      // Generate invitation token
      const token = crypto.randomBytes(32).toString("hex");
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

      // Create invitation
      await db.insert(teamInvitations).values({
        teamId: input.teamId || 1, // Default to team 1
        email: input.email,
        role: input.role,
        token,
        invitedBy: ctx.user.id,
        expiresAt,
      });

      // Log activity
      await db.insert(activityLog).values({
        teamId: input.teamId || 1,
        userId: ctx.user.id,
        action: "INVITE_MEMBER",
        resourceType: "team_member",
        details: JSON.stringify({ email: input.email, role: input.role, message: input.message }),
      });

      console.log(`Invitation email sent to ${input.email} with token: ${token}`);

      return { success: true, token };
    }),

  /**
   * Resend invitation
   */
  resendInvitation: protectedProcedure
    .input(z.object({ invitationId: z.union([z.string(), z.number()]) }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database connection failed");

      const numericId = typeof input.invitationId === "string" ? parseInt(input.invitationId, 10) : input.invitationId;
      const newToken = crypto.randomBytes(32).toString("hex");
      const newExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

      await db
        .update(teamInvitations)
        .set({
          token: newToken,
          expiresAt: newExpiresAt,
          status: "pending",
        })
        .where(eq(teamInvitations.id, numericId));

      return { success: true };
    }),

  /**
   * Cancel / revoke invitation
   */
  cancelInvitation: protectedProcedure
    .input(z.object({ invitationId: z.union([z.string(), z.number()]) }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database connection failed");

      const numericId = typeof input.invitationId === "string" ? parseInt(input.invitationId, 10) : input.invitationId;

      await db
        .update(teamInvitations)
        .set({ status: "expired" })
        .where(eq(teamInvitations.id, numericId));

      return { success: true };
    }),

  /**
   * Accept team invitation
   */
  acceptInvitation: protectedProcedure
    .input(z.object({ token: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database connection failed");

      // Find invitation
      const invitation = await db
        .select()
        .from(teamInvitations)
        .where(eq(teamInvitations.token, input.token))
        .limit(1);

      if (!invitation.length || invitation[0].status !== "pending") {
        throw new Error("Invalid or expired invitation");
      }

      if (invitation[0].expiresAt && new Date() > invitation[0].expiresAt) {
        throw new Error("Invitation has expired");
      }

      // Add user to team
      await db.insert(teamMembers).values({
        teamId: invitation[0].teamId,
        userId: ctx.user.id,
        role: invitation[0].role,
        status: "accepted",
        acceptedAt: new Date(),
      });

      // Update invitation status
      await db
        .update(teamInvitations)
        .set({ status: "accepted", acceptedAt: new Date() })
        .where(eq(teamInvitations.id, invitation[0].id));

      // Log activity
      await db.insert(activityLog).values({
        teamId: invitation[0].teamId,
        userId: ctx.user.id,
        action: "ACCEPT_INVITATION",
        resourceType: "team_member",
      });

      return { success: true };
    }),

  /**
   * List team members
   */
  listTeamMembers: protectedProcedure
    .input(z.object({ teamId: z.number().optional() }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database connection failed");

      const members = await db
        .select()
        .from(teamMembers)
        .where(eq(teamMembers.teamId, input.teamId || 1));

      return members;
    }),

  /**
   * Update member role
   */
  updateMemberRole: protectedProcedure
    .input(
      z.object({
        memberId: z.number(),
        role: z.enum(["admin", "editor", "viewer"]),
        teamId: z.number().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database connection failed");

      // Check if user is admin
      const userRole = await db
        .select()
        .from(teamMembers)
        .where(
          and(
            eq(teamMembers.teamId, input.teamId || 1),
            eq(teamMembers.userId, ctx.user.id)
          )
        );

      if (ctx.user.role !== "admin" && (!userRole.length || userRole[0].role !== "admin")) {
        throw new Error("Only admins can update member roles");
      }

      // Update member role
      await db
        .update(teamMembers)
        .set({ role: input.role })
        .where(eq(teamMembers.id, input.memberId));

      // Log activity
      await db.insert(activityLog).values({
        teamId: input.teamId || 1,
        userId: ctx.user.id,
        action: "UPDATE_MEMBER_ROLE",
        resourceType: "team_member",
        resourceId: input.memberId,
        details: JSON.stringify({ newRole: input.role }),
      });

      return { success: true };
    }),

  /**
   * Remove team member
   */
  removeMember: protectedProcedure
    .input(
      z.object({
        memberId: z.number(),
        teamId: z.number().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database connection failed");

      // Check if user is admin
      const userRole = await db
        .select()
        .from(teamMembers)
        .where(
          and(
            eq(teamMembers.teamId, input.teamId || 1),
            eq(teamMembers.userId, ctx.user.id)
          )
        );

      if (ctx.user.role !== "admin" && (!userRole.length || userRole[0].role !== "admin")) {
        throw new Error("Only admins can remove members");
      }

      // Remove member by marking as rejected
      await db
        .update(teamMembers)
        .set({ status: "rejected" })
        .where(eq(teamMembers.id, input.memberId));

      // Log activity
      await db.insert(activityLog).values({
        teamId: input.teamId || 1,
        userId: ctx.user.id,
        action: "REMOVE_MEMBER",
        resourceType: "team_member",
        resourceId: input.memberId,
      });

      return { success: true };
    }),

  /**
   * Get activity logs
   */
  getActivityLogs: protectedProcedure
    .input(
      z.object({
        teamId: z.number().optional(),
        limit: z.number().default(50),
      })
    )
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) return [];

      const logs = await db
        .select()
        .from(activityLog)
        .where(eq(activityLog.teamId, input.teamId || 1))
        .orderBy(desc(activityLog.timestamp))
        .limit(input.limit);

      return logs;
    }),

  /**
   * Get pending invitations
   */
  getPendingInvitations: protectedProcedure
    .input(z.object({ teamId: z.number().optional() }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) return [];

      const invitations = await db
        .select()
        .from(teamInvitations)
        .where(
          and(
            eq(teamInvitations.teamId, input.teamId || 1),
            eq(teamInvitations.status, "pending")
          )
        );

      return invitations;
    }),

  /**
   * Get team info
   */
  getTeamInfo: protectedProcedure
    .input(z.object({ teamId: z.number().optional() }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database connection failed");

      const team = await db
        .select()
        .from(teams)
        .where(eq(teams.id, input.teamId || 1))
        .limit(1);

      if (!team.length) {
        throw new Error("Team not found");
      }

      return team[0];
    }),
});

export const teamInvitationsRouter = teamManagementRouter;
