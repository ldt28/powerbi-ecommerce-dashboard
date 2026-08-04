import { getDb } from "../db";
import { teams, teamMembers, teamActivityLog } from "../../drizzle/schema";
import { eq, and, inArray, desc } from "drizzle-orm";

export async function createTeam(userId: number, teamName: string, description?: string) {
  const db = await getDb();
  if (!db) throw new Error("Database connection failed");

  const [team] = await db.insert(teams).values({
    name: teamName,
    description,
    ownerId: userId,
  }).returning();

  await db.insert(teamMembers).values({
    teamId: team.id,
    userId,
    role: "admin",
    status: "accepted",
    acceptedAt: new Date(),
  });

  await logTeamActivity(team.id, userId, "TEAM_CREATED", "team", team.id, { teamName });
  return team;
}

export async function getTeamById(teamId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database connection failed");

  const [team] = await db.select().from(teams).where(eq(teams.id, teamId)).limit(1);
  if (!team) return null;

  const members = await db.select().from(teamMembers).where(
    and(eq(teamMembers.teamId, teamId), eq(teamMembers.status, "accepted"))
  );

  return { ...team, memberCount: members.length };
}

export async function getUserTeams(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database connection failed");

  const memberships = await db.select().from(teamMembers).where(
    and(eq(teamMembers.userId, userId), eq(teamMembers.status, "accepted"))
  );
  const teamIds = memberships.map((membership) => membership.teamId);
  if (teamIds.length === 0) return [];

  return db.select().from(teams).where(inArray(teams.id, teamIds));
}

export async function getTeamMembership(teamId: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database connection failed");

  const [membership] = await db.select().from(teamMembers).where(
    and(
      eq(teamMembers.teamId, teamId),
      eq(teamMembers.userId, userId),
      eq(teamMembers.status, "accepted")
    )
  ).limit(1);

  return membership ?? null;
}

export async function addTeamMember(
  teamId: number,
  userId: number,
  role: "admin" | "editor" | "viewer",
  invitedBy: number
) {
  const db = await getDb();
  if (!db) throw new Error("Database connection failed");

  const [existing] = await db.select().from(teamMembers).where(
    and(eq(teamMembers.teamId, teamId), eq(teamMembers.userId, userId))
  ).limit(1);
  if (existing) throw new Error("User is already a member of this team");

  const [member] = await db.insert(teamMembers).values({
    teamId,
    userId,
    role,
    status: "accepted",
    acceptedAt: new Date(),
    invitedBy,
  }).returning();

  await logTeamActivity(teamId, invitedBy, "MEMBER_ADDED", "team_member", member.id, { userId, role });
  return member;
}

export async function updateTeamMemberRole(
  teamId: number,
  memberId: number,
  newRole: "admin" | "editor" | "viewer",
  updatedBy: number
) {
  const db = await getDb();
  if (!db) throw new Error("Database connection failed");

  const updater = await getTeamMembership(teamId, updatedBy);
  if (!updater || updater.role !== "admin") {
    throw new Error("Only admins can update member roles");
  }

  const [target] = await db.select().from(teamMembers).where(
    and(eq(teamMembers.id, memberId), eq(teamMembers.teamId, teamId))
  ).limit(1);
  if (!target) throw new Error("Team member not found");

  await db.update(teamMembers).set({ role: newRole }).where(
    and(eq(teamMembers.id, memberId), eq(teamMembers.teamId, teamId))
  );
  await logTeamActivity(teamId, updatedBy, "MEMBER_ROLE_UPDATED", "team_member", memberId, { newRole });
}

export async function removeTeamMember(teamId: number, memberId: number, removedBy: number) {
  const db = await getDb();
  if (!db) throw new Error("Database connection failed");

  const remover = await getTeamMembership(teamId, removedBy);
  if (!remover || remover.role !== "admin") {
    throw new Error("Only admins can remove members");
  }

  const [target] = await db.select().from(teamMembers).where(
    and(eq(teamMembers.id, memberId), eq(teamMembers.teamId, teamId))
  ).limit(1);
  if (!target) throw new Error("Team member not found");

  await db.update(teamMembers).set({ status: "rejected" }).where(
    and(eq(teamMembers.id, memberId), eq(teamMembers.teamId, teamId))
  );
  await logTeamActivity(teamId, removedBy, "MEMBER_REMOVED", "team_member", memberId);
}

export async function getTeamMembers(teamId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database connection failed");

  return db.select().from(teamMembers).where(
    and(eq(teamMembers.teamId, teamId), eq(teamMembers.status, "accepted"))
  );
}

export async function logTeamActivity(
  teamId: number,
  userId: number,
  action: string,
  resourceType: string,
  resourceId?: number,
  details?: unknown
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

export async function getTeamActivityLog(teamId: number, limit: number = 50) {
  const db = await getDb();
  if (!db) throw new Error("Database connection failed");

  return db.select().from(teamActivityLog)
    .where(eq(teamActivityLog.teamId, teamId))
    .orderBy(desc(teamActivityLog.createdAt))
    .limit(Math.min(Math.max(limit, 1), 100));
}
