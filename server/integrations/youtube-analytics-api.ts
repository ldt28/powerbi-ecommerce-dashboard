import { google } from "googleapis";
import { OAuth2Client } from "google-auth-library";

/**
 * YouTube Analytics API Integration Service
 * Retrieves analytics data from YouTube channels
 */

export interface YouTubeAnalyticsConfig {
  accessToken: string;
  refreshToken?: string;
  channelId: string;
  dateRange: {
    startDate: string;
    endDate: string;
  };
}

export interface YouTubeMetrics {
  views: number;
  watchTime: number; // in minutes
  subscribers: number;
  subscriberGrowth: number;
  likes: number;
  comments: number;
  shares: number;
  revenue: number;
  cpm: number; // Cost per mille (per 1000 views)
  rpm: number; // Revenue per mille
}

export interface VideoMetrics extends YouTubeMetrics {
  videoId: string;
  videoTitle: string;
  uploadDate: string;
}

export interface DemographicsMetrics {
  ageGroup: string;
  gender: string;
  viewPercentage: number;
  watchTimePercentage: number;
}

export class YouTubeAnalyticsService {
  private analyticsClient: any;
  private youtubeClient: any;
  private oauth2Client: OAuth2Client;

  constructor(accessToken: string, refreshToken?: string) {
    this.oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );

    this.oauth2Client.setCredentials({
      access_token: accessToken,
      refresh_token: refreshToken,
    });

