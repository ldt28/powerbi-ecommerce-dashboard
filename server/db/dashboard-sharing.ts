import { db } from "@/server/db";
import { dashboardShares, users } from "@/drizzle/schema";
import { eq, and } from "drizzle-orm";

export async function shareDashboard(
  dashboardId: string,
  ownerId: string,
  sharedWithUserId: string,
  role: "viewer" | "editor" | "admin"
) {
  return db.insert(dashboardShares).values({
    dashboardId,
    ownerId,
    sharedWithUserId,
    role,
    sharedAt: new Date(),
  });
}

export async function getSharedDashboards(userId: string) {
  return db
    .select()
    .from(dashboardShares)
    .where(eq(dashboardShares.sharedWithUserId, userId));
}

export async function getDashboardShares(dashboardId: string) {
  return db
    .select()
    .from(dashboardShares)
    .where(eq(dashboardShares.dashboardId, dashboardId));
}

export async function updateShareRole(
  dashboardId: string,
  sharedWithUserId: string,
  role: "viewer" | "editor" | "admin"
) {
  return db
    .update(dashboardShares)
    .set({ role })
    .where(
      and(
        eq(dashboardShares.dashboardId, dashboardId),
        eq(dashboardShares.sharedWithUserId, sharedWithUserId)
      )
    );
}

export async function revokeDashboardShare(
  dashboardId: string,
  sharedWithUserId: string
) {
  return db
    .delete(dashboardShares)
    .where(
      and(
        eq(dashboardShares.dashboardId, dashboardId),
        eq(dashboardShares.sharedWithUserId, sharedWithUserId)
      )
    );
}

export async function canAccessDashboard(
  dashboardId: string,
  userId: string
): Promise<boolean> {
  const share = await db
    .select()
    .from(dashboardShares)
    .where(
      and(
        eq(dashboardShares.dashboardId, dashboardId),
        eq(dashboardShares.sharedWithUserId, userId)
      )
    )
    .limit(1);

  return share.length > 0;
}

export async function getShareRole(
  dashboardId: string,
  userId: string
): Promise<"viewer" | "editor" | "admin" | null> {
  const share = await db
    .select()
    .from(dashboardShares)
    .where(
      and(
        eq(dashboardShares.dashboardId, dashboardId),
        eq(dashboardShares.sharedWithUserId, userId)
      )
    )
    .limit(1);

  return share.length > 0 ? share[0].role : null;
}
