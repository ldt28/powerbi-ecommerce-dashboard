import { router, protectedProcedure } from "../_core/trpc";
import { z } from "zod";
import { getDb } from "../db";
import { teamMembers, teamInvitations, activityLog, teams } from "../../drizzle/schema";
import { eq, and } from "drizzle-orm";
import crypto from "crypto";

/**
 * Team Management Router
 * Handles team invitations, member management, and activity logging
 */
export const teamManagementRouter = router({
  /**
   * Send team invitation
   */
  sendInvitation: protectedProcedure
    .input(
      z.object({
        email: z.string().email(),
        role: z.enum(["admin", "editor", "viewer"]),
        teamId: z.number().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();

      // Generate invitation token
      const token = crypto.randomBytes(32).toString("hex");
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

      // Create invitation
      const result = await db
        .insert(teamInvitations)
        .$returningId()
        .values({
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
        details: JSON.stringify({ email: input.email, role: input.role }),
      });

      // Mock email sending (replace with real email service)
      console.log(`Invitation email sent to ${input.email} with token: ${token}`);

      return { success: true, invitationId: result[0].id };
    }),

  /**
   * Accept team invitation
   */
  acceptInvitation: protectedProcedure
    .input(z.object({ token: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();

      // Find invitation
      const invitation = await db
        .select()
        .from(teamInvitations)
        .where(eq(teamInvitations.token, input.token))
        .limit(1);

      if (!invitation.length || invitation[0].status !== "pending") {
        throw new Error("Invalid or expired invitation");
      }

      if (new Date() > invitation[0].expiresAt) {
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

      if (!userRole.length || userRole[0].role !== "admin") {
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

      if (!userRole.length || userRole[0].role !== "admin") {
        throw new Error("Only admins can remove members");
      }

      // Remove member
      await db
        .update(teamMembers)
        .set({ status: "inactive" })
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

      const logs = await db
        .select()
        .from(activityLog)
        .where(eq(activityLog.teamId, input.teamId || 1))
        .orderBy(activityLog.timestamp)
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
   * Cancel invitation
   */
  cancelInvitation: protectedProcedure
    .input(z.object({ invitationId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();

      await db
        .update(teamInvitations)
        .set({ status: "expired" })
        .where(eq(teamInvitations.id, input.invitationId));

      return { success: true };
    }),

  /**
   * Get team info
   */
  getTeamInfo: protectedProcedure
    .input(z.object({ teamId: z.number().optional() }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();

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
