import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";

/**
 * Hook to check if user has a specific permission
 */
export function usePermission(permission: string) {
  const { data: hasPermission } = trpc.rbacManagement.hasPermission.useQuery(
    { permission },
    { staleTime: 5 * 60 * 1000 } // Cache for 5 minutes
  );

  return hasPermission ?? false;
}

/**
 * Hook to check if user can manage users
 */
export function useCanManageUsers() {
  const { data: canManage } = trpc.rbacManagement.canManageUsers.useQuery(
    {},
    { staleTime: 5 * 60 * 1000 }
  );

  return canManage ?? false;
}

/**
 * Hook to get user's permissions
 */
export function useMyPermissions() {
  const { data: permissions } = trpc.rbacManagement.getMyPermissions.useQuery(
    {},
    { staleTime: 5 * 60 * 1000 }
  );

  return permissions;
}

/**
 * Hook to check if user has admin role
 */
export function useIsAdmin() {
  const { user } = useAuth();
  return user?.role === "admin";
}

/**
 * Hook to check if user has editor or admin role
 */
export function useIsEditor() {
  const { user } = useAuth();
  return user?.role === "admin" || user?.role === "editor";
}

/**
 * Hook to check if user has any role
 */
export function useHasRole(role: "admin" | "editor" | "viewer") {
  const { user } = useAuth();
  return user?.role === role;
}
