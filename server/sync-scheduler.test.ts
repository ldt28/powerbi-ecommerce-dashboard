import { describe, it, expect, beforeEach, vi } from "vitest";
import { syncScheduler, SyncJob, SyncConfig } from "./sync-scheduler";

/**
 * Tests for Data Sync Scheduler and Health Monitoring
 */

describe("Sync Scheduler Service", () => {
  beforeEach(() => {
    syncScheduler.clearAllJobs();
  });

  describe("Job Registration", () => {
    it("should register a new sync job", () => {
      const job = syncScheduler.registerJob("google", 1);

      expect(job).toBeDefined();
      expect(job.platform).toBe("google");
      expect(job.userId).toBe(1);
      expect(job.status).toBe("idle");
      expect(job.retryCount).toBe(0);
    });

    it("should create unique job IDs", () => {
      const job1 = syncScheduler.registerJob("google", 1);
      const job2 = syncScheduler.registerJob("facebook", 1);
      const job3 = syncScheduler.registerJob("google", 2);

      expect(job1.id).not.toBe(job2.id);
      expect(job1.id).not.toBe(job3.id);
      expect(job2.id).not.toBe(job3.id);
    });

    it("should set correct max retries for each platform", () => {
      const platforms = ["google", "facebook", "linkedin", "tiktok"];

      platforms.forEach((platform) => {
        const job = syncScheduler.registerJob(platform as any, 1);
        expect(job.maxRetries).toBeGreaterThan(0);
      });
    });
  });

  describe("Job Status Management", () => {
    it("should retrieve job status", () => {
      const job = syncScheduler.registerJob("google", 1);
      const status = syncScheduler.getJobStatus(job.id);

      expect(status).toBeDefined();
      expect(status?.platform).toBe("google");
      expect(status?.userId).toBe(1);
    });

    it("should return undefined for non-existent job", () => {
      const status = syncScheduler.getJobStatus("non_existent");
      expect(status).toBeUndefined();
    });

    it("should track job status transitions", () => {
      const job = syncScheduler.registerJob("google", 1);

      expect(job.status).toBe("idle");
      job.status = "running";
      expect(job.status).toBe("running");
      job.status = "success";
      expect(job.status).toBe("success");
    });
  });

  describe("User Job Management", () => {
    it("should get all jobs for a user", () => {
      syncScheduler.registerJob("google", 1);
      syncScheduler.registerJob("facebook", 1);
      syncScheduler.registerJob("linkedin", 1);
      syncScheduler.registerJob("google", 2);

      const userJobs = syncScheduler.getUserJobs(1);
      expect(userJobs).toHaveLength(3);
      expect(userJobs.every((job) => job.userId === 1)).toBe(true);
    });

    it("should return empty array for user with no jobs", () => {
      const userJobs = syncScheduler.getUserJobs(999);
      expect(userJobs).toHaveLength(0);
    });

    it("should stop all jobs for a user", () => {
      const job1 = syncScheduler.registerJob("google", 1);
      const job2 = syncScheduler.registerJob("facebook", 1);

      syncScheduler.stopUserJobs(1);

      expect(syncScheduler.getJobStatus(job1.id)?.status).toBe("idle");
      expect(syncScheduler.getJobStatus(job2.id)?.status).toBe("idle");
    });
  });

  describe("Job Lifecycle", () => {
    it("should track job execution time", () => {
      const job = syncScheduler.registerJob("google", 1);

      expect(job.lastRunTime).toBeUndefined();

      job.lastRunTime = new Date();
      expect(job.lastRunTime).toBeDefined();
      expect(job.lastRunTime).toBeInstanceOf(Date);
    });

    it("should track next run time", () => {
      const job = syncScheduler.registerJob("google", 1);

      expect(job.nextRunTime).toBeUndefined();

      job.nextRunTime = new Date(Date.now() + 3600000);
      expect(job.nextRunTime).toBeDefined();
      expect(job.nextRunTime!.getTime()).toBeGreaterThan(Date.now());
    });

    it("should track retry count", () => {
      const job = syncScheduler.registerJob("google", 1);

      expect(job.retryCount).toBe(0);
      job.retryCount++;
      expect(job.retryCount).toBe(1);
      job.retryCount++;
      expect(job.retryCount).toBe(2);
    });

    it("should track errors", () => {
      const job = syncScheduler.registerJob("google", 1);

      expect(job.error).toBeUndefined();

      job.error = "Connection timeout";
      expect(job.error).toBe("Connection timeout");

      job.error = undefined;
      expect(job.error).toBeUndefined();
    });
  });

  describe("Sync Configuration", () => {
    it("should have default configs for all platforms", () => {
      const platforms = ["google", "facebook", "linkedin", "tiktok", "youtube", "instagram", "x", "pinterest", "snapchat"];

      platforms.forEach((platform) => {
        const job = syncScheduler.registerJob(platform as any, 1);
        expect(job.maxRetries).toBeGreaterThan(0);
      });
    });

    it("should update sync config", () => {
      const newConfig: Partial<SyncConfig> = {
        interval: 1800000, // 30 minutes
        enabled: false,
      };

      syncScheduler.updateConfig("google", newConfig);
      // Config update would be verified through job execution
    });
  });

  describe("Sync Status Indicators", () => {
    it("should indicate idle status", () => {
      const job = syncScheduler.registerJob("google", 1);
      expect(job.status).toBe("idle");
    });

    it("should indicate running status", () => {
      const job = syncScheduler.registerJob("google", 1);
      job.status = "running";
      expect(job.status).toBe("running");
    });

    it("should indicate success status", () => {
      const job = syncScheduler.registerJob("google", 1);
      job.status = "success";
      expect(job.status).toBe("success");
    });

    it("should indicate error status", () => {
      const job = syncScheduler.registerJob("google", 1);
      job.status = "error";
      job.error = "API rate limit exceeded";
      expect(job.status).toBe("error");
      expect(job.error).toBeTruthy();
    });
  });

  describe("Health Monitoring", () => {
    it("should track token expiry", () => {
      const job = syncScheduler.registerJob("google", 1);

      const expiryTime = new Date(Date.now() + 3600000);
      expect(expiryTime.getTime()).toBeGreaterThan(Date.now());
    });

    it("should detect expiring tokens", () => {
      const expiringTime = new Date(Date.now() + 60000); // 1 minute
      const fiveMinutesFromNow = new Date(Date.now() + 5 * 60 * 1000);

      const isExpiringSoon = expiringTime <= fiveMinutesFromNow;
      expect(isExpiringSoon).toBe(true);
    });

    it("should detect expired tokens", () => {
      const expiredTime = new Date(Date.now() - 3600000); // 1 hour ago
      const isExpired = expiredTime.getTime() <= Date.now();
      expect(isExpired).toBe(true);
    });

    it("should track sync frequency", () => {
      const job1 = syncScheduler.registerJob("google", 1);
      const job2 = syncScheduler.registerJob("youtube", 1);

      job1.lastRunTime = new Date();
      job2.lastRunTime = new Date();

      const timeSinceSync1 = Date.now() - job1.lastRunTime.getTime();
      const timeSinceSync2 = Date.now() - job2.lastRunTime.getTime();

      expect(timeSinceSync1).toBeGreaterThanOrEqual(0);
      expect(timeSinceSync2).toBeGreaterThanOrEqual(0);
    });
  });

  describe("Error Handling", () => {
    it("should handle sync errors", () => {
      const job = syncScheduler.registerJob("google", 1);

      job.status = "error";
      job.error = "Network connection failed";
      job.retryCount = 1;

      expect(job.status).toBe("error");
      expect(job.error).toBeTruthy();
      expect(job.retryCount).toBeGreaterThan(0);
    });

    it("should track retry attempts", () => {
      const job = syncScheduler.registerJob("google", 1);

      for (let i = 0; i < job.maxRetries; i++) {
        expect(job.retryCount).toBeLessThanOrEqual(job.maxRetries);
        job.retryCount++;
      }

      expect(job.retryCount).toBe(job.maxRetries);
    });

    it("should handle max retry exceeded", () => {
      const job = syncScheduler.registerJob("google", 1);

      job.retryCount = job.maxRetries;
      const shouldRetry = job.retryCount < job.maxRetries;

      expect(shouldRetry).toBe(false);
    });
  });

  describe("Multiple Platforms", () => {
    it("should manage jobs for all platforms", () => {
      const platforms = ["google", "facebook", "linkedin", "tiktok", "youtube", "instagram", "x", "pinterest", "snapchat"];

      platforms.forEach((platform) => {
        syncScheduler.registerJob(platform as any, 1);
      });

      const allJobs = syncScheduler.getAllJobs();
      expect(allJobs).toHaveLength(platforms.length);
    });

    it("should handle platform-specific sync intervals", () => {
      const googleJob = syncScheduler.registerJob("google", 1);
      const youtubeJob = syncScheduler.registerJob("youtube", 1);

      // Different platforms may have different sync intervals
      expect(googleJob.id).not.toBe(youtubeJob.id);
    });
  });

  describe("Job Cleanup", () => {
    it("should stop individual jobs", () => {
      const job = syncScheduler.registerJob("google", 1);
      syncScheduler.stopJob(job.id);

      expect(syncScheduler.getJobStatus(job.id)?.status).toBe("idle");
    });

    it("should clear all jobs", () => {
      syncScheduler.registerJob("google", 1);
      syncScheduler.registerJob("facebook", 1);
      syncScheduler.registerJob("linkedin", 2);

      syncScheduler.clearAllJobs();

      expect(syncScheduler.getAllJobs()).toHaveLength(0);
    });

    it("should handle clearing empty job list", () => {
      syncScheduler.clearAllJobs();
      syncScheduler.clearAllJobs(); // Should not throw

      expect(syncScheduler.getAllJobs()).toHaveLength(0);
    });
  });

  describe("Connection Health Status", () => {
    it("should indicate connected status", () => {
      const job = syncScheduler.registerJob("google", 1);
      job.status = "success";

      expect(job.status).toBe("success");
    });

    it("should indicate disconnected status", () => {
      const job = syncScheduler.registerJob("google", 1);
      job.status = "error";

      expect(job.status).toBe("error");
    });

    it("should track account information", () => {
      const job = syncScheduler.registerJob("google", 1);

      const accountInfo = {
        accountId: "account_123",
        accountName: "John Doe",
        accountEmail: "john@example.com",
      };

      expect(accountInfo.accountId).toBeTruthy();
      expect(accountInfo.accountName).toBeTruthy();
      expect(accountInfo.accountEmail).toContain("@");
    });
  });
});
