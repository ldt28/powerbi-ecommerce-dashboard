/**
 * BigCommerce REST API data fetcher
 * Uses store hash + access token to pull orders.
 * Docs: https://developer.bigcommerce.com/docs/rest-management/orders
 */

import axios from "axios";

export interface BigCommerceCredentials {
  storeHash: string;     // credential1
  accessToken: string;   // credential2
}

export async function fetchBigCommerceOrders(creds: BigCommerceCredentials, daysBack: number = 30) {
  const minDateCreated = new Date(Date.now() - daysBack * 86400_000)
    .toISOString()
    .replace("T", " ")
    .substring(0, 19);

  const res = await axios.get(
    `https://api.bigcommerce.com/stores/${creds.storeHash}/v2/orders`,
    {
      headers: {
        "X-Auth-Token": creds.accessToken,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      params: {
        min_date_created: minDateCreated,
        limit: 250,
        status_id: 10, // 10 = completed
      },
    }
  );

  const orders: any[] = Array.isArray(res.data) ? res.data : [];
  return orders.map((o) => ({
    orderId: String(o.id),
    orderDate: o.date_created,
    revenue: parseFloat(o.total_inc_tax ?? o.total_ex_tax ?? "0"),
    currency: o.currency_code ?? "USD",
    quantity: parseInt(o.items_total ?? "1", 10),
    productName: null as string | null,
    platform: "bigcommerce" as const,
  }));
}

export async function testBigCommerceConnection(creds: BigCommerceCredentials): Promise<{ ok: boolean; error?: string }> {
  try {
    await axios.get(
      `https://api.bigcommerce.com/stores/${creds.storeHash}/v2/store`,
      { headers: { "X-Auth-Token": creds.accessToken } }
    );
    return { ok: true };
  } catch (e: any) {
    return { ok: false, error: e?.response?.data?.title ?? e?.message ?? "Unknown error" };
  }
}
