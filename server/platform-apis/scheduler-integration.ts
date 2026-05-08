import GoogleAnalyticsClient from "./google-analytics";
import FacebookAdsClient from "./facebook-ads";
import YouTubeAnalyticsClient from "./youtube";
import PlatformSyncService, { SyncResult } from "./sync-service";

/**
 * Platform API Scheduler Integration
 * Integrates platform APIs with the sync scheduler for automated data synchronization
 */

export interface ScheduledSyncConfig {
  enabled: boolean;
  intervalMs: number; // How often to sync
  startHour?: number; // Hour of day to start syncing (0-23)
  endHour?: number; // Hour of day to stop syncing (0-23)
  maxConcurrentSyncs?: number;
}

export interface PlatformSyncConfig {
  platform: string;
  connectionId: number;
  credentials: any;
  config: any;
}

class PlatformSchedulerIntegration {
  private syncService: PlatformSyncService;
  private activesyncs: Map<number, Promise<SyncResult>> = new Map();
  private config: ScheduledSyncConfig;

  constructor(config: ScheduledSyncConfig) {
    this.config = {
      enabled: true,
      intervalMs: 3600000, // 1 hour
      maxConcurrentSyncs: 5,
      ...config,
    };
    this.syncService = new PlatformSyncService({
      maxRetries: 3,
      retryDelayMs: 1000,
    });
  }

  /**
   * Check if current time is within sync window
   */
  private isWithinSyncWindow(): boolean {
    if (this.config.startHour === undefined || this.config.endHour === undefined) {
      return true;
    }

    const now = new Date();
    const currentHour = now.getHours();

    if (this.config.startHour < this.config.endHour) {
      return currentHour >= this.config.startHour && currentHour < this.config.endHour;
    } else {
      // Wrap around midnight
      return currentHour >= this.config.startHour || currentHour < this.config.endHour;
    }
  }

  /**
   * Check if we can start a new sync (respecting max concurrent limit)
   */
  private canStartSync(): boolean {
    const activeCount = Array.from(this.activesyncs.values()).filter(
      (sync) => sync instanceof Promise
    ).length;
    return activeCount < (this.config.maxConcurrentSyncs || 5);
  }

  /**
   * Schedule Google Analytics sync
   */
  async scheduleGoogleAnalyticSync(
    config: PlatformSyncConfig,
    propertyId: string,
    startDate: string,
    endDate: string
  ): Promise<SyncResult> {
    if (!this.config.enabled || !this.isWithinSyncWindow()) {
      throw new Error("Sync is disabled or outside sync window");
    }

    if (!this.canStartSync()) {
      throw new Error("Max concurrent syncs reached");
    }

    const client = new GoogleAnalyticsClient({
      clientId: config.credentials.clientId,
      clientSecret: config.credentials.clientSecret,
      redirectUri: config.credentials.redirectUri,
    });

    client.setCredentials(config.credentials);

    const syncPromise = this.syncService.syncGoogleAnalytics(
      client,
      propertyId,
      config.connectionId,
      startDate,
      endDate
    );

    this.activesyncs.set(config.connectionId, syncPromise);

    try {
      const result = await syncPromise;
      return result;
    } finally {
      this.activesyncs.delete(config.connectionId);
    }
  }

  /**
   * Schedule Facebook Ads sync
   */
  async scheduleFacebookAdsSync(
    config: PlatformSyncConfig,
    adAccountId: string,
    startDate: string,
    endDate: string
  ): Promise<SyncResult> {
    if (!this.config.enabled || !this.isWithinSyncWindow()) {
      throw new Error("Sync is disabled or outside sync window");
    }

    if (!this.canStartSync()) {
      throw new Error("Max concurrent syncs reached");
    }

    const client = new FacebookAdsClient({
      appId: config.credentials.appId,
      appSecret: config.credentials.appSecret,
      redirectUri: config.credentials.redirectUri,
    });

    client.setCredentials(config.credentials);

    const syncPromise = this.syncService.syncFacebookAds(
      client,
      adAccountId,
      config.connectionId,
      startDate,
      endDate
    );

    this.activesyncs.set(config.connectionId, syncPromise);

    try {
      const result = await syncPromise;
      return result;
    } finally {
      this.activesyncs.delete(config.connectionId);
    }
  }

  /**
   * Schedule YouTube Analytics sync
   */
  async scheduleYouTubeSyncSync(
    config: PlatformSyncConfig,
    startDate: string,
    endDate: string
  ): Promise<SyncResult> {
    if (!this.config.enabled || !this.isWithinSyncWindow()) {
      throw new Error("Sync is disabled or outside sync window");
    }

    if (!this.canStartSync()) {
      throw new Error("Max concurrent syncs reached");
    }

    const client = new YouTubeAnalyticsClient({
      clientId: config.credentials.clientId,
      clientSecret: config.credentials.clientSecret,
      redirectUri: config.credentials.redirectUri,
    });

    client.setCredentials(config.credentials);

    const syncPromise = this.syncService.syncYouTubeAnalytics(
      client,
      config.connectionId,
      startDate,
      endDate
    );

    this.activesyncs.set(config.connectionId, syncPromise);

    try {
      const result = await syncPromise;
      return result;
    } finally {
      this.activesyncs.delete(config.connectionId);
    }
  }

  /**
   * Get sync status for a connection
   */
  async getSyncStatus(connectionId: number): Promise<SyncResult | null> {
    const syncPromise = this.activesyncs.get(connectionId);
    if (!syncPromise) {
      return null;
    }

    try {
      return await syncPromise;
    } catch (error) {
      return null;
    }
  }

  /**
   * Cancel sync for a connection
   */
  cancelSync(connectionId: number): boolean {
    return this.activesyncs.delete(connectionId);
  }

  /**
   * Get active sync count
   */
  getActiveSyncCount(): number {
    return this.activesyncs.size;
  }

  /**
   * Enable/disable scheduler
   */
  setEnabled(enabled: boolean): void {
    this.config.enabled = enabled;
  }

  /**
   * Update sync interval
   */
  setInterval(intervalMs: number): void {
    this.config.intervalMs = intervalMs;
  }

  /**
   * Update sync window
   */
  setSyncWindow(startHour: number, endHour: number): void {
    this.config.startHour = startHour;
    this.config.endHour = endHour;
  }

  /**
   * Get scheduler status
   */
  getStatus(): {
    enabled: boolean;
    activeSyncs: number;
    maxConcurrentSyncs: number;
    syncWindow: { startHour?: number; endHour?: number };
    intervalMs: number;
  } {
    return {
      enabled: this.config.enabled,
      activeSyncs: this.activesyncs.size,
      maxConcurrentSyncs: this.config.maxConcurrentSyncs || 5,
      syncWindow: {
        startHour: this.config.startHour,
        endHour: this.config.endHour,
      },
      intervalMs: this.config.intervalMs,
    };
  }
}

/**
 * Create scheduler integration instance
 */
export function createSchedulerIntegration(
  config?: ScheduledSyncConfig
): PlatformSchedulerIntegration {
  return new PlatformSchedulerIntegration(config || {});
}

export default PlatformSchedulerIntegration;
