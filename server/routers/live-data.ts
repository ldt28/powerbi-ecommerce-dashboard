/**
 * Live Data Router — fetches real data from all connected platforms,
 * caches results in SQLite, and exposes unified tRPC procedures.
 */

import { router, protectedProcedure } from "../_core/trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import {
  getPlatformCredentials,
  getPlatformCredential,
  savePlatformCredential,
  deletePlatformCredential,
  updateCredentialTestStatus,
  upsertSalesData,
  upsertAdSpendData,
  getSalesDataByUser,
  getAdSpendByUser,
} from "../db";
import { TokenEncryption } from "../utils/encryption";

import { fetchAmazonOrders, testAmazonConnection, type AmazonCredentials } from "../services/platforms/amazon";
import { fetchBigCommerceOrders, testBigCommerceConnection, type BigCommerceCredentials } from "../services/platforms/bigcommerce";
import { fetchEbayOrders, testEbayConnection, type EbayCredentials } from "../services/platforms/ebay";
import { fetchWalmartOrders, testWalmartConnection, type WalmartCredentials } from "../services/platforms/walmart";
import { fetchGA4Report, testGA4Connection, type GA4Credentials } from "../services/platforms/google-analytics";
import { fetchMetaAdsInsights, testMetaAdsConnection, type MetaAdsCredentials } from "../services/platforms/meta-ads";
import { fetchTikTokInsights, testTikTokConnection, type TikTokAdsCredentials } from "../services/platforms/tiktok-ads";

// --------------------------------------------------------------------------
// Types
// --------------------------------------------------------------------------

const PLATFORMS = ["amazon", "bigcommerce", "ebay", "walmart", "google_analytics", "meta_ads", "tiktok_ads"] as const;
type Platform = typeof PLATFORMS[number];

// In-memory cache to avoid hammering APIs on every dashboard load
const syncCache = new Map<string, { ts: number; result: any }>();
const CACHE_TTL_MS = 15 * 60 * 1000; // 15 minutes

function cacheKey(userId: number, platform: string) { return `${userId}:${platform}`; }

// --------------------------------------------------------------------------
// Helpers — decrypt credentials and build typed cred objects
// --------------------------------------------------------------------------

function decrypt(val: string | null | undefined): string {
  if (!val) return "";
  try { return TokenEncryption.decrypt(val); } catch { return val; }
}

function buildCreds(platform: Platform, cred: any): any {
  const [c1, c2, c3, c4, c5] = [cred.credential1, cred.credential2, cred.credential3, cred.credential4, cred.credential5].map(decrypt);
  switch (platform) {
    case "amazon":          return { sellerId: c1, marketplaceId: c2, clientId: c3, clientSecret: c4, refreshToken: c5 } as AmazonCredentials;
    case "bigcommerce":     return { storeHash: c1, accessToken: c2 } as BigCommerceCredentials;
    case "ebay":            return { appId: c1, certId: c2, devId: c3, refreshToken: c4, environment: (c5?.toLowerCase() === "sandbox" ? "sandbox" : "production") } as EbayCredentials;
    case "walmart":         return { clientId: c1, clientSecret: c2 } as WalmartCredentials;
    case "google_analytics": return { propertyId: c1, serviceAccountJson: c2 } as GA4Credentials;
    case "meta_ads":        return { appId: c1, appSecret: c2, accessToken: c3, adAccountId: c4 } as MetaAdsCredentials;
    case "tiktok_ads":      return { accessToken: c1, advertiserId: c2 } as TikTokAdsCredentials;
  }
}

// --------------------------------------------------------------------------
// Sync a single platform and store results in SQLite
// --------------------------------------------------------------------------

