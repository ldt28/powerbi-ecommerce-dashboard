import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  AlertCircle,
  CheckCircle,
  Clock,
  RefreshCw,
  AlertTriangle,
  Activity,
  Zap,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface SyncStatus {
  connectionId: number;
  platform: string;
  status: "syncing" | "success" | "error" | "idle";
  lastSync?: Date;
  nextSync?: Date;
  recordsSync?: number;
  error?: string;
  progress?: number;
}

interface SyncLog {
  id: string;
  timestamp: Date;
  platform: string;
  status: "success" | "error" | "warning";
  message: string;
  recordsSync?: number;
  duration?: number;
}

interface SyncMonitoringDashboardProps {
  syncs: SyncStatus[];
  logs: SyncLog[];
  onRefresh: (connectionId: number) => void;
  onRefreshAll: () => void;
  loading?: boolean;
}

/**
 * Sync Status Badge
 * Shows the current status of a sync operation
 */
function SyncStatusBadge({ status }: { status: SyncStatus["status"] }) {
  const statusConfig = {
    syncing: {
      color: "bg-blue-100 text-blue-800",
      icon: <Zap className="w-3 h-3" />,
      label: "Syncing",
    },
    success: {
      color: "bg-green-100 text-green-800",
      icon: <CheckCircle className="w-3 h-3" />,
      label: "Success",
    },
    error: {
      color: "bg-red-100 text-red-800",
      icon: <AlertCircle className="w-3 h-3" />,
      label: "Error",
    },
    idle: {
      color: "bg-gray-100 text-gray-800",
      icon: <Clock className="w-3 h-3" />,
      label: "Idle",
    },
  };

  const config = statusConfig[status];

  return (
    <Badge className={`${config.color} flex items-center gap-1`}>
      {config.icon}
      {config.label}
    </Badge>
  );
}

/**
 * Sync Status Card
 * Displays detailed information about a single sync connection
 */
