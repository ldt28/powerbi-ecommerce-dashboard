import { useEffect, useRef, useCallback } from "react";
import { trpc } from "@/lib/trpc";

export interface ConnectionMonitoringOptions {
  enabled?: boolean;
  refreshInterval?: number; // milliseconds
  autoRefreshOnError?: boolean;
  maxRetries?: number;
}

const DEFAULT_OPTIONS: ConnectionMonitoringOptions = {
  enabled: true,
  refreshInterval: 60000, // 1 minute
  autoRefreshOnError: true,
  maxRetries: 3,
};

/**
 * Hook for monitoring platform connection status and auto-refreshing
 * Handles connection health checks, error tracking, and automatic recovery
 */
export function useConnectionMonitoring(
  userId: number,
  options: ConnectionMonitoringOptions = {}
) {
  const mergedOptions = { ...DEFAULT_OPTIONS, ...options };
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const retryCountRef = useRef<Record<number, number>>({});

  // tRPC queries and mutations
  const { data: connections, refetch: refetchConnections } =
    trpc.platformConnections.listConnections.useQuery(
      { userId },
      { enabled: mergedOptions.enabled }
    );

  const updateSyncStatusMutation = trpc.platformConnections.updateSyncStatus.useMutation();

  /**
   * Check connection health and update status
   */
  const checkConnectionHealth = useCallback(async () => {
    if (!connections || connections.length === 0) return;

    for (const connection of connections) {
      try {
        // Check if connection needs refresh
        const now = new Date();
        const expiresAt = connection.expiresAt ? new Date(connection.expiresAt) : null;
        const daysUntilExpiry = expiresAt
          ? (expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
          : null;

        // If token expires within 7 days, refresh it
        if (daysUntilExpiry !== null && daysUntilExpiry < 7 && daysUntilExpiry > 0) {
          console.log(`Token for ${connection.platform} expiring soon, refreshing...`);
          await updateSyncStatusMutation.mutateAsync({
            connectionId: connection.id,
            syncStatus: "syncing",
          });

          // Reset retry count on successful refresh
          retryCountRef.current[connection.id] = 0;
        }

        // Check for stale sync errors
        if (
          connection.syncStatus === "error" &&
          mergedOptions.autoRefreshOnError
        ) {
          const retryCount = retryCountRef.current[connection.id] || 0;

          if (retryCount < (mergedOptions.maxRetries || 3)) {
            console.log(
              `Retrying failed sync for ${connection.platform} (attempt ${retryCount + 1})`
            );
            retryCountRef.current[connection.id] = retryCount + 1;

            await updateSyncStatusMutation.mutateAsync({
              connectionId: connection.id,
              syncStatus: "syncing",
            });
          }
        }
      } catch (error) {
        console.error("Error checking connection health:", error);
      }
    }

    // Refetch to get updated status
    await refetchConnections();
  }, [connections, updateSyncStatusMutation, mergedOptions, refetchConnections]);

  /**
   * Start monitoring connections
   */
  useEffect(() => {
    if (!mergedOptions.enabled || !connections) return;

    // Initial check
    checkConnectionHealth();

    // Set up interval for periodic checks
    intervalRef.current = setInterval(
      checkConnectionHealth,
      mergedOptions.refreshInterval
    );

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [
    mergedOptions.enabled,
    mergedOptions.refreshInterval,
    connections,
    checkConnectionHealth,
  ]);

  /**
   * Get connection health summary
   */
  const getHealthSummary = useCallback(() => {
    if (!connections) return null;

    return {
      total: connections.length,
      healthy: connections.filter((c) => c.syncStatus === "success").length,
      syncing: connections.filter((c) => c.syncStatus === "syncing").length,
      errors: connections.filter((c) => c.syncStatus === "error").length,
      idle: connections.filter((c) => c.syncStatus === "idle").length,
      expiringTokens: connections.filter((c) => {
        if (!c.expiresAt) return false;
        const daysUntilExpiry =
          (new Date(c.expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24);
        return daysUntilExpiry < 7 && daysUntilExpiry > 0;
      }).length,
    };
  }, [connections]);

  /**
   * Get connections needing attention
   */
  const getConnectionsNeedingAttention = useCallback(() => {
    if (!connections) return [];

    return connections.filter(
      (c) =>
        c.syncStatus === "error" ||
        (c.expiresAt &&
          (new Date(c.expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24) <
            7)
    );
  }, [connections]);

  /**
   * Manually trigger health check
   */
  const triggerHealthCheck = useCallback(async () => {
    await checkConnectionHealth();
  }, [checkConnectionHealth]);

  /**
   * Reset retry count for a specific connection
   */
  const resetRetryCount = useCallback((connectionId: number) => {
    retryCountRef.current[connectionId] = 0;
  }, []);

  return {
    connections,
    isMonitoring: mergedOptions.enabled,
    healthSummary: getHealthSummary(),
    connectionsNeedingAttention: getConnectionsNeedingAttention(),
    triggerHealthCheck,
    resetRetryCount,
    refetch: refetchConnections,
  };
}
