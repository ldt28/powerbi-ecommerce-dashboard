import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Loader2, Plus, Trash2, Share2, Eye } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function CustomDashboards() {
  const [newDashboardName, setNewDashboardName] = useState("");
  const [newDashboardDesc, setNewDashboardDesc] = useState("");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [selectedDashboard, setSelectedDashboard] = useState<any>(null);

  // Fetch user's dashboards
  const { data: dashboards, isLoading: dashboardsLoading, refetch: refetchDashboards } = 
    trpc.dashboards.getUserDashboards.useQuery();

  // Fetch shared dashboards
  const { data: sharedDashboards } = trpc.dashboards.getSharedDashboards.useQuery();

  // Fetch user preferences
  const { data: preferences } = trpc.dashboards.getUserPreferences.useQuery();

  // Mutations
  const createDashboardMutation = trpc.dashboards.createDashboard.useMutation();
  const deleteDashboardMutation = trpc.dashboards.deleteDashboard.useMutation();
  const updatePreferencesMutation = trpc.dashboards.updateUserPreferences.useMutation();

  const handleCreateDashboard = async () => {
    if (!newDashboardName.trim()) return;
    try {
      await createDashboardMutation.mutateAsync({
        name: newDashboardName,
        description: newDashboardDesc,
        layout: { type: "grid", columns: 12 },
        widgets: [],
      });
      setNewDashboardName("");
      setNewDashboardDesc("");
      setCreateDialogOpen(false);
      refetchDashboards();
    } catch (error) {
      console.error("Failed to create dashboard:", error);
    }
  };

  const handleDeleteDashboard = async (dashboardId: number) => {
    if (!confirm("Are you sure you want to delete this dashboard?")) return;
    try {
      await deleteDashboardMutation.mutateAsync({ dashboardId });
      refetchDashboards();
    } catch (error) {
      console.error("Failed to delete dashboard:", error);
    }
  };

  const handleSetDefault = async (dashboardId: number) => {
    try {
      await updatePreferencesMutation.mutateAsync({
        defaultDashboardId: dashboardId,
      });
    } catch (error) {
      console.error("Failed to set default dashboard:", error);
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Custom Dashboards</h1>
          <p className="text-muted-foreground">Create and manage your personalized dashboards</p>
        </div>

        {/* Create Dashboard Dialog */}
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="mb-6">
              <Plus className="mr-2 h-4 w-4" />
              Create Dashboard
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Dashboard</DialogTitle>
              <DialogDescription>Create a custom dashboard tailored to your needs</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Dashboard Name</label>
                <Input
                  placeholder="e.g., Sales Overview"
                  value={newDashboardName}
                  onChange={(e) => setNewDashboardName(e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Description (optional)</label>
                <Input
                  placeholder="e.g., Daily sales metrics and trends"
                  value={newDashboardDesc}
                  onChange={(e) => setNewDashboardDesc(e.target.value)}
                />
              </div>
              <div className="flex gap-3 justify-end">
                <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateDashboard}
                  disabled={createDashboardMutation.isPending}
                >
                  {createDashboardMutation.isPending ? (
                    <Loader2 className="animate-spin mr-2 h-4 w-4" />
                  ) : null}
                  Create
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* User's Dashboards */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">My Dashboards</h2>
          {dashboardsLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="animate-spin h-8 w-8" />
            </div>
          ) : dashboards && dashboards.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {dashboards.map((dashboard: any) => (
                <Card
                  key={dashboard.id}
                  className={`cursor-pointer transition hover:shadow-lg ${
                    preferences?.defaultDashboardId === dashboard.id ? "ring-2 ring-primary" : ""
                  }`}
                >
                  <CardHeader>
                    <CardTitle className="text-lg">{dashboard.name}</CardTitle>
                    <CardDescription>{dashboard.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Eye className="h-4 w-4" />
                        {dashboard.viewCount} views
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedDashboard(dashboard)}
                          className="flex-1"
                        >
                          Open
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleSetDefault(dashboard.id)}
                          disabled={preferences?.defaultDashboardId === dashboard.id}
                        >
                          {preferences?.defaultDashboardId === dashboard.id ? "Default" : "Set Default"}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteDashboard(dashboard.id)}
                          disabled={deleteDashboardMutation.isPending}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-12">
                <p className="text-center text-muted-foreground">
                  No dashboards yet. Create one to get started!
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Shared Dashboards */}
        {sharedDashboards && sharedDashboards.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Shared with Me</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {sharedDashboards.map((dashboard: any) => (
                <Card key={dashboard.id} className="cursor-pointer transition hover:shadow-lg">
                  <CardHeader>
                    <CardTitle className="text-lg">{dashboard.name}</CardTitle>
                    <CardDescription>{dashboard.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="flex-1">
                        Open
                      </Button>
                      <Button variant="outline" size="sm">
                        <Share2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* User Preferences */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Dashboard Preferences</CardTitle>
            <CardDescription>Customize your dashboard experience</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">Theme</label>
              <p className="text-sm text-muted-foreground">
                {preferences?.theme === "auto"
                  ? "Automatic (follows system)"
                  : preferences?.theme === "dark"
                    ? "Dark"
                    : "Light"}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium">Timezone</label>
              <p className="text-sm text-muted-foreground">{preferences?.timezone || "UTC"}</p>
            </div>
            <div>
              <label className="text-sm font-medium">Auto-refresh Interval</label>
              <p className="text-sm text-muted-foreground">
                {preferences?.autoRefreshInterval ? `${preferences.autoRefreshInterval} seconds` : "Disabled"}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
