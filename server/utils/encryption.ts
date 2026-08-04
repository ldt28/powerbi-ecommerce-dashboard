import crypto from "crypto";

/**
 * Encryption utilities for storing sensitive tokens
 */
export class TokenEncryption {
  private static algorithm = "aes-256-gcm";

  /**
   * Get encryption key from environment
   */
  private static getKey(): Buffer {
    const key = process.env.ENCRYPTION_KEY;
    if (!key) {
      throw new Error("ENCRYPTION_KEY environment variable not set");
    }
    // Ensure key is exactly 32 bytes
    const hash = crypto.createHash("sha256").update(key).digest();
    return hash;
  }

  /**
   * Encrypt a token
   */
  static encrypt(token: string): string {
    const key = this.getKey();
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(this.algorithm, key, iv);

    let encrypted = cipher.update(token, "utf8", "hex");
    encrypted += cipher.final("hex");

    const authTag = (cipher as any).getAuthTag();

    // Combine IV + authTag + encrypted data
    const combined = iv.toString("hex") + authTag.toString("hex") + encrypted;
    return combined;
  }

  /**
   * Decrypt a token
   */
  static decrypt(encryptedData: string): string {
    const key = this.getKey();

    // Extract IV, authTag, and encrypted data
    const iv = Buffer.from(encryptedData.slice(0, 32), "hex");
    const authTag = Buffer.from(encryptedData.slice(32, 64), "hex");
    const encrypted = encryptedData.slice(64);

    const decipher = crypto.createDecipheriv(this.algorithm, key, iv);
    (decipher as any).setAuthTag(authTag);

    let decrypted = decipher.update(encrypted, "hex", "utf8");
    decrypted += decipher.final("utf8");

    return decrypted;
  }
}
