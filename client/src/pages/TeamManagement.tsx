import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { TeamMembersGrid } from "@/components/TeamMemberCard";
import { useAuth } from "@/_core/hooks/useAuth";
import { Users, Mail, Plus } from "lucide-react";
import { toast } from "sonner";

interface TeamMember {
  id: number;
  name: string;
  email: string;
  role: "admin" | "editor" | "viewer";
  avatar?: string;
  joinedAt: Date;
  lastActive?: Date;
  status: "active" | "inactive" | "pending";
}

/**
 * Team Management Page
 * Manage team members and their roles
 */
export default function TeamManagement() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Mock team members data (replace with real data from tRPC)
  const [teamMembers] = useState<TeamMember[]>([
    {
      id: 1,
      name: user?.name || "Current User",
      email: user?.email || "user@example.com",
      role: "admin",
      joinedAt: new Date("2026-01-01"),
      lastActive: new Date(),
      status: "active",
    },
    {
      id: 2,
      name: "Sarah Johnson",
      email: "sarah@example.com",
      role: "editor",
      joinedAt: new Date("2026-02-15"),
      lastActive: new Date(Date.now() - 2 * 60 * 60000),
      status: "active",
    },
    {
      id: 3,
      name: "Mike Chen",
      email: "mike@example.com",
      role: "viewer",
      joinedAt: new Date("2026-03-01"),
      lastActive: new Date(Date.now() - 24 * 60 * 60000),
      status: "active",
    },
    {
      id: 4,
      name: "Emma Davis",
      email: "emma@example.com",
      role: "editor",
      joinedAt: new Date("2026-04-10"),
      lastActive: undefined,
      status: "pending",
    },
  ]);

  const handleInvite = async () => {
    if (!inviteEmail) {
      toast.error("Please enter an email address");
      return;
    }

    setIsLoading(true);
    try {
      // Call tRPC procedure to send invite
      // await trpc.team.sendInvite.mutate({ email: inviteEmail });
      toast.success(`Invitation sent to ${inviteEmail}`);
      setInviteEmail("");
      setOpen(false);
    } catch (error) {
      toast.error("Failed to send invitation");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditRole = (member: TeamMember) => {
    toast.info(`Edit role for ${member.name} (not implemented)`);
  };

  const handleRemove = (memberId: number) => {
    if (confirm("Are you sure you want to remove this team member?")) {
      toast.success("Team member removed");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Team Management</h1>
          <p className="text-muted-foreground">Manage your team members and their access levels</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Members</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{teamMembers.length}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {teamMembers.filter((m) => m.status === "active").length} active
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Admins</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {teamMembers.filter((m) => m.role === "admin").length}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Full access</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Pending Invites</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {teamMembers.filter((m) => m.status === "pending").length}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Awaiting response</p>
            </CardContent>
          </Card>
        </div>

        {/* Invite Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Invite Team Member
            </CardTitle>
            <CardDescription>Send an invitation to add a new team member</CardDescription>
          </CardHeader>
          <CardContent>
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Send Invite
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Invite Team Member</DialogTitle>
                  <DialogDescription>
                    Enter the email address of the person you want to invite to your team
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="colleague@example.com"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && handleInvite()}
                    />
                  </div>

                  <div className="flex gap-3 justify-end">
                    <Button variant="outline" onClick={() => setOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleInvite} disabled={isLoading}>
                      {isLoading ? "Sending..." : "Send Invite"}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>

        {/* Team Members Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Team Members
            </CardTitle>
            <CardDescription>
              {teamMembers.length} member{teamMembers.length !== 1 ? "s" : ""} in your team
            </CardDescription>
          </CardHeader>
          <CardContent>
            <TeamMembersGrid
              members={teamMembers}
              currentUserId={user?.id}
              onEdit={handleEditRole}
              onRemove={handleRemove}
            />
          </CardContent>
        </Card>

        {/* Role Reference */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Role Permissions</CardTitle>
            <CardDescription>Understanding team member roles</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <h4 className="font-semibold mb-2">Admin</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>✓ Full access to all dashboards</li>
                  <li>✓ Manage team members</li>
                  <li>✓ Configure integrations</li>
                  <li>✓ Export and schedule reports</li>
                  <li>✓ Manage billing</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Editor</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>✓ View all dashboards</li>
                  <li>✓ Edit dashboard configurations</li>
                  <li>✓ Export data</li>
                  <li>✓ Schedule reports</li>
                  <li>✗ Cannot manage team</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Viewer</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>✓ View all dashboards</li>
                  <li>✓ Download reports</li>
                  <li>✗ Cannot edit configurations</li>
                  <li>✗ Cannot schedule exports</li>
                  <li>✗ Cannot manage team</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
