import { router, protectedProcedure } from "../_core/trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { getDb } from "../db";
import { users, adminAuditLog } from "../../drizzle/schema";
import { eq } from "drizzle-orm";

/**
 * Admin Router
 * Owner-only procedures for managing users, subscriptions, and system health
 */

// Owner-only middleware
const ownerProcedure = protectedProcedure.use(({ ctx, next }) => {
  // Check if user is the owner
  const ownerOpenId = process.env.OWNER_OPEN_ID;
  if (ctx.user.openId !== ownerOpenId) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Only the owner can access admin features",
    });
  }
  return next({ ctx });
});

export const adminRouter = router({
  // ==================== User Management ====================

  /**
   * Get all users
   */
  getAllUsers: ownerProcedure.query(async () => {
    try {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const allUsers = await db.select().from(users);
      return allUsers;
    } catch (error) {
      console.error("Error fetching users:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to fetch users",
      });
    }
  }),

  /**
   * Suspend a user
   */
  suspendUser: ownerProcedure
    .input(
      z.object({
        userId: z.number(),
        reason: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        
        // Update user status
        await db
          .update(users)
          .set({
            isSuspended: 1,
            suspendedAt: new Date(),
            suspendedReason: input.reason || "Suspended by admin",
          })
          .where(eq(users.id, input.userId));

        // Log the action
        await db.insert(adminAuditLog).values({
          adminId: ctx.user.id,
          action: "SUSPEND_USER",
          targetUserId: input.userId,
          details: JSON.stringify({ reason: input.reason }),
          timestamp: new Date(),
        });

        return { success: true, message: "User suspended successfully" };
      } catch (error) {
        console.error("Error suspending user:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to suspend user",
        });
      }
    }),

  /**
   * Unsuspend a user
   */
  unsuspendUser: ownerProcedure
    .input(z.object({ userId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      try {
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        
        // Update user status
        await db
          .update(users)
          .set({
            isSuspended: 0,
            suspendedAt: null,
            suspendedReason: null,
          })
          .where(eq(users.id, input.userId));

        // Log the action
        await db.insert(adminAuditLog).values({
          adminId: ctx.user.id,
          action: "UNSUSPEND_USER",
          targetUserId: input.userId,
          details: JSON.stringify({}),
          timestamp: new Date(),
        });

        return { success: true, message: "User unsuspended successfully" };
      } catch (error) {
        console.error("Error unsuspending user:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to unsuspend user",
        });
      }
    }),

  /**
   * Reset user password
   */
  resetUserPassword: ownerProcedure
    .input(z.object({ userId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      try {
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        
        // Generate a temporary password reset token
        const resetToken = Math.random().toString(36).substring(2, 15);
        const resetTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

        // Update user with reset token
        await db
          .update(users)
          .set({
            passwordResetToken: resetToken,
            passwordResetExpiry: resetTokenExpiry,
          })
          .where(eq(users.id, input.userId));

        // Log the action
        await db.insert(adminAuditLog).values({
          adminId: ctx.user.id,
          action: "RESET_PASSWORD",
          targetUserId: input.userId,
          details: JSON.stringify({ resetTokenExpiry }),
          timestamp: new Date(),
        });

        return {
          success: true,
          message: "Password reset initiated",
          resetToken,
          expiresAt: resetTokenExpiry,
        };
      } catch (error) {
        console.error("Error resetting password:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to reset password",
        });
      }
    }),

  /**
   * Change user role
   */
  changeUserRole: ownerProcedure
    .input(
      z.object({
        userId: z.number(),
        newRole: z.enum(["user", "admin"]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        
        // Prevent changing owner's role
        const targetUser = await db
          .select()
          .from(users)
          .where(eq(users.id, input.userId))
          .limit(1);

        if (!targetUser.length) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "User not found",
          });
        }

        if (targetUser[0].openId === process.env.OWNER_OPEN_ID) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Cannot change owner's role",
          });
        }

        // Update user role
        await db
          .update(users)
          .set({ role: input.newRole })
          .where(eq(users.id, input.userId));

        // Log the action
        await db.insert(adminAuditLog).values({
          adminId: ctx.user.id,
          action: "CHANGE_ROLE",
          targetUserId: input.userId,
          details: JSON.stringify({ newRole: input.newRole }),
          timestamp: new Date(),
        });

        return { success: true, message: `User role changed to ${input.newRole}` };
      } catch (error) {
        console.error("Error changing user role:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to change user role",
        });
      }
    }),

  /**
   * Delete a user
   */
  deleteUser: ownerProcedure
    .input(
      z.object({
        userId: z.number(),
        reason: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        
        // Prevent deleting owner
        const targetUser = await db
          .select()
          .from(users)
          .where(eq(users.id, input.userId))
          .limit(1);

        if (!targetUser.length) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "User not found",
          });
        }

        if (targetUser[0].openId === process.env.OWNER_OPEN_ID) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Cannot delete the owner account",
          });
        }

        // Delete user
        await db.delete(users).where(eq(users.id, input.userId));

        // Log the action
        await db.insert(adminAuditLog).values({
          adminId: ctx.user.id,
          action: "DELETE_USER",
          targetUserId: input.userId,
          details: JSON.stringify({ reason: input.reason }),
          timestamp: new Date(),
        });

        return { success: true, message: "User deleted successfully" };
      } catch (error) {
        console.error("Error deleting user:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to delete user",
        });
      }
    }),

  // ==================== Audit Log ====================

  /**
   * Get admin audit logs
   */
  getAuditLogs: ownerProcedure
    .input(
      z.object({
        limit: z.number().default(50),
        offset: z.number().default(0),
        action: z.string().optional(),
      })
    )
    .query(async ({ input }) => {
      try {
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        
        const logs = await db
          .select()
          .from(adminAuditLog)
          .where(input.action ? eq(adminAuditLog.action, input.action) : undefined)
          .orderBy(adminAuditLog.timestamp)
          .limit(input.limit)
          .offset(input.offset);

        return logs;
      } catch (error) {
        console.error("Error fetching audit logs:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch audit logs",
        });
      }
    }),

  /**
   * Get audit logs for a specific user
   */
  getUserAuditLogs: ownerProcedure
    .input(
      z.object({
        userId: z.number(),
        limit: z.number().default(20),
      })
    )
    .query(async ({ input }) => {
      try {
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        
        const logs = await db
          .select()
          .from(adminAuditLog)
          .where(eq(adminAuditLog.targetUserId, input.userId))
          .orderBy(adminAuditLog.timestamp)
          .limit(input.limit);

        return logs;
      } catch (error) {
        console.error("Error fetching user audit logs:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch user audit logs",
        });
      }
    }),

  // ==================== Dashboard Overview ====================

  /**
   * Get dashboard overview with key metrics
   */
  getDashboardOverview: ownerProcedure.query(async () => {
    try {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      const allUsers = await db.select().from(users);
      const adminUsers = allUsers.filter((u: any) => u.role === "admin");
      const suspendedUsers = allUsers.filter((u: any) => u.isSuspended);

      return {
        totalUsers: allUsers.length,
        adminUsers: adminUsers.length,
        suspendedUsers: suspendedUsers.length,
        activeUsers: allUsers.length - suspendedUsers.length,
      };
    } catch (error) {
      console.error("Error fetching dashboard overview:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to fetch dashboard overview",
      });
    }
  }),
});
