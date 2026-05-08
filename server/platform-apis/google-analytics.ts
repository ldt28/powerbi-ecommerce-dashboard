import { google } from "googleapis";
import { OAuth2Client } from "google-auth-library";

/**
 * Google Analytics API Client
 * Handles OAuth2 authentication and data retrieval from Google Analytics 4
 */

export interface GoogleAnalyticsConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
}

export interface GoogleAnalyticsCredentials {
  accessToken: string;
  refreshToken?: string;
  expiresAt?: Date;
}

export interface GoogleAnalyticsMetrics {
  sessions: number;
  users: number;
  revenue: number;
  conversions: number;
  conversionRate: number;
  avgSessionDuration: number;
  bounceRate: number;
}

export interface GoogleAnalyticsData {
  date: string;
  metrics: GoogleAnalyticsMetrics;
}

class GoogleAnalyticsClient {
  private oauth2Client: OAuth2Client;
  private analytics: any;
  private config: GoogleAnalyticsConfig;

  constructor(config: GoogleAnalyticsConfig) {
    this.config = config;
    this.oauth2Client = new OAuth2Client(
      config.clientId,
      config.clientSecret,
      config.redirectUri
    );
    this.analytics = google.analytics({
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
        "https://www.googleapis.com/auth/analytics.readonly",
        "https://www.googleapis.com/auth/analytics",
      ],
      prompt: "consent",
    });
  }

  /**
   * Exchange authorization code for tokens
   */
  async exchangeCodeForTokens(code: string): Promise<GoogleAnalyticsCredentials> {
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
  setCredentials(credentials: GoogleAnalyticsCredentials): void {
    this.oauth2Client.setCredentials({
      access_token: credentials.accessToken,
      refresh_token: credentials.refreshToken,
      expiry_date: credentials.expiresAt?.getTime(),
    });
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshAccessToken(): Promise<GoogleAnalyticsCredentials> {
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
   * Get Google Analytics 4 property ID from account
   */
  async getPropertyId(accountId: string): Promise<string> {
    try {
      const response = await google
        .analyticsadmin({ version: "v1beta", auth: this.oauth2Client })
        .properties.list({
          filter: `parent:accounts/${accountId}`,
        });

      const properties = response.data.properties || [];
      if (properties.length === 0) {
        throw new Error("No GA4 properties found");
      }

      // Return the first property ID
      return properties[0].name?.split("/")[1] || "";
    } catch (error) {
      console.error("Error getting property ID:", error);
      throw new Error("Failed to get GA4 property ID");
    }
  }

  /**
   * Retrieve Google Analytics data for a date range
   */
  async getAnalyticsData(
    propertyId: string,
    startDate: string,
    endDate: string
  ): Promise<GoogleAnalyticsData[]> {
    try {
      const response = await google
        .analyticsdata({ version: "v1beta", auth: this.oauth2Client })
        .properties.runReport({
          property: `properties/${propertyId}`,
          requestBody: {
            dateRanges: [
              {
                startDate,
                endDate,
              },
            ],
            metrics: [
              { name: "sessions" },
              { name: "totalUsers" },
              { name: "ecommerceRevenue" },
              { name: "conversions" },
              { name: "conversionRate" },
              { name: "averageSessionDuration" },
              { name: "bounceRate" },
            ],
            dimensions: [{ name: "date" }],
          },
        });

      return this.parseAnalyticsResponse(response.data);
    } catch (error) {
      console.error("Error retrieving analytics data:", error);
      throw new Error("Failed to retrieve analytics data");
    }
  }

  /**
   * Get analytics data by traffic source
   */
  async getDataBySource(
    propertyId: string,
    startDate: string,
    endDate: string
  ): Promise<any[]> {
    try {
      const response = await google
        .analyticsdata({ version: "v1beta", auth: this.oauth2Client })
        .properties.runReport({
          property: `properties/${propertyId}`,
          requestBody: {
            dateRanges: [
              {
                startDate,
                endDate,
              },
            ],
            metrics: [
              { name: "sessions" },
              { name: "totalUsers" },
              { name: "ecommerceRevenue" },
            ],
            dimensions: [{ name: "sessionDefaultChannelGroup" }],
          },
        });

      return this.parseSourceResponse(response.data);
    } catch (error) {
      console.error("Error retrieving source data:", error);
      throw new Error("Failed to retrieve traffic source data");
    }
  }

  /**
   * Parse analytics response from API
   */
  private parseAnalyticsResponse(data: any): GoogleAnalyticsData[] {
    const results: GoogleAnalyticsData[] = [];

    if (!data.rows) {
      return results;
    }

    for (const row of data.rows) {
      const date = row.dimensionValues?.[0]?.value || "";
      const values = row.metricValues || [];

      results.push({
        date,
        metrics: {
          sessions: parseInt(values[0]?.value || "0"),
          users: parseInt(values[1]?.value || "0"),
          revenue: parseFloat(values[2]?.value || "0"),
          conversions: parseInt(values[3]?.value || "0"),
          conversionRate: parseFloat(values[4]?.value || "0"),
          avgSessionDuration: parseFloat(values[5]?.value || "0"),
          bounceRate: parseFloat(values[6]?.value || "0"),
        },
      });
    }

    return results;
  }

  /**
   * Parse source response from API
   */
  private parseSourceResponse(data: any): any[] {
    const results: any[] = [];

    if (!data.rows) {
      return results;
    }

    for (const row of data.rows) {
      const source = row.dimensionValues?.[0]?.value || "Unknown";
      const values = row.metricValues || [];

      results.push({
        source,
        sessions: parseInt(values[0]?.value || "0"),
        users: parseInt(values[1]?.value || "0"),
        revenue: parseFloat(values[2]?.value || "0"),
      });
    }

    return results;
  }
}

/**
 * Create Google Analytics client instance
 */
export function createGoogleAnalyticsClient(
  config: GoogleAnalyticsConfig
): GoogleAnalyticsClient {
  return new GoogleAnalyticsClient(config);
}

export default GoogleAnalyticsClient;
