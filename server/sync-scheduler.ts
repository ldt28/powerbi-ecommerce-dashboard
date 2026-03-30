import { getDb } from "./db";
import { apiConnections, oauth2Tokens } from "../drizzle/schema";
import { eq } from "drizzle-orm";

/**
 * Data Sync Scheduler Service
 * Manages background jobs for syncing data from connected platforms
 */

export interface SyncJob {
  id: string;
  platform: string;
  userId: number;
  status: "idle" | "running" | "success" | "error";
  lastRunTime?: Date;
  nextRunTime?: Date;
  error?: string;
  retryCount: number;
  maxRetries: number;
}

export interface SyncConfig {
  platform: string;
  interval: number; // milliseconds
  enabled: boolean;
  maxRetries: number;
  retryDelay: number; // milliseconds
}

const DEFAULT_SYNC_CONFIGS: Record<string, SyncConfig> = {
  google: {
    platform: "google",
    interval: 3600000, // 1 hour
    enabled: true,
    maxRetries: 3,
    retryDelay: 5000, // 5 seconds
  },
  facebook: {
    platform: "facebook",
    interval: 3600000, // 1 hour
    enabled: true,
    maxRetries: 3,
    retryDelay: 5000,
  },
  linkedin: {
    platform: "linkedin",
    interval: 7200000, // 2 hours
    enabled: true,
    maxRetries: 3,
    retryDelay: 5000,
  },
  tiktok: {
    platform: "tiktok",
    interval: 3600000, // 1 hour
    enabled: true,
    maxRetries: 3,
    retryDelay: 5000,
  },
  youtube: {
    platform: "youtube",
    interval: 1800000, // 30 minutes
    enabled: true,
    maxRetries: 3,
    retryDelay: 5000,
  },
  instagram: {
    platform: "instagram",
    interval: 3600000, // 1 hour
    enabled: true,
    maxRetries: 3,
    retryDelay: 5000,
  },
  x: {
    platform: "x",
    interval: 1800000, // 30 minutes
    enabled: true,
    maxRetries: 3,
    retryDelay: 5000,
  },
  pinterest: {
    platform: "pinterest",
    interval: 7200000, // 2 hours
    enabled: true,
    maxRetries: 3,
    retryDelay: 5000,
  },
  snapchat: {
    platform: "snapchat",
    interval: 3600000, // 1 hour
    enabled: true,
    maxRetries: 3,
    retryDelay: 5000,
  },
};

class SyncScheduler {
  private jobs: Map<string, SyncJob> = new Map();
  private timers: Map<string, NodeJS.Timeout> = new Map();
  private configs: Map<string, SyncConfig> = new Map();

  constructor() {
    // Initialize configs
    Object.entries(DEFAULT_SYNC_CONFIGS).forEach(([platform, config]) => {
      this.configs.set(platform, config);
    });
  }

  /**
   * Register a sync job for a platform
   */
  registerJob(platform: string, userId: number): SyncJob {
    const jobId = `${platform}_${userId}`;
    const job: SyncJob = {
      id: jobId,
      platform,
      userId,
      status: "idle",
      retryCount: 0,
      maxRetries: this.configs.get(platform)?.maxRetries || 3,
    };

    this.jobs.set(jobId, job);
    this.scheduleJob(jobId);
    return job;
  }

  /**
   * Schedule a job to run at intervals
   */
  private scheduleJob(jobId: string): void {
    const job = this.jobs.get(jobId);
    if (!job) return;

    const config = this.configs.get(job.platform);
    if (!config || !config.enabled) return;

    // Clear existing timer if any
    const existingTimer = this.timers.get(jobId);
    if (existingTimer) {
      clearTimeout(existingTimer);
    }

    // Schedule next run
    const timer = setTimeout(() => {
      this.executeJob(jobId).then(() => {
        this.scheduleJob(jobId); // Reschedule after completion
      });
    }, config.interval);

    this.timers.set(jobId, timer);
  }

  /**
   * Execute a sync job
   */
  private async executeJob(jobId: string): Promise<void> {
    const job = this.jobs.get(jobId);
    if (!job) return;

    try {
      job.status = "running";
      job.lastRunTime = new Date();

      // Get connection and token
      const dbInstance = await getDb();
      if (!dbInstance) {
        throw new Error("Database connection failed");
      }

      const connection = await dbInstance
        .select()
        .from(apiConnections)
        .where(eq(apiConnections.userId, job.userId))
        .limit(1);

      if (!connection || connection.length === 0) {
        throw new Error("Connection not found");
      }

      // Get OAuth token if available
      const token = await dbInstance
        .select()
        .from(oauth2Tokens)
        .where(eq(oauth2Tokens.userId, job.userId))
        .limit(1);

      // Execute platform-specific sync
      await this.syncPlatformData(job.platform, job.userId, token?.[0], dbInstance);

      job.status = "success";
      job.error = undefined;
      job.retryCount = 0;

      // Schedule next run
      const config = this.configs.get(job.platform);
      if (config) {
        job.nextRunTime = new Date(Date.now() + config.interval);
      }
    } catch (error) {
      job.status = "error";
      job.error = error instanceof Error ? error.message : "Unknown error";
      job.retryCount++;

      if (job.retryCount < job.maxRetries) {
        // Retry with exponential backoff
        const config = this.configs.get(job.platform);
        const delay = (config?.retryDelay || 5000) * Math.pow(2, job.retryCount - 1);
        const timer = setTimeout(() => {
          this.executeJob(jobId);
        }, delay);
        this.timers.set(`${jobId}_retry`, timer);
      }
    }
  }

