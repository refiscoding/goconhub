import { SignJWT, jwtVerify } from "jose";
import { compare, hash } from "bcryptjs";

// Crash early in production if JWT_SECRET is missing — never rely on a hardcoded fallback
if (process.env.NODE_ENV === "production" && !process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET environment variable is required in production.");
}

const SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET ?? "handyhub-dev-secret-change-in-production"
);

const COOKIE_NAME = "hh_session";
const TOKEN_TTL   = "7d";

// ── Password helpers ──────────────────────────────────────────────────────────

export function hashPassword(plain: string) {
  return hash(plain, 12);
}

export function verifyPassword(plain: string, hashed: string) {
  return compare(plain, hashed);
}

// ── JWT helpers ───────────────────────────────────────────────────────────────

export interface SessionPayload {
  userId: string;
  role:   "customer" | "vendor" | "admin";
  email:  string;
}

export async function signToken(payload: SessionPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(TOKEN_TTL)
    .sign(SECRET);
}

export async function verifyToken(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET);
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}

// ── Cookie helpers ────────────────────────────────────────────────────────────

export { COOKIE_NAME };

export function cookieOptions(maxAge = 60 * 60 * 24 * 7) {
  return {
    httpOnly: true,
    secure:   process.env.NODE_ENV === "production",
    sameSite: "strict" as const,
    path:     "/",
    maxAge,
  };
}
