import { useEffect, useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Loader2, AlertCircle, Shield, Lock, Trash2, Ban, CheckCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";

/**
 * Admin Dashboard
 * Owner-only dashboard for managing users with action buttons
 */

export default function AdminDashboard() {
  const { user, loading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const [isOwner, setIsOwner] = useState(false);

  // Check if user is owner
  useEffect(() => {
    if (!authLoading && user) {
      // Check if user is the owner
      const isOwnerUser = user.openId === process.env.VITE_OWNER_OPEN_ID;
      setIsOwner(isOwnerUser);

      if (!isOwnerUser) {
        // Redirect non-owners away
        setLocation("/");
      }
    } else if (!authLoading && !user) {
      // Redirect unauthenticated users to login
      setLocation("/");
    }
  }, [user, authLoading, setLocation]);

  // Show loading state while checking auth
  if (authLoading || !isOwner) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            Owner-only access to manage users and monitor system health
          </p>
        </div>

        {/* Admin Navigation Tabs */}
        <Tabs defaultValue="users" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="audit">Audit Logs</TabsTrigger>
            <TabsTrigger value="overview">Overview</TabsTrigger>
          </TabsList>

          {/* Users Tab */}
          <TabsContent value="users">
            <AdminUsersTab />
          </TabsContent>

          {/* Audit Logs Tab */}
          <TabsContent value="audit">
            <AdminAuditTab />
          </TabsContent>

          {/* Overview Tab */}
          <TabsContent value="overview">
            <AdminOverviewTab />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

/**
 * Users Tab Component with Action Buttons
 */
function AdminUsersTab() {
  const { data: users, isLoading, error, refetch } = trpc.admin.getAllUsers.useQuery();
  const [selectedUser, setSelectedUser] = useState<any>(null);

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>Failed to load users</AlertDescription>
      </Alert>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Users Management</CardTitle>
        <CardDescription>Manage user accounts, roles, and access</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4">Name</th>
                <th className="text-left py-3 px-4">Email</th>
                <th className="text-left py-3 px-4">Role</th>
                <th className="text-left py-3 px-4">Status</th>
                <th className="text-left py-3 px-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users?.map((user: any) => (
                <tr key={user.id} className="border-b hover:bg-muted/50">
                  <td className="py-3 px-4">{user.name || "N/A"}</td>
                  <td className="py-3 px-4">{user.email || "N/A"}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      user.role === "admin" ? "bg-red-100 text-red-800" : "bg-blue-100 text-blue-800"
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      user.isSuspended ? "bg-yellow-100 text-yellow-800" : "bg-green-100 text-green-800"
                    }`}>
                      {user.isSuspended ? "Suspended" : "Active"}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex gap-2">
                      <UserActionButtons user={user} onSuccess={() => refetch()} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * User Action Buttons Component
 */
function UserActionButtons({ user, onSuccess }: { user: any; onSuccess: () => void }) {
  const suspendMutation = trpc.admin.suspendUser.useMutation();
  const unsuspendMutation = trpc.admin.unsuspendUser.useMutation();
  const resetPasswordMutation = trpc.admin.resetUserPassword.useMutation();
  const changeRoleMutation = trpc.admin.changeUserRole.useMutation();
  const deleteUserMutation = trpc.admin.deleteUser.useMutation();

  const [suspendReason, setSuspendReason] = useState("");
  const [newRole, setNewRole] = useState(user.role);

  const handleSuspend = async () => {
    try {
      await suspendMutation.mutateAsync({
        userId: user.id,
        reason: suspendReason,
      });
      toast.success("User suspended successfully");
      onSuccess();
    } catch (error) {
      toast.error("Failed to suspend user");
    }
  };

  const handleUnsuspend = async () => {
    try {
      await unsuspendMutation.mutateAsync({ userId: user.id });
      toast.success("User unsuspended successfully");
      onSuccess();
    } catch (error) {
      toast.error("Failed to unsuspend user");
    }
  };

  const handleResetPassword = async () => {
    try {
      const result = await resetPasswordMutation.mutateAsync({ userId: user.id });
      toast.success("Password reset token generated");
      console.log("Reset token:", result.resetToken);
      onSuccess();
    } catch (error) {
      toast.error("Failed to reset password");
    }
  };

  const handleChangeRole = async () => {
    try {
      await changeRoleMutation.mutateAsync({
        userId: user.id,
        newRole: newRole as "user" | "admin",
      });
      toast.success("User role changed successfully");
      onSuccess();
    } catch (error) {
      toast.error("Failed to change user role");
    }
  };

  const handleDeleteUser = async () => {
    try {
      await deleteUserMutation.mutateAsync({ userId: user.id });
      toast.success("User deleted successfully");
      onSuccess();
    } catch (error) {
      toast.error("Failed to delete user");
    }
  };

  return (
    <div className="flex flex-wrap gap-2">
      {/* Suspend/Unsuspend Button */}
      {user.isSuspended ? (
        <Button
          size="sm"
          variant="outline"
          onClick={handleUnsuspend}
          disabled={unsuspendMutation.isPending}
          className="gap-1"
        >
          {unsuspendMutation.isPending ? (
            <Loader2 className="h-3 w-3 animate-spin" />
          ) : (
            <CheckCircle className="h-3 w-3" />
          )}
          Unsuspend
        </Button>
      ) : (
        <Dialog>
          <DialogTrigger asChild>
            <Button size="sm" variant="outline" className="gap-1">
              <Ban className="h-3 w-3" />
              Suspend
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Suspend User</DialogTitle>
              <DialogDescription>
                Suspend {user.name || user.email} from accessing the platform
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Reason (optional)</label>
                <textarea
                  value={suspendReason}
                  onChange={(e) => setSuspendReason(e.target.value)}
                  placeholder="Enter reason for suspension..."
                  className="w-full mt-2 p-2 border rounded text-sm"
                  rows={3}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline">Cancel</Button>
                <Button
                  onClick={handleSuspend}
                  disabled={suspendMutation.isPending}
                  className="bg-red-600 hover:bg-red-700"
                >
                  {suspendMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Suspend"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Reset Password Button */}
      <Dialog>
        <DialogTrigger asChild>
          <Button size="sm" variant="outline" className="gap-1">
            <Lock className="h-3 w-3" />
            Reset Password
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reset Password</DialogTitle>
            <DialogDescription>
              Generate a password reset token for {user.name || user.email}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                A password reset token will be generated and the user will need to use it within 24 hours.
              </AlertDescription>
            </Alert>
            <div className="flex justify-end gap-2">
              <Button variant="outline">Cancel</Button>
              <Button
                onClick={handleResetPassword}
                disabled={resetPasswordMutation.isPending}
              >
                {resetPasswordMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Generate Token"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Change Role Button */}
      <Dialog>
        <DialogTrigger asChild>
          <Button size="sm" variant="outline" className="gap-1">
            <Shield className="h-3 w-3" />
            Change Role
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change User Role</DialogTitle>
            <DialogDescription>
              Update the role for {user.name || user.email}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">New Role</label>
              <select
                value={newRole}
                onChange={(e) => setNewRole(e.target.value)}
                className="w-full mt-2 p-2 border rounded text-sm"
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline">Cancel</Button>
              <Button
                onClick={handleChangeRole}
                disabled={changeRoleMutation.isPending || newRole === user.role}
              >
                {changeRoleMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Update Role"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete User Button */}
      <Dialog>
        <DialogTrigger asChild>
          <Button size="sm" variant="outline" className="gap-1 text-red-600 hover:text-red-700">
            <Trash2 className="h-3 w-3" />
            Delete
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete User</DialogTitle>
            <DialogDescription>
              Permanently delete {user.name || user.email} and all associated data
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                This action cannot be undone. All user data will be permanently deleted.
              </AlertDescription>
            </Alert>
            <div className="flex justify-end gap-2">
              <Button variant="outline">Cancel</Button>
              <Button
                onClick={handleDeleteUser}
                disabled={deleteUserMutation.isPending}
                className="bg-red-600 hover:bg-red-700"
              >
                {deleteUserMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Delete User"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/**
 * Audit Logs Tab Component
 */
function AdminAuditTab() {
  const { data: logs, isLoading, error } = trpc.admin.getAuditLogs.useQuery({ limit: 50 });

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>Failed to load audit logs</AlertDescription>
      </Alert>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Admin Audit Logs</CardTitle>
        <CardDescription>Track all admin actions and changes</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4">Action</th>
                <th className="text-left py-3 px-4">Target User</th>
                <th className="text-left py-3 px-4">Details</th>
                <th className="text-left py-3 px-4">Time</th>
              </tr>
            </thead>
            <tbody>
              {logs?.map((log: any) => (
                <tr key={log.id} className="border-b hover:bg-muted/50">
                  <td className="py-3 px-4">
                    <span className="px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800">
                      {log.action}
                    </span>
                  </td>
                  <td className="py-3 px-4">{log.targetUserId || "N/A"}</td>
                  <td className="py-3 px-4 text-xs text-muted-foreground">{log.details || "N/A"}</td>
                  <td className="py-3 px-4">{new Date(log.timestamp).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Overview Tab Component
 */
function AdminOverviewTab() {
  const { data: overview, isLoading, error } = trpc.admin.getDashboardOverview.useQuery();

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>Failed to load dashboard overview</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Total Users Card */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">Total Users</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{overview?.totalUsers || 0}</div>
          <p className="text-xs text-muted-foreground mt-1">
            {overview?.adminUsers || 0} admins
          </p>
        </CardContent>
      </Card>

      {/* Active Users Card */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">Active Users</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">{overview?.activeUsers || 0}</div>
          <p className="text-xs text-muted-foreground mt-1">Not suspended</p>
        </CardContent>
      </Card>

      {/* Suspended Users Card */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">Suspended</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-yellow-600">{overview?.suspendedUsers || 0}</div>
          <p className="text-xs text-muted-foreground mt-1">Currently suspended</p>
        </CardContent>
      </Card>

      {/* Admin Users Card */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">Admin Users</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-purple-600">{overview?.adminUsers || 0}</div>
          <p className="text-xs text-muted-foreground mt-1">Admin role</p>
        </CardContent>
      </Card>
    </div>
  );
}
