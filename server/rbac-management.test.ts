import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  hasPermission,
  hasAnyPermission,
  hasAllPermissions,
  enforcePermission,
  enforceAdmin,
  getRoleDisplayName,
  getRoleDescription,
  canPerformAction,
  rolePermissions,
  type UserRole,
} from "./_core/rbac";
import { TRPCError } from "@trpc/server";

describe("RBAC System", () => {
  describe("Permission Checking", () => {
    it("should check if admin has dashboard:create permission", () => {
      expect(hasPermission("admin", "dashboard:create")).toBe(true);
    });

    it("should check if viewer does not have dashboard:delete permission", () => {
      expect(hasPermission("viewer", "dashboard:delete")).toBe(false);
    });

    it("should check if editor has dashboard:update permission", () => {
      expect(hasPermission("editor", "dashboard:update")).toBe(true);
    });

    it("should return false for non-existent permission", () => {
      expect(hasPermission("admin", "invalid:permission")).toBe(false);
    });
  });

  describe("Multiple Permission Checks", () => {
    it("should check if user has any of the given permissions", () => {
      expect(hasAnyPermission("editor", ["dashboard:delete", "dashboard:create"])).toBe(true);
    });

    it("should return false if user has none of the permissions", () => {
      expect(hasAnyPermission("viewer", ["dashboard:delete", "team:manage"])).toBe(false);
    });

    it("should check if user has all given permissions", () => {
      expect(hasAllPermissions("admin", ["dashboard:create", "team:invite"])).toBe(true);
    });

    it("should return false if user missing one permission", () => {
      expect(hasAllPermissions("editor", ["dashboard:create", "team:manage"])).toBe(false);
    });
  });

  describe("Permission Enforcement", () => {
    it("should throw error if user not authenticated", () => {
      const ctx = { user: null };
      expect(() => enforcePermission(ctx, "dashboard:read")).toThrow(TRPCError);
    });

    it("should throw error if user lacks permission", () => {
      const ctx = { user: { role: "viewer" } };
      expect(() => enforcePermission(ctx, "dashboard:delete")).toThrow(TRPCError);
    });

    it("should not throw if user has permission", () => {
      const ctx = { user: { role: "admin" } };
      expect(() => enforcePermission(ctx, "dashboard:create")).not.toThrow();
    });

    it("should enforce admin role", () => {
      const adminCtx = { user: { role: "admin" } };
      expect(() => enforceAdmin(adminCtx)).not.toThrow();

      const editorCtx = { user: { role: "editor" } };
      expect(() => enforceAdmin(editorCtx)).toThrow(TRPCError);
    });
  });

  describe("Role Display Information", () => {
    it("should return correct display name for admin role", () => {
      expect(getRoleDisplayName("admin")).toBe("Administrator");
    });

    it("should return correct display name for editor role", () => {
      expect(getRoleDisplayName("editor")).toBe("Editor");
    });

    it("should return correct display name for viewer role", () => {
      expect(getRoleDisplayName("viewer")).toBe("Viewer");
    });

    it("should return correct description for admin role", () => {
      expect(getRoleDescription("admin")).toContain("Full access");
    });

    it("should return correct description for editor role", () => {
      expect(getRoleDescription("editor")).toContain("create and edit");
    });

    it("should return correct description for viewer role", () => {
      expect(getRoleDescription("viewer")).toContain("Read-only");
    });
  });

  describe("Resource-based Permission Checking", () => {
    it("should check if user can create dashboard", () => {
      expect(canPerformAction("admin", "create", "dashboard")).toBe(true);
    });

    it("should check if viewer cannot delete dashboard", () => {
      expect(canPerformAction("viewer", "delete", "dashboard")).toBe(false);
    });

    it("should check if editor can read team", () => {
      expect(canPerformAction("editor", "read", "team")).toBe(true);
    });

    it("should check if viewer cannot manage team", () => {
      expect(canPerformAction("viewer", "manage", "team")).toBe(false);
    });
  });

  describe("Role Permissions Structure", () => {
    it("should have admin role with most permissions", () => {
      const adminPerms = rolePermissions.admin.length;
      const editorPerms = rolePermissions.editor.length;
      const viewerPerms = rolePermissions.viewer.length;

      expect(adminPerms).toBeGreaterThan(editorPerms);
      expect(editorPerms).toBeGreaterThan(viewerPerms);
    });

    it("should have all roles defined", () => {
      expect(rolePermissions.admin).toBeDefined();
      expect(rolePermissions.editor).toBeDefined();
      expect(rolePermissions.viewer).toBeDefined();
    });

    it("should have dashboard permissions for all roles", () => {
      expect(rolePermissions.admin.some((p) => p.startsWith("dashboard:"))).toBe(true);
      expect(rolePermissions.editor.some((p) => p.startsWith("dashboard:"))).toBe(true);
      expect(rolePermissions.viewer.some((p) => p.startsWith("dashboard:"))).toBe(true);
    });

    it("should restrict team management to admin", () => {
      expect(rolePermissions.admin.some((p) => p === "team:manage")).toBe(true);
      expect(rolePermissions.editor.some((p) => p === "team:manage")).toBe(false);
      expect(rolePermissions.viewer.some((p) => p === "team:manage")).toBe(false);
    });
  });

  describe("Permission Categories", () => {
    it("should have dashboard permissions", () => {
      const allPerms = [...rolePermissions.admin];
      expect(allPerms.some((p) => p.startsWith("dashboard:"))).toBe(true);
    });

    it("should have team permissions", () => {
      const allPerms = [...rolePermissions.admin];
      expect(allPerms.some((p) => p.startsWith("team:"))).toBe(true);
    });

    it("should have settings permissions", () => {
      const allPerms = [...rolePermissions.admin];
      expect(allPerms.some((p) => p.startsWith("settings:"))).toBe(true);
    });

    it("should have logs permissions", () => {
      const allPerms = [...rolePermissions.admin];
      expect(allPerms.some((p) => p.startsWith("logs:"))).toBe(true);
    });

    it("should have connections permissions", () => {
      const allPerms = [...rolePermissions.admin];
      expect(allPerms.some((p) => p.startsWith("connections:"))).toBe(true);
    });
  });

  describe("Role Hierarchy", () => {
    it("should have admin > editor > viewer hierarchy", () => {
      const adminPerms = new Set(rolePermissions.admin);
      const editorPerms = new Set(rolePermissions.editor);
      const viewerPerms = new Set(rolePermissions.viewer);

      // Admin should have all editor permissions
      editorPerms.forEach((perm) => {
        expect(adminPerms.has(perm)).toBe(true);
      });

      // Editor should have all viewer permissions
      viewerPerms.forEach((perm) => {
        expect(editorPerms.has(perm)).toBe(true);
      });
    });
  });

  describe("Permission Enforcement with Context", () => {
    it("should throw UNAUTHORIZED for null user", () => {
      const ctx = { user: null };
      expect(() => enforcePermission(ctx, "dashboard:read")).toThrow("not authenticated");
    });

    it("should throw FORBIDDEN for insufficient permissions", () => {
      const ctx = { user: { role: "viewer" } };
      expect(() => enforcePermission(ctx, "team:manage")).toThrow("does not have permission");
    });

    it("should include permission in error message", () => {
      const ctx = { user: { role: "viewer" } };
      try {
        enforcePermission(ctx, "team:manage");
      } catch (error) {
        if (error instanceof TRPCError) {
          expect(error.message).toContain("team:manage");
        }
      }
    });
  });

  describe("Edge Cases", () => {
    it("should handle empty permission string", () => {
      expect(hasPermission("admin", "")).toBe(false);
    });

    it("should handle permission with invalid format", () => {
      expect(hasPermission("admin", "invalid")).toBe(false);
    });

    it("should handle checking multiple permissions with empty array", () => {
      expect(hasAnyPermission("admin", [])).toBe(false);
    });

    it("should handle checking all permissions with empty array", () => {
      expect(hasAllPermissions("admin", [])).toBe(true);
    });

    it("should be case-sensitive for permissions", () => {
      expect(hasPermission("admin", "Dashboard:Create")).toBe(false);
      expect(hasPermission("admin", "dashboard:create")).toBe(true);
    });

    it("should be case-sensitive for roles", () => {
      expect(hasPermission("Admin" as UserRole, "dashboard:create")).toBe(false);
    });
  });

  describe("Dashboard Permissions", () => {
    it("should allow admin to create dashboards", () => {
      expect(hasPermission("admin", "dashboard:create")).toBe(true);
    });

    it("should allow admin to delete dashboards", () => {
      expect(hasPermission("admin", "dashboard:delete")).toBe(true);
    });

    it("should allow editor to create dashboards", () => {
      expect(hasPermission("editor", "dashboard:create")).toBe(true);
    });

    it("should not allow editor to delete dashboards", () => {
      expect(hasPermission("editor", "dashboard:delete")).toBe(false);
    });

    it("should allow viewer to read dashboards", () => {
      expect(hasPermission("viewer", "dashboard:read")).toBe(true);
    });

    it("should not allow viewer to create dashboards", () => {
      expect(hasPermission("viewer", "dashboard:create")).toBe(false);
    });
  });

  describe("Team Permissions", () => {
    it("should allow admin to invite team members", () => {
      expect(hasPermission("admin", "team:invite")).toBe(true);
    });

    it("should not allow editor to invite team members", () => {
      expect(hasPermission("editor", "team:invite")).toBe(false);
    });

    it("should allow admin to update user roles", () => {
      expect(hasPermission("admin", "team:updateRole")).toBe(true);
    });

    it("should allow all roles to read team", () => {
      expect(hasPermission("admin", "team:read")).toBe(true);
      expect(hasPermission("editor", "team:read")).toBe(true);
      expect(hasPermission("viewer", "team:read")).toBe(true);
    });
  });

  describe("Settings Permissions", () => {
    it("should allow admin to update settings", () => {
      expect(hasPermission("admin", "settings:update")).toBe(true);
    });

    it("should not allow editor to update settings", () => {
      expect(hasPermission("editor", "settings:update")).toBe(false);
    });

    it("should allow admin to view settings", () => {
      expect(hasPermission("admin", "settings:view")).toBe(true);
    });
  });

  describe("Connection Permissions", () => {
    it("should allow admin to create connections", () => {
      expect(hasPermission("admin", "connections:create")).toBe(true);
    });

    it("should allow editor to read connections", () => {
      expect(hasPermission("editor", "connections:read")).toBe(true);
    });

    it("should not allow editor to delete connections", () => {
      expect(hasPermission("editor", "connections:delete")).toBe(false);
    });

    it("should allow viewer to read connections", () => {
      expect(hasPermission("viewer", "connections:read")).toBe(true);
    });
  });
});
