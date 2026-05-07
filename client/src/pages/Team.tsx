import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Users, Mail, Trash2, Edit2 } from "lucide-react";
import { toast } from "sonner";

interface TeamMember {
  id: string;
  email: string;
  role: "admin" | "editor" | "viewer";
  status: "active" | "pending";
  joinedAt: string;
}

export default function Team() {
  const [members, setMembers] = useState<TeamMember[]>([
    {
      id: "1",
      email: "admin@example.com",
      role: "admin",
      status: "active",
      joinedAt: "2024-01-15",
    },
    {
      id: "2",
      email: "editor@example.com",
      role: "editor",
      status: "active",
      joinedAt: "2024-02-20",
    },
    {
      id: "3",
      email: "viewer@example.com",
      role: "viewer",
      status: "active",
      joinedAt: "2024-03-10",
    },
  ]);

  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<"admin" | "editor" | "viewer">("viewer");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editRole, setEditRole] = useState<"admin" | "editor" | "viewer">("viewer");

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim()) {
      toast.error("Please enter an email");
      return;
    }

    const newMember: TeamMember = {
      id: Date.now().toString(),
      email: inviteEmail,
      role: inviteRole,
      status: "pending",
      joinedAt: new Date().toISOString().split("T")[0],
    };

    setMembers([...members, newMember]);
    toast.success(`Invitation sent to ${inviteEmail}`);
    setInviteEmail("");
    setInviteRole("viewer");
  };

  const handleUpdateRole = (id: string, newRole: "admin" | "editor" | "viewer") => {
    setMembers(members.map((m) => (m.id === id ? { ...m, role: newRole } : m)));
    setEditingId(null);
    toast.success("Role updated");
  };

  const handleRemove = (id: string) => {
    setMembers(members.filter((m) => m.id !== id));
    toast.success("Member removed");
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-red-100 text-red-800";
      case "editor":
        return "bg-blue-100 text-blue-800";
      case "viewer":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusBadgeColor = (status: string) => {
    return status === "active" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800";
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
            <Users className="h-8 w-8" />
            Team Management
          </h1>
          <p className="text-muted-foreground">
            Manage team members and their permissions
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Invite Section */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Invite Member
              </CardTitle>
              <CardDescription>Add a new team member</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleInvite} className="space-y-4">
                <div>
                  <Label htmlFor="email" className="text-sm">
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="colleague@example.com"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="role" className="text-sm">
                    Role
                  </Label>
                  <Select value={inviteRole} onValueChange={(v) => setInviteRole(v as any)}>
                    <SelectTrigger id="role">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="editor">Editor</SelectItem>
                      <SelectItem value="viewer">Viewer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button type="submit" className="w-full">
                  Send Invite
                </Button>
              </form>

              {/* Role Info */}
              <div className="mt-6 pt-6 border-t space-y-3">
                <h4 className="font-semibold text-sm">Role Permissions</h4>
                <div className="space-y-2 text-xs">
                  <div>
                    <p className="font-medium text-red-700">Admin</p>
                    <p className="text-muted-foreground">Full access & team management</p>
                  </div>
                  <div>
                    <p className="font-medium text-blue-700">Editor</p>
                    <p className="text-muted-foreground">Create & edit dashboards</p>
                  </div>
                  <div>
                    <p className="font-medium text-gray-700">Viewer</p>
                    <p className="text-muted-foreground">View-only access</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Members List */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Team Members ({members.length})</CardTitle>
              <CardDescription>Active and pending team members</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {members.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    No team members yet. Invite someone to get started.
                  </p>
                ) : (
                  members.map((member) => (
                    <div
                      key={member.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent transition-colors"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <p className="font-medium">{member.email}</p>
                          <Badge className={`text-xs ${getStatusBadgeColor(member.status)}`}>
                            {member.status}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Joined {member.joinedAt}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        {editingId === member.id ? (
                          <div className="flex gap-2">
                            <Select
                              value={editRole}
                              onValueChange={(v) => setEditRole(v as any)}
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
                              size="sm"
                              onClick={() => handleUpdateRole(member.id, editRole)}
                            >
                              Save
                            </Button>
                          </div>
                        ) : (
                          <>
                            <Badge className={`text-xs ${getRoleBadgeColor(member.role)}`}>
                              {member.role}
                            </Badge>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                setEditingId(member.id);
                                setEditRole(member.role);
                              }}
                            >
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleRemove(member.id)}
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Total Members</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{members.length}</div>
              <p className="text-xs text-muted-foreground">Active team members</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Admins</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {members.filter((m) => m.role === "admin").length}
              </div>
              <p className="text-xs text-muted-foreground">Full access</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {members.filter((m) => m.status === "pending").length}
              </div>
              <p className="text-xs text-muted-foreground">Awaiting acceptance</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
