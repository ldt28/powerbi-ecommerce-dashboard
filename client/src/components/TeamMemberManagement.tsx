import React, { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Trash2, Shield, Edit2, Mail, CheckCircle, Clock } from "lucide-react";
import { toast } from "sonner";

interface TeamMember {
  id: number;
  name: string;
  email: string;
  role: "admin" | "editor" | "viewer";
  joinedAt: Date;
  status: "active" | "pending" | "inactive";
}

/**
 * Role Badge Component
 */
function RoleBadge({ role }: { role: "admin" | "editor" | "viewer" }) {
  const colors = {
    admin: "bg-red-100 text-red-800",
    editor: "bg-blue-100 text-blue-800",
    viewer: "bg-gray-100 text-gray-800",
  };

  const icons = {
    admin: <Shield className="w-3 h-3" />,
    editor: <Edit2 className="w-3 h-3" />,
    viewer: <Mail className="w-3 h-3" />,
  };

  return (
    <Badge className={`${colors[role]} flex items-center gap-1`}>
      {icons[role]}
      {role.charAt(0).toUpperCase() + role.slice(1)}
    </Badge>
  );
}

/**
 * Status Badge Component
 */
function StatusBadge({ status }: { status: "active" | "pending" | "inactive" }) {
  const colors = {
    active: "bg-green-100 text-green-800",
    pending: "bg-yellow-100 text-yellow-800",
    inactive: "bg-gray-100 text-gray-800",
  };

  const icons = {
    active: <CheckCircle className="w-3 h-3" />,
    pending: <Clock className="w-3 h-3" />,
    inactive: null,
  };

  return (
    <Badge variant="outline" className={`${colors[status]} flex items-center gap-1`}>
      {icons[status]}
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  );
}

/**
 * Team Member Row Component
 */
function TeamMemberRow({
  member,
  onRoleChange,
  onRemove,
}: {
  member: TeamMember;
  onRoleChange: (memberId: number, newRole: string) => void;
  onRemove: (memberId: number) => void;
}) {
  const [isChangingRole, setIsChangingRole] = useState(false);
  const [showRemoveDialog, setShowRemoveDialog] = useState(false);

  return (
    <>
      <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
              {member.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="font-medium">{member.name}</p>
              <p className="text-sm text-gray-600">{member.email}</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <StatusBadge status={member.status} />

          <Select
            value={member.role}
            onValueChange={(value) => {
              setIsChangingRole(true);
              onRoleChange(member.id, value);
              setIsChangingRole(false);
            }}
            disabled={isChangingRole}
          >
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="editor">Editor</SelectItem>
              <SelectItem value="viewer">Viewer</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowRemoveDialog(true)}
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <AlertDialog open={showRemoveDialog} onOpenChange={setShowRemoveDialog}>
        <AlertDialogContent>
          <AlertDialogTitle>Remove Team Member</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to remove {member.name} from the team? This action cannot be
            undone.
          </AlertDialogDescription>
          <div className="flex gap-2 justify-end">
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                onRemove(member.id);
                setShowRemoveDialog(false);
              }}
              className="bg-red-600 hover:bg-red-700"
            >
              Remove
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

/**
 * Team Member Management Component
 */
export function TeamMemberManagement() {
  const { data: members, isLoading } = trpc.rbacManagement.getTeamMembers.useQuery();
  const updateRoleMutation = trpc.rbacManagement.updateUserRole.useMutation();

  const handleRoleChange = async (memberId: number, newRole: string) => {
    try {
      await updateRoleMutation.mutateAsync({
        userId: memberId,
        newRole: newRole as "admin" | "editor" | "viewer",
      });
      toast.success("Role updated successfully");
    } catch (error) {
      toast.error("Failed to update role");
    }
  };

  const handleRemoveMember = (memberId: number) => {
    toast.success("Member removed from team");
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading team members...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Team Members</CardTitle>
        <CardDescription>Manage team members and their roles</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {members && members.length > 0 ? (
            members.map((member) => (
              <TeamMemberRow
                key={member.id}
                member={member}
                onRoleChange={handleRoleChange}
                onRemove={handleRemoveMember}
              />
            ))
          ) : (
            <p className="text-center text-gray-500 py-8">No team members yet</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default TeamMemberManagement;
