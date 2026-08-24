import { protectedProcedure, router } from '../_core/trpc';
import { z } from 'zod';
import { getDb } from '../db';
import { activityLog } from '../../drizzle/schema';
import { eq, desc, and, gte, lte } from 'drizzle-orm';
import { TRPCError } from '@trpc/server';

export const activityLogsRouter = router({
  // Log an activity
  logActivity: protectedProcedure
    .input(z.object({
      teamId: z.number().optional(),
      action: z.string(),
      resourceType: z.string().optional(),
      resourceId: z.union([z.string(), z.number()]).optional(),
      details: z.record(z.string(), z.any()).optional(),
      changes: z.record(z.string(), z.any()).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

      const numericResourceId = input.resourceId ? (typeof input.resourceId === "string" ? parseInt(input.resourceId, 10) : input.resourceId) : undefined;

      const res = await db.insert(activityLog).values({
        teamId: input.teamId || 1,
        userId: ctx.user.id,
        action: input.action,
        resourceType: input.resourceType,
        resourceId: isNaN(numericResourceId as number) ? undefined : numericResourceId,
        details: input.details ? JSON.stringify(input.details) : undefined,
      });

      return { success: true, id: (res as any)[0]?.insertId };
    }),

  // Get activity logs with filtering
  getActivityLogs: protectedProcedure
    .input(z.object({
      limit: z.number().default(50),
      offset: z.number().default(0),
      userId: z.union([z.string(), z.number()]).optional(),
      action: z.string().optional(),
      resourceType: z.string().optional(),
      startDate: z.date().optional(),
      endDate: z.date().optional(),
    }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) return { logs: [], total: 0 };

      const conditions = [];

      if (input.userId) {
        const uid = typeof input.userId === "string" ? parseInt(input.userId, 10) : input.userId;
        if (!isNaN(uid)) conditions.push(eq(activityLog.userId, uid));
      }

      if (input.action) {
        conditions.push(eq(activityLog.action, input.action));
      }

      if (input.resourceType) {
        conditions.push(eq(activityLog.resourceType, input.resourceType));
      }

      if (input.startDate) {
        conditions.push(gte(activityLog.timestamp, input.startDate));
      }

      if (input.endDate) {
        conditions.push(lte(activityLog.timestamp, input.endDate));
      }

      const logs = await db
        .select()
        .from(activityLog)
        .where(conditions.length > 0 ? and(...conditions) : undefined)
        .orderBy(desc(activityLog.timestamp))
        .limit(input.limit)
        .offset(input.offset);

      return {
        logs: logs.map((log) => ({
          ...log,
          id: String(log.id),
          details: log.details ? (typeof log.details === "string" ? JSON.parse(log.details) : log.details) : {},
          timestamp: log.timestamp.toISOString(),
        })),
        total: logs.length,
      };
    }),

  // Get activity stats
  getActivityStats: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return { total: 0, actions: {}, resourceTypes: {}, users: {} };

    const logs = await db.select().from(activityLog).limit(500);

    const stats = {
      total: logs.length,
      actions: {} as Record<string, number>,
      resourceTypes: {} as Record<string, number>,
      users: {} as Record<string, number>,
    };

    logs.forEach((log) => {
      stats.actions[log.action] = (stats.actions[log.action] || 0) + 1;
      if (log.resourceType) {
        stats.resourceTypes[log.resourceType] = (stats.resourceTypes[log.resourceType] || 0) + 1;
      }
      if (log.userId) {
        stats.users[String(log.userId)] = (stats.users[String(log.userId)] || 0) + 1;
      }
    });

    return stats;
  }),
});
