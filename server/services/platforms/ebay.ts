/**
 * eBay Analytics & Fulfillment API data fetcher
 * Uses App ID + Cert ID + Dev ID + OAuth refresh token.
 * Docs: https://developer.ebay.com/api-docs/sell/analytics/overview.html
 */

import axios from "axios";

export interface EbayCredentials {
  appId: string;        // credential1
  certId: string;       // credential2
  devId: string;        // credential3
  refreshToken: string; // credential4 (optional 5th would be extra)
}

async function getEbayAccessToken(creds: EbayCredentials): Promise<string> {
  const basicAuth = Buffer.from(`${creds.appId}:${creds.certId}`).toString("base64");
  const res = await axios.post<{ access_token: string }>(
    "https://api.ebay.com/identity/v1/oauth2/token",
    new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: creds.refreshToken,
      scope: "https://api.ebay.com/oauth/api_scope/sell.analytics.readonly https://api.ebay.com/oauth/api_scope/sell.fulfillment.readonly",
    }),
    {
      headers: {
        Authorization: `Basic ${basicAuth}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
    }
  );
  return res.data.access_token;
}

export async function fetchEbayOrders(creds: EbayCredentials, daysBack: number = 30) {
  const token = await getEbayAccessToken(creds);
  const creationDateFrom = new Date(Date.now() - daysBack * 86400_000).toISOString();

  const res = await axios.get(
    "https://api.ebay.com/sell/fulfillment/v1/order",
    {
      headers: { Authorization: `Bearer ${token}` },
      params: {
        filter: `creationdate:[${creationDateFrom}..${new Date().toISOString()}]`,
        limit: 200,
      },
    }
  );

  const orders: any[] = res.data?.orders ?? [];
  return orders.map((o) => ({
    orderId: o.orderId,
    orderDate: o.creationDate,
    revenue: parseFloat(o.pricingSummary?.total?.value ?? "0"),
    currency: o.pricingSummary?.total?.currency ?? "USD",
    quantity: (o.lineItems ?? []).reduce((sum: number, li: any) => sum + (li.quantity ?? 1), 0),
    productName: o.lineItems?.[0]?.title ?? null,
    platform: "ebay" as const,
  }));
}

export async function testEbayConnection(creds: EbayCredentials): Promise<{ ok: boolean; error?: string }> {
  try {
    await getEbayAccessToken(creds);
    return { ok: true };
  } catch (e: any) {
    return { ok: false, error: e?.response?.data?.error_description ?? e?.message ?? "Unknown error" };
  }
}
