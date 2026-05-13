import React, { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import TeamMemberManagement from "@/components/TeamMemberManagement";
import RolePermissionEditor from "@/components/RolePermissionEditor";
import { Users, Shield, Lock, AlertCircle, Plus } from "lucide-react";

/**
 * Team Settings Page
 * Manage team members, roles, and permissions
 */
export default function TeamSettings() {
  const { user, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState("members");

  const { data: canManage } = trpc.rbacManagement.canManageUsers.useQuery();
  const { data: myPermissions } = trpc.rbacManagement.getMyPermissions.useQuery();
  const { data: roleStats } = trpc.rbacManagement.getRoleStats.useQuery();

  if (authLoading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  if (!user) {
    return <div className="text-center py-8 text-gray-500">Please log in</div>;
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Team Settings</h1>
          <p className="text-gray-600 mt-2">Manage your team, roles, and permissions</p>
        </div>

        {/* Permission Alert */}
        {!canManage && (
          <Alert className="border-yellow-200 bg-yellow-50">
            <AlertCircle className="h-4 w-4 text-yellow-600" />
            <AlertDescription className="text-yellow-800">
              You don't have permission to manage team members. Contact an administrator.
            </AlertDescription>
          </Alert>
        )}

        {/* Role Statistics */}
        {roleStats && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {roleStats.roles.map((role) => (
              <Card key={role.role}>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-gray-600 text-sm capitalize">{role.role}s</p>
                    <p className="text-3xl font-bold mt-2">{role.count}</p>
                    <p className="text-xs text-gray-500 mt-1">{role.percentage}% of team</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* My Permissions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Your Permissions
            </CardTitle>
            <CardDescription>Permissions assigned to your role</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Role</span>
                <Badge>{user.role}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Permissions</span>
                <Badge variant="outline">{myPermissions?.permissionCount || 0}</Badge>
              </div>
            </div>
            {myPermissions?.permissions && myPermissions.permissions.length > 0 && (
              <div className="mt-4 pt-4 border-t">
                <p className="text-xs font-medium text-gray-600 mb-2">Assigned Permissions:</p>
                <div className="flex flex-wrap gap-2">
                  {myPermissions.permissions.map((perm) => (
                    <Badge key={perm} variant="outline" className="text-xs">
                      {perm}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="members" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Team Members
            </TabsTrigger>
            <TabsTrigger value="roles" className="flex items-center gap-2">
              <Lock className="w-4 h-4" />
              Roles & Permissions
            </TabsTrigger>
          </TabsList>

          {/* Team Members Tab */}
          <TabsContent value="members" className="space-y-4">
            {canManage ? (
              <>
                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-semibold">Manage Team Members</h2>
                  <Button className="gap-2">
                    <Plus className="w-4 h-4" />
                    Invite Member
                  </Button>
                </div>
                <TeamMemberManagement />
              </>
            ) : (
              <Card>
                <CardContent className="pt-6">
                  <p className="text-center text-gray-500">
                    You don't have permission to manage team members
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Roles & Permissions Tab */}
          <TabsContent value="roles" className="space-y-4">
            <div>
              <h2 className="text-lg font-semibold mb-4">Roles & Permissions</h2>
              <RolePermissionEditor />
            </div>
          </TabsContent>
        </Tabs>

        {/* Information Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Admin Role</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p className="text-gray-600">Full access to all features and team management.</p>
              <ul className="list-disc list-inside text-gray-600 space-y-1">
                <li>Create and manage dashboards</li>
                <li>Invite and remove team members</li>
                <li>Manage roles and permissions</li>
                <li>Access all settings</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Editor Role</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p className="text-gray-600">Can create and edit dashboards.</p>
              <ul className="list-disc list-inside text-gray-600 space-y-1">
                <li>Create and edit dashboards</li>
                <li>Share dashboards</li>
                <li>Export reports</li>
                <li>View team members</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Viewer Role</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p className="text-gray-600">Read-only access to dashboards.</p>
              <ul className="list-disc list-inside text-gray-600 space-y-1">
                <li>View dashboards</li>
                <li>Export reports</li>
                <li>View team members</li>
                <li>View activity logs</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Security Best Practices</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <ul className="list-disc list-inside text-gray-600 space-y-1">
                <li>Assign minimum required role</li>
                <li>Regularly review team access</li>
                <li>Remove access when not needed</li>
                <li>Monitor activity logs</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
