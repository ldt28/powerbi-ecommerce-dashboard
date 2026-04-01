import axios, { AxiosInstance } from "axios";

/**
 * Facebook Ads API Integration Service
 * Retrieves advertising data from Facebook Ads Manager
 */

export interface FacebookAdsConfig {
  accessToken: string;
  adAccountId: string;
  dateRange: {
    startDate: string;
    endDate: string;
  };
}

export interface AdsMetrics {
  impressions: number;
  clicks: number;
  spend: number;
  conversions: number;
  conversionValue: number;
  ctr: number; // Click-through rate
  cpc: number; // Cost per click
  cpa: number; // Cost per action
  roas: number; // Return on ad spend
}

export interface CampaignMetrics extends AdsMetrics {
  campaignId: string;
  campaignName: string;
  campaignStatus: string;
}

export interface AdSetMetrics extends AdsMetrics {
  adSetId: string;
  adSetName: string;
  adSetStatus: string;
}

export class FacebookAdsService {
  private client: AxiosInstance;
  private baseUrl = "https://graph.facebook.com/v18.0";

  constructor(accessToken: string) {
    this.client = axios.create({
      baseURL: this.baseUrl,
      params: {
        access_token: accessToken,
      },
    });
  }

  /**
   * Get account-level metrics
   */
  async getAccountMetrics(config: FacebookAdsConfig): Promise<AdsMetrics> {
    try {
      const response = await this.client.get(
        `/${config.adAccountId}/insights`,
        {
          params: {
            fields:
              "impressions,clicks,spend,conversions,conversion_values,ctr,cpc,cpp,cpa,roas",
            time_range: {
              since: config.dateRange.startDate,
              until: config.dateRange.endDate,
            },
          },
        }
      );

      const data = response.data.data?.[0] || {};

      return {
        impressions: parseInt(data.impressions || "0"),
        clicks: parseInt(data.clicks || "0"),
        spend: parseFloat(data.spend || "0"),
        conversions: parseInt(data.conversions || "0"),
        conversionValue: parseFloat(data.conversion_values || "0"),
        ctr: parseFloat(data.ctr || "0"),
        cpc: parseFloat(data.cpc || "0"),
        cpa: parseFloat(data.cpa || "0"),
        roas: parseFloat(data.roas || "0"),
      };
    } catch (error) {
      console.error("Error fetching Facebook Ads metrics:", error);
      throw new Error("Failed to fetch Facebook Ads metrics");
    }
  }

  /**
   * Get campaign-level metrics
   */
  async getCampaignMetrics(
    config: FacebookAdsConfig
  ): Promise<CampaignMetrics[]> {
    try {
      const response = await this.client.get(
        `/${config.adAccountId}/campaigns`,
        {
          params: {
            fields:
              "id,name,status,insights{impressions,clicks,spend,conversions,conversion_values,ctr,cpc,cpa,roas}",
            time_range: {
              since: config.dateRange.startDate,
              until: config.dateRange.endDate,
            },
          },
        }
      );

      return (response.data.data || []).map((campaign: any) => {
        const insights = campaign.insights?.data?.[0] || {};

        return {
          campaignId: campaign.id,
          campaignName: campaign.name,
          campaignStatus: campaign.status,
          impressions: parseInt(insights.impressions || "0"),
          clicks: parseInt(insights.clicks || "0"),
          spend: parseFloat(insights.spend || "0"),
          conversions: parseInt(insights.conversions || "0"),
          conversionValue: parseFloat(insights.conversion_values || "0"),
          ctr: parseFloat(insights.ctr || "0"),
          cpc: parseFloat(insights.cpc || "0"),
          cpa: parseFloat(insights.cpa || "0"),
          roas: parseFloat(insights.roas || "0"),
        };
      });
    } catch (error) {
      console.error("Error fetching Facebook Ads campaigns:", error);
      throw new Error("Failed to fetch Facebook Ads campaigns");
    }
  }

  /**
   * Get ad set-level metrics
   */
  async getAdSetMetrics(config: FacebookAdsConfig): Promise<AdSetMetrics[]> {
    try {
      const response = await this.client.get(
        `/${config.adAccountId}/adsets`,
        {
          params: {
            fields:
              "id,name,status,insights{impressions,clicks,spend,conversions,conversion_values,ctr,cpc,cpa,roas}",
            time_range: {
              since: config.dateRange.startDate,
              until: config.dateRange.endDate,
            },
          },
        }
      );

      return (response.data.data || []).map((adSet: any) => {
        const insights = adSet.insights?.data?.[0] || {};

        return {
          adSetId: adSet.id,
          adSetName: adSet.name,
          adSetStatus: adSet.status,
          impressions: parseInt(insights.impressions || "0"),
          clicks: parseInt(insights.clicks || "0"),
          spend: parseFloat(insights.spend || "0"),
          conversions: parseInt(insights.conversions || "0"),
          conversionValue: parseFloat(insights.conversion_values || "0"),
          ctr: parseFloat(insights.ctr || "0"),
          cpc: parseFloat(insights.cpc || "0"),
          cpa: parseFloat(insights.cpa || "0"),
          roas: parseFloat(insights.roas || "0"),
        };
      });
    } catch (error) {
      console.error("Error fetching Facebook Ads ad sets:", error);
      throw new Error("Failed to fetch Facebook Ads ad sets");
    }
  }

