import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPassword, signToken, cookieOptions, COOKIE_NAME } from "@/lib/auth";
import { LoginSchema } from "@/lib/schemas";
import { isRateLimited, recordFailure, clearFailures, getClientIp, RATE_LIMITS } from "@/lib/rateLimit";
import { logger } from "@/lib/logger";

export async function POST(req: NextRequest) {
  // Rate limiting — keyed by IP
  const ip = getClientIp(req);
  const rlKey = `login:${ip}`;

  if (isRateLimited(rlKey, RATE_LIMITS.auth)) {
    return NextResponse.json(
      { message: "Too many login attempts. Please try again in 15 minutes." },
      { status: 429 }
    );
  }

  // Input validation
  let parsed: ReturnType<typeof LoginSchema.safeParse>;
  try {
    parsed = LoginSchema.safeParse(await req.json());
  } catch {
    return NextResponse.json({ message: "Invalid request body." }, { status: 400 });
  }

  if (!parsed.success) {
    return NextResponse.json(
      { message: parsed.error.issues[0]?.message ?? "Invalid input." },
      { status: 400 }
    );
  }

  const { email, password } = parsed.data;

  try {
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true, role: true, firstName: true, lastName: true, passwordHash: true, status: true },
    });

    if (!user) {
      recordFailure(rlKey, RATE_LIMITS.auth);
      return NextResponse.json({ message: "Invalid email or password." }, { status: 401 });
    }

    if (user.status === "suspended") {
      return NextResponse.json({ message: "Your account has been suspended." }, { status: 403 });
    }

    const ok = await verifyPassword(password, user.passwordHash);
    if (!ok) {
      recordFailure(rlKey, RATE_LIMITS.auth);
      return NextResponse.json({ message: "Invalid email or password." }, { status: 401 });
    }

    clearFailures(rlKey);
    const token = await signToken({ userId: user.id, role: user.role, email: user.email });

    const { passwordHash: _, ...safeUser } = user;
    const res = NextResponse.json({ user: safeUser });
    res.cookies.set(COOKIE_NAME, token, cookieOptions());
    return res;
  } catch (e) {
    logger.error("Login failed", { error: e instanceof Error ? e.message : String(e) });
    return NextResponse.json({ message: "Login failed." }, { status: 500 });
  }
}
