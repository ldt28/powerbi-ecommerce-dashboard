import { describe, expect, it } from "vitest";
import { hasDashboardAccess, isAcceptedTeamMember, isTeamAdmin } from "./authorization";

describe("authorization helpers", () => {
  it("denies missing and public access to private dashboard operations", () => {
    expect(hasDashboardAccess(null, "view")).toBe(false);
    expect(hasDashboardAccess("public", "view")).toBe(false);
    expect(hasDashboardAccess("view", "edit")).toBe(false);
    expect(hasDashboardAccess("edit", "admin")).toBe(false);
  });

  it("allows each dashboard permission only at or below its level", () => {
    expect(hasDashboardAccess("view", "view")).toBe(true);
    expect(hasDashboardAccess("edit", "view")).toBe(true);
    expect(hasDashboardAccess("edit", "edit")).toBe(true);
    expect(hasDashboardAccess("admin", "admin")).toBe(true);
    expect(hasDashboardAccess("owner", "admin")).toBe(true);
  });

  it("requires accepted team membership", () => {
    expect(isAcceptedTeamMember(null)).toBe(false);
    expect(isAcceptedTeamMember({ status: "pending" })).toBe(false);
    expect(isAcceptedTeamMember({ status: "rejected" })).toBe(false);
    expect(isAcceptedTeamMember({ status: "accepted" })).toBe(true);
  });

  it("requires both accepted status and admin role for team administration", () => {
    expect(isTeamAdmin({ status: "accepted", role: "viewer" })).toBe(false);
    expect(isTeamAdmin({ status: "pending", role: "admin" })).toBe(false);
    expect(isTeamAdmin({ status: "accepted", role: "admin" })).toBe(true);
  });
});
