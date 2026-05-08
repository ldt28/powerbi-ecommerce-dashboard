import { google } from "googleapis";
import { OAuth2Client } from "google-auth-library";

/**
 * YouTube Analytics API Client
 * Handles OAuth2 authentication and data retrieval from YouTube Analytics
 */

export interface YouTubeConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
}

export interface YouTubeCredentials {
  accessToken: string;
  refreshToken?: string;
  expiresAt?: Date;
}

export interface YouTubeMetrics {
  views: number;
  watchTime: number;
  subscribers: number;
  revenue: number;
  cpm: number;
  rpm: number;
  engagement: number;
  likes: number;
  dislikes: number;
  comments: number;
  shares: number;
}

export interface YouTubeData {
  date: string;
  metrics: YouTubeMetrics;
}

export interface YouTubeChannel {
  id: string;
  title: string;
  description: string;
  subscriberCount: number;
  viewCount: number;
  videoCount: number;
  thumbnail: string;
}

class YouTubeAnalyticsClient {
  private oauth2Client: OAuth2Client;
  private youtubeAnalytics: any;
  private youtube: any;
  private config: YouTubeConfig;

  constructor(config: YouTubeConfig) {
    this.config = config;
    this.oauth2Client = new OAuth2Client(
      config.clientId,
      config.clientSecret,
      config.redirectUri
    );
    this.youtubeAnalytics = google.youtubeAnalytics({
      version: "v2",
      auth: this.oauth2Client,
    });
    this.youtube = google.youtube({
      version: "v3",
      auth: this.oauth2Client,
    });
  }

  /**
   * Get OAuth2 authorization URL
   */
  getAuthorizationUrl(): string {
    return this.oauth2Client.generateAuthUrl({
      access_type: "offline",
      scope: [
        "https://www.googleapis.com/auth/youtube.readonly",
        "https://www.googleapis.com/auth/youtube",
        "https://www.googleapis.com/auth/yt-analytics.readonly",
        "https://www.googleapis.com/auth/yt-analytics-monetary.readonly",
      ],
      prompt: "consent",
    });
  }

  /**
   * Exchange authorization code for tokens
   */
  async exchangeCodeForTokens(code: string): Promise<YouTubeCredentials> {
    try {
      const { tokens } = await this.oauth2Client.getToken(code);
      this.oauth2Client.setCredentials(tokens);

      return {
        accessToken: tokens.access_token || "",
        refreshToken: tokens.refresh_token,
        expiresAt: tokens.expiry_date
          ? new Date(tokens.expiry_date)
          : undefined,
      };
    } catch (error) {
      console.error("Error exchanging code for tokens:", error);
      throw new Error("Failed to exchange authorization code for tokens");
    }
  }

