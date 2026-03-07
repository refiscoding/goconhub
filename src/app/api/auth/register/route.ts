import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword, signToken, cookieOptions, COOKIE_NAME } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const { email, password, firstName, lastName, role } = await req.json();

    if (!email || !password || !firstName || !lastName || !role) {
      return NextResponse.json({ message: "All fields are required." }, { status: 400 });
    }

    if (!["customer", "vendor"].includes(role)) {
      return NextResponse.json({ message: "Invalid role." }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
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
    console.error("[register]", e);
    return NextResponse.json({ message: "Registration failed." }, { status: 500 });
  }
}
