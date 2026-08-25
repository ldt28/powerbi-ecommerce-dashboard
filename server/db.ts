import { eq, and, desc, gte, lte } from "drizzle-orm";
import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import path from "path";
import fs from "fs";
import {
  InsertUser,
  users,
  salesData,
  adSpendData,
  cachedSalesData,
  cachedAdSpendData,
  apiConnections,
  platformCredentials,
  InsertSalesData,
  InsertAdSpendData,
  InsertCachedSalesData,
  InsertCachedAdSpendData,
  InsertApiConnection,
  InsertPlatformCredential,
} from "../drizzle/schema";

// ---------------------------------------------------------------------------
// Database bootstrap — lazily initialised, SQLite file in ./data/
// ---------------------------------------------------------------------------

let _db: ReturnType<typeof drizzle> | null = null;
let _sqlite: Database.Database | null = null;

function getDbPath(): string {
  const dataDir = path.join(process.cwd(), "data");
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
  return path.join(dataDir, "ecommerce.db");
}

export function getDb(): ReturnType<typeof drizzle> {
  if (!_db) {
    try {
      _sqlite = new Database(getDbPath());
      _sqlite.pragma("journal_mode = WAL");
      _sqlite.pragma("foreign_keys = ON");
      _db = drizzle(_sqlite);
      bootstrapSchema(_sqlite);
    } catch (error) {
      console.error("[Database] Failed to open SQLite:", error);
      throw error;
    }
  }
  return _db;
}