  /**
   * Set credentials for API calls
   */
  setCredentials(credentials: YouTubeCredentials): void {
    this.oauth2Client.setCredentials({
      access_token: credentials.accessToken,
      refresh_token: credentials.refreshToken,
      expiry_date: credentials.expiresAt?.getTime(),
    });
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshAccessToken(): Promise<YouTubeCredentials> {
    try {
      const { credentials } = await this.oauth2Client.refreshAccessToken();
      return {
        accessToken: credentials.access_token || "",
        refreshToken: credentials.refresh_token,
        expiresAt: credentials.expiry_date
          ? new Date(credentials.expiry_date)
          : undefined,
      };
    } catch (error) {
      console.error("Error refreshing access token:", error);
      throw new Error("Failed to refresh access token");
    }
  }

  /**
   * Get authenticated user's channel
   */
  async getChannel(): Promise<YouTubeChannel> {
    try {
      const response = await this.youtube.channels.list({
        part: "snippet,statistics",
        mine: true,
      });

      const channel = response.data.items?.[0];
      if (!channel) {
        throw new Error("No channel found");
      }

      return {
        id: channel.id,
        title: channel.snippet?.title || "",
        description: channel.snippet?.description || "",
        subscriberCount: parseInt(
          channel.statistics?.subscriberCount || "0"
        ),
        viewCount: parseInt(channel.statistics?.viewCount || "0"),
        videoCount: parseInt(channel.statistics?.videoCount || "0"),
        thumbnail: channel.snippet?.thumbnails?.default?.url || "",
      };
    } catch (error) {
      console.error("Error getting channel:", error);
      throw new Error("Failed to retrieve channel information");
    }
  }

  /**
   * Get YouTube Analytics data for a date range
   */
  async getAnalyticsData(
    startDate: string,
    endDate: string
  ): Promise<YouTubeData[]> {
    try {
      const response = await this.youtubeAnalytics.reports.query({
        ids: "channel==MINE",
        startDate,
        endDate,
        metrics:
          "views,estimatedMinutesWatched,subscribersGained,estimatedRevenue,cpm,rpm",
        dimensions: "day",
      });

      return this.parseAnalyticsResponse(response.data);
    } catch (error) {
      console.error("Error retrieving analytics data:", error);
      throw new Error("Failed to retrieve analytics data");
    }
  }

  /**
   * Get YouTube engagement data
   */
  async getEngagementData(
    startDate: string,
    endDate: string
  ): Promise<YouTubeData[]> {
    try {
      const response = await this.youtubeAnalytics.reports.query({
        ids: "channel==MINE",
        startDate,
        endDate,
        metrics:
          "views,likes,dislikes,comments,shares,estimatedMinutesWatched",
        dimensions: "day",
      });

      return this.parseEngagementResponse(response.data);
    } catch (error) {
      console.error("Error retrieving engagement data:", error);
      throw new Error("Failed to retrieve engagement data");
    }
  }

  /**
   * Get video-level analytics
   */
  async getVideoAnalytics(
    startDate: string,
    endDate: string
  ): Promise<any[]> {
    try {
      const response = await this.youtubeAnalytics.reports.query({
        ids: "channel==MINE",
        startDate,
        endDate,
        metrics: "views,estimatedMinutesWatched,likes,dislikes,comments",
        dimensions: "video",
        sort: "-views",
        maxResults: 50,
      });

      return this.parseVideoResponse(response.data);
    } catch (error) {
      console.error("Error retrieving video analytics:", error);
      throw new Error("Failed to retrieve video analytics");
    }
  }

  /**
   * Parse analytics response from API
   */
  private parseAnalyticsResponse(data: any): YouTubeData[] {
    const results: YouTubeData[] = [];

    if (!data.rows) {
      return results;
    }

    const headers = data.columnHeaders || [];
    const metricsMap = this.createMetricsMap(headers);

    for (const row of data.rows) {
      const date = row[0] || "";
      const metrics: YouTubeMetrics = {
        views: parseInt(row[metricsMap.views] || "0"),
        watchTime: parseInt(row[metricsMap.watchTime] || "0"),
        subscribers: parseInt(row[metricsMap.subscribers] || "0"),
        revenue: parseFloat(row[metricsMap.revenue] || "0"),
        cpm: parseFloat(row[metricsMap.cpm] || "0"),
        rpm: parseFloat(row[metricsMap.rpm] || "0"),
        engagement: 0,
        likes: 0,
        dislikes: 0,
        comments: 0,
        shares: 0,
      };

      results.push({ date, metrics });
    }

    return results;
  }

  /**
   * Parse engagement response from API
   */
  private parseEngagementResponse(data: any): YouTubeData[] {
    const results: YouTubeData[] = [];

    if (!data.rows) {
      return results;
    }

    const headers = data.columnHeaders || [];
    const metricsMap = this.createEngagementMetricsMap(headers);

    for (const row of data.rows) {
      const date = row[0] || "";
      const views = parseInt(row[metricsMap.views] || "0");
      const likes = parseInt(row[metricsMap.likes] || "0");
      const dislikes = parseInt(row[metricsMap.dislikes] || "0");
      const comments = parseInt(row[metricsMap.comments] || "0");
      const shares = parseInt(row[metricsMap.shares] || "0");
      const watchTime = parseInt(row[metricsMap.watchTime] || "0");

      const engagement = views > 0 ? ((likes + comments + shares) / views) * 100 : 0;

      const metrics: YouTubeMetrics = {
        views,
        watchTime,
        subscribers: 0,
        revenue: 0,
        cpm: 0,
        rpm: 0,
        engagement,
        likes,
        dislikes,
        comments,
        shares,
      };

      results.push({ date, metrics });
    }

    return results;
  }

  /**
   * Parse video response from API
   */
  private parseVideoResponse(data: any): any[] {
    const results: any[] = [];

    if (!data.rows) {
      return results;
    }

    const headers = data.columnHeaders || [];
    const metricsMap = this.createVideoMetricsMap(headers);

    for (const row of data.rows) {
      const videoId = row[0] || "";
      const views = parseInt(row[metricsMap.views] || "0");
      const watchTime = parseInt(row[metricsMap.watchTime] || "0");
      const likes = parseInt(row[metricsMap.likes] || "0");
      const dislikes = parseInt(row[metricsMap.dislikes] || "0");
      const comments = parseInt(row[metricsMap.comments] || "0");

      results.push({
        videoId,
        views,
        watchTime,
        likes,
        dislikes,
        comments,
        engagement: views > 0 ? ((likes + comments) / views) * 100 : 0,
      });
    }

    return results;
  }

  /**
   * Create metrics map from column headers
   */
  private createMetricsMap(headers: any[]): Record<string, number> {
    const map: Record<string, number> = {};
    headers.forEach((header, index) => {
      const name = header.name?.toLowerCase() || "";
      if (name.includes("views")) map.views = index;
      if (name.includes("minuteswatched")) map.watchTime = index;
      if (name.includes("subscribersgained")) map.subscribers = index;
      if (name.includes("revenue")) map.revenue = index;
      if (name.includes("cpm")) map.cpm = index;
      if (name.includes("rpm")) map.rpm = index;
    });
    return map;
  }

  /**
   * Create engagement metrics map from column headers
   */
  private createEngagementMetricsMap(headers: any[]): Record<string, number> {
    const map: Record<string, number> = {};
    headers.forEach((header, index) => {
      const name = header.name?.toLowerCase() || "";
      if (name.includes("views")) map.views = index;
      if (name.includes("likes")) map.likes = index;
      if (name.includes("dislikes")) map.dislikes = index;
      if (name.includes("comments")) map.comments = index;
      if (name.includes("shares")) map.shares = index;
      if (name.includes("minuteswatched")) map.watchTime = index;
    });
    return map;
  }

  /**
   * Create video metrics map from column headers
   */
  private createVideoMetricsMap(headers: any[]): Record<string, number> {
    const map: Record<string, number> = {};
    headers.forEach((header, index) => {
      const name = header.name?.toLowerCase() || "";
      if (name.includes("views")) map.views = index;
      if (name.includes("minuteswatched")) map.watchTime = index;
      if (name.includes("likes")) map.likes = index;
      if (name.includes("dislikes")) map.dislikes = index;
      if (name.includes("comments")) map.comments = index;
    });
    return map;
  }
}

/**
 * Create YouTube Analytics client instance
 */
export function createYouTubeClient(config: YouTubeConfig): YouTubeAnalyticsClient {
  return new YouTubeAnalyticsClient(config);
}

export default YouTubeAnalyticsClient;
