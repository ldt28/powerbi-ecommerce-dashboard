import { getDb } from "./db";
import { apiConnections } from "../drizzle/schema";
import { eq, and } from "drizzle-orm";
import type { InsertApiConnection, ApiConnection } from "../drizzle/schema";

/**
 * Create a new API connection
 */
export async function createApiConnection(
  userId: number,
  data: Omit<InsertApiConnection, "userId" | "createdAt" | "updatedAt">
): Promise<ApiConnection | null> {
  const db = await getDb();
  if (!db) return null;

  const result = await db.insert(apiConnections).values({
    ...data,
    userId,
  } as InsertApiConnection);

  const id = result[0].insertId;
  const connections = await db
    .select()
    .from(apiConnections)
    .where(eq(apiConnections.id, Number(id)))
    .limit(1);

  return connections.length > 0 ? connections[0] : null;
}

/**
 * Get all API connections for a user
 */
export async function getUserApiConnections(userId: number): Promise<ApiConnection[]> {
  const db = await getDb();
  if (!db) return [];

  return db.select().from(apiConnections).where(eq(apiConnections.userId, userId));
}

/**
 * Get API connection by ID
 */
export async function getApiConnectionById(
  connectionId: number,
  userId: number
): Promise<ApiConnection | null> {
  const db = await getDb();
  if (!db) return null;

  const connections = await db
    .select()
    .from(apiConnections)
    .where(and(eq(apiConnections.id, connectionId), eq(apiConnections.userId, userId)))
    .limit(1);

  return connections.length > 0 ? connections[0] : null;
}

/**
 * Get API connections by platform
 */
export async function getApiConnectionsByPlatform(
  userId: number,
  platform: string
): Promise<ApiConnection[]> {
  const db = await getDb();
  if (!db) return [];

  return db
    .select()
    .from(apiConnections)
    .where(and(eq(apiConnections.userId, userId), eq(apiConnections.platform, platform)));
}

/**
 * Update API connection
 */
export async function updateApiConnection(
  connectionId: number,
  userId: number,
  data: Partial<Omit<InsertApiConnection, "userId" | "createdAt">>
): Promise<ApiConnection | null> {
  const db = await getDb();
  if (!db) return null;

  await db
    .update(apiConnections)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(and(eq(apiConnections.id, connectionId), eq(apiConnections.userId, userId)));

  return getApiConnectionById(connectionId, userId);
}

/**
 * Delete API connection
 */
export async function deleteApiConnection(
  connectionId: number,
  userId: number
): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;

  const result = await db
    .delete(apiConnections)
    .where(and(eq(apiConnections.id, connectionId), eq(apiConnections.userId, userId)));

  return true;
}

/**
 * Update sync status
 */
export async function updateSyncStatus(
  connectionId: number,
  userId: number,
  status: "idle" | "syncing" | "error",
  error?: string
): Promise<ApiConnection | null> {
  const db = await getDb();
  if (!db) return null;

  const updateData: any = {
    syncStatus: status,
    updatedAt: new Date(),
  };

  if (status === "error" && error) {
    updateData.syncError = error;
  } else if (status === "idle") {
    updateData.lastSyncedAt = new Date();
    updateData.syncError = null;
  }

  await db
    .update(apiConnections)
    .set(updateData)
    .where(and(eq(apiConnections.id, connectionId), eq(apiConnections.userId, userId)));

  return getApiConnectionById(connectionId, userId);
}

/**
 * Check if connection token is expired
 */
export function isTokenExpired(connection: ApiConnection): boolean {
  if (!connection.expiresAt) {
    return false;
  }

  return new Date() > new Date(connection.expiresAt);
}

/**
 * Get active connections for a user
 */
export async function getActiveApiConnections(userId: number): Promise<ApiConnection[]> {
  const db = await getDb();
  if (!db) return [];

  return db
    .select()
    .from(apiConnections)
    .where(and(eq(apiConnections.userId, userId), eq(apiConnections.isActive, 1)));
}