/** Create tables if they don't exist — idempotent. */
function bootstrapSchema(db: Database.Database) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      openId TEXT NOT NULL UNIQUE,
      name TEXT,
      email TEXT,
      loginMethod TEXT,
      role TEXT NOT NULL DEFAULT 'user',
      isSuspended INTEGER NOT NULL DEFAULT 0,
      suspendedAt TEXT,
      suspendedReason TEXT,
      passwordResetToken TEXT,
      passwordResetExpiry TEXT,
      createdAt TEXT NOT NULL DEFAULT (datetime('now')),
      updatedAt TEXT NOT NULL DEFAULT (datetime('now')),
      lastSignedIn TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS platform_credentials (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      platform TEXT NOT NULL,
      label TEXT NOT NULL,
      credential1 TEXT,
      credential2 TEXT,
      credential3 TEXT,
      credential4 TEXT,
      credential5 TEXT,
      isActive INTEGER NOT NULL DEFAULT 1,
      lastTestedAt TEXT,
      lastTestStatus TEXT,
      lastTestError TEXT,
      lastSyncedAt TEXT,
      createdAt TEXT NOT NULL DEFAULT (datetime('now')),
      updatedAt TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE INDEX IF NOT EXISTS pc_user_platform_idx ON platform_credentials(userId, platform);

    CREATE TABLE IF NOT EXISTS api_credentials (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      marketplace TEXT NOT NULL,
      apiKey TEXT NOT NULL,
      apiSecret TEXT,
      accessToken TEXT,
      refreshToken TEXT,
      isActive INTEGER NOT NULL DEFAULT 1,
      lastSyncedAt TEXT,
      createdAt TEXT NOT NULL DEFAULT (datetime('now')),
      updatedAt TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS api_connections (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      platform TEXT NOT NULL,
      connectionName TEXT NOT NULL,
      connectionType TEXT NOT NULL,
      accessToken TEXT,
      refreshToken TEXT,
      expiresAt TEXT,
      accountId TEXT,
      accountEmail TEXT,
      accountName TEXT,
      isActive INTEGER NOT NULL DEFAULT 1,
      lastSyncedAt TEXT,
      syncStatus TEXT DEFAULT 'idle',
      syncError TEXT,
      metadata TEXT,
      createdAt TEXT NOT NULL DEFAULT (datetime('now')),
      updatedAt TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE INDEX IF NOT EXISTS ac_user_id_idx ON api_connections(userId);

    CREATE TABLE IF NOT EXISTS sales_data (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      orderId TEXT NOT NULL,
      marketplace TEXT NOT NULL,
      productSku TEXT,
      productName TEXT,
      quantity INTEGER NOT NULL DEFAULT 1,
      unitPrice REAL NOT NULL,
      revenue REAL NOT NULL,
      cogs REAL,
      profit REAL,
      orderDate TEXT NOT NULL,
      createdAt TEXT NOT NULL DEFAULT (datetime('now')),
      updatedAt TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS ad_spend_data (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      marketplace TEXT NOT NULL,
      adSpend REAL NOT NULL,
      impressions INTEGER NOT NULL DEFAULT 0,
      clicks INTEGER NOT NULL DEFAULT 0,
      conversions INTEGER NOT NULL DEFAULT 0,
      revenueFromAds REAL NOT NULL,
      date TEXT NOT NULL,
      createdAt TEXT NOT NULL DEFAULT (datetime('now')),
      updatedAt TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS cached_sales_data (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      platform TEXT NOT NULL,
      orderId TEXT NOT NULL,
      orderDate TEXT NOT NULL,
      revenue REAL NOT NULL,
      quantity INTEGER NOT NULL DEFAULT 1,
      productName TEXT,
      currency TEXT DEFAULT 'USD',
      syncedAt TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE INDEX IF NOT EXISTS csd_user_platform_idx ON cached_sales_data(userId, platform);
    CREATE INDEX IF NOT EXISTS csd_user_date_idx ON cached_sales_data(userId, orderDate);

    CREATE TABLE IF NOT EXISTS cached_ad_spend_data (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      platform TEXT NOT NULL,
      date TEXT NOT NULL,
      spend REAL NOT NULL,
      impressions INTEGER DEFAULT 0,
      clicks INTEGER DEFAULT 0,
      conversions INTEGER DEFAULT 0,
      revenue REAL DEFAULT 0,
      currency TEXT DEFAULT 'USD',
      syncedAt TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE INDEX IF NOT EXISTS casd_user_platform_idx ON cached_ad_spend_data(userId, platform);
    CREATE INDEX IF NOT EXISTS casd_user_date_idx ON cached_ad_spend_data(userId, date);

    CREATE TABLE IF NOT EXISTS custom_dashboards (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      teamId INTEGER,
      name TEXT NOT NULL,
      description TEXT,
      layout TEXT NOT NULL,
      widgets TEXT NOT NULL,
      isPublic INTEGER NOT NULL DEFAULT 0,
      isTemplate INTEGER NOT NULL DEFAULT 0,
      templateCategory TEXT,
      viewCount INTEGER NOT NULL DEFAULT 0,
      lastViewedAt TEXT,
      createdAt TEXT NOT NULL DEFAULT (datetime('now')),
      updatedAt TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS teams (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      ownerId INTEGER NOT NULL REFERENCES users(id),
      name TEXT NOT NULL,
      description TEXT,
      createdAt TEXT NOT NULL DEFAULT (datetime('now')),
      updatedAt TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS team_members (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      teamId INTEGER NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
      userId INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      role TEXT NOT NULL DEFAULT 'viewer',
      joinedAt TEXT NOT NULL DEFAULT (datetime('now')),
      invitedBy INTEGER REFERENCES users(id),
      invitedAt TEXT,
      acceptedAt TEXT,
      status TEXT NOT NULL DEFAULT 'pending'
    );
  `);

  // Migrate columns in existing databases if created before
  try {
    const cols = db.prepare("PRAGMA table_info(users)").all() as { name: string }[];
    const colNames = new Set(cols.map(c => c.name));
    if (!colNames.has("passwordResetToken")) {
      db.exec("ALTER TABLE users ADD COLUMN passwordResetToken TEXT;");
    }
    if (!colNames.has("passwordResetExpiry")) {
      db.exec("ALTER TABLE users ADD COLUMN passwordResetExpiry TEXT;");
    }
  } catch (e) {
    console.warn("[Database] column migration note:", e);
  }
}

// ---------------------------------------------------------------------------
// User operations
// ---------------------------------------------------------------------------

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = getDb();
  const existing = db.select().from(users).where(eq(users.openId, user.openId)).all();

  if (existing.length > 0) {
    const updates: Partial<InsertUser> = { updatedAt: new Date().toISOString() };
    if (user.name !== undefined) updates.name = user.name;
    if (user.email !== undefined) updates.email = user.email;
    if (user.loginMethod !== undefined) updates.loginMethod = user.loginMethod;
    if (user.role !== undefined) updates.role = user.role;
    if (user.lastSignedIn !== undefined) updates.lastSignedIn = typeof user.lastSignedIn === 'string' ? user.lastSignedIn : new Date().toISOString();
    db.update(users).set(updates).where(eq(users.openId, user.openId)).run();
  } else {
    db.insert(users).values({
      ...user,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastSignedIn: typeof user.lastSignedIn === 'string' ? user.lastSignedIn : new Date().toISOString(),
    }).run();
  }
}

export async function getUserByOpenId(openId: string) {
  try {
    const db = getDb();
    const result = db.select().from(users).where(eq(users.openId, openId)).all();
    return result.length > 0 ? result[0] : undefined;
  } catch {
    return undefined;
  }
}

// ---------------------------------------------------------------------------
// Platform credential operations
// ---------------------------------------------------------------------------

export async function savePlatformCredential(cred: InsertPlatformCredential) {
  const db = getDb();
  const existing = db.select().from(platformCredentials)
    .where(and(eq(platformCredentials.userId, cred.userId!), eq(platformCredentials.platform, cred.platform)))
    .all();

  if (existing.length > 0) {
    db.update(platformCredentials).set({ ...cred, updatedAt: new Date().toISOString() })
      .where(eq(platformCredentials.id, existing[0].id)).run();
    return existing[0].id;
  } else {
    const result = db.insert(platformCredentials).values({
      ...cred,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }).run();
    return Number(result.lastInsertRowid);
  }
}

export async function getPlatformCredentials(userId: number) {
  const db = getDb();
  return db.select().from(platformCredentials)
    .where(and(eq(platformCredentials.userId, userId), eq(platformCredentials.isActive, 1)))
    .all();
}

export async function getPlatformCredential(userId: number, platform: string) {
  const db = getDb();
  const results = db.select().from(platformCredentials)
    .where(and(eq(platformCredentials.userId, userId), eq(platformCredentials.platform, platform), eq(platformCredentials.isActive, 1)))
    .all();
  return results[0] ?? null;
}

export async function deletePlatformCredential(userId: number, platform: string) {
  const db = getDb();
  db.update(platformCredentials).set({ isActive: 0 })
    .where(and(eq(platformCredentials.userId, userId), eq(platformCredentials.platform, platform)))
    .run();
}

export async function updateCredentialTestStatus(id: number, status: "ok" | "error", error?: string) {
  const db = getDb();
  db.update(platformCredentials).set({
    lastTestedAt: new Date().toISOString(),
    lastTestStatus: status,
    lastTestError: error ?? null,
  }).where(eq(platformCredentials.id, id)).run();
}

// ---------------------------------------------------------------------------
// Cached data operations
// ---------------------------------------------------------------------------

export async function upsertSalesData(records: InsertCachedSalesData[]) {
  if (!records.length) return;
  const db = getDb();
  for (const r of records) {
    const existing = db.select().from(cachedSalesData)
      .where(and(eq(cachedSalesData.userId, r.userId!), eq(cachedSalesData.platform, r.platform), eq(cachedSalesData.orderId, r.orderId)))
      .all();
    if (!existing.length) {
      db.insert(cachedSalesData).values({ ...r, syncedAt: new Date().toISOString() }).run();
    }
  }
}

export async function upsertAdSpendData(records: InsertCachedAdSpendData[]) {
  if (!records.length) return;
  const db = getDb();
  for (const r of records) {
    const existing = db.select().from(cachedAdSpendData)
      .where(and(eq(cachedAdSpendData.userId, r.userId!), eq(cachedAdSpendData.platform, r.platform), eq(cachedAdSpendData.date, r.date)))
      .all();
    if (existing.length) {
      db.update(cachedAdSpendData).set({ ...r, syncedAt: new Date().toISOString() })
        .where(eq(cachedAdSpendData.id, existing[0].id)).run();
    } else {
      db.insert(cachedAdSpendData).values({ ...r, syncedAt: new Date().toISOString() }).run();
    }
  }
}

export interface NormalizedSalesData {
  id: number;
  userId: number;
  marketplace: string;
  platform: string;
  orderId: string;
  orderDate: string;
  revenue: number;
  quantity: number;
  unitPrice: number;
  cogs: number;
  profit: number;
  productName: string | null;
  productSku: string | null;
  currency: string | null;
  syncedAt: string;
}

export interface NormalizedAdSpendData {
  id: number;
  userId: number;
  marketplace: string;
  platform: string;
  date: string;
  adSpend: number;
  spend: number;
  impressions: number;
  clicks: number;
  conversions: number;
  revenueFromAds: number;
  revenue: number;
  currency: string | null;
  syncedAt: string;
}

export async function getSalesDataByUser(userId: number, startDate?: Date, endDate?: Date): Promise<NormalizedSalesData[]> {
  const db = getDb();
  const cached = db.select().from(cachedSalesData)
    .where(eq(cachedSalesData.userId, userId))
    .orderBy(desc(cachedSalesData.orderDate))
    .all();

  const legacy = db.select().from(salesData)
    .where(eq(salesData.userId, userId))
    .orderBy(desc(salesData.orderDate))
    .all();

  const normalizedCached: NormalizedSalesData[] = cached.map((r) => {
    const rev = Number(r.revenue || 0);
    const qty = Number(r.quantity || 1);
    const cogsVal = rev * 0.7;
    const profitVal = rev - cogsVal;
    return {
      id: r.id,
      userId: r.userId,
      marketplace: r.platform,
      platform: r.platform,
      orderId: r.orderId,
      orderDate: r.orderDate,
      revenue: rev,
      quantity: qty,
      unitPrice: qty > 0 ? rev / qty : rev,
      cogs: cogsVal,
      profit: profitVal,
      productName: r.productName,
      productSku: r.productName,
      currency: r.currency,
      syncedAt: r.syncedAt,
    };
  });

  const normalizedLegacy: NormalizedSalesData[] = legacy.map((r: any) => {
    const rev = Number(r.revenue || 0);
    const qty = Number(r.quantity || 1);
    const cogsVal = Number(r.cogs || rev * 0.7);
    const profitVal = Number(r.profit || (rev - cogsVal));
    return {
      id: r.id,
      userId: r.userId,
      marketplace: r.marketplace || "Direct",
      platform: r.marketplace || "Direct",
      orderId: String(r.id),
      orderDate: r.orderDate,
      revenue: rev,
      quantity: qty,
      unitPrice: Number(r.unitPrice || (qty > 0 ? rev / qty : rev)),
      cogs: cogsVal,
      profit: profitVal,
      productName: r.productName,
      productSku: r.productSku || r.productName,
      currency: "USD",
      syncedAt: r.createdAt || new Date().toISOString(),
    };
  });

  const allRows = [...normalizedCached, ...normalizedLegacy];

  return allRows.filter(r => {
    if (startDate && r.orderDate < startDate.toISOString()) return false;
    if (endDate && r.orderDate > endDate.toISOString()) return false;
    return true;
  });
}

export async function getAdSpendByUser(userId: number, startDate?: Date, endDate?: Date): Promise<NormalizedAdSpendData[]> {
  const db = getDb();
  const cached = db.select().from(cachedAdSpendData)
    .where(eq(cachedAdSpendData.userId, userId))
    .orderBy(desc(cachedAdSpendData.date))
    .all();

  const legacy = db.select().from(adSpendData)
    .where(eq(adSpendData.userId, userId))
    .orderBy(desc(adSpendData.date))
    .all();

  const normalizedCached: NormalizedAdSpendData[] = cached.map((r) => {
    const sp = Number(r.spend || 0);
    const rev = Number(r.revenue || 0);
    return {
      id: r.id,
      userId: r.userId,
      marketplace: r.platform,
      platform: r.platform,
      date: r.date,
      adSpend: sp,
      spend: sp,
      impressions: Number(r.impressions || 0),
      clicks: Number(r.clicks || 0),
      conversions: Number(r.conversions || 0),
      revenueFromAds: rev,
      revenue: rev,
      currency: r.currency,
      syncedAt: r.syncedAt,
    };
  });

  const normalizedLegacy: NormalizedAdSpendData[] = legacy.map((r: any) => {
    const sp = Number(r.adSpend || 0);
    const rev = Number(r.revenueFromAds || 0);
    return {
      id: r.id,
      userId: r.userId,
      marketplace: r.marketplace || "Ad Channel",
      platform: r.marketplace || "Ad Channel",
      date: r.date,
      adSpend: sp,
      spend: sp,
      impressions: Number(r.impressions || 0),
      clicks: Number(r.clicks || 0),
      conversions: Number(r.conversions || 0),
      revenueFromAds: rev,
      revenue: rev,
      currency: "USD",
      syncedAt: r.createdAt || new Date().toISOString(),
    };
  });

  const allRows = [...normalizedCached, ...normalizedLegacy];

  return allRows.filter(r => {
    if (startDate && r.date < startDate.toISOString()) return false;
    if (endDate && r.date > endDate.toISOString()) return false;
    return true;
  });
}

// ---------------------------------------------------------------------------
// Legacy stubs — keep old function signatures so existing routers compile
// ---------------------------------------------------------------------------
export async function insertSalesData(data: InsertSalesData) {
  const db = getDb();
  db.insert(salesData).values({
    ...data,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }).run();
}
export async function getSalesDataByMarketplace(userId: number, marketplace: string) {
  const db = getDb();
  return db.select().from(salesData)
    .where(and(eq(salesData.userId, userId), eq(salesData.marketplace, marketplace)))
    .all();
}
export async function insertAdSpendData(data: InsertAdSpendData) {
  const db = getDb();
  db.insert(adSpendData).values({
    ...data,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }).run();
}
export async function getAdSpendDataByUser(userId: number, startDate?: Date, endDate?: Date) {
  return getAdSpendByUser(userId, startDate, endDate);
}
export async function insertDataSyncLog(_data: any) { /* no-op in SQLite MVP */ }
