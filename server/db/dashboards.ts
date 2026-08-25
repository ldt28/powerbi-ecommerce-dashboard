import { getDb } from "../db";
import { customDashboards, dashboardSharing, userPreferences } from "../../drizzle/schema";
import { eq, and, sql } from "drizzle-orm";

export interface DashboardLayout {
  columns: number;
  rows: number;
  gap: number;
  padding: number;
}

export interface DashboardWidget {
  id: string;
  type: string;
  title: string;
  x: number;
  y: number;
  w: number;
  h: number;
  config: Record<string, any>;
}

/**
 * Get all custom dashboards for a user
 */
export async function getUserDashboards(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database connection failed");

  const dashboards = await db
    .select()
    .from(customDashboards)
    .where(eq(customDashboards.userId, userId));

  return dashboards.map((d) => ({
    ...d,
    layout: JSON.parse(d.layout),
    widgets: JSON.parse(d.widgets),
  }));
}

/**
 * Get all dashboards for a team
 */
export async function getTeamDashboards(teamId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database connection failed");

  const dashboards = await db
    .select()
    .from(customDashboards)
    .where(eq(customDashboards.teamId, teamId));

  return dashboards.map((d) => ({
    ...d,
    layout: JSON.parse(d.layout),
    widgets: JSON.parse(d.widgets),
  }));
}

/**
 * Create a custom dashboard
 */
