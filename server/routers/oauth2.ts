import { router, protectedProcedure } from "../_core/trpc";
import { z } from "zod";
import { OAuth2Service } from "../oauth2-service";
import { TRPCError } from "@trpc/server";
import crypto from "crypto";
import { ENV } from "../_core/env";
import { getSessionCookieOptions } from "../_core/cookies";

/**
 * OAuth2 Router
 * Handles OAuth2 authentication flows and token management
 */

// Short-lived, server-signed cookie that carries the CSRF `state` and PKCE
// `codeVerifier` between getAuthorizationUrl and handleCallback. Previously
// the client round-tripped both values itself and the server never checked
// them against anything, so the "state" param wasn't actually protecting
// against CSRF. Signing (HMAC) stops a tampered cookie value from being
// accepted even though the cookie itself is already httpOnly.
const OAUTH_STATE_COOKIE = "oauth_flow_state";
const OAUTH_STATE_TTL_MS = 10 * 60 * 1000;

interface OAuthStatePayload {
  platform: string;
  state: string;
  codeVerifier: string;
  userId: number;
  expiresAt: number;
}

function signOAuthStatePayload(payload: string): string {
  return crypto
    .createHmac("sha256", ENV.cookieSecret || "insecure-dev-oauth-state-secret")
    .update(payload)
    .digest("hex");
}

function encodeOAuthState(data: OAuthStatePayload): string {
  const payload = Buffer.from(JSON.stringify(data)).toString("base64url");
  return `${payload}.${signOAuthStatePayload(payload)}`;
}

function decodeOAuthState(cookieValue: unknown): OAuthStatePayload | null {
  if (typeof cookieValue !== "string" || !cookieValue.includes(".")) return null;

  const [payload, signature] = cookieValue.split(".");
  if (!payload || !signature) return null;
  if (signOAuthStatePayload(payload) !== signature) return null;

  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as OAuthStatePayload;
    if (typeof data.expiresAt !== "number" || Date.now() > data.expiresAt) return null;
    return data;
  } catch {
    return null;
  }
}

