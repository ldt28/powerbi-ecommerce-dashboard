import { protectedProcedure, publicProcedure, router } from '../_core/trpc';
import { z } from 'zod';
import { db } from '../db';
import { teamInvitations, users } from '../../drizzle/schema';
import { eq, and, desc } from 'drizzle-orm';
import { TRPCError } from '@trpc/server';
import { notifyOwner } from '../_core/notification';
import crypto from 'crypto';

// Email sending helper
async function sendInvitationEmail(email: string, inviteCode: string, inviterName: string, teamName: string) {
  try {
    const inviteLink = `${process.env.VITE_FRONTEND_FORGE_API_URL}/invite/${inviteCode}`;
    
    // Send via notification system
    await notifyOwner({
      title: `Team Invitation: ${inviterName} invited ${email} to ${teamName}`,
      content: `
        <h2>You've been invited to join a team!</h2>
        <p><strong>${inviterName}</strong> has invited you to join <strong>${teamName}</strong> on EcomAnalytics.</p>
        <p><a href="${inviteLink}" style="background: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; display: inline-block;">Accept Invitation</a></p>
        <p>Or copy this link: ${inviteLink}</p>
      `
    });
    return true;
  } catch (error) {
    console.error('Failed to send invitation email:', error);
    return false;
  }
}

export const teamInvitationsRouter = router({
  // Send invitation to new team member
  sendInvitation: protectedProcedure
    .input(z.object({
      email: z.string().email('Invalid email address'),
      role: z.enum(['admin', 'editor', 'viewer']),
      message: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      // Check if user is admin
      if (ctx.user.role !== 'admin') {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Only admins can invite team members',
        });
      }

      // Check if email already exists in team
      const existingUser = await db.query.users.findFirst({
        where: eq(users.email, input.email),
      });

      if (existingUser) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'User already exists in team',
        });
      }

      // Generate invitation code
      const inviteCode = crypto.randomBytes(32).toString('hex');
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

      // Create invitation
      const [invitation] = await db.insert(teamInvitations).values({
        email: input.email,
        role: input.role,
        inviteCode,
        expiresAt,
        createdBy: ctx.user.id,
        message: input.message,
      }).returning();

      // Send email
      const emailSent = await sendInvitationEmail(
        input.email,
        inviteCode,
        ctx.user.name || 'Team Admin',
        'EcomAnalytics'
      );

      return {
        success: true,
        invitation,
        emailSent,
      };
    }),

  // List pending invitations
  listInvitations: protectedProcedure
    .query(async ({ ctx }) => {
      if (ctx.user.role !== 'admin') {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Only admins can view invitations',
        });
      }

      const invitations = await db.query.teamInvitations.findMany({
        where: and(
          eq(teamInvitations.createdBy, ctx.user.id),
        ),
        orderBy: desc(teamInvitations.createdAt),
      });

      return invitations;
    }),

  // Accept invitation
  acceptInvitation: publicProcedure
    .input(z.object({
      inviteCode: z.string(),
      name: z.string().min(2),
      password: z.string().min(8),
    }))
    .mutation(async ({ input }) => {
      // Find invitation
      const invitation = await db.query.teamInvitations.findFirst({
        where: eq(teamInvitations.inviteCode, input.inviteCode),
      });

      if (!invitation) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Invitation not found or expired',
        });
      }

      // Check expiration
      if (new Date() > invitation.expiresAt) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Invitation has expired',
        });
      }

      // Create user
      const [user] = await db.insert(users).values({
        email: invitation.email,
        name: input.name,
        role: invitation.role,
        passwordHash: input.password, // In production, hash this
      }).returning();

      // Mark invitation as accepted
      await db.update(teamInvitations)
        .set({ acceptedAt: new Date(), acceptedBy: user.id })
        .where(eq(teamInvitations.id, invitation.id));

      return {
        success: true,
        user,
      };
    }),

  // Resend invitation
  resendInvitation: protectedProcedure
    .input(z.object({
      invitationId: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      if (ctx.user.role !== 'admin') {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Only admins can resend invitations',
        });
      }

      const invitation = await db.query.teamInvitations.findFirst({
        where: eq(teamInvitations.id, input.invitationId),
      });

      if (!invitation) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Invitation not found',
        });
      }

      // Send email
      const emailSent = await sendInvitationEmail(
        invitation.email,
        invitation.inviteCode,
        ctx.user.name || 'Team Admin',
        'EcomAnalytics'
      );

      return { success: true, emailSent };
    }),

  // Cancel invitation
  cancelInvitation: protectedProcedure
    .input(z.object({
      invitationId: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      if (ctx.user.role !== 'admin') {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Only admins can cancel invitations',
        });
      }

      await db.delete(teamInvitations)
        .where(eq(teamInvitations.id, input.invitationId));

      return { success: true };
    }),

  // Get invitation details
  getInvitation: publicProcedure
    .input(z.object({
      inviteCode: z.string(),
    }))
    .query(async ({ input }) => {
      const invitation = await db.query.teamInvitations.findFirst({
        where: eq(teamInvitations.inviteCode, input.inviteCode),
      });

      if (!invitation) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Invitation not found',
        });
      }

      if (new Date() > invitation.expiresAt) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Invitation has expired',
        });
      }

      return {
        email: invitation.email,
        role: invitation.role,
        expiresAt: invitation.expiresAt,
      };
    }),
});
