import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPassword, signToken, cookieOptions, COOKIE_NAME } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ message: "Email and password are required." }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true, role: true, firstName: true, lastName: true, passwordHash: true, status: true },
    });

    if (!user) {
      return NextResponse.json({ message: "Invalid email or password." }, { status: 401 });
    }

    if (user.status === "suspended") {
      return NextResponse.json({ message: "Your account has been suspended." }, { status: 403 });
    }

    const ok = await verifyPassword(password, user.passwordHash);
    if (!ok) {
      return NextResponse.json({ message: "Invalid email or password." }, { status: 401 });
    }

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
