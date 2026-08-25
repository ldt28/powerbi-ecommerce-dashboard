/**
 * Google Analytics 4 Data API fetcher
 * Supports two auth modes:
 *  1. Service Account JSON (recommended) — credential2 = full JSON string
 *  2. API Key (limited, read-only public data) — credential2 = key string
 * Docs: https://developers.google.com/analytics/devguides/reporting/data/v1
 */

import axios from "axios";
import { GoogleAuth } from "google-auth-library";

export interface GA4Credentials {
  propertyId: string;          // credential1 (e.g. "properties/123456789")
  serviceAccountJson: string;  // credential2 (JSON string of service account key)
}

async function getGA4AccessToken(creds: GA4Credentials): Promise<string> {
  const key = JSON.parse(creds.serviceAccountJson);
  const auth = new GoogleAuth({
    credentials: key,
    scopes: ["https://www.googleapis.com/auth/analytics.readonly"],
  });
  const client = await auth.getClient();
  const tokenResponse = await client.getAccessToken();
  return tokenResponse.token ?? "";
}

export async function fetchGA4Report(creds: GA4Credentials, daysBack: number = 30) {
  const token = await getGA4AccessToken(creds);

  const propertyId = creds.propertyId.replace("properties/", "");
  const endDate = "today";
  const startDate = `${daysBack}daysAgo`;

  const res = await axios.post(
    `https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`,
    {
      dateRanges: [{ startDate, endDate }],
      dimensions: [{ name: "date" }],
      metrics: [
        { name: "sessions" },
        { name: "conversions" },
        { name: "purchaseRevenue" },
        { name: "transactions" },
      ],
    },
    { headers: { Authorization: `Bearer ${token}` } }
  );

  const rows: any[] = res.data?.rows ?? [];
  return rows.map((row) => {
    const dims = row.dimensionValues ?? [];
    const mets = row.metricValues ?? [];
    const dateStr = dims[0]?.value ?? "";
    // Format date from YYYYMMDD to ISO
    const orderDate = dateStr.length === 8
      ? `${dateStr.slice(0, 4)}-${dateStr.slice(4, 6)}-${dateStr.slice(6, 8)}`
      : dateStr;
    return {
      date: orderDate,
      sessions: parseInt(mets[0]?.value ?? "0", 10),
      conversions: parseInt(mets[1]?.value ?? "0", 10),
      revenue: parseFloat(mets[2]?.value ?? "0"),
      transactions: parseInt(mets[3]?.value ?? "0", 10),
    };
  });
}

export async function testGA4Connection(creds: GA4Credentials): Promise<{ ok: boolean; error?: string }> {
  try {
    await getGA4AccessToken(creds);
    return { ok: true };
  } catch (e: any) {
    return { ok: false, error: e?.response?.data?.error?.message ?? e?.message ?? "Unknown error" };
  }
}