  /**
   * Get daily metrics for trend analysis
   */
  async getDailyMetrics(
    config: FacebookAdsConfig
  ): Promise<Array<AdsMetrics & { date: string }>> {
    try {
      const response = await this.client.get(
        `/${config.adAccountId}/insights`,
        {
          params: {
            fields:
              "date_start,impressions,clicks,spend,conversions,conversion_values,ctr,cpc,cpa,roas",
            time_range: {
              since: config.dateRange.startDate,
              until: config.dateRange.endDate,
            },
            time_increment: 1,
          },
        }
      );

      return (response.data.data || []).map((day: any) => ({
        date: day.date_start || "",
        impressions: parseInt(day.impressions || "0"),
        clicks: parseInt(day.clicks || "0"),
        spend: parseFloat(day.spend || "0"),
        conversions: parseInt(day.conversions || "0"),
        conversionValue: parseFloat(day.conversion_values || "0"),
        ctr: parseFloat(day.ctr || "0"),
        cpc: parseFloat(day.cpc || "0"),
        cpa: parseFloat(day.cpa || "0"),
        roas: parseFloat(day.roas || "0"),
      }));
    } catch (error) {
      console.error("Error fetching Facebook Ads daily metrics:", error);
      throw new Error("Failed to fetch Facebook Ads daily metrics");
    }
  }

  /**
   * Get metrics by placement (where ads are shown)
   */
  async getMetricsByPlacement(
    config: FacebookAdsConfig
  ): Promise<Array<AdsMetrics & { placement: string }>> {
    try {
      const response = await this.client.get(
        `/${config.adAccountId}/insights`,
        {
          params: {
            fields:
              "placement,impressions,clicks,spend,conversions,conversion_values,ctr,cpc,cpa,roas",
            time_range: {
              since: config.dateRange.startDate,
              until: config.dateRange.endDate,
            },
            breakdowns: "placement",
          },
        }
      );

      return (response.data.data || []).map((placement: any) => ({
        placement: placement.placement || "unknown",
        impressions: parseInt(placement.impressions || "0"),
        clicks: parseInt(placement.clicks || "0"),
        spend: parseFloat(placement.spend || "0"),
        conversions: parseInt(placement.conversions || "0"),
        conversionValue: parseFloat(placement.conversion_values || "0"),
        ctr: parseFloat(placement.ctr || "0"),
        cpc: parseFloat(placement.cpc || "0"),
        cpa: parseFloat(placement.cpa || "0"),
        roas: parseFloat(placement.roas || "0"),
      }));
    } catch (error) {
      console.error("Error fetching Facebook Ads by placement:", error);
      throw new Error("Failed to fetch Facebook Ads by placement");
    }
  }

  /**
   * Get metrics by device (desktop, mobile, etc.)
   */
  async getMetricsByDevice(
    config: FacebookAdsConfig
  ): Promise<Array<AdsMetrics & { device: string }>> {
    try {
      const response = await this.client.get(
        `/${config.adAccountId}/insights`,
        {
          params: {
            fields:
              "device_platform,impressions,clicks,spend,conversions,conversion_values,ctr,cpc,cpa,roas",
            time_range: {
              since: config.dateRange.startDate,
              until: config.dateRange.endDate,
            },
            breakdowns: "device_platform",
          },
        }
      );

      return (response.data.data || []).map((device: any) => ({
        device: device.device_platform || "unknown",
        impressions: parseInt(device.impressions || "0"),
        clicks: parseInt(device.clicks || "0"),
        spend: parseFloat(device.spend || "0"),
        conversions: parseInt(device.conversions || "0"),
        conversionValue: parseFloat(device.conversion_values || "0"),
        ctr: parseFloat(device.ctr || "0"),
        cpc: parseFloat(device.cpc || "0"),
        cpa: parseFloat(device.cpa || "0"),
        roas: parseFloat(device.roas || "0"),
      }));
    } catch (error) {
      console.error("Error fetching Facebook Ads by device:", error);
      throw new Error("Failed to fetch Facebook Ads by device");
    }
  }

  /**
   * Validate access token
   */
  async validateToken(): Promise<boolean> {
    try {
      const response = await this.client.get("/me");
      return !!response.data.id;
    } catch (error) {
      console.error("Error validating Facebook Ads token:", error);
      return false;
    }
  }
}

export default FacebookAdsService;
