import { router, protectedProcedure } from "../_core/trpc";
import { z } from "zod";
import { OAuth2Service } from "../oauth2-service";
import { TRPCError } from "@trpc/server";

/**
 * OAuth2 Router
 * Handles OAuth2 authentication flows and token management
 */

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

        return {
          url,
          state,
          codeVerifier,
        };
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
        codeVerifier: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        // Exchange code for token
        const tokenResponse = await OAuth2Service.exchangeCodeForToken(
          input.platform,
          input.code,
          input.codeVerifier
        );

        // Get user info
        const userInfo = await OAuth2Service.getUserInfo(
          input.platform,
          tokenResponse.access_token
        );

        // Store token
        await OAuth2Service.storeToken(
          ctx.user.id,
          input.platform,
          tokenResponse,
          userInfo,
          input.state
        );

        return {
          success: true,
          platform: input.platform,
          accountId: userInfo.id,
          accountEmail: userInfo.email,
          accountName: userInfo.name,
        };
      } catch (error) {
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
