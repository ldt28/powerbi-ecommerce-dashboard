/**
 * Walmart Marketplace API data fetcher
 * Uses Client ID + Client Secret (2-legged OAuth 2.0).
 * Docs: https://developer.walmart.com/api/us/mp/orders
 */

import axios from "axios";

export interface WalmartCredentials {
  clientId: string;     // credential1
  clientSecret: string; // credential2
}

async function getWalmartAccessToken(creds: WalmartCredentials): Promise<string> {
  const basicAuth = Buffer.from(`${creds.clientId}:${creds.clientSecret}`).toString("base64");
  const res = await axios.post<{ access_token: string }>(
    "https://marketplace.walmartapis.com/v3/token",
    new URLSearchParams({ grant_type: "client_credentials" }),
    {
      headers: {
        Authorization: `Basic ${basicAuth}`,
        "Content-Type": "application/x-www-form-urlencoded",
        "WM_SVC.NAME": "Walmart Marketplace",
        "WM_QOS.CORRELATION_ID": crypto.randomUUID(),
      },
    }
  );
  return res.data.access_token;
}

export async function fetchWalmartOrders(creds: WalmartCredentials, daysBack: number = 30) {
  const token = await getWalmartAccessToken(creds);
  const createdStartDate = new Date(Date.now() - daysBack * 86400_000).toISOString();

  const res = await axios.get(
    "https://marketplace.walmartapis.com/v3/orders",
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "WM_SEC.ACCESS_TOKEN": token,
        "WM_QOS.CORRELATION_ID": crypto.randomUUID(),
        "WM_SVC.NAME": "Walmart Marketplace",
        Accept: "application/json",
      },
      params: { createdStartDate, limit: 200 },
    }
  );

  const orders: any[] = res.data?.list?.elements?.order ?? [];
  return orders.map((o) => {
    const total = (o.orderLines?.orderLine ?? []).reduce(
      (sum: number, line: any) => sum + parseFloat(line.charges?.charge?.[0]?.chargeAmount?.amount ?? "0"),
      0
    );
    return {
      orderId: o.purchaseOrderId,
      orderDate: new Date(o.orderDate).toISOString(),
      revenue: total,
      currency: "USD",
      quantity: (o.orderLines?.orderLine ?? []).length,
      productName: o.orderLines?.orderLine?.[0]?.item?.productName ?? null,
      platform: "walmart" as const,
    };
  });
}

export async function testWalmartConnection(creds: WalmartCredentials): Promise<{ ok: boolean; error?: string }> {
  try {
    await getWalmartAccessToken(creds);
    return { ok: true };
  } catch (e: any) {
    return { ok: false, error: e?.response?.data?.message ?? e?.message ?? "Unknown error" };
  }
}
