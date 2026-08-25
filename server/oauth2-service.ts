import { getDb } from "./db";
import { oauth2Tokens, InsertOAuth2Token } from "../drizzle/schema";
import { eq, and } from "drizzle-orm";
import crypto from "crypto";
import { TokenEncryption } from "./utils/encryption";

export type OAuth2Token = typeof oauth2Tokens.$inferSelect;

/**
 * Decrypt helper that treats a bad/legacy value as "unusable" instead of
 * throwing, so a token stored before encryption was wired up (or a corrupted
 * row) surfaces as a clear "please reconnect" error instead of a crypto crash.
 */
function tryDecrypt(value: string | null | undefined): string | null {
  if (!value) return null;
  try {
    return TokenEncryption.decrypt(value);
  } catch {
    return null;
  }
}

/**
 * OAuth2 Service
 * Handles OAuth2 token management, refresh logic, and secure storage
 */

export interface OAuth2Config {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  authorizationEndpoint: string;
  tokenEndpoint: string;
  userInfoEndpoint: string;
  revokeEndpoint?: string;
}

export interface OAuth2TokenResponse {
  access_token: string;
  refresh_token?: string;
  id_token?: string;
  token_type: string;
  expires_in: number;
  scope?: string;
}

export interface OAuth2UserInfo {
  id: string;
  email?: string;
  name?: string;
  picture?: string;
}

const OAUTH2_CONFIGS: Record<string, OAuth2Config> = {
  google: {
    clientId: process.env.GOOGLE_OAUTH_CLIENT_ID || "",
    clientSecret: process.env.GOOGLE_OAUTH_CLIENT_SECRET || "",
    redirectUri: `${process.env.VITE_FRONTEND_URL || "http://localhost:3000"}/api/oauth/google/callback`,
    authorizationEndpoint: "https://accounts.google.com/o/oauth2/v2/auth",
    tokenEndpoint: "https://oauth2.googleapis.com/token",
    userInfoEndpoint: "https://www.googleapis.com/oauth2/v2/userinfo",
    revokeEndpoint: "https://oauth2.googleapis.com/revoke",
  },
  facebook: {
    clientId: process.env.FACEBOOK_OAUTH_CLIENT_ID || "",
    clientSecret: process.env.FACEBOOK_OAUTH_CLIENT_SECRET || "",
    redirectUri: `${process.env.VITE_FRONTEND_URL || "http://localhost:3000"}/api/oauth/facebook/callback`,
    authorizationEndpoint: "https://www.facebook.com/v18.0/dialog/oauth",
    tokenEndpoint: "https://graph.facebook.com/v18.0/oauth/access_token",
    userInfoEndpoint: "https://graph.facebook.com/me",
  },
  linkedin: {
    clientId: process.env.LINKEDIN_OAUTH_CLIENT_ID || "",
    clientSecret: process.env.LINKEDIN_OAUTH_CLIENT_SECRET || "",
    redirectUri: `${process.env.VITE_FRONTEND_URL || "http://localhost:3000"}/api/oauth/linkedin/callback`,
    authorizationEndpoint: "https://www.linkedin.com/oauth/v2/authorization",
    tokenEndpoint: "https://www.linkedin.com/oauth/v2/accessToken",
    userInfoEndpoint: "https://api.linkedin.com/v2/me",
  },
  tiktok: {
    clientId: process.env.TIKTOK_OAUTH_CLIENT_ID || "",
    clientSecret: process.env.TIKTOK_OAUTH_CLIENT_SECRET || "",
    redirectUri: `${process.env.VITE_FRONTEND_URL || "http://localhost:3000"}/api/oauth/tiktok/callback`,
    authorizationEndpoint: "https://www.tiktok.com/v1/oauth/authorize",
    tokenEndpoint: "https://open.tiktokapis.com/v1/oauth/token",
    userInfoEndpoint: "https://open.tiktokapis.com/v1/user/info",
  },
};

export class OAuth2Service {
  /**
   * Generate authorization URL for OAuth2 flow
   */
  static generateAuthorizationUrl(
    platform: string,
    userId: number,
    scopes: string[],
    state?: string
  ): { url: string; state: string; codeVerifier: string } {
    const config = OAUTH2_CONFIGS[platform];
    if (!config) {
      throw new Error(`Unsupported OAuth2 platform: ${platform}`);
    }

    // Generate CSRF protection state
    const generatedState = state || crypto.randomBytes(32).toString("hex");

    // Generate PKCE code verifier and challenge
    const codeVerifier = crypto.randomBytes(32).toString("base64url");
    const codeChallenge = crypto
      .createHash("sha256")
      .update(codeVerifier)
      .digest("base64url");

    const params = new URLSearchParams({
      client_id: config.clientId,
      redirect_uri: config.redirectUri,
      response_type: "code",
      scope: scopes.join(" "),
      state: generatedState,
      code_challenge: codeChallenge,
      code_challenge_method: "S256",
    });

    return {
      url: `${config.authorizationEndpoint}?${params.toString()}`,
      state: generatedState,
      codeVerifier,
    };
  }

