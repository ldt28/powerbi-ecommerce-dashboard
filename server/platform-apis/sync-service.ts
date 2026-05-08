import GoogleAnalyticsClient, { GoogleAnalyticsConfig } from "./google-analytics";
import FacebookAdsClient, { FacebookAdsConfig } from "./facebook-ads";
import YouTubeAnalyticsClient, { YouTubeConfig } from "./youtube";
import type { Database } from "drizzle-orm/mysql-core";

/**
 * Platform API Sync Service
 * Manages synchronization of data from multiple platforms with error handling and retry logic
 */

export interface SyncOptions {
  maxRetries?: number;
  retryDelayMs?: number;
  batchSize?: number;
}

export interface SyncResult {
  platform: string;
  connectionId: number;
  status: "success" | "error" | "partial";
  recordsSync: number;
  error?: string;
  startedAt: Date;
  completedAt: Date;
}

class PlatformSyncService {
  private maxRetries: number;
  private retryDelayMs: number;
  private batchSize: number;

  constructor(options: SyncOptions = {}) {
    this.maxRetries = options.maxRetries || 3;
    this.retryDelayMs = options.retryDelayMs || 1000;
    this.batchSize = options.batchSize || 100;
  }

  /**
   * Sync Google Analytics data with retry logic
   */
  async syncGoogleAnalytics(
    client: GoogleAnalyticsClient,
    propertyId: string,
    connectionId: number,
    startDate: string,
    endDate: string,
    db?: Database
  ): Promise<SyncResult> {
    const startedAt = new Date();
    let recordsSync = 0;

    for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
      try {
        const data = await client.getAnalyticsData(
          propertyId,
          startDate,
          endDate
        );

        recordsSync = data.length;

        // Store data in database if provided
        if (db) {
          await this.storeGoogleAnalyticsData(db, connectionId, data);
        }

        return {
          platform: "google_analytics",
          connectionId,
          status: "success",
          recordsSync,
          startedAt,
          completedAt: new Date(),
        };
      } catch (error) {
        const isLastAttempt = attempt === this.maxRetries;
        const errorMessage = error instanceof Error ? error.message : String(error);

        console.error(
          `Google Analytics sync attempt ${attempt + 1}/${this.maxRetries + 1} failed:`,
          errorMessage
        );

        if (isLastAttempt) {
          return {
            platform: "google_analytics",
            connectionId,
            status: "error",
            recordsSync,
            error: errorMessage,
            startedAt,
            completedAt: new Date(),
          };
        }

        // Wait before retrying
        await this.delay(this.retryDelayMs * (attempt + 1));
      }
    }

