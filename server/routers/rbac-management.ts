import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { enforceAdmin, hasPermission, rolePermissions, type UserRole } from "../_core/rbac";
import { TRPCError } from "@trpc/server";
import { getDb } from "../db";
import { users, teamMembers } from "../../drizzle/schema";
import { eq } from "drizzle-orm";

/**
 * RBAC Management Router
 * Handles role-based access control operations
 */

export const rbacManagementRouter = router({
  /**
   * Get all available roles with their permissions
   */
  getRoles: protectedProcedure.query(async () => {
    const descriptions: Record<string, string> = {
      admin: "Full access to all features and team management",
      editor: "Can create and edit dashboards, view team info",
      viewer: "Read-only access to dashboards and reports",
    };
    return Object.entries(rolePermissions).map(([role, permissions]) => ({
      id: role,
      role: role as UserRole,
      name: role.charAt(0).toUpperCase() + role.slice(1),
      description: descriptions[role] || `${role} role`,
      permissions,
      permissionCount: permissions.length,
    }));
  }),

  /**
   * Get role details with description
   */
  getRoleDetails: protectedProcedure
    .input(z.object({ role: z.enum(["admin", "editor", "viewer"]) }))
    .query(async ({ input }) => {
      const permissions = rolePermissions[input.role];
      const descriptions: Record<UserRole, string> = {
        admin: "Full access to all features and team management",
        editor: "Can create and edit dashboards, view team info",
        viewer: "Read-only access to dashboards and reports",
      };

      return {
        role: input.role,
        name: input.role.charAt(0).toUpperCase() + input.role.slice(1),
        description: descriptions[input.role],
        permissions: permissions.map((p) => ({
          id: p,
          name: p.replace(":", " - ").replace(/_/g, " "),
          category: p.split(":")[0],
          action: p.split(":")[1],
        })),
        permissionCount: permissions.length,
      };
    }),

  /**
   * Get all permissions grouped by category
   */
  getPermissions: protectedProcedure.query(async () => {
    const allPermissions = new Set<string>();
    Object.values(rolePermissions).forEach((perms: string[]) => {
      perms.forEach((p: string) => allPermissions.add(p));
    });

    const grouped: Record<string, string[]> = {};
    allPermissions.forEach((p) => {
      const [category, action] = p.split(":");
      if (!grouped[category]) grouped[category] = [];
      grouped[category].push(action);
    });

    return Object.entries(grouped).map(([category, actions]) => ({
      category,
      permissions: actions.map((action) => ({
        id: `${category}:${action}`,
        name: action,
        fullName: `${category}:${action}`,
      })),
    }));
  }),

  /**
   * Check if user has permission
   */
  hasPermission: protectedProcedure
    .input(z.object({ permission: z.string() }))
    .query(async ({ ctx, input }) => {
      return hasPermission((ctx.user.role as UserRole) || "viewer", input.permission);
    }),

  /**
   * Get current user's permissions
   */
  getMyPermissions: protectedProcedure.query(async ({ ctx }) => {
    const role = (ctx.user.role as UserRole) || "viewer";
    const permissions = rolePermissions[role] || rolePermissions.viewer;
    return {
      role,
      permissions,
      permissionCount: permissions.length,
    };
  }),

  /**
   * Update user role (admin only)
   */
  updateUserRole: protectedProcedure
    .input(
      z.object({
        userId: z.number(),
        newRole: z.enum(["admin", "editor", "viewer"]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      enforceAdmin(ctx);

      const db = await getDb();
      if (!db) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database not initialized",
        });
      }

      // Update user role in users table (maps admin -> admin, editor/viewer -> user with team role)
      const userTableRole = input.newRole === "admin" ? "admin" : "user";
      await db
        .update(users)
        .set({ role: userTableRole as any })
        .where(eq(users.id, input.userId));

      // Also update team_members role if membership exists
      await db
        .update(teamMembers)
        .set({ role: input.newRole })
        .where(eq(teamMembers.userId, input.userId));

      return {
        success: true,
        userId: input.userId,
        newRole: input.newRole,
        message: `User role updated to ${input.newRole}`,
      };
    }),

  /**
   * Get team members with their roles
   */
  getTeamMembers: protectedProcedure.query(async () => {
    const db = await getDb();
    if (!db) return [];

    try {
      const allUsers = await db.select().from(users).limit(50);
      return allUsers.map((u) => ({
        id: u.id,
        name: u.name || u.email?.split("@")[0] || `User #${u.id}`,
        email: u.email || "no-email@example.com",
        role: (u.role === "admin" ? "admin" : "editor") as "admin" | "editor" | "viewer",
        joinedAt: u.createdAt,
        status: (u.isSuspended ? "suspended" : "active") as "active" | "suspended" | "pending",
      }));
    } catch {
      return [];
    }
  }),

  /**
   * Get role statistics
   */
  getRoleStats: protectedProcedure.query(async () => {
    const db = await getDb();
    if (!db) {
      return {
        totalRoles: 3,
        roles: [
          { role: "admin", count: 1, percentage: 33 },
          { role: "editor", count: 1, percentage: 33 },
          { role: "viewer", count: 1, percentage: 34 },
        ],
      };
    }

    try {
      const allUsers = await db.select().from(users);
      const total = allUsers.length || 1;
      const adminCount = allUsers.filter((u) => u.role === "admin").length;
      const otherCount = total - adminCount;
      const editorCount = Math.ceil(otherCount / 2);
      const viewerCount = otherCount - editorCount;

      return {
        totalRoles: 3,
        roles: [
          { role: "admin", count: adminCount, percentage: Math.round((adminCount / total) * 100) },
          { role: "editor", count: editorCount, percentage: Math.round((editorCount / total) * 100) },
          { role: "viewer", count: viewerCount, percentage: Math.round((viewerCount / total) * 100) },
        ],
      };
    } catch {
      return {
        totalRoles: 3,
        roles: [
          { role: "admin", count: 1, percentage: 33 },
          { role: "editor", count: 1, percentage: 33 },
          { role: "viewer", count: 1, percentage: 34 },
        ],
      };
    }
  }),

  /**
   * Check if user can manage other users
   */
  canManageUsers: protectedProcedure.query(async ({ ctx }) => {
    return ctx.user.role === "admin" || hasPermission((ctx.user.role as UserRole) || "viewer", "team:manage");
  }),

  /**
   * Get permission matrix for all roles
   */
  getPermissionMatrix: protectedProcedure.query(async () => {
    const allPermissions = new Set<string>();
    Object.values(rolePermissions).forEach((perms: string[]) => {
      perms.forEach((p: string) => allPermissions.add(p));
    });

    const matrix: Record<string, Record<string, boolean>> = {};
    const roles: UserRole[] = ["admin", "editor", "viewer"];

    roles.forEach((role: UserRole) => {
      matrix[role] = {};
      allPermissions.forEach((permission: string) => {
        matrix[role][permission] = hasPermission(role, permission);
      });
    });

    return {
      permissions: Array.from(allPermissions),
      matrix,
    };
  }),

  /**
   * Get role hierarchy
   */
  getRoleHierarchy: protectedProcedure.query(async () => {
    return [
      {
        level: 1,
        role: "admin",
        name: "Administrator",
        description: "Full system access",
        permissions: rolePermissions.admin.length,
      },
      {
        level: 2,
        role: "editor",
        name: "Editor",
        description: "Can create and edit content",
        permissions: rolePermissions.editor.length,
      },
      {
        level: 3,
        role: "viewer",
        name: "Viewer",
        description: "Read-only access",
        permissions: rolePermissions.viewer.length,
      },
    ];
  }),
});
