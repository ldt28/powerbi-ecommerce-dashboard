import type { Express, Request, Response } from "express";
import * as db from "../db";
import { getSessionCookieOptions } from "./cookies";
import { sdk } from "./sdk";

const DEMO_USER_OPEN_ID = "demo-user-12345";
const DEMO_USER_NAME = "Demo User";
const DEMO_USER_EMAIL = "demo@example.com";
const ONE_YEAR_MS = 365 * 24 * 60 * 60 * 1000;

/**
 * Development-only authentication setup
 * Creates a demo user and auto-logs them in for development purposes
 */
export async function setupDevAuth(app: Express) {
  // Only enable in development mode
  if (process.env.NODE_ENV !== "development") {
    return;
  }

  console.log("[Dev Auth] Setting up development authentication...");

  // Create or update demo user in database
  try {
    await db.upsertUser({
      openId: DEMO_USER_OPEN_ID,
      name: DEMO_USER_NAME,
      email: DEMO_USER_EMAIL,
      loginMethod: "demo",
      lastSignedIn: new Date(),
    });
    console.log("[Dev Auth] Demo user created/updated successfully");
  } catch (error) {
    console.error("[Dev Auth] Failed to create demo user:", error);
  }

  // Add a route to auto-login as demo user
  app.get("/api/dev-login", async (req: Request, res: Response) => {
    try {
      // Create session token for demo user
      const sessionToken = await sdk.createSessionToken(DEMO_USER_OPEN_ID, {
        name: DEMO_USER_NAME,
        expiresInMs: ONE_YEAR_MS,
      });

      // Set session cookie
      const cookieOptions = getSessionCookieOptions(req);
      res.cookie("manus-session", sessionToken, {
        ...cookieOptions,
        maxAge: ONE_YEAR_MS,
      });

      console.log("[Dev Auth] Demo user logged in successfully");

      // Redirect to dashboard
      res.redirect(302, "/dashboard");
    } catch (error) {
      console.error("[Dev Auth] Failed to login demo user:", error);
      res.status(500).json({ error: "Failed to login demo user" });
    }
  });

  // Auto-login middleware: if no session cookie exists, create one for demo user
  app.use((req: Request, res: Response, next) => {
    // Skip API routes and OAuth routes
    if (req.path.startsWith("/api/") || req.path.startsWith("/trpc")) {
      return next();
    }

    // Check if session cookie already exists
    const sessionCookie = req.cookies?.["manus-session"];
    if (sessionCookie) {
      return next();
    }

    // For dashboard routes, auto-login as demo user
    if (req.path.startsWith("/dashboard")) {
      (async () => {
        try {
          const sessionToken = await sdk.createSessionToken(DEMO_USER_OPEN_ID, {
            name: DEMO_USER_NAME,
            expiresInMs: ONE_YEAR_MS,
          });

          const cookieOptions = getSessionCookieOptions(req);
          res.cookie("manus-session", sessionToken, {
            ...cookieOptions,
            maxAge: ONE_YEAR_MS,
          });

          console.log("[Dev Auth] Auto-logged in demo user for dashboard access");
          next();
        } catch (error) {
          console.error("[Dev Auth] Failed to auto-login:", error);
          next();
        }
      })();
    } else {
      next();
    }
  });
}