    return {
      platform: "google_analytics",
      connectionId,
      status: "error",
      recordsSync,
      error: "Max retries exceeded",
      startedAt,
      completedAt: new Date(),
    };
  }

  /**
   * Sync Facebook Ads data with retry logic
   */
  async syncFacebookAds(
    client: FacebookAdsClient,
    adAccountId: string,
    connectionId: number,
    startDate: string,
    endDate: string,
    db?: Database
  ): Promise<SyncResult> {
    const startedAt = new Date();
    let recordsSync = 0;

    for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
      try {
        const data = await client.getAccountInsights(
          adAccountId,
          startDate,
          endDate
        );

        recordsSync = data.length;

        // Store data in database if provided
        if (db) {
          await this.storeFacebookAdsData(db, connectionId, data);
        }

        return {
          platform: "facebook_ads",
          connectionId,
          status: "success",
          recordsSync,
          startedAt,
          completedAt: new Date(),
        };
      } catch (error) {
        const isLastAttempt = attempt === this.maxRetries;
        const errorMessage = error instanceof Error ? error.message : String(error);

        console.error(
          `Facebook Ads sync attempt ${attempt + 1}/${this.maxRetries + 1} failed:`,
          errorMessage
        );

        if (isLastAttempt) {
          return {
            platform: "facebook_ads",
            connectionId,
            status: "error",
            recordsSync,
            error: errorMessage,
            startedAt,
            completedAt: new Date(),
          };
        }

        // Wait before retrying
        await this.delay(this.retryDelayMs * (attempt + 1));
      }
    }

    return {
      platform: "facebook_ads",
      connectionId,
      status: "error",
      recordsSync,
      error: "Max retries exceeded",
      startedAt,
      completedAt: new Date(),
    };
  }

  /**
   * Sync YouTube Analytics data with retry logic
   */
  async syncYouTubeAnalytics(
    client: YouTubeAnalyticsClient,
    connectionId: number,
    startDate: string,
    endDate: string,
    db?: Database
  ): Promise<SyncResult> {
    const startedAt = new Date();
    let recordsSync = 0;

    for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
      try {
        const data = await client.getAnalyticsData(startDate, endDate);

        recordsSync = data.length;

        // Store data in database if provided
        if (db) {
          await this.storeYouTubeData(db, connectionId, data);
        }

        return {
          platform: "youtube",
          connectionId,
          status: "success",
          recordsSync,
          startedAt,
          completedAt: new Date(),
        };
      } catch (error) {
        const isLastAttempt = attempt === this.maxRetries;
        const errorMessage = error instanceof Error ? error.message : String(error);

        console.error(
          `YouTube sync attempt ${attempt + 1}/${this.maxRetries + 1} failed:`,
          errorMessage
        );

        if (isLastAttempt) {
          return {
            platform: "youtube",
            connectionId,
            status: "error",
            recordsSync,
            error: errorMessage,
            startedAt,
            completedAt: new Date(),
          };
        }

        // Wait before retrying
        await this.delay(this.retryDelayMs * (attempt + 1));
      }
    }

    return {
      platform: "youtube",
      connectionId,
      status: "error",
      recordsSync,
      error: "Max retries exceeded",
      startedAt,
      completedAt: new Date(),
    };
  }

  /**
   * Store Google Analytics data in database
   */
  private async storeGoogleAnalyticsData(
    db: Database,
    connectionId: number,
    data: any[]
  ): Promise<void> {
    // Implementation would depend on your database schema
    // This is a placeholder for the actual storage logic
    console.log(
      `Storing ${data.length} Google Analytics records for connection ${connectionId}`
    );
  }

  /**
   * Store Facebook Ads data in database
   */
  private async storeFacebookAdsData(
    db: Database,
    connectionId: number,
    data: any[]
  ): Promise<void> {
    // Implementation would depend on your database schema
    // This is a placeholder for the actual storage logic
    console.log(
      `Storing ${data.length} Facebook Ads records for connection ${connectionId}`
    );
  }

  /**
   * Store YouTube data in database
   */
  private async storeYouTubeData(
    db: Database,
    connectionId: number,
    data: any[]
  ): Promise<void> {
    // Implementation would depend on your database schema
    // This is a placeholder for the actual storage logic
    console.log(
      `Storing ${data.length} YouTube records for connection ${connectionId}`
    );
  }

  /**
   * Delay helper for retry logic
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Check if error is retryable
   */
  private isRetryableError(error: any): boolean {
    const message = error?.message?.toLowerCase() || "";
    const retryableErrors = [
      "network",
      "timeout",
      "econnrefused",
      "econnreset",
      "rate limit",
      "temporarily unavailable",
    ];

    return retryableErrors.some((err) => message.includes(err));
  }

  /**
   * Batch sync multiple connections
   */
  async batchSync(
    syncTasks: Array<() => Promise<SyncResult>>
  ): Promise<SyncResult[]> {
    const results: SyncResult[] = [];

    for (let i = 0; i < syncTasks.length; i += this.batchSize) {
      const batch = syncTasks.slice(i, i + this.batchSize);
      const batchResults = await Promise.all(
        batch.map((task) => task().catch((error) => ({
          status: "error",
          error: error.message,
          recordsSync: 0,
          startedAt: new Date(),
          completedAt: new Date(),
        })))
      );
      results.push(...batchResults);
    }

    return results;
  }
}

/**
 * Create sync service instance
 */
export function createSyncService(options?: SyncOptions): PlatformSyncService {
  return new PlatformSyncService(options);
}

export default PlatformSyncService;