async function syncPlatform(userId: number, platform: Platform, credRow: any, daysBack: number) {
  const key = cacheKey(userId, platform);
  const cached = syncCache.get(key);
  if (cached && Date.now() - cached.ts < CACHE_TTL_MS) return cached.result;

  const creds = buildCreds(platform, credRow);

  if (platform === "amazon") {
    const orders = await fetchAmazonOrders(creds, daysBack);
    await upsertSalesData(orders.map(o => ({ ...o, userId })));
    const result = { platform, orders: orders.length, revenue: orders.reduce((s, o) => s + o.revenue, 0) };
    syncCache.set(key, { ts: Date.now(), result });
    return result;
  }

  if (platform === "bigcommerce") {
    const orders = await fetchBigCommerceOrders(creds, daysBack);
    await upsertSalesData(orders.map(o => ({ ...o, userId })));
    const result = { platform, orders: orders.length, revenue: orders.reduce((s, o) => s + o.revenue, 0) };
    syncCache.set(key, { ts: Date.now(), result });
    return result;
  }

  if (platform === "ebay") {
    const orders = await fetchEbayOrders(creds, daysBack);
    await upsertSalesData(orders.map(o => ({ ...o, userId })));
    const result = { platform, orders: orders.length, revenue: orders.reduce((s, o) => s + o.revenue, 0) };
    syncCache.set(key, { ts: Date.now(), result });
    return result;
  }

  if (platform === "walmart") {
    const orders = await fetchWalmartOrders(creds, daysBack);
    await upsertSalesData(orders.map(o => ({ ...o, userId })));
    const result = { platform, orders: orders.length, revenue: orders.reduce((s, o) => s + o.revenue, 0) };
    syncCache.set(key, { ts: Date.now(), result });
    return result;
  }

  if (platform === "google_analytics") {
    const rows = await fetchGA4Report(creds, daysBack);
    const result = {
      platform,
      sessions: rows.reduce((s, r) => s + r.sessions, 0),
      conversions: rows.reduce((s, r) => s + r.conversions, 0),
      revenue: rows.reduce((s, r) => s + r.revenue, 0),
      transactions: rows.reduce((s, r) => s + r.transactions, 0),
      daily: rows,
    };
    syncCache.set(key, { ts: Date.now(), result });
    return result;
  }

  if (platform === "meta_ads") {
    const rows = await fetchMetaAdsInsights(creds, daysBack);
    await upsertAdSpendData(rows.map(r => ({
      userId, platform, date: r.date, spend: r.spend,
      impressions: r.impressions, clicks: r.clicks,
      conversions: r.conversions, revenue: r.revenue, currency: r.currency,
    })));
    const result = {
      platform,
      spend: rows.reduce((s, r) => s + r.spend, 0),
      revenue: rows.reduce((s, r) => s + r.revenue, 0),
      impressions: rows.reduce((s, r) => s + r.impressions, 0),
      clicks: rows.reduce((s, r) => s + r.clicks, 0),
      conversions: rows.reduce((s, r) => s + r.conversions, 0),
      roas: (() => { const ts = rows.reduce((s, r) => s + r.spend, 0); const tr = rows.reduce((s, r) => s + r.revenue, 0); return ts > 0 ? tr / ts : 0; })(),
    };
    syncCache.set(key, { ts: Date.now(), result });
    return result;
  }

  if (platform === "tiktok_ads") {
    const rows = await fetchTikTokInsights(creds, daysBack);
    await upsertAdSpendData(rows.map(r => ({
      userId, platform, date: r.date, spend: r.spend,
      impressions: r.impressions, clicks: r.clicks,
      conversions: r.conversions, revenue: r.revenue, currency: r.currency,
    })));
    const result = {
      platform,
      spend: rows.reduce((s, r) => s + r.spend, 0),
      revenue: rows.reduce((s, r) => s + r.revenue, 0),
      impressions: rows.reduce((s, r) => s + r.impressions, 0),
      clicks: rows.reduce((s, r) => s + r.clicks, 0),
      conversions: rows.reduce((s, r) => s + r.conversions, 0),
      roas: (() => { const ts = rows.reduce((s, r) => s + r.spend, 0); const tr = rows.reduce((s, r) => s + r.revenue, 0); return ts > 0 ? tr / ts : 0; })(),
    };
    syncCache.set(key, { ts: Date.now(), result });
    return result;
  }
}

// --------------------------------------------------------------------------
// Router
// --------------------------------------------------------------------------

const credentialInputSchema = z.object({
  platform: z.enum(PLATFORMS),
  label: z.string().min(1),
  credential1: z.string().optional(),
  credential2: z.string().optional(),
  credential3: z.string().optional(),
  credential4: z.string().optional(),
  credential5: z.string().optional(),
});