export const oauth2Router = router({
  /**
   * Generate authorization URL for OAuth2 flow
   */
  getAuthorizationUrl: protectedProcedure
    .input(
      z.object({
        platform: z.enum(["google", "facebook", "linkedin", "tiktok"]),
        scopes: z.array(z.string()).default([]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const { url, state, codeVerifier } = OAuth2Service.generateAuthorizationUrl(
          input.platform,
          ctx.user.id,
          input.scopes
        );

        // Stash state + codeVerifier server-side instead of trusting the client
        // to hand them back unmodified. One-time use, 10 minute expiry.
        const cookieValue = encodeOAuthState({
          platform: input.platform,
          state,
          codeVerifier,
          userId: ctx.user.id,
          expiresAt: Date.now() + OAUTH_STATE_TTL_MS,
        });

        ctx.res.cookie(OAUTH_STATE_COOKIE, cookieValue, {
          ...getSessionCookieOptions(ctx.req),
          maxAge: OAUTH_STATE_TTL_MS,
        });

        return { url, state };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error instanceof Error ? error.message : "Failed to generate authorization URL",
        });
      }
    }),

  /**
   * Handle OAuth2 callback and exchange code for token
   */
  handleCallback: protectedProcedure
    .input(
      z.object({
        platform: z.enum(["google", "facebook", "linkedin", "tiktok"]),
        code: z.string(),
        state: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      const stateData = decodeOAuthState(ctx.req.cookies?.[OAUTH_STATE_COOKIE]);

      // Single-use: clear it regardless of whether validation succeeds below.
      ctx.res.clearCookie(OAUTH_STATE_COOKIE, { path: cookieOptions.path });

      if (
        !stateData ||
        stateData.platform !== input.platform ||
        stateData.state !== input.state ||
        stateData.userId !== ctx.user.id
      ) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Invalid or expired OAuth state. Please restart the connection flow.",
        });
      }

      try {
        // Exchange code for token. codeVerifier comes from the server-held
        // state, never from client input, so it can't be swapped out.
        const tokenResponse = await OAuth2Service.exchangeCodeForToken(
          input.platform,
          input.code,
          stateData.codeVerifier
        );

        // Get user info
        const userInfo = await OAuth2Service.getUserInfo(
          input.platform,
          tokenResponse.access_token
        );

        // Store token. Persist the scope the provider actually granted, not
        // the CSRF state value that was being written into this column before.
        await OAuth2Service.storeToken(
          ctx.user.id,
          input.platform,
          tokenResponse,
          userInfo,
          tokenResponse.scope || ""
        );

        return {
          success: true,
          platform: input.platform,
          accountId: userInfo.id,
          accountEmail: userInfo.email,
          accountName: userInfo.name,
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error instanceof Error ? error.message : "OAuth2 callback failed",
        });
      }
    }),

  /**
   * Get stored OAuth2 token
   */
  getToken: protectedProcedure
    .input(z.object({ platform: z.enum(["google", "facebook", "linkedin", "tiktok"]) }))
    .query(async ({ ctx, input }) => {
      try {
        const token = await OAuth2Service.getToken(ctx.user.id, input.platform);
        if (!token) {
          return null;
        }

        return {
          platform: token.platform,
          accountId: token.accountId,
          accountEmail: token.accountEmail,
          accountName: token.accountName,
          isActive: token.isActive === 1,
          expiresAt: token.expiresAt,
          isExpired: OAuth2Service.isTokenExpired(token),
          isExpiringSoon: OAuth2Service.isTokenExpiringSoon(token),
        };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error instanceof Error ? error.message : "Failed to get token",
        });
      }
    }),

  /**
   * Refresh OAuth2 token
   */
  refreshToken: protectedProcedure
    .input(z.object({ platform: z.enum(["google", "facebook", "linkedin", "tiktok"]) }))
    .mutation(async ({ ctx, input }) => {
      try {
        const token = await OAuth2Service.ensureValidToken(ctx.user.id, input.platform);
        return {
          success: true,
          platform: input.platform,
          expiresAt: token.expiresAt,
        };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error instanceof Error ? error.message : "Failed to refresh token",
        });
      }
    }),

  /**
   * List all OAuth2 tokens for current user
   */
  listTokens: protectedProcedure.query(async ({ ctx }) => {
    try {
      const tokens = await OAuth2Service.listTokens(ctx.user.id);
      return tokens.map((token) => ({
        platform: token.platform,
        accountId: token.accountId,
        accountEmail: token.accountEmail,
        accountName: token.accountName,
        isActive: token.isActive === 1,
        expiresAt: token.expiresAt,
        isExpired: OAuth2Service.isTokenExpired(token),
        isExpiringSoon: OAuth2Service.isTokenExpiringSoon(token),
        lastRefreshedAt: token.lastRefreshedAt,
        refreshAttempts: token.refreshAttempts,
      }));
    } catch (error) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: error instanceof Error ? error.message : "Failed to list tokens",
      });
    }
  }),

  /**
   * Disconnect OAuth2 account
   */
  disconnect: protectedProcedure
    .input(z.object({ platform: z.enum(["google", "facebook", "linkedin", "tiktok"]) }))
    .mutation(async ({ ctx, input }) => {
      try {
        await OAuth2Service.deleteToken(ctx.user.id, input.platform);
        return {
          success: true,
          platform: input.platform,
        };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error instanceof Error ? error.message : "Failed to disconnect account",
        });
      }
    }),

  /**
   * Check token validity and refresh if needed
   */
  validateToken: protectedProcedure
    .input(z.object({ platform: z.enum(["google", "facebook", "linkedin", "tiktok"]) }))
    .query(async ({ ctx, input }) => {
      try {
        const token = await OAuth2Service.getToken(ctx.user.id, input.platform);
        if (!token) {
          return { valid: false, reason: "Token not found" };
        }

        if (!token.isActive) {
          return { valid: false, reason: "Token is inactive" };
        }

        if (OAuth2Service.isTokenExpired(token)) {
          return { valid: false, reason: "Token expired" };
        }

        return {
          valid: true,
          expiresAt: token.expiresAt,
          expiresIn: Math.floor((new Date(token.expiresAt).getTime() - Date.now()) / 1000),
        };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error instanceof Error ? error.message : "Failed to validate token",
        });
      }
    }),
});
