import { useState, useEffect } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Plus, RefreshCw } from "lucide-react";
import { PlatformConnectionCard, PlatformConnectionGrid } from "@/components/PlatformConnectionCard";
import { PlatformOAuthModal, PlatformConnectionSelector } from "@/components/PlatformOAuthModal";
import { toast } from "sonner";

/**
 * Platform Connections Settings Page
 * Manage connections to Google Analytics, Facebook Ads, and YouTube
 */

export default function PlatformConnections() {
  const { user, loading: authLoading } = useAuth();
  const [selectedPlatform, setSelectedPlatform] = useState<"google_analytics" | "facebook_ads" | "youtube" | null>(
    null
  );
  const [isOAuthModalOpen, setIsOAuthModalOpen] = useState(false);

  // Fetch connections
  const { data: connections, isLoading: connectionsLoading, refetch: refetchConnections } =
    trpc.platformConnections.listConnections.useQuery(
      user ? { userId: user.id } : { userId: 0 },
      { enabled: !!user }
    );

  // Mutations
  const disconnectMutation = trpc.platformConnections.disconnectConnection.useMutation({
    onSuccess: () => {
      refetchConnections();
    },
  });

  const refreshMutation = trpc.platformConnections.refreshConnectionToken.useMutation({
    onSuccess: () => {
      refetchConnections();
    },
  });

  const saveConnectionMutation = trpc.platformConnections.saveConnection.useMutation({
    onSuccess: () => {
      refetchConnections();
      setIsOAuthModalOpen(false);
      setSelectedPlatform(null);
    },
  });

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Please log in to manage platform connections</p>
      </div>
    );
  }

  const handleDisconnect = async (connectionId: number) => {
    try {
      await disconnectMutation.mutateAsync({ connectionId });
      toast.success("Platform disconnected");
    } catch (error) {
      toast.error("Failed to disconnect platform");
    }
  };

  const handleRefresh = async (connectionId: number) => {
    try {
      await refreshMutation.mutateAsync({ connectionId });
      toast.success("Connection refreshed");
    } catch (error) {
      toast.error("Failed to refresh connection");
    }
  };

  const handleConnectPlatform = (platform: "google_analytics" | "facebook_ads" | "youtube") => {
    setSelectedPlatform(platform);
    setIsOAuthModalOpen(true);
  };

  const handleOAuthConnect = async (connectionName: string) => {
    if (!selectedPlatform) return;

    try {
      // In a real implementation, this would:
      // 1. Get the OAuth URL from the server
      // 2. Open the OAuth flow in a new window
      // 3. Wait for the callback
      // 4. Save the connection with the returned tokens

      // For now, we'll simulate a successful connection
      await saveConnectionMutation.mutateAsync({
        userId: user.id,
        platform: selectedPlatform,
        connectionName,
        connectionType: "oauth2",
        accessToken: "mock_access_token_" + Date.now(),
        refreshToken: "mock_refresh_token_" + Date.now(),
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        accountId: "mock_account_id_" + Date.now(),
        accountEmail: user.email || "user@example.com",
        accountName: user.name || "User Account",
      });

      toast.success(`${selectedPlatform} connected successfully`);
    } catch (error) {
      toast.error("Failed to connect platform");
    }
  };

  const connectedPlatforms = connections?.filter((c) => c.isActive) || [];
  const availablePlatforms = [
    "google_analytics",
    "facebook_ads",
    "youtube",
  ].filter((p) => !connectedPlatforms.some((c) => c.platform === p));

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-4xl font-bold">Platform Connections</h1>
            <p className="text-muted-foreground mt-2">
              Connect your analytics and advertising accounts to sync data
            </p>
          </div>
          <Button onClick={() => refetchConnections()} disabled={connectionsLoading} className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
        </div>

        {/* Connected Platforms */}
        {connectedPlatforms.length > 0 && (
          <div className="space-y-4">
            <div>
              <h2 className="text-2xl font-semibold">Connected Platforms</h2>
              <p className="text-muted-foreground">Your active platform connections</p>
            </div>
            <PlatformConnectionGrid
              connections={connectedPlatforms}
              onDisconnect={handleDisconnect}
              onRefresh={handleRefresh}
              isLoading={connectionsLoading || disconnectMutation.isPending || refreshMutation.isPending}
            />
          </div>
        )}

        {/* Available Platforms to Connect */}
        {availablePlatforms.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Add More Platforms
              </CardTitle>
              <CardDescription>Connect additional platforms to expand your analytics coverage</CardDescription>
            </CardHeader>
            <CardContent>
              <PlatformConnectionSelector
                onSelectPlatform={handleConnectPlatform}
                isLoading={saveConnectionMutation.isPending}
              />
            </CardContent>
          </Card>
        )}

        {/* No Connections State */}
        {connectedPlatforms.length === 0 && (
          <Card className="border-dashed">
            <CardContent className="pt-12 pb-12 text-center">
              <div className="space-y-4">
                <div className="text-5xl">🔗</div>
                <div>
                  <h3 className="text-xl font-semibold">No Platforms Connected</h3>
                  <p className="text-muted-foreground mt-2">
                    Connect your first platform to start syncing analytics data
                  </p>
                </div>
                <Button onClick={() => handleConnectPlatform("google_analytics")} className="mt-4">
                  <Plus className="h-4 w-4 mr-2" />
                  Connect Your First Platform
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* How It Works */}
        <Card>
          <CardHeader>
            <CardTitle>How Platform Connections Work</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <div className="flex items-center justify-center h-10 w-10 rounded-full bg-blue-100 text-blue-700 font-semibold">
                  1
                </div>
                <h4 className="font-semibold">Connect Account</h4>
                <p className="text-sm text-muted-foreground">
                  Click "Connect" and authorize access to your platform account
                </p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-center h-10 w-10 rounded-full bg-blue-100 text-blue-700 font-semibold">
                  2
                </div>
                <h4 className="font-semibold">Automatic Sync</h4>
                <p className="text-sm text-muted-foreground">
                  Your data syncs automatically every 30 minutes
                </p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-center h-10 w-10 rounded-full bg-blue-100 text-blue-700 font-semibold">
                  3
                </div>
                <h4 className="font-semibold">View Analytics</h4>
                <p className="text-sm text-muted-foreground">
                  See unified analytics in your dashboard
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Security Info */}
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-6">
            <div className="space-y-2">
              <h4 className="font-semibold text-blue-900">🔒 Your Data is Secure</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>✓ We only request read-only access to your data</li>
                <li>✓ Your account credentials are never stored</li>
                <li>✓ All connections use industry-standard OAuth 2.0</li>
                <li>✓ You can disconnect any platform at any time</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* OAuth Modal */}
      {selectedPlatform && (
        <PlatformOAuthModal
          isOpen={isOAuthModalOpen}
          onClose={() => {
            setIsOAuthModalOpen(false);
            setSelectedPlatform(null);
          }}
          platform={selectedPlatform}
          onConnect={handleOAuthConnect}
          isLoading={saveConnectionMutation.isPending}
        />
      )}
    </div>
  );
}
