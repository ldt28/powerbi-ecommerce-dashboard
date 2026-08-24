import { getDb } from "../db";
import { teams, teamMembers, teamActivityLog, customDashboards, dashboardSharing } from "../../drizzle/schema";
import { eq, and } from "drizzle-orm";

/**
 * Create a new team
 */
export async function createTeam(userId: number, teamName: string, description?: string) {
  const db = await getDb();
  if (!db) throw new Error("Database connection failed");

  const res = await db
    .insert(teams)
    .values({
      name: teamName,
      description,
      ownerId: userId,
    });

  const teamId = (res as any)[0]?.insertId || 1;

  // Add owner as admin member
  await db.insert(teamMembers).values({
    teamId,
    userId,
    role: "admin",
    status: "accepted",
    acceptedAt: new Date(),
  });

  // Log activity
  await logTeamActivity(teamId, userId, "TEAM_CREATED", "team", teamId, { teamName });

  return { id: teamId, name: teamName, description, ownerId: userId };
}

/**
 * Get team by ID with member count
 */
export async function getTeamById(teamId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database connection failed");

  const team = await db
    .select()
    .from(teams)
    .where(eq(teams.id, teamId))
    .limit(1);

  if (!team.length) return null;

  // Get member count
  const members = await db
    .select()
    .from(teamMembers)
    .where(eq(teamMembers.teamId, teamId));

  return {
    ...team[0],
    memberCount: members.length,
  };
}

/**
 * Get all teams for a user
 */
export async function getUserTeams(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database connection failed");

  const userTeams = await db
    .select()
    .from(teamMembers)
    .where(eq(teamMembers.userId, userId));

  const teamIds = userTeams.map((tm) => tm.teamId);

  if (teamIds.length === 0) return [];

  const teamList = await db
    .select()
    .from(teams)
    .where((t) => {
      const conditions: any[] = [];
      teamIds.forEach((id) => {
        conditions.push(eq(t.id, id));
      });
      return conditions.length > 0 ? conditions[0] : undefined;
    });

  return teamList;
}

/**
 * Add member to team
 */
export async function addTeamMember(
  teamId: number,
  userId: number,
  role: "admin" | "editor" | "viewer",
  invitedBy: number
) {
  const db = await getDb();
  if (!db) throw new Error("Database connection failed");

  // Check if already a member
  const existing = await db
    .select()
    .from(teamMembers)
    .where(and(eq(teamMembers.teamId, teamId), eq(teamMembers.userId, userId)))
    .limit(1);

  if (existing.length > 0) {
    throw new Error("User is already a member of this team");
  }

  const res = await db
    .insert(teamMembers)
    .values({
      teamId,
      userId,
      role,
      status: "accepted",
      acceptedAt: new Date(),
      invitedBy,
    });

  const memberId = (res as any)[0]?.insertId || 1;

  // Log activity
  await logTeamActivity(teamId, invitedBy, "MEMBER_ADDED", "team_member", memberId, { userId, role });

  return { id: memberId, teamId, userId, role, status: "accepted" };
}

/**
 * Update team member role
 */
export async function updateTeamMemberRole(
  teamId: number,
  memberId: number,
  newRole: "admin" | "editor" | "viewer",
  updatedBy: number
) {
  const db = await getDb();
  if (!db) throw new Error("Database connection failed");

  // Check if updater is admin
  const updaterRole = await db
    .select()
    .from(teamMembers)
    .where(and(eq(teamMembers.teamId, teamId), eq(teamMembers.userId, updatedBy)))
    .limit(1);

  if (!updaterRole.length || updaterRole[0].role !== "admin") {
    throw new Error("Only admins can update member roles");
  }

  await db
    .update(teamMembers)
    .set({ role: newRole })
    .where(eq(teamMembers.id, memberId));

  // Log activity
  await logTeamActivity(teamId, updatedBy, "MEMBER_ROLE_UPDATED", "team_member", memberId, { newRole });
}

/**
 * Remove team member
 */
export async function removeTeamMember(teamId: number, memberId: number, removedBy: number) {
  const db = await getDb();
  if (!db) throw new Error("Database connection failed");

  // Check if remover is admin
  const removerRole = await db
    .select()
    .from(teamMembers)
    .where(and(eq(teamMembers.teamId, teamId), eq(teamMembers.userId, removedBy)))
    .limit(1);

  if (!removerRole.length || removerRole[0].role !== "admin") {
    throw new Error("Only admins can remove members");
  }

  await db
    .update(teamMembers)
    .set({ status: "rejected" })
    .where(eq(teamMembers.id, memberId));

  // Log activity
  await logTeamActivity(teamId, removedBy, "MEMBER_REMOVED", "team_member", memberId);
}

/**
 * Get team members
 */
export async function getTeamMembers(teamId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database connection failed");

  return db
    .select()
    .from(teamMembers)
    .where(eq(teamMembers.teamId, teamId));
}

/**
 * Whether userId has access to teamId at all: owner, or an accepted member.
 * Callers that only need "can this person see the team" (as opposed to the
 * admin-only checks already enforced deeper in updateTeamMemberRole /
 * removeTeamMember) should gate on this before returning team-scoped data.
 */
export async function hasTeamAccess(teamId: number, userId: number): Promise<boolean> {
  const db = await getDb();
  if (!db) throw new Error("Database connection failed");

  const team = await db.select().from(teams).where(eq(teams.id, teamId)).limit(1);
  if (team.length && team[0].ownerId === userId) return true;

  const membership = await db
    .select()
    .from(teamMembers)
    .where(
      and(
        eq(teamMembers.teamId, teamId),
        eq(teamMembers.userId, userId),
        eq(teamMembers.status, "accepted")
      )
    )
    .limit(1);

  return membership.length > 0;
}

/**
 * Log team activity
 */
export async function logTeamActivity(
  teamId: number,
  userId: number,
  action: string,
  resourceType: string,
  resourceId?: number,
  details?: any
) {
  const db = await getDb();
  if (!db) throw new Error("Database connection failed");

  await db.insert(teamActivityLog).values({
    teamId,
    userId,
    action,
    resourceType,
    resourceId,
    details: details ? JSON.stringify(details) : undefined,
  });
}

/**
 * Get team activity log
 */
export async function getTeamActivityLog(teamId: number, limit: number = 50) {
  const db = await getDb();
  if (!db) throw new Error("Database connection failed");

  return db
    .select()
    .from(teamActivityLog)
    .where(eq(teamActivityLog.teamId, teamId))
    .orderBy((t) => t.createdAt)
    .limit(limit);
}