  /**
   * Exchange authorization code for tokens
   */
  static async exchangeCodeForToken(
    platform: string,
    code: string,
    codeVerifier: string
  ): Promise<OAuth2TokenResponse> {
    const config = OAUTH2_CONFIGS[platform];
    if (!config) {
      throw new Error(`Unsupported OAuth2 platform: ${platform}`);
    }

    const body = new URLSearchParams({
      grant_type: "authorization_code",
      code,
      client_id: config.clientId,
      client_secret: config.clientSecret,
      redirect_uri: config.redirectUri,
      code_verifier: codeVerifier,
    });

    const response = await fetch(config.tokenEndpoint, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: body.toString(),
    });

    if (!response.ok) {
      throw new Error(`Token exchange failed: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Refresh access token using refresh token
   */
  static async refreshAccessToken(
    platform: string,
    refreshToken: string
  ): Promise<OAuth2TokenResponse> {
    const config = OAUTH2_CONFIGS[platform];
    if (!config) {
      throw new Error(`Unsupported OAuth2 platform: ${platform}`);
    }

    const body = new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: refreshToken,
      client_id: config.clientId,
      client_secret: config.clientSecret,
    });

    const response = await fetch(config.tokenEndpoint, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: body.toString(),
    });

    if (!response.ok) {
      throw new Error(`Token refresh failed: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Get user info from OAuth2 provider
   */
  static async getUserInfo(platform: string, accessToken: string): Promise<OAuth2UserInfo> {
    const config = OAUTH2_CONFIGS[platform];
    if (!config) {
      throw new Error(`Unsupported OAuth2 platform: ${platform}`);
    }

    const response = await fetch(config.userInfoEndpoint, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch user info: ${response.statusText}`);
    }

    const data = await response.json();

    // Normalize user info across platforms
    return {
      id: data.id || data.sub || data.user_id,
      email: data.email,
      name: data.name || data.given_name,
      picture: data.picture || data.avatar_url,
    };
  }

  /**
   * Store OAuth2 token in database
   */
  static async storeToken(
    userId: number,
    platform: string,
    tokenResponse: OAuth2TokenResponse,
    userInfo: OAuth2UserInfo,
    scope: string
  ) {
    const db = getDb();

    const expiresAt = new Date(Date.now() + (tokenResponse.expires_in || 3600) * 1000).toISOString();

    db.insert(oauth2Tokens).values({
      userId,
      platform,
      // Tokens are encrypted at rest (AES-256-GCM) since this table holds live
      // credentials for every connected platform. Never store these raw.
      accessToken: TokenEncryption.encrypt(tokenResponse.access_token),
      refreshToken: tokenResponse.refresh_token
        ? TokenEncryption.encrypt(tokenResponse.refresh_token)
        : null,
      idToken: tokenResponse.id_token ? TokenEncryption.encrypt(tokenResponse.id_token) : null,
      tokenType: tokenResponse.token_type,
      expiresAt,
      scope,
      accountId: userInfo.id,
      accountEmail: userInfo.email || null,
      accountName: userInfo.name || null,
      profilePicture: userInfo.picture || null,
      isActive: 1,
      lastRefreshedAt: new Date().toISOString(),
      refreshAttempts: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }).run();
  }

  /**
   * Refresh OAuth2 token
   */
  static async refreshToken(token: OAuth2Token): Promise<OAuth2Token> {
    const config = OAUTH2_CONFIGS[token.platform];
    if (!config || !token.refreshToken) {
      throw new Error(`Cannot refresh token for platform: ${token.platform}`);
    }

    try {
      const response = await fetch(config.tokenEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          grant_type: "refresh_token",
          refresh_token: token.refreshToken,
          client_id: config.clientId,
          client_secret: config.clientSecret,
        }).toString(),
      });

      if (!response.ok) {
        throw new Error(`Failed to refresh token: ${response.statusText}`);
      }

      const newTokenResponse: OAuth2TokenResponse = await response.json();
      const expiresAt = new Date(Date.now() + (newTokenResponse.expires_in || 3600) * 1000).toISOString();
      const db = getDb();

      // token.refreshToken is already decrypted here (getToken decrypts on read),
      // so re-encrypt before persisting the refreshed values.
      const refreshTokenPlain = newTokenResponse.refresh_token || token.refreshToken;

      db
        .update(oauth2Tokens)
        .set({
          accessToken: TokenEncryption.encrypt(newTokenResponse.access_token),
          refreshToken: refreshTokenPlain ? TokenEncryption.encrypt(refreshTokenPlain) : null,
          expiresAt,
          lastRefreshedAt: new Date().toISOString(),
          refreshAttempts: 0,
          lastRefreshError: null,
        })
        .where(eq(oauth2Tokens.id, token.id))
        .run();

      return {
        ...token,
        accessToken: newTokenResponse.access_token,
        expiresAt,
      };
    } catch (error) {
      // Update refresh attempt count and error
      const db = getDb();

      db
        .update(oauth2Tokens)
        .set({
          refreshAttempts: token.refreshAttempts + 1,
          lastRefreshError: error instanceof Error ? error.message : "Unknown error",
        })
        .where(eq(oauth2Tokens.id, token.id))
        .run();

      throw error;
    }
  }

  /**
   * Get stored OAuth2 token (decrypted)
   */
  static async getToken(userId: number, platform: string) {
    const db = getDb();

    const tokens = db
      .select()
      .from(oauth2Tokens)
      .where(and(eq(oauth2Tokens.userId, userId), eq(oauth2Tokens.platform, platform)))
      .limit(1)
      .all();

    const token = tokens[0];
    if (!token) return null;

    const accessToken = tryDecrypt(token.accessToken);
    if (accessToken === null) {
      // Most likely a token that was written before encryption was enabled,
      // or the ENCRYPTION_KEY changed. Either way it's not usable as-is.
      throw new Error(
        `Stored ${platform} token could not be decrypted and is unusable. Please reconnect this platform.`
      );
    }

    return {
      ...token,
      accessToken,
      refreshToken: tryDecrypt(token.refreshToken),
      idToken: tryDecrypt(token.idToken),
    };
  }

  /**
   * Refresh token if expired
   */
  static async ensureValidToken(userId: number, platform: string) {
    const token = await this.getToken(userId, platform);
    if (!token) {
      throw new Error("Token not found");
    }

    // Check if token is expired or expiring soon (within 5 minutes)
    const now = new Date();
    const expiresAt = new Date(token.expiresAt);
    const fiveMinutesFromNow = new Date(now.getTime() + 5 * 60 * 1000);

    if (expiresAt > fiveMinutesFromNow) {
      return token; // Token is still valid
    }

    if (!token.refreshToken) {
      throw new Error("Token expired and no refresh token available");
    }

    // Refresh the token
    return this.refreshToken(token as OAuth2Token);
  }

  /**
   * Revoke OAuth2 token
   */
  static async revokeToken(platform: string, accessToken: string) {
    const config = OAUTH2_CONFIGS[platform];
    if (!config || !config.revokeEndpoint) {
      return; // Platform doesn't support revocation
    }

    try {
      await fetch(config.revokeEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          token: accessToken,
          client_id: config.clientId,
          client_secret: config.clientSecret,
        }).toString(),
      });
    } catch (error) {
      console.error(`Failed to revoke token for ${platform}:`, error);
    }
  }

  /**
   * Delete stored OAuth2 token
   */
  static async deleteToken(userId: number, platform: string) {
    const token = await this.getToken(userId, platform);
    if (token) {
      await this.revokeToken(platform, token.accessToken);
      const db = getDb();

      db
        .delete(oauth2Tokens)
        .where(and(eq(oauth2Tokens.userId, userId), eq(oauth2Tokens.platform, platform)))
        .run();
    }
  }

  /**
   * List all OAuth2 tokens for a user (decrypted)
   */
  static async listTokens(userId: number) {
    const db = getDb();

    const tokens = db
      .select()
      .from(oauth2Tokens)
      .where(eq(oauth2Tokens.userId, userId))
      .all();

    return tokens.map((token) => ({
      ...token,
      accessToken: tryDecrypt(token.accessToken),
      refreshToken: tryDecrypt(token.refreshToken),
      idToken: tryDecrypt(token.idToken),
    }));
  }

  /**
   * Check if token needs refresh
   */
  static isTokenExpired(token: any): boolean {
    const now = new Date();
    const expiresAt = new Date(token.expiresAt);
    return expiresAt <= now;
  }

  /**
   * Check if token is expiring soon (within 5 minutes)
   */
  static isTokenExpiringSoon(token: any): boolean {
    const now = new Date();
    const expiresAt = new Date(token.expiresAt);
    const fiveMinutesFromNow = new Date(now.getTime() + 5 * 60 * 1000);
    return expiresAt <= fiveMinutesFromNow;
  }
}
