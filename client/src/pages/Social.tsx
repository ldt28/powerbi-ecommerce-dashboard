import { useState, useEffect } from "react";
import { APIConnections } from "@/components/dashboard/APIConnections";
import { OAuth2ConnectButton, OAuth2StatusBadge } from "@/components/dashboard/OAuth2ConnectButton";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertCircle, CheckCircle2, Clock, RefreshCw, Zap } from "lucide-react";

/**
 * Social Tab - OAuth2 & API Connections Management
 * Allows users to connect platforms via OAuth2 and manage API connections
 */

interface ConnectionStatus {
  platform: "google" | "facebook" | "linkedin" | "tiktok" | "youtube" | "instagram" | "x" | "pinterest" | "snapchat";
  isConnected: boolean;
  accountName?: string;
  accountId?: string;
  lastSyncTime?: Date;
  nextSyncTime?: Date;
  syncStatus?: "idle" | "syncing" | "success" | "error";
  syncError?: string;
  tokenExpiresAt?: Date;
  isExpiringSoon?: boolean;
}

const OAUTH2_PLATFORMS = ["google", "facebook", "linkedin", "tiktok"] as const;
const API_PLATFORMS = ["youtube", "instagram", "x", "pinterest", "snapchat"] as const;

export default function Social() {
  const [connections, setConnections] = useState<ConnectionStatus[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState<string | null>(null);

  // Initialize connections from localStorage
  useEffect(() => {
    const savedConnections = localStorage.getItem("platformConnections");
    if (savedConnections) {
      try {
        setConnections(JSON.parse(savedConnections));
      } catch (error) {
        console.error("Failed to load connections:", error);
      }
    }
  }, []);

  // Save connections to localStorage
  useEffect(() => {
    localStorage.setItem("platformConnections", JSON.stringify(connections));
  }, [connections]);

  const handleOAuth2Success = (platform: string) => {
    setConnections((prev) => {
      const existing = prev.find((c) => c.platform === platform);
      if (existing) {
        return prev.map((c) =>
          c.platform === platform
            ? { ...c, isConnected: true, syncStatus: "idle" }
            : c
        );
      }
      return [
        ...prev,
        {
          platform: platform as any,
          isConnected: true,
          syncStatus: "idle",
          lastSyncTime: new Date(),
        },
      ];
    });
  };

  const handleSyncNow = async (platform: string) => {
    setIsSyncing(true);
    try {
      setConnections((prev) =>
        prev.map((c) =>
          c.platform === platform
            ? { ...c, syncStatus: "syncing" }
            : c
        )
      );

      // Simulate sync operation
      await new Promise((resolve) => setTimeout(resolve, 2000));

      setConnections((prev) =>
        prev.map((c) =>
          c.platform === platform
            ? {
                ...c,
                syncStatus: "success",
                lastSyncTime: new Date(),
                nextSyncTime: new Date(Date.now() + 3600000), // 1 hour from now
              }
            : c
        )
      );
    } catch (error) {
      setConnections((prev) =>
        prev.map((c) =>
          c.platform === platform
            ? {
                ...c,
                syncStatus: "error",
                syncError: error instanceof Error ? error.message : "Sync failed",
              }
            : c
        )
      );
    } finally {
      setIsSyncing(false);
    }
  };

  const handleDisconnect = (platform: string) => {
    setConnections((prev) =>
      prev.filter((c) => c.platform !== platform)
    );
  };

  const getConnectionStatus = (platform: string) => {
    return connections.find((c) => c.platform === platform);
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="oauth2" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="oauth2">OAuth2 Platforms</TabsTrigger>
          <TabsTrigger value="api">API Connections</TabsTrigger>
          <TabsTrigger value="health">Health Monitor</TabsTrigger>
        </TabsList>

        {/* OAuth2 Platforms Tab */}
        <TabsContent value="oauth2" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                OAuth2 Platform Connections
              </CardTitle>
              <CardDescription>
                Connect your social media accounts with one click using OAuth2 authentication
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {OAUTH2_PLATFORMS.map((platform) => {
                  const status = getConnectionStatus(platform);
                  return (
                    <Card key={platform} className="border">
                      <CardContent className="pt-6 space-y-4">
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold capitalize">{platform}</h3>
                          {status?.isConnected && (
                            <OAuth2StatusBadge
                              platform={platform}
                              isConnected={true}
                              accountName={status.accountName}
                              expiresAt={status.tokenExpiresAt}
                              isExpiringSoon={status.isExpiringSoon}
                            />
                          )}
                        </div>

                        {!status?.isConnected ? (
                          <OAuth2ConnectButton
                            platform={platform}
                            onSuccess={() => handleOAuth2Success(platform)}
                            disabled={isSyncing}
                          />
                        ) : (
                          <div className="space-y-3">
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleSyncNow(platform)}
                                disabled={isSyncing || status.syncStatus === "syncing"}
                                className="flex-1"
                              >
                                <RefreshCw className="h-4 w-4 mr-2" />
                                {status.syncStatus === "syncing" ? "Syncing..." : "Sync Now"}
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleDisconnect(platform)}
                                disabled={isSyncing}
                              >
                                Disconnect
                              </Button>
                            </div>

                            {status.lastSyncTime && (
                              <div className="text-sm text-gray-600 flex items-center gap-2">
                                <Clock className="h-4 w-4" />
                                Last sync: {status.lastSyncTime.toLocaleString()}
                              </div>
                            )}

                            {status.syncError && (
                              <div className="text-sm text-red-600 flex items-center gap-2">
                                <AlertCircle className="h-4 w-4" />
                                {status.syncError}
                              </div>
                            )}

                            {status.syncStatus === "success" && (
                              <div className="text-sm text-green-600 flex items-center gap-2">
                                <CheckCircle2 className="h-4 w-4" />
                                Sync successful
                              </div>
                            )}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* API Connections Tab */}
        <TabsContent value="api">
          <APIConnections />
        </TabsContent>

        {/* Health Monitor Tab */}
        <TabsContent value="health" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5" />
                Connection Health Monitor
              </CardTitle>
              <CardDescription>
                Monitor the health and status of all your connected platforms
              </CardDescription>
            </CardHeader>
            <CardContent>
              {connections.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>No connections yet. Connect a platform to see health status.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {connections.map((connection) => (
                    <div
                      key={connection.platform}
                      className="border rounded-lg p-4 space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold capitalize">
                          {connection.platform}
                        </h4>
                        <div className="flex items-center gap-2">
                          {connection.syncStatus === "syncing" && (
                            <div className="flex items-center gap-1 text-blue-600">
                              <RefreshCw className="h-4 w-4 animate-spin" />
                              <span className="text-sm">Syncing...</span>
                            </div>
                          )}
                          {connection.syncStatus === "success" && (
                            <div className="flex items-center gap-1 text-green-600">
                              <CheckCircle2 className="h-4 w-4" />
                              <span className="text-sm">Healthy</span>
                            </div>
                          )}
                          {connection.syncStatus === "error" && (
                            <div className="flex items-center gap-1 text-red-600">
                              <AlertCircle className="h-4 w-4" />
                              <span className="text-sm">Error</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm">
                        {connection.lastSyncTime && (
                          <div>
                            <p className="text-gray-600">Last Sync</p>
                            <p className="font-medium">
                              {connection.lastSyncTime.toLocaleString()}
                            </p>
                          </div>
                        )}
                        {connection.nextSyncTime && (
                          <div>
                            <p className="text-gray-600">Next Sync</p>
                            <p className="font-medium">
                              {connection.nextSyncTime.toLocaleString()}
                            </p>
                          </div>
                        )}
                        {connection.tokenExpiresAt && (
                          <div>
                            <p className="text-gray-600">Token Expires</p>
                            <p className={`font-medium ${connection.isExpiringSoon ? "text-yellow-600" : ""}`}>
                              {connection.tokenExpiresAt.toLocaleString()}
                            </p>
                          </div>
                        )}
                        {connection.accountName && (
                          <div>
                            <p className="text-gray-600">Account</p>
                            <p className="font-medium">{connection.accountName}</p>
                          </div>
                        )}
                      </div>

                      {connection.syncError && (
                        <div className="bg-red-50 border border-red-200 rounded p-3 text-sm text-red-700">
                          <p className="font-medium">Sync Error</p>
                          <p>{connection.syncError}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
