export type DashboardPermission = "owner" | "admin" | "edit" | "view" | "public";
export type RequiredDashboardAccess = "view" | "edit" | "admin";
export type TeamRole = "admin" | "editor" | "viewer";

const permissionRank: Record<DashboardPermission | RequiredDashboardAccess, number> = {
  public: 0,
  view: 1,
  edit: 2,
  admin: 3,
  owner: 4,
};

export function hasDashboardAccess(
  permission: DashboardPermission | null,
  required: RequiredDashboardAccess
) {
  return permission !== null && permissionRank[permission] >= permissionRank[required];
}

export function isAcceptedTeamMember(
  membership: { status: string } | null | undefined
) {
  return membership?.status === "accepted";
}

export function isTeamAdmin(
  membership: { status: string; role: TeamRole } | null | undefined
) {
  return isAcceptedTeamMember(membership) && membership?.role === "admin";
}
