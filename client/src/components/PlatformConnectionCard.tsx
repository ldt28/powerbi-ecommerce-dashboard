import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Loader2, MoreVertical, AlertCircle, CheckCircle2, Clock, Unlink } from "lucide-react";
import { toast } from "sonner";

interface PlatformConnection {
  id: number;
  platform: string;
  connectionName: string;
  accountEmail: string;
  accountName: string;
  isActive: boolean;
  lastSyncedAt: Date | null;
  syncStatus: string;
  syncError: string | null;
  expiresAt: Date | null;
}

interface PlatformConnectionCardProps {
  connection: PlatformConnection;
  onDisconnect: (connectionId: number) => Promise<void>;
  onRefresh: (connectionId: number) => Promise<void>;
  isLoading?: boolean;
}

export function PlatformConnectionCard({
  connection,
  onDisconnect,
  onRefresh,
  isLoading = false,
}: PlatformConnectionCardProps) {
  const [showDisconnectDialog, setShowDisconnectDialog] = useState(false);
  const [isDisconnecting, setIsDisconnecting] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleDisconnect = async () => {
    setIsDisconnecting(true);
    try {
      await onDisconnect(connection.id);
      toast.success(`${connection.platform} disconnected`);
      setShowDisconnectDialog(false);
    } catch (error) {
      toast.error("Failed to disconnect");
    } finally {
      setIsDisconnecting(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await onRefresh(connection.id);
      toast.success("Connection refreshed");
    } catch (error) {
      toast.error("Failed to refresh connection");
    } finally {
      setIsRefreshing(false);
    }
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case "google_analytics":
        return "📊";
      case "facebook_ads":
        return "📱";
      case "youtube":
        return "▶️";
      default:
        return "🔗";
    }
  };

  const getPlatformLabel = (platform: string) => {
    switch (platform) {
      case "google_analytics":
        return "Google Analytics";
      case "facebook_ads":
        return "Facebook Ads";
      case "youtube":
        return "YouTube";
      default:
        return platform;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "success":
        return "bg-green-100 text-green-800";
      case "error":
        return "bg-red-100 text-red-800";
      case "syncing":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success":
        return <CheckCircle2 className="h-4 w-4" />;
      case "error":
        return <AlertCircle className="h-4 w-4" />;
      case "syncing":
        return <Loader2 className="h-4 w-4 animate-spin" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const formatLastSyncTime = (date: Date | null) => {
    if (!date) return "Never synced";
    const now = new Date();
    const diffMs = now.getTime() - new Date(date).getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  return (
    <>
      <Card className={`${!connection.isActive ? "opacity-60" : ""}`}>
        <CardHeader className="flex flex-row items-start justify-between space-y-0">
          <div className="flex items-start gap-3">
            <div className="text-2xl">{getPlatformIcon(connection.platform)}</div>
            <div>
              <CardTitle className="text-lg">{getPlatformLabel(connection.platform)}</CardTitle>
              <CardDescription>{connection.connectionName}</CardDescription>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" disabled={isLoading}>
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleRefresh} disabled={isRefreshing}>
                {isRefreshing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Refreshing...
                  </>
                ) : (
                  <>
                    <Clock className="h-4 w-4 mr-2" />
                    Refresh
                  </>
                )}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setShowDisconnectDialog(true)}
                disabled={isDisconnecting}
                className="text-red-600"
              >
                <Unlink className="h-4 w-4 mr-2" />
                Disconnect
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Account Info */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Account Email</p>
              <p className="font-medium">{connection.accountEmail}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Account Name</p>
              <p className="font-medium">{connection.accountName}</p>
            </div>
          </div>

          {/* Status and Sync Info */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">Sync Status</p>
              <Badge className={getStatusColor(connection.syncStatus)}>
                <span className="flex items-center gap-1">
                  {getStatusIcon(connection.syncStatus)}
                  {connection.syncStatus.charAt(0).toUpperCase() + connection.syncStatus.slice(1)}
                </span>
              </Badge>
            </div>

            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">Last Synced</p>
              <p className="text-sm font-medium">{formatLastSyncTime(connection.lastSyncedAt)}</p>
            </div>
          </div>

          {/* Error Message */}
          {connection.syncError && (
            <div className="rounded-md bg-red-50 p-3 text-sm text-red-800">
              <p className="font-medium">Sync Error</p>
              <p>{connection.syncError}</p>
            </div>
          )}

          {/* Token Expiry Warning */}
          {connection.expiresAt && (
            <div className="rounded-md bg-yellow-50 p-3 text-sm text-yellow-800">
              <p className="font-medium">Token Expiring Soon</p>
              <p>Expires on {new Date(connection.expiresAt).toLocaleDateString()}</p>
            </div>
          )}

          {/* Connection Status */}
          <div className="flex items-center gap-2">
            <div className={`h-2 w-2 rounded-full ${connection.isActive ? "bg-green-500" : "bg-gray-300"}`}></div>
            <p className="text-sm text-muted-foreground">
              {connection.isActive ? "Connected" : "Disconnected"}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Disconnect Confirmation Dialog */}
      <AlertDialog open={showDisconnectDialog} onOpenChange={setShowDisconnectDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Disconnect {getPlatformLabel(connection.platform)}?</AlertDialogTitle>
            <AlertDialogDescription>
              This will disconnect your {connection.accountEmail} account. You'll need to reconnect to sync data from
              this platform again.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogCancel disabled={isDisconnecting}>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleDisconnect} disabled={isDisconnecting} className="bg-red-600">
            {isDisconnecting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Disconnecting...
              </>
            ) : (
              "Disconnect"
            )}
          </AlertDialogAction>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

/**
 * Platform Connection Grid
 */
export function PlatformConnectionGrid({
  connections,
  onDisconnect,
  onRefresh,
  isLoading = false,
}: {
  connections: PlatformConnection[];
  onDisconnect: (connectionId: number) => Promise<void>;
  onRefresh: (connectionId: number) => Promise<void>;
  isLoading?: boolean;
}) {
  if (connections.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border p-8 text-center">
        <p className="text-muted-foreground">No platforms connected yet</p>
        <p className="text-sm text-muted-foreground mt-1">Connect your first platform to get started</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {connections.map((connection) => (
        <PlatformConnectionCard
          key={connection.id}
          connection={connection}
          onDisconnect={onDisconnect}
          onRefresh={onRefresh}
          isLoading={isLoading}
        />
      ))}
    </div>
  );
}
