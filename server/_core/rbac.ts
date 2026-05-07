import { TRPCError } from "@trpc/server";
import type { Context } from "./context";

/**
 * Role-Based Access Control (RBAC) Utilities
 * Provides middleware and helpers for enforcing role-based permissions
 */

export type UserRole = "admin" | "editor" | "viewer";

export interface RolePermissions {
  admin: string[];
  editor: string[];
  viewer: string[];
}

/**
 * Define permissions for each role
 */
export const rolePermissions: RolePermissions = {
  admin: [
    // Dashboard permissions
    "dashboard:create",
    "dashboard:read",
    "dashboard:update",
    "dashboard:delete",
    "dashboard:share",
    "dashboard:export",

    // Team permissions
    "team:invite",
    "team:manage",
    "team:remove",
    "team:updateRole",

    // Settings permissions
    "settings:view",
    "settings:update",

    // Activity logs
    "logs:view",

    // Connections
    "connections:create",
    "connections:delete",
  ],
  editor: [
    // Dashboard permissions
    "dashboard:create",
    "dashboard:read",
    "dashboard:update",
    "dashboard:share",
    "dashboard:export",

    // Team permissions
    "team:read",

    // Activity logs
    "logs:view",

    // Connections
    "connections:read",
  ],
  viewer: [
    // Dashboard permissions
    "dashboard:read",
    "dashboard:export",

    // Team permissions
    "team:read",

    // Activity logs
    "logs:view",
  ],
};

/**
 * Check if a user has a specific permission
 */
export function hasPermission(userRole: UserRole, permission: string): boolean {
  const permissions = rolePermissions[userRole] || [];
  return permissions.includes(permission);
}

/**
 * Check if a user has any of the given permissions
 */
export function hasAnyPermission(userRole: UserRole, permissions: string[]): boolean {
  return permissions.some((permission) => hasPermission(userRole, permission));
}

/**
 * Check if a user has all of the given permissions
 */
export function hasAllPermissions(userRole: UserRole, permissions: string[]): boolean {
  return permissions.every((permission) => hasPermission(userRole, permission));
}

/**
 * Enforce a specific permission
 */
export function enforcePermission(ctx: any, permission: string): void {
  if (!ctx.user) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "User not authenticated",
    });
  }

  if (!hasPermission(ctx.user.role as UserRole, permission)) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: `User does not have permission: ${permission}`,
    });
  }
}

/**
 * Enforce any of the given permissions
 */
export function enforceAnyPermission(ctx: Context, permissions: string[]): void {
  if (!ctx.user) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "User not authenticated",
    });
  }

  if (!hasAnyPermission(ctx.user.role as UserRole, permissions)) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: `User does not have any of the required permissions`,
    });
  }
}

/**
 * Enforce all of the given permissions
 */
export function enforceAllPermissions(ctx: Context, permissions: string[]): void {
  if (!ctx.user) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "User not authenticated",
    });
  }

  if (!hasAllPermissions(ctx.user.role as UserRole, permissions)) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: `User does not have all required permissions`,
    });
  }
}

/**
 * Enforce admin role
 */
export function enforceAdmin(ctx: Context): void {
  if (!ctx.user) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "User not authenticated",
    });
  }

  if (ctx.user.role !== "admin") {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Admin access required",
    });
  }
}

/**
 * Enforce editor or admin role
 */
export function enforceEditor(ctx: Context): void {
  if (!ctx.user) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "User not authenticated",
    });
  }

  if (ctx.user.role !== "admin" && ctx.user.role !== "editor") {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Editor or Admin access required",
    });
  }
}

/**
 * Get role display name
 */
export function getRoleDisplayName(role: UserRole): string {
  const names: Record<UserRole, string> = {
    admin: "Administrator",
    editor: "Editor",
    viewer: "Viewer",
  };
  return names[role] || role;
}

/**
 * Get role description
 */
export function getRoleDescription(role: UserRole): string {
  const descriptions: Record<UserRole, string> = {
    admin: "Full access to all features and team management",
    editor: "Can create and edit dashboards",
    viewer: "Read-only access to dashboards",
  };
  return descriptions[role] || "";
}

/**
 * Check if user can perform action on resource
 */
export function canPerformAction(
  userRole: UserRole,
  action: string,
  resourceType: string
): boolean {
  const permission = `${resourceType}:${action}`;
  return hasPermission(userRole, permission);
}
