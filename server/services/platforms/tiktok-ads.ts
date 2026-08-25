/**
 * TikTok Ads API data fetcher
 * Uses Access Token + Advertiser ID.
 * Docs: https://business-api.tiktok.com/portal/docs?id=1738864835897345
 */

import axios from "axios";

export interface TikTokAdsCredentials {
  accessToken: string;   // credential1
  advertiserId: string;  // credential2
}

export interface TikTokInsightRow {
  date: string;
  spend: number;
  impressions: number;
  clicks: number;
  conversions: number;
  revenue: number;
  currency: string;
  roas: number;
}

export async function fetchTikTokInsights(
  creds: TikTokAdsCredentials,
  daysBack: number = 30
): Promise<TikTokInsightRow[]> {
  const endDate = new Date().toISOString().split("T")[0];
  const startDate = new Date(Date.now() - daysBack * 86400_000).toISOString().split("T")[0];

  const res = await axios.get(
    "https://business-api.tiktok.com/open_api/v1.3/report/integrated/get/",
    {
      headers: {
        "Access-Token": creds.accessToken,
        "Content-Type": "application/json",
      },
      params: {
        advertiser_id: creds.advertiserId,
        report_type: "BASIC",
        dimensions: JSON.stringify(["stat_time_day"]),
        metrics: JSON.stringify([
          "spend",
          "impressions",
          "clicks",
          "conversion",
          "value",
          "real_time_conversion",
        ]),
        data_level: "AUCTION_ADVERTISER",
        start_date: startDate,
        end_date: endDate,
        page_size: 1000,
      },
    }
  );

  const rows: any[] = res.data?.data?.list ?? [];
  return rows.map((row) => {
    const spend = parseFloat(row.metrics?.spend ?? "0");
    const revenue = parseFloat(row.metrics?.value ?? "0");

    return {
      date: row.dimensions?.stat_time_day?.split(" ")[0] ?? "",
      spend,
      impressions: parseInt(row.metrics?.impressions ?? "0", 10),
      clicks: parseInt(row.metrics?.clicks ?? "0", 10),
      conversions: parseInt(row.metrics?.conversion ?? "0", 10),
      revenue,
      currency: "USD",
      roas: spend > 0 ? revenue / spend : 0,
    };
  });
}

export async function testTikTokConnection(creds: TikTokAdsCredentials): Promise<{ ok: boolean; error?: string }> {
  try {
    const res = await axios.get(
      "https://business-api.tiktok.com/open_api/v1.3/advertiser/info/",
      {
        headers: { "Access-Token": creds.accessToken },
        params: {
          advertiser_ids: JSON.stringify([creds.advertiserId]),
          fields: JSON.stringify(["name", "status"]),
        },
      }
    );
    if (res.data?.code !== 0) {
      return { ok: false, error: res.data?.message ?? "Invalid credentials" };
    }
    return { ok: true };
  } catch (e: any) {
    return { ok: false, error: e?.response?.data?.message ?? e?.message ?? "Unknown error" };
  }
}
