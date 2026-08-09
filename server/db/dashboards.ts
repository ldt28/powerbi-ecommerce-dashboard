import { getDb } from "../db";
import { customDashboards, dashboardSharing, userPreferences, teamMembers } from "../../drizzle/schema";
import { eq, and } from "drizzle-orm";

type AccessLevel = "none" | "view" | "edit" | "owner";

const LEVEL_RANK: Record<AccessLevel, number> = { none: 0, view: 1, edit: 2, owner: 3 };

function maxLevel(a: AccessLevel, b: AccessLevel): AccessLevel {
  return LEVEL_RANK[a] >= LEVEL_RANK[b] ? a : b;
}

/**
 * Work out what a given user is allowed to do with a dashboard: own it,
 * edit/view it via team membership, edit/view it via an explicit share, or
 * nothing at all. Every dashboard read/write in this router must call this
 * first — getDashboardById alone does not check who's asking.
 */
export async function getDashboardAccessLevel(
  dashboardId: number,
  userId: number
): Promise<AccessLevel> {
  const db = await getDb();
  if (!db) throw new Error("Database connection failed");

  const rows = await db
    .select()
    .from(customDashboards)
    .where(eq(customDashboards.id, dashboardId))
    .limit(1);

  const dashboard = rows[0];
  if (!dashboard) return "none";

  if (dashboard.userId === userId) return "owner";

  let level: AccessLevel = dashboard.isPublic === 1 ? "view" : "none";

  if (dashboard.teamId) {
    const membership = await db
      .select()
      .from(teamMembers)
      .where(
        and(
          eq(teamMembers.teamId, dashboard.teamId),
          eq(teamMembers.userId, userId),
          eq(teamMembers.status, "accepted")
        )
      )
      .limit(1);

    if (membership.length) {
      level = maxLevel(level, membership[0].role === "viewer" ? "view" : "edit");
    }
  }

  const shares = await db
    .select()
    .from(dashboardSharing)
    .where(eq(dashboardSharing.dashboardId, dashboardId));

  if (shares.length) {
    const teamShares = shares.filter((s) => s.sharedWithTeamId);
    let userTeamIds: number[] = [];

    if (teamShares.length) {
      const memberships = await db
        .select()
        .from(teamMembers)
        .where(and(eq(teamMembers.userId, userId), eq(teamMembers.status, "accepted")));
      userTeamIds = memberships.map((m) => m.teamId);
    }

    for (const share of shares) {
      const appliesToUser =
        share.sharedWithUserId === userId ||
        (share.sharedWithTeamId != null && userTeamIds.includes(share.sharedWithTeamId));
      if (!appliesToUser) continue;

      level = maxLevel(level, share.permission === "view" ? "view" : "edit");
    }
  }

  return level;
}

/**
 * Create a custom dashboard
 */
export async function createCustomDashboard(
  userId: number,
  name: string,
  layout: any,
  widgets: any,
  teamId?: number,
  description?: string
) {
  const db = await getDb();
  if (!db) throw new Error("Database connection failed");

  const [dashboard] = await db
    .insert(customDashboards)
    .values({
      userId,
      teamId,
      name,
      description,
      layout: JSON.stringify(layout),
      widgets: JSON.stringify(widgets),
    })
    .returning();

  return {
    ...dashboard,
    layout: JSON.parse(dashboard.layout),
    widgets: JSON.parse(dashboard.widgets),
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
 * Get user's dashboards
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
 * Get team dashboards
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
 * Update dashboard
 */
export async function updateDashboard(
  dashboardId: number,
  updates: {
    name?: string;
    description?: string;
    layout?: any;
    widgets?: any;
    isPublic?: number;
  }
) {
  const db = await getDb();
  if (!db) throw new Error("Database connection failed");

  const updateData: any = {};
  if (updates.name) updateData.name = updates.name;
  if (updates.description) updateData.description = updates.description;
  if (updates.layout) updateData.layout = JSON.stringify(updates.layout);
  if (updates.widgets) updateData.widgets = JSON.stringify(updates.widgets);
  if (updates.isPublic !== undefined) updateData.isPublic = updates.isPublic;

  await db
    .update(customDashboards)
    .set(updateData)
    .where(eq(customDashboards.id, dashboardId));

  return getDashboardById(dashboardId);
}

/**
 * Delete dashboard
 */
export async function deleteDashboard(dashboardId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database connection failed");

  // Delete sharing records
  await db
    .delete(dashboardSharing)
    .where(eq(dashboardSharing.dashboardId, dashboardId));

  // Delete dashboard
  await db
    .delete(customDashboards)
    .where(eq(customDashboards.id, dashboardId));
}

/**
 * Share dashboard with user or team
 */
export async function shareDashboard(
  dashboardId: number,
  sharedBy: number,
  sharedWithUserId?: number,
  sharedWithTeamId?: number,
  permission: "view" | "edit" | "admin" = "view"
) {
  const db = await getDb();
  if (!db) throw new Error("Database connection failed");

  const [sharing] = await db
    .insert(dashboardSharing)
    .values({
      dashboardId,
      sharedWithUserId,
      sharedWithTeamId,
      permission,
      sharedBy,
    })
    .returning();

  return sharing;
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

  const dashboards = await db
    .select()
    .from(customDashboards)
    .where((d) => {
      const conditions: any[] = [];
      dashboardIds.forEach((id) => {
        conditions.push(eq(d.id, id));
      });
      return conditions.length > 0 ? conditions[0] : undefined;
    });

  return dashboards.map((d) => ({
    ...d,
    layout: JSON.parse(d.layout),
    widgets: JSON.parse(d.widgets),
  }));
}

/**
 * Update view count
 */
export async function incrementDashboardViews(dashboardId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database connection failed");

  await db
    .update(customDashboards)
    .set({
      viewCount: (d) => d.viewCount + 1,
      lastViewedAt: new Date(),
    })
    .where(eq(customDashboards.id, dashboardId));
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
    // Create default preferences
    const [newPrefs] = await db
      .insert(userPreferences)
      .values({ userId })
      .returning();
    return newPrefs;
  }

  return prefs[0];
}

/**
 * Update user preferences
 */
export async function updateUserPreferences(userId: number, updates: any) {
  const db = await getDb();
  if (!db) throw new Error("Database connection failed");

  // Ensure preferences exist
  const existing = await getUserPreferences(userId);

  await db
    .update(userPreferences)
    .set(updates)
    .where(eq(userPreferences.userId, userId));

  return db
    .select()
    .from(userPreferences)
    .where(eq(userPreferences.userId, userId))
    .limit(1);
}
