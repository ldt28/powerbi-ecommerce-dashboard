/**
 * Meta Ads (Facebook/Instagram) Marketing API fetcher
 * Uses App ID, App Secret, long-lived Access Token, Ad Account ID.
 * Docs: https://developers.facebook.com/docs/marketing-api/insights
 */

import axios from "axios";

export interface MetaAdsCredentials {
  appId: string;        // credential1
  appSecret: string;    // credential2
  accessToken: string;  // credential3 (long-lived user token)
  adAccountId: string;  // credential4 (e.g. "act_123456789")
}

export interface MetaInsightRow {
  date: string;
  spend: number;
  impressions: number;
  clicks: number;
  conversions: number;
  revenue: number;
  currency: string;
  roas: number;
}

export async function fetchMetaAdsInsights(
  creds: MetaAdsCredentials,
  daysBack: number = 30
): Promise<MetaInsightRow[]> {
  const since = new Date(Date.now() - daysBack * 86400_000).toISOString().split("T")[0];
  const until = new Date().toISOString().split("T")[0];
  const accountId = creds.adAccountId.startsWith("act_")
    ? creds.adAccountId
    : `act_${creds.adAccountId}`;

  const res = await axios.get(
    `https://graph.facebook.com/v19.0/${accountId}/insights`,
    {
      params: {
        access_token: creds.accessToken,
        time_range: JSON.stringify({ since, until }),
        time_increment: 1,
        fields: "spend,impressions,clicks,actions,action_values,date_start",
        level: "account",
        limit: 500,
      },
    }
  );

  const rows: any[] = res.data?.data ?? [];
  return rows.map((row) => {
    const purchaseAction = (row.actions ?? []).find((a: any) => a.action_type === "purchase");
    const purchaseValue = (row.action_values ?? []).find((a: any) => a.action_type === "purchase");
    const spend = parseFloat(row.spend ?? "0");
    const revenue = parseFloat(purchaseValue?.value ?? "0");

    return {
      date: row.date_start,
      spend,
      impressions: parseInt(row.impressions ?? "0", 10),
      clicks: parseInt(row.clicks ?? "0", 10),
      conversions: parseInt(purchaseAction?.value ?? "0", 10),
      revenue,
      currency: "USD",
      roas: spend > 0 ? revenue / spend : 0,
    };
  });
}

export async function testMetaAdsConnection(creds: MetaAdsCredentials): Promise<{ ok: boolean; error?: string }> {
  try {
    await axios.get(`https://graph.facebook.com/v19.0/me`, {
      params: { access_token: creds.accessToken, fields: "id,name" },
    });
    return { ok: true };
  } catch (e: any) {
    return { ok: false, error: e?.response?.data?.error?.message ?? e?.message ?? "Unknown error" };
  }
}
