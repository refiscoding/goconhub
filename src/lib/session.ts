import { cookies } from "next/headers";
import { verifyToken, COOKIE_NAME, type SessionPayload } from "@/lib/auth";

/** Returns the current session from the HTTP-only cookie, or null. */
export async function getSession(): Promise<SessionPayload | null> {
  const token = (await cookies()).get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyToken(token);
}