  /**
   * Sync platform-specific data
   */
  private async syncPlatformData(
    platform: string,
    userId: number,
    token?: any,
    db?: any
  ): Promise<void> {

    switch (platform) {
      case "google":
        await this.syncGoogleAnalytics(userId, token, db);
        break;
      case "facebook":
        await this.syncFacebookData(userId, token, db);
        break;
      case "linkedin":
        await this.syncLinkedInData(userId, token, db);
        break;
      case "tiktok":
        await this.syncTikTokData(userId, token, db);
        break;
      case "youtube":
        await this.syncYouTubeData(userId, token, db);
        break;
      case "instagram":
        await this.syncInstagramData(userId, token, db);
        break;
      case "x":
        await this.syncXData(userId, token, db);
        break;
      case "pinterest":
        await this.syncPinterestData(userId, token, db);
        break;
      case "snapchat":
        await this.syncSnapchatData(userId, token, db);
        break;
      default:
        throw new Error(`Unknown platform: ${platform}`);
    }
  }

  private async syncGoogleAnalytics(userId: number, token?: any, db?: any): Promise<void> {
    // Fetch Google Analytics data
    console.log(`Syncing Google Analytics for user ${userId}`);
  }

  private async syncFacebookData(userId: number, token?: any, db?: any): Promise<void> {
    // Fetch Facebook data
    console.log(`Syncing Facebook data for user ${userId}`);
  }

  private async syncLinkedInData(userId: number, token?: any, db?: any): Promise<void> {
    // Fetch LinkedIn data
    console.log(`Syncing LinkedIn data for user ${userId}`);
  }

  private async syncTikTokData(userId: number, token?: any, db?: any): Promise<void> {
    // Fetch TikTok data
    console.log(`Syncing TikTok data for user ${userId}`);
  }

  private async syncYouTubeData(userId: number, token?: any, db?: any): Promise<void> {
    // Fetch YouTube data
    console.log(`Syncing YouTube data for user ${userId}`);
  }

  private async syncInstagramData(userId: number, token?: any, db?: any): Promise<void> {
    // Fetch Instagram data
    console.log(`Syncing Instagram data for user ${userId}`);
  }

  private async syncXData(userId: number, token?: any, db?: any): Promise<void> {
    // Fetch X (Twitter) data
    console.log(`Syncing X data for user ${userId}`);
  }

  private async syncPinterestData(userId: number, token?: any, db?: any): Promise<void> {
    // Fetch Pinterest data
    console.log(`Syncing Pinterest data for user ${userId}`);
  }

  private async syncSnapchatData(userId: number, token?: any, db?: any): Promise<void> {
    // Fetch Snapchat data
    console.log(`Syncing Snapchat data for user ${userId}`);
  }

  /**
   * Get job status
   */
  getJobStatus(jobId: string): SyncJob | undefined {
    return this.jobs.get(jobId);
  }

  /**
   * Get all jobs for a user
   */
  getUserJobs(userId: number): SyncJob[] {
    return Array.from(this.jobs.values()).filter((job) => job.userId === userId);
  }

  /**
   * Stop a job
   */
  stopJob(jobId: string): void {
    const timer = this.timers.get(jobId);
    if (timer) {
      clearTimeout(timer);
      this.timers.delete(jobId);
    }

    const job = this.jobs.get(jobId);
    if (job) {
      job.status = "idle";
    }
  }

  /**
   * Stop all jobs for a user
   */
  stopUserJobs(userId: number): void {
    this.getUserJobs(userId).forEach((job) => {
      this.stopJob(job.id);
    });
  }

  /**
   * Update sync config
   */
  updateConfig(platform: string, config: Partial<SyncConfig>): void {
    const existing = this.configs.get(platform);
    if (existing) {
      this.configs.set(platform, { ...existing, ...config });
    }
  }

  /**
   * Get all jobs
   */
  getAllJobs(): SyncJob[] {
    return Array.from(this.jobs.values());
  }

  /**
   * Clear all jobs
   */
  clearAllJobs(): void {
    this.timers.forEach((timer) => clearTimeout(timer));
    this.timers.clear();
    this.jobs.clear();
  }
}

// Export singleton instance
export const syncScheduler = new SyncScheduler();
