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
import { Mail, Users, Clock } from "lucide-react";
import { toast } from "sonner";

export default function TeamPage() {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"admin" | "editor" | "viewer">("viewer");
  const [teamMembers] = useState([
    { id: 1, email: "john@example.com", role: "admin", joined: "2024-01-15" },
    { id: 2, email: "jane@example.com", role: "editor", joined: "2024-02-20" },
    { id: 3, email: "bob@example.com", role: "viewer", joined: "2024-03-10" },
  ]);

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.error("Enter email");
      return;
    }
    toast.success(`Invite sent to ${email}`);
    setEmail("");
  };

  const getRoleBadge = (role: string) => {
    const colors: Record<string, string> = {
      admin: "bg-red-100 text-red-800",
      editor: "bg-blue-100 text-blue-800",
      viewer: "bg-gray-100 text-gray-800",
    };
    return colors[role] || "bg-gray-100";
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
          <Users className="h-8 w-8" />
          Team Management
        </h1>
        <p className="text-muted-foreground mb-8">Manage team members and permissions</p>

        <Tabs defaultValue="members" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="members">
              <Users className="h-4 w-4 mr-2" />
              Members
            </TabsTrigger>
            <TabsTrigger value="invite">
              <Mail className="h-4 w-4 mr-2" />
              Invite
            </TabsTrigger>
            <TabsTrigger value="roles">
              <Clock className="h-4 w-4 mr-2" />
              Roles
            </TabsTrigger>
          </TabsList>

          <TabsContent value="members">
            <Card>
              <CardHeader>
                <CardTitle>Team Members ({teamMembers.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {teamMembers.map((member) => (
                    <div key={member.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <p className="font-medium">{member.email}</p>
                        <p className="text-sm text-muted-foreground">Joined {member.joined}</p>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded ${getRoleBadge(member.role)}`}>
                        {member.role}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="invite">
            <Card>
              <CardHeader>
                <CardTitle>Send Invitation</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleInvite} className="space-y-4">
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="colleague@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="role">Role</Label>
                    <Select value={role} onValueChange={(v) => setRole(v as any)}>
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
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="roles">
            <div className="grid gap-4">
              {[
                { role: "Admin", perms: "Full access to all features" },
                { role: "Editor", perms: "Can create and edit dashboards" },
                { role: "Viewer", perms: "Read-only access" },
              ].map((r) => (
                <Card key={r.role}>
                  <CardHeader>
                    <CardTitle>{r.role}</CardTitle>
                  </CardHeader>
                  <CardContent>{r.perms}</CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
