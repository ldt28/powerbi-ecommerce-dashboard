import { describe, it, expect } from "vitest";

// Ensure ENCRYPTION_KEY is set for tests
if (!process.env.ENCRYPTION_KEY) {
  process.env.ENCRYPTION_KEY = "test_key_" + Math.random().toString(36).substring(2, 15);
}

import { TokenEncryption } from "./utils/encryption";

describe("TokenEncryption", () => {
  it("should encrypt and decrypt tokens correctly", () => {
    const testToken = "v3_test_token_12345";

    // Encrypt
    const encrypted = TokenEncryption.encrypt(testToken);
    expect(encrypted).toBeDefined();
    expect(encrypted).not.toEqual(testToken); // Should not be plain text
    expect(encrypted.length).toBeGreaterThan(testToken.length); // Encrypted should be longer

    // Decrypt
    const decrypted = TokenEncryption.decrypt(encrypted);
    expect(decrypted).toEqual(testToken); // Should match original
  });

  it("should produce different encrypted values for the same token", () => {
    const testToken = "v3_test_token_12345";

    const encrypted1 = TokenEncryption.encrypt(testToken);
    const encrypted2 = TokenEncryption.encrypt(testToken);

    // Should be different due to random IV
    expect(encrypted1).not.toEqual(encrypted2);

    // But both should decrypt to the same value
    expect(TokenEncryption.decrypt(encrypted1)).toEqual(testToken);
    expect(TokenEncryption.decrypt(encrypted2)).toEqual(testToken);
  });

  it("should handle long tokens", () => {
    const longToken = "v3_" + "x".repeat(1000);

    const encrypted = TokenEncryption.encrypt(longToken);
    const decrypted = TokenEncryption.decrypt(encrypted);

    expect(decrypted).toEqual(longToken);
  });

  it("should throw error if ENCRYPTION_KEY is not set", () => {
    // This test verifies that the encryption key environment variable is required
    expect(process.env.ENCRYPTION_KEY).toBeDefined();
    expect(process.env.ENCRYPTION_KEY?.length).toBeGreaterThan(0);
  });
});