export const liveDataRouter = router({

  /** List all saved platform connections for the current user */
  listConnections: protectedProcedure.query(async ({ ctx }) => {
    const creds = await getPlatformCredentials(ctx.user.id);
    return creds.map(c => ({
      id: c.id,
      platform: c.platform,
      label: c.label,
      isActive: c.isActive === 1,
      lastTestedAt: c.lastTestedAt,
      lastTestStatus: c.lastTestStatus,
      lastTestError: c.lastTestError,
      lastSyncedAt: c.lastSyncedAt,
    }));
  }),

  /** Save (create or update) credentials for a platform */
  saveConnection: protectedProcedure
    .input(credentialInputSchema)
    .mutation(async ({ input, ctx }) => {
      const encrypt = (v?: string) => v ? TokenEncryption.encrypt(v) : null;
      await savePlatformCredential({
        userId: ctx.user.id,
        platform: input.platform,
        label: input.label,
        credential1: encrypt(input.credential1),
        credential2: encrypt(input.credential2),
        credential3: encrypt(input.credential3),
        credential4: encrypt(input.credential4),
        credential5: encrypt(input.credential5),
        isActive: 1,
      });
      return { success: true };
    }),

  /** Test a platform connection and update last-test status */
  testConnection: protectedProcedure
    .input(z.object({ platform: z.enum(PLATFORMS) }))
    .mutation(async ({ input, ctx }) => {
      const credRow = await getPlatformCredential(ctx.user.id, input.platform);
      if (!credRow) throw new TRPCError({ code: "NOT_FOUND", message: "No credentials saved for this platform" });

      const creds = buildCreds(input.platform as Platform, credRow);
      let result: { ok: boolean; error?: string };

      switch (input.platform) {
        case "amazon":          result = await testAmazonConnection(creds); break;
        case "bigcommerce":     result = await testBigCommerceConnection(creds); break;
        case "ebay":            result = await testEbayConnection(creds); break;
        case "walmart":         result = await testWalmartConnection(creds); break;
        case "google_analytics": result = await testGA4Connection(creds); break;
        case "meta_ads":        result = await testMetaAdsConnection(creds); break;
        case "tiktok_ads":      result = await testTikTokConnection(creds); break;
        default:                result = { ok: false, error: "Unknown platform" };
      }

      await updateCredentialTestStatus(credRow.id, result.ok ? "ok" : "error", result.error);
      return result;
    }),

  /** Remove a platform connection */
  removeConnection: protectedProcedure
    .input(z.object({ platform: z.enum(PLATFORMS) }))
    .mutation(async ({ input, ctx }) => {
      await deletePlatformCredential(ctx.user.id, input.platform);
      syncCache.delete(cacheKey(ctx.user.id, input.platform));
      return { success: true };
    }),

  /** Sync live data from all connected platforms and return aggregated KPIs */
  syncAll: protectedProcedure
    .input(z.object({ daysBack: z.number().min(1).max(365).default(30) }))
    .query(async ({ input, ctx }) => {
      const creds = await getPlatformCredentials(ctx.user.id);
      if (!creds.length) {
        return { connected: 0, platforms: [], totalRevenue: 0, totalOrders: 0, totalAdSpend: 0, totalRoas: 0, errors: [] };
      }

      const results = await Promise.allSettled(
        creds.map(c => syncPlatform(ctx.user.id, c.platform as Platform, c, input.daysBack))
      );

      const platforms: any[] = [];
      const errors: string[] = [];

      results.forEach((r, i) => {
        if (r.status === "fulfilled" && r.value) {
          platforms.push(r.value);
        } else if (r.status === "rejected") {
          errors.push(`${creds[i].platform}: ${r.reason?.message ?? "Sync failed"}`);
        }
      });

      const salesPlatforms = platforms.filter(p => p.orders !== undefined);
      const adPlatforms = platforms.filter(p => p.spend !== undefined);

      const totalRevenue = salesPlatforms.reduce((s, p) => s + (p.revenue ?? 0), 0);
      const totalOrders = salesPlatforms.reduce((s, p) => s + (p.orders ?? 0), 0);
      const totalAdSpend = adPlatforms.reduce((s, p) => s + (p.spend ?? 0), 0);
      const totalAdRevenue = adPlatforms.reduce((s, p) => s + (p.revenue ?? 0), 0);

      return {
        connected: creds.length,
        platforms,
        totalRevenue,
        totalOrders,
        totalAdSpend,
        totalRoas: totalAdSpend > 0 ? totalAdRevenue / totalAdSpend : 0,
        errors,
      };
    }),

  /** Get cached sales data from DB (fast, no API call) */
  getCachedSales: protectedProcedure
    .input(z.object({
      startDate: z.string().optional(),
      endDate: z.string().optional(),
    }))
    .query(async ({ input, ctx }) => {
      const start = input.startDate ? new Date(input.startDate) : undefined;
      const end = input.endDate ? new Date(input.endDate) : undefined;
      const rows = await getSalesDataByUser(ctx.user.id, start, end);

      // Aggregate by platform
      const byPlatform: Record<string, { revenue: number; orders: number }> = {};
      for (const r of rows) {
        if (!byPlatform[r.platform]) byPlatform[r.platform] = { revenue: 0, orders: 0 };
        byPlatform[r.platform].revenue += r.revenue;
        byPlatform[r.platform].orders += 1;
      }

      return {
        total: rows.length,
        totalRevenue: rows.reduce((s, r) => s + r.revenue, 0),
        byPlatform,
        records: rows.slice(0, 500),
      };
    }),

  /** Get cached ad spend data from DB */
  getCachedAdSpend: protectedProcedure
    .input(z.object({
      startDate: z.string().optional(),
      endDate: z.string().optional(),
    }))
    .query(async ({ input, ctx }) => {
      const start = input.startDate ? new Date(input.startDate) : undefined;
      const end = input.endDate ? new Date(input.endDate) : undefined;
      const rows = await getAdSpendByUser(ctx.user.id, start, end);

      const byPlatform: Record<string, { spend: number; revenue: number; roas: number }> = {};
      for (const r of rows) {
        if (!byPlatform[r.platform]) byPlatform[r.platform] = { spend: 0, revenue: 0, roas: 0 };
        byPlatform[r.platform].spend += r.spend;
        byPlatform[r.platform].revenue += r.revenue ?? 0;
      }
      for (const k of Object.keys(byPlatform)) {
        const p = byPlatform[k];
        p.roas = p.spend > 0 ? p.revenue / p.spend : 0;
      }

      return {
        totalSpend: rows.reduce((s, r) => s + r.spend, 0),
        byPlatform,
      };
    }),
});
