import React, { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Shield, Lock, Eye } from "lucide-react";

interface Permission {
  id: string;
  name: string;
  category: string;
  action: string;
}

interface RoleData {
  role: string;
  name: string;
  description: string;
  permissions: Permission[];
  permissionCount: number;
}

/**
 * Permission Category Component
 */
function PermissionCategory({
  category,
  permissions,
  selectedPermissions,
  onPermissionToggle,
}: {
  category: string;
  permissions: Permission[];
  selectedPermissions: Set<string>;
  onPermissionToggle: (permissionId: string) => void;
}) {
  const categoryName = category.charAt(0).toUpperCase() + category.slice(1);

  return (
    <div className="border rounded-lg p-4 mb-4">
      <h3 className="font-semibold text-sm mb-3 text-gray-700">{categoryName}</h3>
      <div className="space-y-2">
        {permissions.map((permission) => (
          <div key={permission.id} className="flex items-center gap-2">
            <Checkbox
              id={permission.id}
              checked={selectedPermissions.has(permission.id)}
              onCheckedChange={() => onPermissionToggle(permission.id)}
            />
            <label htmlFor={permission.id} className="text-sm cursor-pointer flex-1">
              {permission.name}
            </label>
            <Badge variant="outline" className="text-xs">
              {permission.id}
            </Badge>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Role Card Component
 */
function RoleCard({ role, isSelected, onSelect }: { role: RoleData; isSelected: boolean; onSelect: () => void }) {
  const roleIcons = {
    admin: <Shield className="w-5 h-5 text-red-600" />,
    editor: <Lock className="w-5 h-5 text-blue-600" />,
    viewer: <Eye className="w-5 h-5 text-gray-600" />,
  };

  return (
    <Card
      className={`cursor-pointer transition-all ${
        isSelected ? "border-blue-500 bg-blue-50" : "hover:border-gray-400"
      }`}
      onClick={onSelect}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          {roleIcons[role.role as keyof typeof roleIcons]}
          <CardTitle className="text-base">{role.name}</CardTitle>
        </div>
        <CardDescription className="text-xs">{role.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-sm text-gray-600">
          <span className="font-semibold text-gray-900">{role.permissionCount}</span> permissions
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Permission Matrix Component
 */
function PermissionMatrix() {
  const { data: matrix, isLoading } = trpc.rbacManagement.getPermissionMatrix.useQuery();

  if (isLoading) {
    return <div className="text-center py-8">Loading permission matrix...</div>;
  }

  if (!matrix) {
    return <div className="text-center py-8 text-gray-500">No data available</div>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b">
            <th className="text-left p-2 font-semibold">Permission</th>
            {Object.keys(matrix.matrix).map((role) => (
              <th key={role} className="text-center p-2 font-semibold">
                {role.charAt(0).toUpperCase() + role.slice(1)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {matrix.permissions.map((permission) => (
            <tr key={permission} className="border-b hover:bg-gray-50">
              <td className="p-2 font-mono text-xs">{permission}</td>
              {Object.entries(matrix.matrix).map(([role, perms]) => (
                <td key={`${role}-${permission}`} className="text-center p-2">
                  {perms[permission] ? (
                    <span className="text-green-600 font-bold">✓</span>
                  ) : (
                    <span className="text-gray-300">-</span>
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/**
 * Role Hierarchy Component
 */
function RoleHierarchy() {
  const { data: hierarchy, isLoading } = trpc.rbacManagement.getRoleHierarchy.useQuery();

  if (isLoading) {
    return <div className="text-center py-8">Loading role hierarchy...</div>;
  }

  return (
    <div className="space-y-3">
      {hierarchy?.map((role) => (
        <div key={role.role} className="flex items-center gap-4 p-4 border rounded-lg">
          <div className="text-center min-w-12">
            <div className="text-2xl font-bold text-blue-600">{role.level}</div>
            <div className="text-xs text-gray-600">Level</div>
          </div>
          <div className="flex-1">
            <h3 className="font-semibold">{role.name}</h3>
            <p className="text-sm text-gray-600">{role.description}</p>
          </div>
          <Badge variant="outline">{role.permissions} permissions</Badge>
        </div>
      ))}
    </div>
  );
}

/**
 * Role Permission Editor Component
 */
export function RolePermissionEditor() {
  const [selectedRole, setSelectedRole] = useState<string>("admin");
  const { data: roles, isLoading: rolesLoading } = trpc.rbacManagement.getRoles.useQuery();
  const { data: roleDetails, isLoading: detailsLoading } = trpc.rbacManagement.getRoleDetails.useQuery(
    { role: selectedRole as "admin" | "editor" | "viewer" },
    { enabled: !!selectedRole }
  );

  const [selectedPermissions, setSelectedPermissions] = React.useState<Set<string>>(new Set());

  React.useEffect(() => {
    if (roleDetails?.permissions) {
      setSelectedPermissions(new Set(roleDetails.permissions.map((p) => p.id)));
    }
  }, [roleDetails]);

  const handlePermissionToggle = (permissionId: string) => {
    const newSet = new Set(selectedPermissions);
    if (newSet.has(permissionId)) {
      newSet.delete(permissionId);
    } else {
      newSet.add(permissionId);
    }
    setSelectedPermissions(newSet);
  };

  // Group permissions by category
  const permissionsByCategory = React.useMemo(() => {
    const grouped: Record<string, any[]> = {};
    roleDetails?.permissions.forEach((p) => {
      if (!grouped[p.category]) grouped[p.category] = [];
      grouped[p.category].push(p);
    });
    return grouped;
  }, [roleDetails]);

  if (rolesLoading) {
    return <div className="text-center py-8">Loading roles...</div>;
  }

  return (
    <Tabs defaultValue="editor" className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="editor">Permission Editor</TabsTrigger>
        <TabsTrigger value="matrix">Permission Matrix</TabsTrigger>
        <TabsTrigger value="hierarchy">Role Hierarchy</TabsTrigger>
      </TabsList>

      <TabsContent value="editor" className="space-y-4">
        {/* Role Selection */}
        <div>
          <h3 className="font-semibold mb-3">Select Role</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {roles?.map((role) => (
              <RoleCard
                key={role.id}
                role={role}
                isSelected={selectedRole === role.id}
                onSelect={() => setSelectedRole(role.id)}
              />
            ))}
          </div>
        </div>

        {/* Permission Editor */}
        {!detailsLoading && roleDetails && (
          <Card>
            <CardHeader>
              <CardTitle>{roleDetails.name} Permissions</CardTitle>
              <CardDescription>{roleDetails.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(permissionsByCategory).map(([category, permissions]) => (
                  <PermissionCategory
                    key={category}
                    category={category}
                    permissions={permissions}
                    selectedPermissions={selectedPermissions}
                    onPermissionToggle={handlePermissionToggle}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </TabsContent>

      <TabsContent value="matrix">
        <Card>
          <CardHeader>
            <CardTitle>Permission Matrix</CardTitle>
            <CardDescription>Overview of all permissions across roles</CardDescription>
          </CardHeader>
          <CardContent>
            <PermissionMatrix />
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="hierarchy">
        <Card>
          <CardHeader>
            <CardTitle>Role Hierarchy</CardTitle>
            <CardDescription>Role levels and their capabilities</CardDescription>
          </CardHeader>
          <CardContent>
            <RoleHierarchy />
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}

export default RolePermissionEditor;
