import { z } from "zod";
import { protectedProcedure, publicProcedure, router } from "../_core/trpc";
import { enforceAdmin, hasPermission, rolePermissions, type UserRole } from "../_core/rbac";
import { TRPCError } from "@trpc/server";
import { db } from "../db";

/**
 * RBAC Management Router
 * Handles role-based access control operations
 */

export const rbacManagementRouter = router({
  /**
   * Get all available roles with their permissions
   */
  getRoles: protectedProcedure.query(async ({ ctx }) => {
    return Object.entries(rolePermissions).map(([role, permissions]) => ({
      id: role,
      name: role.charAt(0).toUpperCase() + role.slice(1),
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
  getPermissions: protectedProcedure.query(async ({ ctx }) => {
    const allPermissions = new Set<string>();
    Object.values(rolePermissions).forEach((perms) => {
      perms.forEach((p) => allPermissions.add(p));
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
      return hasPermission(ctx.user.role as UserRole, input.permission);
    }),

  /**
   * Get current user's permissions
   */
  getMyPermissions: protectedProcedure.query(async ({ ctx }) => {
    const permissions = rolePermissions[ctx.user.role as UserRole] || [];
    return {
      role: ctx.user.role,
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

      if (!db) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database not initialized",
        });
      }

      // Update user role in database
      // This is a placeholder - implement based on your schema
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
  getTeamMembers: protectedProcedure.query(async ({ ctx }) => {
    // Placeholder implementation
    return [
      {
        id: 1,
        name: "Admin User",
        email: "admin@example.com",
        role: "admin",
        joinedAt: new Date(),
        status: "active",
      },
      {
        id: 2,
        name: "Editor User",
        email: "editor@example.com",
        role: "editor",
        joinedAt: new Date(),
        status: "active",
      },
    ];
  }),

  /**
   * Get role statistics
   */
  getRoleStats: protectedProcedure.query(async ({ ctx }) => {
    return {
      totalRoles: 3,
      roles: [
        { role: "admin", count: 1, percentage: 33 },
        { role: "editor", count: 1, percentage: 33 },
        { role: "viewer", count: 1, percentage: 33 },
      ],
    };
  }),

  /**
   * Check if user can manage other users
   */
  canManageUsers: protectedProcedure.query(async ({ ctx }) => {
    return hasPermission(ctx.user.role as UserRole, "team:manage");
  }),

  /**
   * Get permission matrix for all roles
   */
  getPermissionMatrix: protectedProcedure.query(async ({ ctx }) => {
    const allPermissions = new Set<string>();
    Object.values(rolePermissions).forEach((perms) => {
      perms.forEach((p) => allPermissions.add(p));
    });

    const matrix: Record<string, Record<string, boolean>> = {};
    const roles: UserRole[] = ["admin", "editor", "viewer"];

    roles.forEach((role) => {
      matrix[role] = {};
      allPermissions.forEach((permission) => {
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
  getRoleHierarchy: protectedProcedure.query(async ({ ctx }) => {
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
