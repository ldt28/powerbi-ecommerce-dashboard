/**
 * Amazon SP-API data fetcher
 * Uses the Selling Partner API (LWA OAuth) to pull orders and revenue.
 * Docs: https://developer-docs.amazon.com/sp-api/docs
 */

import axios from "axios";

export interface AmazonCredentials {
  sellerId: string;        // credential1
  marketplaceId: string;   // credential2 (e.g. ATVPDKIKX0DER = US)
  clientId: string;        // credential3
  clientSecret: string;    // credential4
  refreshToken: string;    // credential5
}

interface LWATokenResponse {
  access_token: string;
  expires_in: number;
}

interface AmazonOrder {
  AmazonOrderId: string;
  PurchaseDate: string;
  OrderTotal?: { Amount: string; CurrencyCode: string };
  OrderStatus: string;
  NumberOfItemsShipped: number;
}

export async function getAmazonAccessToken(creds: AmazonCredentials): Promise<string> {
  const res = await axios.post<LWATokenResponse>(
    "https://api.amazon.com/auth/o2/token",
    new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: creds.refreshToken,
      client_id: creds.clientId,
      client_secret: creds.clientSecret,
    }),
    { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
  );
  return res.data.access_token;
}

export async function fetchAmazonOrders(creds: AmazonCredentials, daysBack: number = 30) {
  const accessToken = await getAmazonAccessToken(creds);
  const createdAfter = new Date(Date.now() - daysBack * 86400_000).toISOString();

  const endpoint = `https://sellingpartnerapi-na.amazon.com`;
  const res = await axios.get<{ payload: { Orders: AmazonOrder[] } }>(
    `${endpoint}/orders/v0/orders`,
    {
      headers: {
        "x-amz-access-token": accessToken,
        "x-amz-date": new Date().toISOString(),
      },
      params: {
        MarketplaceIds: creds.marketplaceId,
        CreatedAfter: createdAfter,
        OrderStatuses: "Shipped,Unshipped,PartiallyShipped",
      },
    }
  );

  return (res.data.payload?.Orders ?? []).map((o) => ({
    orderId: o.AmazonOrderId,
    orderDate: o.PurchaseDate,
    revenue: parseFloat(o.OrderTotal?.Amount ?? "0"),
    currency: o.OrderTotal?.CurrencyCode ?? "USD",
    quantity: o.NumberOfItemsShipped || 1,
    productName: null as string | null,
    platform: "amazon" as const,
  }));
}

export async function testAmazonConnection(creds: AmazonCredentials): Promise<{ ok: boolean; error?: string }> {
  try {
    await getAmazonAccessToken(creds);
    return { ok: true };
  } catch (e: any) {
    return { ok: false, error: e?.response?.data?.error_description ?? e?.message ?? "Unknown error" };
  }
}
