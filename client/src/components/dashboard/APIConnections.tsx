import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogFooter,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Plus, MoreVertical, Trash2, RefreshCw, CheckCircle2, AlertCircle, Clock } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { AddConnectionModal } from "./AddConnectionModal";
import type { ApiConnection } from "@shared/types";

const PLATFORM_ICONS: Record<string, string> = {
  google: "🔍",
  facebook: "f",
  amazon: "🛒",
  ebay: "📦",
  walmart: "🏪",
  instagram: "📷",
};

const PLATFORM_LABELS: Record<string, string> = {
  google: "Google",
  facebook: "Facebook",
  amazon: "Amazon",
  ebay: "eBay",
  walmart: "Walmart",
  instagram: "Instagram",
};

const CONNECTION_TYPE_COLORS: Record<string, string> = {
  analytics: "bg-blue-100 text-blue-800",
  ads: "bg-purple-100 text-purple-800",
  commerce: "bg-green-100 text-green-800",
  social: "bg-pink-100 text-pink-800",
};

const SYNC_STATUS_CONFIG: Record<string, { icon: typeof CheckCircle2; color: string; label: string }> = {
  idle: {
    icon: CheckCircle2,
    color: "text-green-600",
    label: "Synced",
  },
  syncing: {
    icon: Clock,
    color: "text-blue-600",
    label: "Syncing",
  },
  error: {
    icon: AlertCircle,
    color: "text-red-600",
    label: "Error",
  },
};

interface APIConnectionsProps {
  onConnectionAdded?: () => void;
}

export function APIConnections({ onConnectionAdded }: APIConnectionsProps) {
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [selectedConnectionId, setSelectedConnectionId] = useState<number | null>(null);

  const { data: connections = [], isLoading, refetch } = trpc.apiConnections.list.useQuery();
  const deleteConnection = trpc.apiConnections.delete.useMutation();
  const updateSyncStatus = trpc.apiConnections.updateSyncStatus.useMutation();

  const handleDeleteClick = (connectionId: number) => {
    setSelectedConnectionId(connectionId);
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedConnectionId) return;

    try {
      await deleteConnection.mutateAsync({ connectionId: selectedConnectionId });
      refetch();
      setDeleteConfirmOpen(false);
      setSelectedConnectionId(null);
    } catch (error) {
      console.error("Failed to delete connection:", error);
    }
  };

  const handleSync = async (connection: ApiConnection) => {
    try {
      await updateSyncStatus.mutateAsync({
        connectionId: connection.id,
        status: "syncing",
      });
      refetch();

      // Simulate sync completion
      setTimeout(async () => {
        await updateSyncStatus.mutateAsync({
          connectionId: connection.id,
          status: "idle",
        });
        refetch();
      }, 2000);
    } catch (error) {
      console.error("Failed to sync connection:", error);
      await updateSyncStatus.mutateAsync({
        connectionId: connection.id,
        status: "error",
        error: "Sync failed",
      });
      refetch();
    }
  };

  const handleConnectionAdded = () => {
    setAddModalOpen(false);
    refetch();
    onConnectionAdded?.();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Loading connections...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">API Connections</h2>
          <p className="text-muted-foreground">Manage your connected stores and platforms</p>
        </div>
        <Button onClick={() => setAddModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Connection
        </Button>
      </div>

      {/* Connections Grid */}
      {connections.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2">No Connections Yet</h3>
              <p className="text-muted-foreground mb-6">
                Connect your stores and social media accounts to start syncing data
              </p>
              <Button onClick={() => setAddModalOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Your First Connection
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {connections.map((connection) => {
            const statusConfig = SYNC_STATUS_CONFIG[connection.syncStatus as keyof typeof SYNC_STATUS_CONFIG];
            const StatusIcon = statusConfig.icon;

            return (
              <Card key={connection.id} className="flex flex-col">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{PLATFORM_ICONS[connection.platform]}</span>
                      <div>
                        <CardTitle className="text-base">{connection.connectionName}</CardTitle>
                        <CardDescription className="text-xs">
                          {PLATFORM_LABELS[connection.platform]}
                        </CardDescription>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleSync(connection)}>
                          <RefreshCw className="mr-2 h-4 w-4" />
                          Sync Now
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDeleteClick(connection.id)}
                          className="text-red-600"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>

                <CardContent className="flex-1 space-y-4">
                  {/* Type Badge */}
                  <div>
                    <Badge className={CONNECTION_TYPE_COLORS[connection.connectionType]}>
                      {connection.connectionType}
                    </Badge>
                  </div>

                  {/* Account Info */}
                  {(connection.accountEmail || connection.accountName) && (
                    <div className="text-sm">
                      {connection.accountEmail && (
                        <p className="text-muted-foreground truncate">{connection.accountEmail}</p>
                      )}
                      {connection.accountName && (
                        <p className="text-muted-foreground truncate">{connection.accountName}</p>
                      )}
                    </div>
                  )}

                  {/* Status */}
                  <div className="flex items-center gap-2 pt-2 border-t">
                    <StatusIcon className={`h-4 w-4 ${statusConfig.color}`} />
                    <span className="text-sm text-muted-foreground">{statusConfig.label}</span>
                  </div>

                  {/* Last Synced */}
                  {connection.lastSyncedAt && (
                    <div className="text-xs text-muted-foreground">
                      Last synced: {new Date(connection.lastSyncedAt).toLocaleDateString()}
                    </div>
                  )}

                  {/* Error Message */}
                  {connection.syncError && (
                    <div className="text-xs text-red-600 bg-red-50 p-2 rounded">
                      {connection.syncError}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Add Connection Modal */}
      <AddConnectionModal
        open={addModalOpen}
        onOpenChange={setAddModalOpen}
        onConnectionAdded={handleConnectionAdded}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Connection</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this connection? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex gap-3 justify-end">
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
