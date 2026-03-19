import { eq, and, desc, gte, lte } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, salesData, adSpendData, apiCredentials, dataSyncLog, InsertSalesData, InsertAdSpendData, InsertApiCredential, InsertDataSyncLog } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// Sales Data queries
export async function insertSalesData(data: InsertSalesData) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(salesData).values(data);
}

export async function getSalesDataByUser(userId: number, startDate?: Date, endDate?: Date) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const conditions = [eq(salesData.userId, userId)];
  if (startDate) conditions.push(gte(salesData.orderDate, startDate));
  if (endDate) conditions.push(lte(salesData.orderDate, endDate));
  
  return db.select().from(salesData).where(and(...conditions)).orderBy(desc(salesData.orderDate));
}

export async function getSalesDataByMarketplace(userId: number, marketplace: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.select().from(salesData).where(and(eq(salesData.userId, userId), eq(salesData.marketplace, marketplace)));
}

// Ad Spend Data queries
export async function insertAdSpendData(data: InsertAdSpendData) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(adSpendData).values(data);
}

export async function getAdSpendDataByUser(userId: number, startDate?: Date, endDate?: Date) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const conditions = [eq(adSpendData.userId, userId)];
  if (startDate) conditions.push(gte(adSpendData.date, startDate));
  if (endDate) conditions.push(lte(adSpendData.date, endDate));
  
  return db.select().from(adSpendData).where(and(...conditions)).orderBy(desc(adSpendData.date));
}

// API Credentials queries
export async function insertApiCredential(data: InsertApiCredential) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(apiCredentials).values(data);
}

export async function getApiCredentialsByUser(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.select().from(apiCredentials).where(eq(apiCredentials.userId, userId));
}

export async function getApiCredentialByMarketplace(userId: number, marketplace: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.select().from(apiCredentials).where(and(eq(apiCredentials.userId, userId), eq(apiCredentials.marketplace, marketplace))).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updateApiCredential(id: number, data: Partial<InsertApiCredential>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(apiCredentials).set(data).where(eq(apiCredentials.id, id));
}

// Data Sync Log queries
export async function insertDataSyncLog(data: InsertDataSyncLog) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(dataSyncLog).values(data);
}
