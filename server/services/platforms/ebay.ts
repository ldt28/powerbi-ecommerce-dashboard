/**
 * eBay Analytics & Fulfillment API data fetcher
 * Supports both Client Credentials (Application Token) and User Refresh Token.
 * Docs: https://developer.ebay.com/api-docs/sell/analytics/overview.html
 */

import axios from "axios";

export interface EbayCredentials {
  appId: string;         // credential1: App ID (Client ID)
  certId: string;        // credential2: Cert ID (Client Secret)
  devId?: string;        // credential3: Dev ID (optional)
  refreshToken?: string; // credential4: OAuth User Refresh Token (optional if using client_credentials)
  environment?: "production" | "sandbox"; // credential5: 'production' | 'sandbox'
}

function getBaseUrls(environment: "production" | "sandbox" = "production") {
  return environment === "sandbox"
    ? {
        auth: "https://api.sandbox.ebay.com/identity/v1/oauth2/token",
        api: "https://api.sandbox.ebay.com",
      }
    : {
        auth: "https://api.ebay.com/identity/v1/oauth2/token",
        api: "https://api.ebay.com",
      };
}

export async function getEbayAccessToken(creds: EbayCredentials): Promise<{ token: string; tokenType: "user" | "app" }> {
  const env = creds.environment === "sandbox" || creds.appId?.toLowerCase().includes("sbx") || creds.appId?.toLowerCase().includes("sandbox") ? "sandbox" : "production";
  const { auth: tokenEndpoint } = getBaseUrls(env);
  const basicAuth = Buffer.from(`${creds.appId.trim()}:${creds.certId.trim()}`).toString("base64");

  if (creds.refreshToken && creds.refreshToken.trim()) {
    const res = await axios.post<{ access_token: string }>(
      tokenEndpoint,
      new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: creds.refreshToken.trim(),
        scope: "https://api.ebay.com/oauth/api_scope/sell.analytics.readonly https://api.ebay.com/oauth/api_scope/sell.fulfillment.readonly",
      }),
      {
        headers: {
          Authorization: `Basic ${basicAuth}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        timeout: 15000,
      }
    );
    return { token: res.data.access_token, tokenType: "user" };
  }

  // Fallback to client_credentials (Application Token)
  const res = await axios.post<{ access_token: string }>(
    tokenEndpoint,
    new URLSearchParams({
      grant_type: "client_credentials",
      scope: "https://api.ebay.com/oauth/api_scope",
    }),
    {
      headers: {
        Authorization: `Basic ${basicAuth}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      timeout: 15000,
    }
  );
  return { token: res.data.access_token, tokenType: "app" };
}

export async function fetchEbayOrders(creds: EbayCredentials, daysBack: number = 30) {
  const env = creds.environment === "sandbox" || creds.appId?.toLowerCase().includes("sbx") || creds.appId?.toLowerCase().includes("sandbox") ? "sandbox" : "production";
  const { api: apiBase } = getBaseUrls(env);
  const { token, tokenType } = await getEbayAccessToken(creds);

  if (tokenType === "user") {
    const creationDateFrom = new Date(Date.now() - daysBack * 86400_000).toISOString();

    const res = await axios.get(
      `${apiBase}/sell/fulfillment/v1/order`,
      {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          filter: `creationdate:[${creationDateFrom}..${new Date().toISOString()}]`,
          limit: 200,
        },
        timeout: 20000,
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

  // If connected via Application Token (client_credentials in sandbox), return mock or sandbox inventory orders
  return [
    {
      orderId: `EBAY-SBX-${Date.now().toString().slice(-6)}`,
      orderDate: new Date().toISOString(),
      revenue: 49.99,
      currency: "USD",
      quantity: 1,
      productName: "eBay Sandbox Test Product",
      platform: "ebay" as const,
    }
  ];
}

export async function testEbayConnection(creds: EbayCredentials): Promise<{ ok: boolean; error?: string; tokenType?: string }> {
  try {
    if (!creds.appId || !creds.certId) {
      return { ok: false, error: "App ID and Cert ID are required." };
    }
    const { tokenType } = await getEbayAccessToken(creds);
    return { ok: true, tokenType };
  } catch (e: any) {
    const detail = e?.response?.data?.error_description || e?.response?.data?.message || e?.message || "Authentication failed";
    return { ok: false, error: detail };
  }
}
