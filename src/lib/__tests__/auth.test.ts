import { describe, it, expect } from "vitest";
import { hashPassword, verifyPassword, signToken, verifyToken } from "@/lib/auth";

describe("Password hashing", { timeout: 30_000 }, () => {
  it("hashes a password and verifies it correctly", async () => {
    const plain = "mySecurePassword123";
    const hashed = await hashPassword(plain);

    expect(hashed).not.toBe(plain);
    expect(await verifyPassword(plain, hashed)).toBe(true);
  });

  it("rejects a wrong password", async () => {
    const hashed = await hashPassword("correctPassword");
    expect(await verifyPassword("wrongPassword", hashed)).toBe(false);
  });

  it("produces different hashes for the same input (salted)", async () => {
    const hash1 = await hashPassword("same");
    const hash2 = await hashPassword("same");
    expect(hash1).not.toBe(hash2);
  });
});

describe("JWT sign/verify", () => {
  const payload = { userId: "user_123", role: "customer" as const, email: "test@example.com" };

  it("round-trips a payload through sign and verify", async () => {
    const token = await signToken(payload);
    const result = await verifyToken(token);

    expect(result).not.toBeNull();
    expect(result!.userId).toBe(payload.userId);
    expect(result!.role).toBe(payload.role);
    expect(result!.email).toBe(payload.email);
  });

  it("returns null for a tampered token", async () => {
    const token = await signToken(payload);
    const tampered = token.slice(0, -5) + "XXXXX";
    const result = await verifyToken(tampered);

    expect(result).toBeNull();
  });

  it("returns null for garbage input", async () => {
    const result = await verifyToken("not.a.jwt");
    expect(result).toBeNull();
  });
});
