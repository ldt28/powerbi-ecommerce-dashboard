import axios, { AxiosInstance } from "axios";

/**
 * Facebook Ads API Client
 * Handles OAuth2 authentication and data retrieval from Facebook Ads Manager
 */

export interface FacebookAdsConfig {
  appId: string;
  appSecret: string;
  redirectUri: string;
  apiVersion?: string;
}

export interface FacebookAdsCredentials {
  accessToken: string;
  refreshToken?: string;
  expiresAt?: Date;
}

export interface FacebookAdsMetrics {
  impressions: number;
  clicks: number;
  spend: number;
  conversions: number;
  conversionRate: number;
  cpc: number;
  cpm: number;
  roas: number;
}

export interface FacebookAdsData {
  date: string;
  campaignId: string;
  campaignName: string;
  metrics: FacebookAdsMetrics;
}

class FacebookAdsClient {
  private apiClient: AxiosInstance;
  private config: FacebookAdsConfig;
  private accessToken: string = "";
  private apiVersion: string;

  constructor(config: FacebookAdsConfig) {
    this.config = config;
    this.apiVersion = config.apiVersion || "v18.0";
    this.apiClient = axios.create({
      baseURL: `https://graph.facebook.com/${this.apiVersion}`,
    });
  }

  /**
   * Get OAuth2 authorization URL
   */
  getAuthorizationUrl(state?: string): string {
    const params = new URLSearchParams({
      client_id: this.config.appId,
      redirect_uri: this.config.redirectUri,
      scope: "ads_management,ads_read",
      response_type: "code",
      state: state || "facebook_oauth",
    });

    return `https://www.facebook.com/${this.apiVersion}/dialog/oauth?${params.toString()}`;
  }

  /**
   * Exchange authorization code for tokens
   */
  async exchangeCodeForTokens(code: string): Promise<FacebookAdsCredentials> {
    try {
      const response = await this.apiClient.get("/oauth/access_token", {
        params: {
          client_id: this.config.appId,
          client_secret: this.config.appSecret,
          redirect_uri: this.config.redirectUri,
          code,
        },
      });

      const { access_token, expires_in } = response.data;

      this.accessToken = access_token;

      return {
        accessToken: access_token,
        expiresAt: expires_in
          ? new Date(Date.now() + expires_in * 1000)
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
  setCredentials(credentials: FacebookAdsCredentials): void {
    this.accessToken = credentials.accessToken;
  }

  /**
   * Get user's ad accounts
   */
  async getAdAccounts(): Promise<any[]> {
    try {
      const response = await this.apiClient.get("/me/adaccounts", {
        params: {
          access_token: this.accessToken,
          fields: "id,name,currency",
        },
      });

      return response.data.data || [];
    } catch (error) {
      console.error("Error getting ad accounts:", error);
      throw new Error("Failed to retrieve ad accounts");
    }
  }

  /**
   * Get campaigns for an ad account
   */
  async getCampaigns(adAccountId: string): Promise<any[]> {
    try {
      const response = await this.apiClient.get(
        `/${adAccountId}/campaigns`,
        {
          params: {
            access_token: this.accessToken,
            fields: "id,name,status,objective,created_time",
          },
        }
      );

      return response.data.data || [];
    } catch (error) {
      console.error("Error getting campaigns:", error);
      throw new Error("Failed to retrieve campaigns");
    }
  }

  /**
   * Get campaign insights (metrics)
   */
  async getCampaignInsights(
    campaignId: string,
    startDate: string,
    endDate: string
  ): Promise<FacebookAdsData[]> {
    try {
      const response = await this.apiClient.get(
        `/${campaignId}/insights`,
        {
          params: {
            access_token: this.accessToken,
            date_start: startDate,
            date_stop: endDate,
            fields:
              "date_start,campaign_name,impressions,clicks,spend,conversions,conversion_rate,cpc,cpm,roas",
            time_increment: "1",
          },
        }
      );

      return this.parseInsightsResponse(response.data.data || []);
    } catch (error) {
      console.error("Error getting campaign insights:", error);
      throw new Error("Failed to retrieve campaign insights");
    }
  }

  /**
   * Get account-level insights
   */
  async getAccountInsights(
    adAccountId: string,
    startDate: string,
    endDate: string
  ): Promise<any> {
    try {
      const response = await this.apiClient.get(
        `/${adAccountId}/insights`,
        {
          params: {
            access_token: this.accessToken,
            date_start: startDate,
            date_stop: endDate,
            fields:
              "date_start,impressions,clicks,spend,conversions,conversion_rate,cpc,cpm,roas",
            time_increment: "1",
          },
        }
      );

      return this.parseAccountInsightsResponse(response.data.data || []);
    } catch (error) {
      console.error("Error getting account insights:", error);
      throw new Error("Failed to retrieve account insights");
    }
  }

  /**
   * Parse campaign insights response
   */
  private parseInsightsResponse(data: any[]): FacebookAdsData[] {
    return data.map((item) => ({
      date: item.date_start || "",
      campaignId: item.campaign_id || "",
      campaignName: item.campaign_name || "",
      metrics: {
        impressions: parseInt(item.impressions || "0"),
        clicks: parseInt(item.clicks || "0"),
        spend: parseFloat(item.spend || "0"),
        conversions: parseInt(item.conversions || "0"),
        conversionRate: parseFloat(item.conversion_rate || "0"),
        cpc: parseFloat(item.cpc || "0"),
        cpm: parseFloat(item.cpm || "0"),
        roas: parseFloat(item.roas || "0"),
      },
    }));
  }

  /**
   * Parse account insights response
   */
  private parseAccountInsightsResponse(data: any[]): any[] {
    return data.map((item) => ({
      date: item.date_start || "",
      metrics: {
        impressions: parseInt(item.impressions || "0"),
        clicks: parseInt(item.clicks || "0"),
        spend: parseFloat(item.spend || "0"),
        conversions: parseInt(item.conversions || "0"),
        conversionRate: parseFloat(item.conversion_rate || "0"),
        cpc: parseFloat(item.cpc || "0"),
        cpm: parseFloat(item.cpm || "0"),
        roas: parseFloat(item.roas || "0"),
      },
    }));
  }
}

/**
 * Create Facebook Ads client instance
 */
export function createFacebookAdsClient(
  config: FacebookAdsConfig
): FacebookAdsClient {
  return new FacebookAdsClient(config);
}

export default FacebookAdsClient;