function SyncStatusCard({
  sync,
  onRefresh,
}: {
  sync: SyncStatus;
  onRefresh: () => void;
}) {
  const platformName = sync.platform.replace("_", " ").toUpperCase();

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-blue-500" />
            <CardTitle className="text-base">{platformName}</CardTitle>
          </div>
          <SyncStatusBadge status={sync.status} />
        </div>
        <CardDescription className="text-xs">
          Connection ID: {sync.connectionId}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Progress Bar */}
        {sync.status === "syncing" && sync.progress !== undefined && (
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span>Sync Progress</span>
              <span>{sync.progress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-500 h-2 rounded-full transition-all"
                style={{ width: `${sync.progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Last Sync */}
        {sync.lastSync && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Last Sync</span>
            <span className="font-medium">
              {new Date(sync.lastSync).toLocaleString()}
            </span>
          </div>
        )}

        {/* Next Sync */}
        {sync.nextSync && sync.status !== "syncing" && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Next Sync</span>
            <span className="font-medium">
              {new Date(sync.nextSync).toLocaleString()}
            </span>
          </div>
        )}

        {/* Records Synced */}
        {sync.recordsSync !== undefined && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Records Synced</span>
            <span className="font-medium">{sync.recordsSync.toLocaleString()}</span>
          </div>
        )}

        {/* Error Message */}
        {sync.error && (
          <Alert className="bg-red-50 border-red-200">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800 text-xs">
              {sync.error}
            </AlertDescription>
          </Alert>
        )}

        {/* Refresh Button */}
        <Button
          onClick={onRefresh}
          disabled={sync.status === "syncing"}
          variant="outline"
          size="sm"
          className="w-full"
        >
          <RefreshCw className="w-3 h-3 mr-2" />
          {sync.status === "syncing" ? "Syncing..." : "Refresh Now"}
        </Button>
      </CardContent>
    </Card>
  );
}

/**
 * Sync Logs Viewer
 * Displays a log of all sync operations
 */
function SyncLogsViewer({ logs }: { logs: SyncLog[] }) {
  const [expandedLog, setExpandedLog] = useState<string | null>(null);

  const getLogIcon = (status: SyncLog["status"]) => {
    switch (status) {
      case "success":
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case "error":
        return <AlertCircle className="w-4 h-4 text-red-600" />;
      case "warning":
        return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
    }
  };

  const getLogColor = (status: SyncLog["status"]) => {
    switch (status) {
      case "success":
        return "bg-green-50 border-green-200";
      case "error":
        return "bg-red-50 border-red-200";
      case "warning":
        return "bg-yellow-50 border-yellow-200";
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sync Logs</CardTitle>
        <CardDescription>Recent synchronization activities</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {logs.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-4">No logs available</p>
          ) : (
            logs.map((log) => (
              <div
                key={log.id}
                className={`p-3 border rounded-lg cursor-pointer transition-colors ${getLogColor(
                  log.status
                )} hover:opacity-80`}
                onClick={() =>
                  setExpandedLog(expandedLog === log.id ? null : log.id)
                }
              >
                <div className="flex items-start gap-2">
                  {getLogIcon(log.status)}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-medium text-sm">
                        {log.platform.replace("_", " ").toUpperCase()}
                      </span>
                      <span className="text-xs text-gray-600">
                        {new Date(log.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    <p className="text-xs text-gray-700 mt-1">{log.message}</p>

                    {/* Expanded Details */}
                    {expandedLog === log.id && (
                      <div className="mt-2 pt-2 border-t border-current border-opacity-20 space-y-1 text-xs">
                        {log.recordsSync !== undefined && (
                          <div>
                            <span className="text-gray-600">Records: </span>
                            <span className="font-medium">
                              {log.recordsSync.toLocaleString()}
                            </span>
                          </div>
                        )}
                        {log.duration !== undefined && (
                          <div>
                            <span className="text-gray-600">Duration: </span>
                            <span className="font-medium">{log.duration}ms</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Sync Statistics
 * Shows aggregate sync statistics
 */
function SyncStatistics({ syncs, logs }: { syncs: SyncStatus[]; logs: SyncLog[] }) {
  const successCount = logs.filter((l) => l.status === "success").length;
  const errorCount = logs.filter((l) => l.status === "error").length;
  const syncingCount = syncs.filter((s) => s.status === "syncing").length;
  const totalRecords = logs.reduce((sum, log) => sum + (log.recordsSync || 0), 0);

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <Card>
        <CardContent className="pt-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{successCount}</div>
            <p className="text-xs text-gray-600 mt-1">Successful Syncs</p>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="pt-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">{errorCount}</div>
            <p className="text-xs text-gray-600 mt-1">Failed Syncs</p>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="pt-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{syncingCount}</div>
            <p className="text-xs text-gray-600 mt-1">Active Syncs</p>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="pt-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {totalRecords.toLocaleString()}
            </div>
            <p className="text-xs text-gray-600 mt-1">Total Records</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * Main Sync Monitoring Dashboard
 */
export function SyncMonitoringDashboard({
  syncs,
  logs,
  onRefresh,
  onRefreshAll,
  loading,
}: SyncMonitoringDashboardProps) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Sync Monitoring</h2>
          <p className="text-gray-600 text-sm mt-1">
            Monitor and manage platform data synchronization
          </p>
        </div>
        <Button onClick={onRefreshAll} disabled={loading}>
          <RefreshCw className="w-4 h-4 mr-2" />
          {loading ? "Refreshing..." : "Refresh All"}
        </Button>
      </div>

      {/* Statistics */}
      <SyncStatistics syncs={syncs} logs={logs} />

      {/* Sync Status Cards */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Connection Status</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {syncs.map((sync) => (
            <SyncStatusCard
              key={sync.connectionId}
              sync={sync}
              onRefresh={() => onRefresh(sync.connectionId)}
            />
          ))}
        </div>
      </div>

      {/* Sync Logs */}
      <SyncLogsViewer logs={logs} />
    </div>
  );
}

export default SyncMonitoringDashboard;
