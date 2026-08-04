import { getDb } from "../db";
import { customDashboards, dashboardSharing, userPreferences, teamMembers } from "../../drizzle/schema";
import { eq, and, or, inArray } from "drizzle-orm";

export type DashboardPermission = "owner" | "admin" | "edit" | "view" | "public";

function parseDashboard<T extends { layout: string; widgets: string }>(dashboard: T) {
  return {
    ...dashboard,
    layout: JSON.parse(dashboard.layout),
    widgets: JSON.parse(dashboard.widgets),
  };
}

export async function createCustomDashboard(
  userId: number,
  name: string,
  layout: unknown,
  widgets: unknown[],
  teamId?: number,
  description?: string
) {
  const db = await getDb();
  if (!db) throw new Error("Database connection failed");

  if (teamId) {
    const [membership] = await db.select().from(teamMembers).where(
      and(
        eq(teamMembers.teamId, teamId),
        eq(teamMembers.userId, userId),
        eq(teamMembers.status, "accepted")
      )
    ).limit(1);
    if (!membership) throw new Error("You do not have access to this team");
  }

  const [dashboard] = await db.insert(customDashboards).values({
    userId,
    teamId,
    name,
    description,
    layout: JSON.stringify(layout),
    widgets: JSON.stringify(widgets),
  }).returning();

  return parseDashboard(dashboard);
}

export async function getDashboardById(dashboardId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database connection failed");

  const [dashboard] = await db.select().from(customDashboards)
    .where(eq(customDashboards.id, dashboardId)).limit(1);
  return dashboard ? parseDashboard(dashboard) : null;
}

export async function getDashboardPermission(
  dashboardId: number,
  userId: number
): Promise<DashboardPermission | null> {
  const db = await getDb();
  if (!db) throw new Error("Database connection failed");

  const [dashboard] = await db.select().from(customDashboards)
    .where(eq(customDashboards.id, dashboardId)).limit(1);
  if (!dashboard) return null;
  if (dashboard.userId === userId) return "owner";

  const [directShare] = await db.select().from(dashboardSharing).where(
    and(
      eq(dashboardSharing.dashboardId, dashboardId),
      eq(dashboardSharing.sharedWithUserId, userId)
    )
  ).limit(1);
  if (directShare) return directShare.permission;

  const memberships = await db.select().from(teamMembers).where(
    and(eq(teamMembers.userId, userId), eq(teamMembers.status, "accepted"))
  );
  const teamIds = memberships.map((membership) => membership.teamId);
  if (teamIds.length > 0) {
    const [teamShare] = await db.select().from(dashboardSharing).where(
      and(
        eq(dashboardSharing.dashboardId, dashboardId),
        inArray(dashboardSharing.sharedWithTeamId, teamIds)
      )
    ).limit(1);
    if (teamShare) return teamShare.permission;
  }

  return dashboard.isPublic ? "public" : null;
}

export async function getUserDashboards(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database connection failed");

  const dashboards = await db.select().from(customDashboards)
    .where(eq(customDashboards.userId, userId));
  return dashboards.map(parseDashboard);
}

export async function getTeamDashboards(teamId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database connection failed");

  const dashboards = await db.select().from(customDashboards)
    .where(eq(customDashboards.teamId, teamId));
  return dashboards.map(parseDashboard);
}

export async function updateDashboard(
  dashboardId: number,
  updates: {
    name?: string;
    description?: string;
    layout?: unknown;
    widgets?: unknown[];
    isPublic?: number;
  }
) {
  const db = await getDb();
  if (!db) throw new Error("Database connection failed");

  const updateData: Record<string, unknown> = {};
  if (updates.name !== undefined) updateData.name = updates.name;
  if (updates.description !== undefined) updateData.description = updates.description;
  if (updates.layout !== undefined) updateData.layout = JSON.stringify(updates.layout);
  if (updates.widgets !== undefined) updateData.widgets = JSON.stringify(updates.widgets);
  if (updates.isPublic !== undefined) updateData.isPublic = updates.isPublic;

  if (Object.keys(updateData).length > 0) {
    await db.update(customDashboards).set(updateData)
      .where(eq(customDashboards.id, dashboardId));
  }
  return getDashboardById(dashboardId);
}

export async function deleteDashboard(dashboardId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database connection failed");

  await db.delete(dashboardSharing).where(eq(dashboardSharing.dashboardId, dashboardId));
  await db.delete(customDashboards).where(eq(customDashboards.id, dashboardId));
}

export async function shareDashboard(
  dashboardId: number,
  sharedBy: number,
  sharedWithUserId?: number,
  sharedWithTeamId?: number,
  permission: "view" | "edit" | "admin" = "view"
) {
  const db = await getDb();
  if (!db) throw new Error("Database connection failed");
  if ((!sharedWithUserId && !sharedWithTeamId) || (sharedWithUserId && sharedWithTeamId)) {
    throw new Error("Choose exactly one user or team to share with");
  }

  const [sharing] = await db.insert(dashboardSharing).values({
    dashboardId,
    sharedWithUserId,
    sharedWithTeamId,
    permission,
    sharedBy,
  }).returning();
  return sharing;
}

export async function getSharedDashboards(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database connection failed");

  const memberships = await db.select().from(teamMembers).where(
    and(eq(teamMembers.userId, userId), eq(teamMembers.status, "accepted"))
  );
  const teamIds = memberships.map((membership) => membership.teamId);

  const shareCondition = teamIds.length > 0
    ? or(
        eq(dashboardSharing.sharedWithUserId, userId),
        inArray(dashboardSharing.sharedWithTeamId, teamIds)
      )
    : eq(dashboardSharing.sharedWithUserId, userId);

  const shared = await db.select().from(dashboardSharing).where(shareCondition);
  const dashboardIds = [...new Set(shared.map((share) => share.dashboardId))];
  if (dashboardIds.length === 0) return [];

  const dashboards = await db.select().from(customDashboards)
    .where(inArray(customDashboards.id, dashboardIds));
  return dashboards.map(parseDashboard);
}

export async function incrementDashboardViews(dashboardId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database connection failed");

  const dashboard = await getDashboardById(dashboardId);
  if (!dashboard) return;

  await db.update(customDashboards).set({
    viewCount: dashboard.viewCount + 1,
    lastViewedAt: new Date(),
  }).where(eq(customDashboards.id, dashboardId));
}

export async function getUserPreferences(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database connection failed");

  const [prefs] = await db.select().from(userPreferences)
    .where(eq(userPreferences.userId, userId)).limit(1);
  if (prefs) return prefs;

  const [newPrefs] = await db.insert(userPreferences).values({ userId }).returning();
  return newPrefs;
}

export async function updateUserPreferences(userId: number, updates: unknown) {
  const db = await getDb();
  if (!db) throw new Error("Database connection failed");

  await getUserPreferences(userId);
  await db.update(userPreferences).set(updates as Record<string, unknown>)
    .where(eq(userPreferences.userId, userId));
  return db.select().from(userPreferences)
    .where(eq(userPreferences.userId, userId)).limit(1);
}
