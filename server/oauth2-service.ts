import { getDb } from "./db";
import { oauth2Tokens, InsertOAuth2Token } from "../drizzle/schema";
import { eq, and } from "drizzle-orm";
import crypto from "crypto";

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
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const expiresAt = new Date(Date.now() + (tokenResponse.expires_in || 3600) * 1000);

    return db.insert(oauth2Tokens).values({
      userId,
      platform,
      accessToken: tokenResponse.access_token,
      refreshToken: tokenResponse.refresh_token || null,
      idToken: tokenResponse.id_token || null,
      tokenType: tokenResponse.token_type,
      expiresAt,
      scope,
      accountId: userInfo.id,
      accountEmail: userInfo.email || null,
      accountName: userInfo.name || null,
      profilePicture: userInfo.picture || null,
      isActive: 1,
    });
  }

  /**
   * Get stored OAuth2 token
   */
  static async getToken(userId: number, platform: string) {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const tokens = await db
      .select()
      .from(oauth2Tokens)
      .where(and(eq(oauth2Tokens.userId, userId), eq(oauth2Tokens.platform, platform)))
      .limit(1);

    return tokens[0] || null;
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
    try {
      const newTokenResponse = await this.refreshAccessToken(platform, token.refreshToken);

      const expiresAt = new Date(Date.now() + (newTokenResponse.expires_in || 3600) * 1000);
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      await db
        .update(oauth2Tokens)
        .set({
          accessToken: newTokenResponse.access_token,
          refreshToken: newTokenResponse.refresh_token || token.refreshToken,
          expiresAt,
          lastRefreshedAt: new Date(),
          refreshAttempts: 0,
          lastRefreshError: null,
        })
        .where(eq(oauth2Tokens.id, token.id));

      return {
        ...token,
        accessToken: newTokenResponse.access_token,
        expiresAt,
      };
    } catch (error) {
      // Update refresh attempt count and error
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      await db
        .update(oauth2Tokens)
        .set({
          refreshAttempts: token.refreshAttempts + 1,
          lastRefreshError: error instanceof Error ? error.message : "Unknown error",
        })
        .where(eq(oauth2Tokens.id, token.id));

      throw error;
    }
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
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      await db
        .delete(oauth2Tokens)
        .where(and(eq(oauth2Tokens.userId, userId), eq(oauth2Tokens.platform, platform)));
    }
  }

  /**
   * List all OAuth2 tokens for a user
   */
  static async listTokens(userId: number) {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    return db
      .select()
      .from(oauth2Tokens)
      .where(eq(oauth2Tokens.userId, userId));
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
