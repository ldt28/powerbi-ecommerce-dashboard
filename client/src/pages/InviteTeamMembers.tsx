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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Mail, Users, Clock, CheckCircle, XCircle } from "lucide-react";
import { toast } from "sonner";

interface TeamMember {
  id: number;
  email: string;
  role: "admin" | "editor" | "viewer";
  status: "active" | "inactive" | "invited";
  joinedAt?: Date;
  invitedAt?: Date;
}

interface PendingInvitation {
  id: number;
  email: string;
  role: "admin" | "editor" | "viewer";
  status: "pending" | "accepted" | "expired";
  expiresAt: Date;
}

/**
 * Invite Team Members Page
 * Allows users to invite team members and manage permissions
 */
export default function InviteTeamMembers() {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"admin" | "editor" | "viewer">("viewer");
  const [loading, setLoading] = useState(false);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([
    {
      id: 1,
      email: "john@example.com",
      role: "admin",
      status: "active",
      joinedAt: new Date("2024-01-15"),
    },
    {
      id: 2,
      email: "jane@example.com",
      role: "editor",
      status: "active",
      joinedAt: new Date("2024-02-20"),
    },
    {
      id: 3,
      email: "bob@example.com",
      role: "viewer",
      status: "active",
      joinedAt: new Date("2024-03-10"),
    },
  ]);

  const [pendingInvitations, setPendingInvitations] = useState<PendingInvitation[]>([
    {
      id: 1,
      email: "alice@example.com",
      role: "editor",
      status: "pending",
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  ]);

  const handleSendInvitation = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim()) {
      toast.error("Please enter an email address");
      return;
    }

    setLoading(true);
    try {
      // Mock API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Add to pending invitations
      setPendingInvitations([
        ...pendingInvitations,
        {
          id: Date.now(),
          email,
          role,
          status: "pending",
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
      ]);

      toast.success(`Invitation sent to ${email}`);
      setEmail("");
      setRole("viewer");
    } catch (error) {
      toast.error("Failed to send invitation");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateRole = (memberId: number, newRole: "admin" | "editor" | "viewer") => {
    setTeamMembers(
      teamMembers.map((m) => (m.id === memberId ? { ...m, role: newRole } : m))
    );
    toast.success("Member role updated");
  };

  const handleRemoveMember = (memberId: number) => {
    setTeamMembers(teamMembers.filter((m) => m.id !== memberId));
    toast.success("Member removed from team");
  };

  const handleCancelInvitation = (invitationId: number) => {
    setPendingInvitations(pendingInvitations.filter((i) => i.id !== invitationId));
    toast.success("Invitation cancelled");
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
            Invite team members and manage their permissions
          </p>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="invite" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="invite">
              <Mail className="h-4 w-4 mr-2" />
              Send Invitation
            </TabsTrigger>
            <TabsTrigger value="members">
              <Users className="h-4 w-4 mr-2" />
              Team Members
            </TabsTrigger>
            <TabsTrigger value="pending">
              <Clock className="h-4 w-4 mr-2" />
              Pending
            </TabsTrigger>
          </TabsList>

          {/* Send Invitation Tab */}
          <TabsContent value="invite">
            <Card>
              <CardHeader>
                <CardTitle>Invite Team Member</CardTitle>
                <CardDescription>Send an invitation to join your team</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSendInvitation} className="space-y-4">
                  <div>
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="colleague@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={loading}
                    />
                  </div>

                  <div>
                    <Label htmlFor="role">Role</Label>
                    <Select value={role} onValueChange={(value) => setRole(value as any)}>
                      <SelectTrigger id="role">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin">Admin - Full access</SelectItem>
                        <SelectItem value="editor">Editor - Can edit dashboards</SelectItem>
                        <SelectItem value="viewer">Viewer - Read-only access</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm">
                    <p className="font-medium text-blue-900 mb-2">Role Permissions:</p>
                    <ul className="text-blue-800 space-y-1">
                      {role === "admin" && (
                        <>
                          <li>✓ View all dashboards</li>
                          <li>✓ Edit dashboards and reports</li>
                          <li>✓ Manage team members</li>
                          <li>✓ Access settings</li>
                        </>
                      )}
                      {role === "editor" && (
                        <>
                          <li>✓ View all dashboards</li>
                          <li>✓ Edit dashboards and reports</li>
                          <li>✗ Cannot manage team members</li>
                        </>
                      )}
                      {role === "viewer" && (
                        <>
                          <li>✓ View dashboards</li>
                          <li>✓ Export data</li>
                          <li>✗ Cannot edit dashboards</li>
                          <li>✗ Cannot manage team</li>
                        </>
                      )}
                    </ul>
                  </div>

                  <Button type="submit" disabled={loading} className="w-full">
                    {loading ? "Sending..." : "Send Invitation"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Team Members Tab */}
          <TabsContent value="members">
            <Card>
              <CardHeader>
                <CardTitle>Active Team Members</CardTitle>
                <CardDescription>{teamMembers.length} members in your team</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {teamMembers.map((member) => (
                    <div
                      key={member.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent transition-colors"
                    >
                      <div className="flex-1">
                        <p className="font-medium">{member.email}</p>
                        <p className="text-sm text-muted-foreground">
                          Joined {member.joinedAt?.toLocaleDateString()}
                        </p>
                      </div>

                      <div className="flex items-center gap-3">
                        <Select
                          value={member.role}
                          onValueChange={(newRole) => handleUpdateRole(member.id, newRole as any)}
                        >
                          <SelectTrigger className={`w-32 ${getRoleBadgeColor(member.role)}`}>
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
                          onClick={() => handleRemoveMember(member.id)}
                        >
                          Remove
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Pending Invitations Tab */}
          <TabsContent value="pending">
            <Card>
              <CardHeader>
                <CardTitle>Pending Invitations</CardTitle>
                <CardDescription>{pendingInvitations.length} pending invitations</CardDescription>
              </CardHeader>
              <CardContent>
                {pendingInvitations.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No pending invitations</p>
                ) : (
                  <div className="space-y-3">
                    {pendingInvitations.map((invitation) => (
                      <div
                        key={invitation.id}
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent transition-colors"
                      >
                        <div className="flex-1">
                          <p className="font-medium">{invitation.email}</p>
                          <p className="text-sm text-muted-foreground">
                            Expires {invitation.expiresAt.toLocaleDateString()}
                          </p>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className={`text-xs px-2 py-1 rounded ${getRoleBadgeColor(invitation.role)}`}>
                            {invitation.role}
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleCancelInvitation(invitation.id)}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Role Reference Card */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Role Reference</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border rounded-lg">
                <h4 className="font-semibold text-red-900 mb-2">Admin</h4>
                <ul className="text-sm text-red-800 space-y-1">
                  <li>✓ Full access to all features</li>
                  <li>✓ Manage team members</li>
                  <li>✓ Access settings</li>
                  <li>✓ View activity logs</li>
                </ul>
              </div>

              <div className="p-4 border rounded-lg">
                <h4 className="font-semibold text-blue-900 mb-2">Editor</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>✓ View all dashboards</li>
                  <li>✓ Edit dashboards</li>
                  <li>✓ Create reports</li>
                  <li>✗ Cannot manage team</li>
                </ul>
              </div>

              <div className="p-4 border rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-2">Viewer</h4>
                <ul className="text-sm text-gray-800 space-y-1">
                  <li>✓ View dashboards</li>
                  <li>✓ Export data</li>
                  <li>✗ Cannot edit</li>
                  <li>✗ Limited access</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
