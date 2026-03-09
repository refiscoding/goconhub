import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPassword, signToken, cookieOptions, COOKIE_NAME } from "@/lib/auth";
import { LoginSchema } from "@/lib/schemas";
import { isRateLimited, recordFailure, clearFailures } from "@/lib/rateLimit";

export async function POST(req: NextRequest) {
  // Rate limiting — keyed by IP
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "unknown";

  if (isRateLimited(ip)) {
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
      recordFailure(ip);
      return NextResponse.json({ message: "Invalid email or password." }, { status: 401 });
    }

    if (user.status === "suspended") {
      return NextResponse.json({ message: "Your account has been suspended." }, { status: 403 });
    }

    const ok = await verifyPassword(password, user.passwordHash);
    if (!ok) {
      recordFailure(ip);
      return NextResponse.json({ message: "Invalid email or password." }, { status: 401 });
    }

    clearFailures(ip);
    const token = await signToken({ userId: user.id, role: user.role, email: user.email });

    const { passwordHash: _, ...safeUser } = user;
    const res = NextResponse.json({ user: safeUser });
    res.cookies.set(COOKIE_NAME, token, cookieOptions());
    return res;
  } catch (e) {
    console.error("[login]", e);
    return NextResponse.json({ message: "Login failed." }, { status: 500 });
  }
}
