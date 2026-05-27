import { protectedProcedure, router } from '../_core/trpc';
import { z } from 'zod';
import { db } from '../db';
import { activityLogs } from '../../drizzle/schema';
import { eq, desc, and, gte, lte } from 'drizzle-orm';
import { TRPCError } from '@trpc/server';

export const activityLogsRouter = router({
  // Log an activity
  logActivity: protectedProcedure
    .input(z.object({
      action: z.string(),
      resourceType: z.string(),
      resourceId: z.string().optional(),
      details: z.record(z.any()).optional(),
      changes: z.record(z.any()).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const [log] = await db.insert(activityLogs).values({
        userId: ctx.user.id,
        action: input.action,
        resourceType: input.resourceType,
        resourceId: input.resourceId,
        details: input.details,
        changes: input.changes,
        timestamp: new Date(),
      }).returning();

      return log;
    }),

  // Get activity logs with filtering
  getActivityLogs: protectedProcedure
    .input(z.object({
      limit: z.number().default(50),
      offset: z.number().default(0),
      userId: z.string().optional(),
      action: z.string().optional(),
      resourceType: z.string().optional(),
      startDate: z.date().optional(),
      endDate: z.date().optional(),
    }))
    .query(async ({ ctx, input }) => {
      const conditions = [];

      if (input.userId) {
        conditions.push(eq(activityLogs.userId, input.userId));
      }

      if (input.action) {
        conditions.push(eq(activityLogs.action, input.action));
      }

      if (input.resourceType) {
        conditions.push(eq(activityLogs.resourceType, input.resourceType));
      }

      if (input.startDate) {
        conditions.push(gte(activityLogs.timestamp, input.startDate));
      }

      if (input.endDate) {
        conditions.push(lte(activityLogs.timestamp, input.endDate));
      }

      const logs = await db.query.activityLogs.findMany({
        where: conditions.length > 0 ? and(...conditions) : undefined,
        orderBy: desc(activityLogs.timestamp),
        limit: input.limit,
        offset: input.offset,
      });

      const total = await db.query.activityLogs.findMany({
        where: conditions.length > 0 ? and(...conditions) : undefined,
      });

      return {
        logs,
        total: total.length,
        limit: input.limit,
        offset: input.offset,
      };
    }),

  // Get user activity
  getUserActivity: protectedProcedure
    .input(z.object({
      userId: z.string(),
      limit: z.number().default(50),
      offset: z.number().default(0),
    }))
    .query(async ({ input }) => {
      const logs = await db.query.activityLogs.findMany({
        where: eq(activityLogs.userId, input.userId),
        orderBy: desc(activityLogs.timestamp),
        limit: input.limit,
        offset: input.offset,
      });

      return logs;
    }),

  // Get dashboard activity
  getDashboardActivity: protectedProcedure
    .input(z.object({
      dashboardId: z.string(),
      limit: z.number().default(50),
      offset: z.number().default(0),
    }))
    .query(async ({ input }) => {
      const logs = await db.query.activityLogs.findMany({
        where: and(
          eq(activityLogs.resourceType, 'dashboard'),
          eq(activityLogs.resourceId, input.dashboardId)
        ),
        orderBy: desc(activityLogs.timestamp),
        limit: input.limit,
        offset: input.offset,
      });

      return logs;
    }),

  // Get activity summary
  getActivitySummary: protectedProcedure
    .input(z.object({
      days: z.number().default(7),
    }))
    .query(async ({ input }) => {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - input.days);

      const logs = await db.query.activityLogs.findMany({
        where: gte(activityLogs.timestamp, startDate),
        orderBy: desc(activityLogs.timestamp),
      });

      // Group by action
      const byAction: Record<string, number> = {};
      logs.forEach(log => {
        byAction[log.action] = (byAction[log.action] || 0) + 1;
      });

      // Group by resource type
      const byResourceType: Record<string, number> = {};
      logs.forEach(log => {
        byResourceType[log.resourceType] = (byResourceType[log.resourceType] || 0) + 1;
      });

      // Group by user
      const byUser: Record<string, number> = {};
      logs.forEach(log => {
        byUser[log.userId] = (byUser[log.userId] || 0) + 1;
      });

      return {
        totalActivities: logs.length,
        byAction,
        byResourceType,
        byUser,
        logs: logs.slice(0, 20), // Last 20 activities
      };
    }),

  // Delete old activity logs (admin only)
  deleteOldLogs: protectedProcedure
    .input(z.object({
      daysOld: z.number().default(90),
    }))
    .mutation(async ({ ctx, input }) => {
      if (ctx.user.role !== 'admin') {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Only admins can delete activity logs',
        });
      }

      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - input.daysOld);

      const result = await db.delete(activityLogs)
        .where(lte(activityLogs.timestamp, cutoffDate));

      return { success: true };
    }),
});