    this.analyticsClient = google.youtubeAnalytics("v2");
    this.youtubeClient = google.youtube("v3");
  }

  /**
   * Get channel-level metrics
   */
  async getChannelMetrics(
    config: YouTubeAnalyticsConfig
  ): Promise<YouTubeMetrics> {
    try {
      const response = await this.analyticsClient.reports.query({
        auth: this.oauth2Client,
        ids: `channel==${config.channelId}`,
        startDate: config.dateRange.startDate,
        endDate: config.dateRange.endDate,
        metrics:
          "views,watchTime,subscribersGained,likes,comments,shares,estimatedRevenue,cpm,rpm",
      });

      const row = response.data.rows?.[0] || [];

      return {
        views: parseInt(row[0] || "0"),
        watchTime: parseInt(row[1] || "0"),
        subscribers: parseInt(row[2] || "0"),
        subscriberGrowth: 0,
        likes: parseInt(row[3] || "0"),
        comments: parseInt(row[4] || "0"),
        shares: parseInt(row[5] || "0"),
        revenue: parseFloat(row[6] || "0"),
        cpm: parseFloat(row[7] || "0"),
        rpm: parseFloat(row[8] || "0"),
      };
    } catch (error) {
      console.error("Error fetching YouTube Analytics metrics:", error);
      throw new Error("Failed to fetch YouTube Analytics metrics");
    }
  }

  /**
   * Get video-level metrics
   */
  async getVideoMetrics(
    config: YouTubeAnalyticsConfig
  ): Promise<VideoMetrics[]> {
    try {
      // First get all videos from the channel
      const videosResponse = await this.youtubeClient.search.list({
        auth: this.oauth2Client,
        channelId: config.channelId,
        part: "snippet",
        maxResults: 50,
        order: "date",
      });

      const videos = videosResponse.data.items || [];

      // Get analytics for each video
      const metricsPromises = videos.map(async (video: any) => {
        const videoId = video.id.videoId;
        const response = await this.analyticsClient.reports.query({
          auth: this.oauth2Client,
          ids: `video==${videoId}`,
          startDate: config.dateRange.startDate,
          endDate: config.dateRange.endDate,
          metrics:
            "views,watchTime,subscribersGained,likes,comments,shares,estimatedRevenue,cpm,rpm",
        });

        const row = response.data.rows?.[0] || [];

        return {
          videoId,
          videoTitle: video.snippet.title,
          uploadDate: video.snippet.publishedAt,
          views: parseInt(row[0] || "0"),
          watchTime: parseInt(row[1] || "0"),
          subscribers: parseInt(row[2] || "0"),
          subscriberGrowth: 0,
          likes: parseInt(row[3] || "0"),
          comments: parseInt(row[4] || "0"),
          shares: parseInt(row[5] || "0"),
          revenue: parseFloat(row[6] || "0"),
          cpm: parseFloat(row[7] || "0"),
          rpm: parseFloat(row[8] || "0"),
        };
      });

      return await Promise.all(metricsPromises);
    } catch (error) {
      console.error("Error fetching YouTube video metrics:", error);
      throw new Error("Failed to fetch YouTube video metrics");
    }
  }

  /**
   * Get daily metrics for trend analysis
   */
  async getDailyMetrics(
    config: YouTubeAnalyticsConfig
  ): Promise<Array<YouTubeMetrics & { date: string }>> {
    try {
      const response = await this.analyticsClient.reports.query({
        auth: this.oauth2Client,
        ids: `channel==${config.channelId}`,
        startDate: config.dateRange.startDate,
        endDate: config.dateRange.endDate,
        metrics: "views,watchTime,subscribersGained,likes,comments,shares",
        dimensions: "day",
      });

      return (response.data.rows || []).map((row: any) => ({
        date: row[0],
        views: parseInt(row[1] || "0"),
        watchTime: parseInt(row[2] || "0"),
        subscribers: parseInt(row[3] || "0"),
        subscriberGrowth: 0,
        likes: parseInt(row[4] || "0"),
        comments: parseInt(row[5] || "0"),
        shares: parseInt(row[6] || "0"),
        revenue: 0,
        cpm: 0,
        rpm: 0,
      }));
    } catch (error) {
      console.error("Error fetching YouTube daily metrics:", error);
      throw new Error("Failed to fetch YouTube daily metrics");
    }
  }

  /**
   * Get traffic source metrics
   */
  async getTrafficSourceMetrics(
    config: YouTubeAnalyticsConfig
  ): Promise<Array<YouTubeMetrics & { source: string }>> {
    try {
      const response = await this.analyticsClient.reports.query({
        auth: this.oauth2Client,
        ids: `channel==${config.channelId}`,
        startDate: config.dateRange.startDate,
        endDate: config.dateRange.endDate,
        metrics: "views,watchTime,likes,comments",
        dimensions: "insightTrafficSourceDetail",
      });

      return (response.data.rows || []).map((row: any) => ({
        source: row[0] || "unknown",
        views: parseInt(row[1] || "0"),
        watchTime: parseInt(row[2] || "0"),
        subscribers: 0,
        subscriberGrowth: 0,
        likes: parseInt(row[3] || "0"),
        comments: parseInt(row[4] || "0"),
        shares: 0,
        revenue: 0,
        cpm: 0,
        rpm: 0,
      }));
    } catch (error) {
      console.error("Error fetching YouTube traffic source metrics:", error);
      throw new Error("Failed to fetch YouTube traffic source metrics");
    }
  }

  /**
   * Get audience demographics
   */
  async getAudienceDemographics(
    config: YouTubeAnalyticsConfig
  ): Promise<DemographicsMetrics[]> {
    try {
      const response = await this.analyticsClient.reports.query({
        auth: this.oauth2Client,
        ids: `channel==${config.channelId}`,
        startDate: config.dateRange.startDate,
        endDate: config.dateRange.endDate,
        metrics: "viewerPercentage,watchTimePercentage",
        dimensions: "ageGroup,gender",
      });

      return (response.data.rows || []).map((row: any) => ({
        ageGroup: row[0] || "unknown",
        gender: row[1] || "unknown",
        viewPercentage: parseFloat(row[2] || "0"),
        watchTimePercentage: parseFloat(row[3] || "0"),
      }));
    } catch (error) {
      console.error("Error fetching YouTube audience demographics:", error);
      throw new Error("Failed to fetch YouTube audience demographics");
    }
  }

  /**
   * Get subscriber growth
   */
  async getSubscriberGrowth(
    config: YouTubeAnalyticsConfig
  ): Promise<Array<{ date: string; subscribers: number }>> {
    try {
      const response = await this.analyticsClient.reports.query({
        auth: this.oauth2Client,
        ids: `channel==${config.channelId}`,
        startDate: config.dateRange.startDate,
        endDate: config.dateRange.endDate,
        metrics: "subscribersGained",
        dimensions: "day",
      });

      return (response.data.rows || []).map((row: any) => ({
        date: row[0],
        subscribers: parseInt(row[1] || "0"),
      }));
    } catch (error) {
      console.error("Error fetching YouTube subscriber growth:", error);
      throw new Error("Failed to fetch YouTube subscriber growth");
    }
  }

  /**
   * Get monetization metrics
   */
  async getMonetizationMetrics(
    config: YouTubeAnalyticsConfig
  ): Promise<any> {
    try {
      const response = await this.analyticsClient.reports.query({
        auth: this.oauth2Client,
        ids: `channel==${config.channelId}`,
        startDate: config.dateRange.startDate,
        endDate: config.dateRange.endDate,
        metrics: "estimatedRevenue,cpm,rpm,adImpressions,monetizedPlaybacks",
      });

      const row = response.data.rows?.[0] || [];

      return {
        revenue: parseFloat(row[0] || "0"),
        cpm: parseFloat(row[1] || "0"),
        rpm: parseFloat(row[2] || "0"),
        adImpressions: parseInt(row[3] || "0"),
        monetizedPlaybacks: parseInt(row[4] || "0"),
      };
    } catch (error) {
      console.error("Error fetching YouTube monetization metrics:", error);
      throw new Error("Failed to fetch YouTube monetization metrics");
    }
  }

  /**
   * Refresh access token if needed
   */
  async refreshAccessToken(): Promise<string> {
    try {
      const { credentials } = await this.oauth2Client.refreshAccessToken();
      return credentials.access_token || "";
    } catch (error) {
      console.error("Error refreshing YouTube Analytics token:", error);
      throw new Error("Failed to refresh YouTube Analytics token");
    }
  }
}

export default YouTubeAnalyticsService;
