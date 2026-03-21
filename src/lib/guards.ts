import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import type { SessionPayload } from "@/lib/auth";

/**
 * Verifies the request is authenticated as an admin.
 * Returns { session } on success, or { error: NextResponse } to return immediately.
 */
export async function requireAdmin(): Promise<
  { session: SessionPayload; error?: never } |
  { session?: never; error: NextResponse }
> {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return {
      error: NextResponse.json({ message: "Forbidden" }, { status: 403 }),
    };
  }
  return { session };
}