export async function createCustomDashboard(
  userId: number,
  name: string,
  description: string | undefined,
  layout: DashboardLayout,
  widgets: DashboardWidget[],
  teamId?: number
) {
  const db = await getDb();
  if (!db) throw new Error("Database connection failed");

  const res = await db
    .insert(customDashboards)
    .values({
      userId,
      teamId,
      name,
      description,
      layout: JSON.stringify(layout),
      widgets: JSON.stringify(widgets),
    });

  const insertId = (res as any)[0]?.insertId || 1;

  return {
    id: insertId,
    userId,
    teamId,
    name,
    description,
    layout,
    widgets,
    isDefault: 0,
    isPublic: 0,
    viewCount: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

/**
 * Get dashboard by ID
 */
export async function getDashboardById(dashboardId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database connection failed");

  const dashboard = await db
    .select()
    .from(customDashboards)
    .where(eq(customDashboards.id, dashboardId))
    .limit(1);

  if (!dashboard.length) return null;

  return {
    ...dashboard[0],
    layout: JSON.parse(dashboard[0].layout),
    widgets: JSON.parse(dashboard[0].widgets),
  };
}

/**
 * Update a custom dashboard
 */
export async function updateCustomDashboard(
  dashboardId: number,
  userId: number,
  updates: {
    name?: string;
    description?: string;
    layout?: DashboardLayout;
    widgets?: DashboardWidget[];
    isDefault?: boolean;
    isPublic?: boolean;
  }
) {
  const db = await getDb();
  if (!db) throw new Error("Database connection failed");

  const updateData: any = {};
  if (updates.name !== undefined) updateData.name = updates.name;
  if (updates.description !== undefined) updateData.description = updates.description;
  if (updates.layout !== undefined) updateData.layout = JSON.stringify(updates.layout);
  if (updates.widgets !== undefined) updateData.widgets = JSON.stringify(updates.widgets);
  if (updates.isDefault !== undefined) updateData.isDefault = updates.isDefault ? 1 : 0;
  if (updates.isPublic !== undefined) updateData.isPublic = updates.isPublic ? 1 : 0;

  await db
    .update(customDashboards)
    .set(updateData)
    .where(
      and(
        eq(customDashboards.id, dashboardId),
        eq(customDashboards.userId, userId)
      )
    );

  return getDashboardById(dashboardId);
}

/**
 * Delete a custom dashboard
 */
export async function deleteCustomDashboard(dashboardId: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database connection failed");

  await db
    .delete(customDashboards)
    .where(
      and(
        eq(customDashboards.id, dashboardId),
        eq(customDashboards.userId, userId)
      )
    );

  return { success: true };
}

/**
 * Share a dashboard
 */
export async function shareDashboard(
  dashboardId: number,
  sharedWithUserId: number | undefined,
  sharedWithTeamId: number | undefined,
  permission: "view" | "edit" | "admin" = "view",
  sharedBy: number = 1
) {
  const db = await getDb();
  if (!db) throw new Error("Database connection failed");

  const res = await db
    .insert(dashboardSharing)
    .values({
      dashboardId,
      sharedWithUserId,
      sharedWithTeamId,
      permission,
      sharedBy,
    });

  const insertId = (res as any)[0]?.insertId || 1;

  return {
    id: insertId,
    dashboardId,
    sharedWithUserId,
    sharedWithTeamId,
    permission,
    sharedBy,
    createdAt: new Date(),
  };
}

/**
 * Get dashboards shared with user
 */
export async function getSharedDashboards(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database connection failed");

  const shared = await db
    .select()
    .from(dashboardSharing)
    .where(eq(dashboardSharing.sharedWithUserId, userId));

  const dashboardIds = shared.map((s) => s.dashboardId);
  if (dashboardIds.length === 0) return [];

  const results: any[] = [];
  for (const s of shared) {
    const d = await getDashboardById(s.dashboardId);
    if (d) {
      results.push({
        id: s.id,
        dashboardId: s.dashboardId,
        name: d.name,
        description: d.description,
        permission: s.permission,
        sharedBy: s.sharedBy,
        createdAt: s.createdAt,
      });
    }
  }

  return results;
}

/**
 * Get all shares for a dashboard
 */
export async function getDashboardShares(dashboardId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database connection failed");

  const shares = await db
    .select()
    .from(dashboardSharing)
    .where(eq(dashboardSharing.dashboardId, dashboardId));

  return shares;
}

/**
 * Update dashboard share role
 */
export async function updateDashboardShareRole(
  shareId: number,
  permission: "view" | "edit" | "admin"
) {
  const db = await getDb();
  if (!db) throw new Error("Database connection failed");

  await db
    .update(dashboardSharing)
    .set({ permission })
    .where(eq(dashboardSharing.id, shareId));

  return { id: shareId, permission };
}

/**
 * Revoke dashboard share
 */
export async function revokeDashboardShare(
  shareId: number,
  dashboardId: number,
  userId: number
) {
  const db = await getDb();
  if (!db) throw new Error("Database connection failed");

  await db
    .delete(dashboardSharing)
    .where(eq(dashboardSharing.id, shareId));

  return { success: true };
}

/**
 * Get dashboard access level
 */
export async function getDashboardAccessLevel(
  dashboardId: number,
  userId: number
): Promise<"none" | "view" | "edit" | "admin"> {
  const db = await getDb();
  if (!db) return "none";

  const dashboard = await db
    .select()
    .from(customDashboards)
    .where(eq(customDashboards.id, dashboardId))
    .limit(1);

  if (!dashboard.length) return "none";
  if (dashboard[0].userId === userId) return "admin";

  const share = await db
    .select()
    .from(dashboardSharing)
    .where(
      and(
        eq(dashboardSharing.dashboardId, dashboardId),
        eq(dashboardSharing.sharedWithUserId, userId)
      )
    )
    .limit(1);

  if (!share.length) return "none";
  return share[0].permission as "view" | "edit" | "admin";
}

export async function incrementDashboardViews(dashboardId: number) {
  const db = getDb();
  db
    .update(customDashboards)
    .set({
      viewCount: sql`${customDashboards.viewCount} + 1`,
      lastViewedAt: new Date().toISOString(),
    })
    .where(eq(customDashboards.id, dashboardId))
    .run();
}

/**
 * Get user preferences
 */
export async function getUserPreferences(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database connection failed");

  const prefs = await db
    .select()
    .from(userPreferences)
    .where(eq(userPreferences.userId, userId))
    .limit(1);

  if (!prefs.length) {
    const res = await db
      .insert(userPreferences)
      .values({ userId });
    const insertId = (res as any)[0]?.insertId || 1;
    return {
      id: insertId,
      userId,
      theme: "dark" as const,
      timezone: "UTC",
      language: "en",
      dateFormat: "MM/DD/YYYY",
      currencySymbol: "$",
      emailNotifications: 1,
      slackNotifications: 0,
      slackWebhookUrl: null as string | null,
      defaultDashboardId: null as number | null,
      itemsPerPage: 20,
      autoRefreshInterval: 300,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  return prefs[0];
}

/**
 * Update user preferences
 */
export async function updateUserPreferences(userId: number, updates: any) {
  const db = await getDb();
  if (!db) throw new Error("Database connection failed");

  await db
    .update(userPreferences)
    .set(updates)
    .where(eq(userPreferences.userId, userId));

  return getUserPreferences(userId);
}
