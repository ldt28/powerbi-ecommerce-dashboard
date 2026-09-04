import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import type { Express, Request, Response } from "express";
import * as db from "../db";
import { getSessionCookieOptions } from "./cookies";
import { sdk } from "./sdk";

import axios from "axios";
import { TokenEncryption } from "../utils/encryption";

function getQueryParam(req: Request, key: string): string | undefined {
  const value = req.query[key];
  return typeof value === "string" ? value : undefined;
}

export function registerOAuthRoutes(app: Express) {
  app.get("/api/oauth/callback", async (req: Request, res: Response) => {
    const spapiCode = getQueryParam(req, "spapi_oauth_code") || (req.query.selling_partner_id ? getQueryParam(req, "code") : undefined);
    const sellingPartnerId = getQueryParam(req, "selling_partner_id");
    const rawState = getQueryParam(req, "state");

    // Handle Amazon SP-API OAuth Callback
    if (spapiCode || sellingPartnerId) {
      try {
        const code = spapiCode || getQueryParam(req, "code") || "";
        const clientId = process.env.AMAZON_LWA_CLIENT_ID || "";
        const clientSecret = process.env.AMAZON_LWA_CLIENT_SECRET || "";

        const tokenRes = await axios.post<{ access_token: string; refresh_token: string }>(
          "https://api.amazon.com/auth/o2/token",
          new URLSearchParams({
            grant_type: "authorization_code",
            code: code,
            client_id: clientId,
            client_secret: clientSecret,
          }),
          { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
        );

        let userId = 1;
        let returnUrl = "/settings/connections";
        if (rawState) {
          try {
            const parsed = JSON.parse(rawState);
            if (parsed.userId) userId = Number(parsed.userId);
            if (parsed.returnUrl) returnUrl = parsed.returnUrl;
          } catch {
            if (!isNaN(Number(rawState))) userId = Number(rawState);
          }
        }

        const sellerId = sellingPartnerId || "AMAZON_SELLER";
        const encrypt = (val: string) => TokenEncryption.encrypt(val);

        await db.savePlatformCredential({
          userId,
          platform: "amazon",
          label: `Amazon Store (${sellerId})`,
          credential1: encrypt(sellerId),
          credential2: encrypt("ATVPDKIKX0DER"),
          credential3: encrypt(clientId),
          credential4: encrypt(clientSecret),
          credential5: encrypt(tokenRes.data.refresh_token || ""),
          isActive: 1,
        });

        return res.redirect(302, `${returnUrl}?connected=amazon&status=success`);
      } catch (err) {
        console.error("[Amazon OAuth] Token exchange failed:", err);
        return res.redirect(302, `/settings/connections?error=amazon_auth_failed`);
      }
    }

    const code = getQueryParam(req, "code");
    const state = getQueryParam(req, "state");

    if (!code || !state) {
      res.status(400).json({ error: "code and state are required" });
      return;
    }

    try {
      const tokenResponse = await sdk.exchangeCodeForToken(code, state);
      const userInfo = await sdk.getUserInfo(tokenResponse.accessToken);

      if (!userInfo.openId) {
        res.status(400).json({ error: "openId missing from user info" });
        return;
      }

      await db.upsertUser({
        openId: userInfo.openId,
        name: userInfo.name || null,
        email: userInfo.email ?? null,
        loginMethod: userInfo.loginMethod ?? userInfo.platform ?? null,
        lastSignedIn: new Date().toISOString(),
      });

      const sessionToken = await sdk.createSessionToken(userInfo.openId, {
        name: userInfo.name || "",
        expiresInMs: ONE_YEAR_MS,
      });

      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });

      res.redirect(302, "/");
    } catch (error) {
      console.error("[OAuth] Callback failed", error);
      res.status(500).json({ error: "OAuth callback failed" });
    }
  });
}
