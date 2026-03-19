import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword, signToken, cookieOptions, COOKIE_NAME } from "@/lib/auth";
import { RegisterSchema } from "@/lib/schemas";
import { isRateLimited, recordFailure, getClientIp, RATE_LIMITS } from "@/lib/rateLimit";
import { logger } from "@/lib/logger";

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  const rlKey = `register:${ip}`;
  if (isRateLimited(rlKey, RATE_LIMITS.auth)) {
    return NextResponse.json({ message: "Too many attempts. Please try again later." }, { status: 429 });
  }

  let parsed: ReturnType<typeof RegisterSchema.safeParse>;
  try {
    parsed = RegisterSchema.safeParse(await req.json());
  } catch {
    return NextResponse.json({ message: "Invalid request body." }, { status: 400 });
  }

  if (!parsed.success) {
    return NextResponse.json(
      { message: parsed.error.issues[0]?.message ?? "Invalid input." },
      { status: 400 }
    );
  }

  const { email, password, firstName, lastName, role } = parsed.data;

  try {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      recordFailure(rlKey, RATE_LIMITS.auth);
      return NextResponse.json({ message: "An account with this email already exists." }, { status: 409 });
    }

    const passwordHash = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        firstName,
        lastName,
        role,
        status: "active",
        ...(role === "vendor" && {
          vendor: { create: {} },
        }),
      },
      select: { id: true, email: true, role: true, firstName: true, lastName: true },
    });

    const token = await signToken({ userId: user.id, role: user.role, email: user.email });

    const res = NextResponse.json({ user }, { status: 201 });
    res.cookies.set(COOKIE_NAME, token, cookieOptions());
    return res;
  } catch (e) {
    logger.error("Registration failed", { error: e instanceof Error ? e.message : String(e) });
    return NextResponse.json({ message: "Registration failed." }, { status: 500 });
  }
}
