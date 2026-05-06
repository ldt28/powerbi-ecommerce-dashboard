import { router, protectedProcedure } from "../_core/trpc";
import { z } from "zod";
import { getDb } from "../db";
import { exportSchedules } from "../../drizzle/schema";
import { eq, and } from "drizzle-orm";

/**
 * Export Scheduling Router
 * Manages recurring data export schedules
 */
export const exportSchedulingRouter = router({
  /**
   * List all export schedules for current user
   */
  listSchedules: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return [];
    const schedules = await db
      .select()
      .from(exportSchedules)
      .where(eq(exportSchedules.userId, ctx.user.id));
    return schedules;
  }),

  /**
   * Create new export schedule
   */
  createSchedule: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1),
        format: z.enum(["csv", "excel", "pdf"]),
        frequency: z.enum(["daily", "weekly", "monthly"]),
        dayOfWeek: z.number().optional(),
        dayOfMonth: z.number().optional(),
        time: z.string(),
        emailRecipients: z.array(z.string().email()),
        includeMetrics: z.array(z.string()),
        isActive: z.boolean().default(true),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) return { success: false };
      const result = await db.insert(exportSchedules).values({
        userId: ctx.user.id,
        name: input.name,
        format: input.format,
        frequency: input.frequency,
        dayOfWeek: input.dayOfWeek,
        dayOfMonth: input.dayOfMonth,
        time: input.time,
        emailRecipients: JSON.stringify(input.emailRecipients),
        includeMetrics: JSON.stringify(input.includeMetrics),
        isActive: input.isActive,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      return { success: true, id: result[0]?.insertId };
    }),

  /**
   * Update export schedule
   */
  updateSchedule: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        name: z.string().min(1),
        format: z.enum(["csv", "excel", "pdf"]),
        frequency: z.enum(["daily", "weekly", "monthly"]),
        dayOfWeek: z.number().optional(),
        dayOfMonth: z.number().optional(),
        time: z.string(),
        emailRecipients: z.array(z.string().email()),
        includeMetrics: z.array(z.string()),
        isActive: z.boolean(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) return { success: false };
      await db
        .update(exportSchedules)
        .set({
          name: input.name,
          format: input.format,
          frequency: input.frequency,
          dayOfWeek: input.dayOfWeek,
          dayOfMonth: input.dayOfMonth,
          time: input.time,
          emailRecipients: JSON.stringify(input.emailRecipients),
          includeMetrics: JSON.stringify(input.includeMetrics),
          isActive: input.isActive,
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(exportSchedules.id, input.id),
            eq(exportSchedules.userId, ctx.user.id)
          )
        );

      return { success: true };
    }),

  /**
   * Delete export schedule
   */
  deleteSchedule: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) return { success: false };
      await db
        .delete(exportSchedules)
        .where(
          and(
            eq(exportSchedules.id, input.id),
            eq(exportSchedules.userId, ctx.user.id)
          )
        );

      return { success: true };
    }),

  /**
   * Toggle schedule active status
   */
  toggleSchedule: protectedProcedure
    .input(z.object({ id: z.number(), isActive: z.boolean() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) return { success: false };
      await db
        .update(exportSchedules)
        .set({
          isActive: input.isActive,
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(exportSchedules.id, input.id),
            eq(exportSchedules.userId, ctx.user.id)
          )
        );

      return { success: true };
    }),
});
