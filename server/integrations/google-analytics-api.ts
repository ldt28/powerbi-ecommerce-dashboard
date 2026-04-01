import { google } from "googleapis";
import { OAuth2Client } from "google-auth-library";

/**
 * Google Analytics API Integration Service
 * Retrieves analytics data from Google Analytics 4 property
 */

export interface GoogleAnalyticsConfig {
  accessToken: string;
  refreshToken?: string;
  propertyId: string;
  dateRange: {
    startDate: string;
    endDate: string;
  };
}

export interface AnalyticsMetrics {
  sessions: number;
  users: number;
  newUsers: number;
  bounceRate: number;
  sessionDuration: number;
  revenue: number;
  transactions: number;
  conversionRate: number;
  pageViews: number;
}

export interface AnalyticsDimensions {
  date: string;
  source: string;
  medium: string;
  campaign: string;
  country: string;
  device: string;
}

export class GoogleAnalyticsService {
  private analyticsClient: any;
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

    this.analyticsClient = google.analyticsdata("v1beta");
  }

  /**
   * Get core metrics for a date range
   */
  async getMetrics(config: GoogleAnalyticsConfig): Promise<AnalyticsMetrics> {
    try {
      const response = await this.analyticsClient.properties.runReport({
        auth: this.oauth2Client,
        property: `properties/${config.propertyId}`,
        requestBody: {
          dateRanges: [config.dateRange],
          metrics: [
            { name: "sessions" },
            { name: "activeUsers" },
            { name: "newUsers" },
            { name: "bounceRate" },
            { name: "averageSessionDuration" },
            { name: "ecommerceRevenue" },
            { name: "transactions" },
            { name: "conversionRate" },
            { name: "screenPageViews" },
          ],
        },
      });

      const row = response.data.rows?.[0]?.metricValues || [];

      return {
        sessions: parseInt(row[0]?.value || "0"),
        users: parseInt(row[1]?.value || "0"),
        newUsers: parseInt(row[2]?.value || "0"),
        bounceRate: parseFloat(row[3]?.value || "0"),
        sessionDuration: parseFloat(row[4]?.value || "0"),
        revenue: parseFloat(row[5]?.value || "0"),
        transactions: parseInt(row[6]?.value || "0"),
        conversionRate: parseFloat(row[7]?.value || "0"),
        pageViews: parseInt(row[8]?.value || "0"),
      };
    } catch (error) {
      console.error("Error fetching Google Analytics metrics:", error);
      throw new Error("Failed to fetch Google Analytics metrics");
    }
  }

  /**
   * Get metrics broken down by traffic source
   */
  async getMetricsBySource(
    config: GoogleAnalyticsConfig
  ): Promise<Array<AnalyticsMetrics & { source: string }>> {
    try {
      const response = await this.analyticsClient.properties.runReport({
        auth: this.oauth2Client,
        property: `properties/${config.propertyId}`,
        requestBody: {
          dateRanges: [config.dateRange],
          dimensions: [{ name: "sessionSource" }],
          metrics: [
            { name: "sessions" },
            { name: "activeUsers" },
            { name: "ecommerceRevenue" },
            { name: "transactions" },
            { name: "conversionRate" },
          ],
        },
      });

      return (response.data.rows || []).map((row: any) => ({
        source: row.dimensionValues?.[0]?.value || "unknown",
        sessions: parseInt(row.metricValues?.[0]?.value || "0"),
        users: parseInt(row.metricValues?.[1]?.value || "0"),
        newUsers: 0,
        bounceRate: 0,
        sessionDuration: 0,
        revenue: parseFloat(row.metricValues?.[2]?.value || "0"),
        transactions: parseInt(row.metricValues?.[3]?.value || "0"),
        conversionRate: parseFloat(row.metricValues?.[4]?.value || "0"),
        pageViews: 0,
      }));
    } catch (error) {
      console.error("Error fetching Google Analytics by source:", error);
      throw new Error("Failed to fetch Google Analytics by source");
    }
  }

  /**
   * Get metrics broken down by device type
   */
  async getMetricsByDevice(
    config: GoogleAnalyticsConfig
  ): Promise<Array<AnalyticsMetrics & { device: string }>> {
    try {
      const response = await this.analyticsClient.properties.runReport({
        auth: this.oauth2Client,
        property: `properties/${config.propertyId}`,
        requestBody: {
          dateRanges: [config.dateRange],
          dimensions: [{ name: "deviceCategory" }],
          metrics: [
            { name: "sessions" },
            { name: "activeUsers" },
            { name: "bounceRate" },
            { name: "ecommerceRevenue" },
            { name: "conversionRate" },
          ],
        },
      });

      return (response.data.rows || []).map((row: any) => ({
        device: row.dimensionValues?.[0]?.value || "unknown",
        sessions: parseInt(row.metricValues?.[0]?.value || "0"),
        users: parseInt(row.metricValues?.[1]?.value || "0"),
        newUsers: 0,
        bounceRate: parseFloat(row.metricValues?.[2]?.value || "0"),
        sessionDuration: 0,
        revenue: parseFloat(row.metricValues?.[3]?.value || "0"),
        transactions: 0,
        conversionRate: parseFloat(row.metricValues?.[4]?.value || "0"),
        pageViews: 0,
      }));
    } catch (error) {
      console.error("Error fetching Google Analytics by device:", error);
      throw new Error("Failed to fetch Google Analytics by device");
    }
  }

  /**
   * Get daily metrics for trend analysis
   */
  async getDailyMetrics(
    config: GoogleAnalyticsConfig
  ): Promise<Array<AnalyticsMetrics & { date: string }>> {
    try {
      const response = await this.analyticsClient.properties.runReport({
        auth: this.oauth2Client,
        property: `properties/${config.propertyId}`,
        requestBody: {
          dateRanges: [config.dateRange],
          dimensions: [{ name: "date" }],
          metrics: [
            { name: "sessions" },
            { name: "activeUsers" },
            { name: "ecommerceRevenue" },
            { name: "transactions" },
            { name: "conversionRate" },
          ],
        },
      });

      return (response.data.rows || []).map((row: any) => ({
        date: row.dimensionValues?.[0]?.value || "",
        sessions: parseInt(row.metricValues?.[0]?.value || "0"),
        users: parseInt(row.metricValues?.[1]?.value || "0"),
        newUsers: 0,
        bounceRate: 0,
        sessionDuration: 0,
        revenue: parseFloat(row.metricValues?.[2]?.value || "0"),
        transactions: parseInt(row.metricValues?.[3]?.value || "0"),
        conversionRate: parseFloat(row.metricValues?.[4]?.value || "0"),
        pageViews: 0,
      }));
    } catch (error) {
      console.error("Error fetching Google Analytics daily metrics:", error);
      throw new Error("Failed to fetch Google Analytics daily metrics");
    }
  }

  /**
   * Get conversion data
   */
  async getConversions(config: GoogleAnalyticsConfig): Promise<any> {
    try {
      const response = await this.analyticsClient.properties.runReport({
        auth: this.oauth2Client,
        property: `properties/${config.propertyId}`,
        requestBody: {
          dateRanges: [config.dateRange],
          metrics: [
            { name: "conversions" },
            { name: "conversionValue" },
            { name: "conversionRate" },
          ],
        },
      });

      const row = response.data.rows?.[0]?.metricValues || [];

      return {
        conversions: parseInt(row[0]?.value || "0"),
        conversionValue: parseFloat(row[1]?.value || "0"),
        conversionRate: parseFloat(row[2]?.value || "0"),
      };
    } catch (error) {
      console.error("Error fetching Google Analytics conversions:", error);
      throw new Error("Failed to fetch Google Analytics conversions");
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
      console.error("Error refreshing Google Analytics token:", error);
      throw new Error("Failed to refresh Google Analytics token");
    }
  }
}

export default GoogleAnalyticsService;
