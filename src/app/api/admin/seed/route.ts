import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth";

/**
 * One-time route to create the first admin user.
 * Requires a setup token in the request body for safety.
 * Usage: POST /api/admin/seed  { setupToken, email, password, firstName, lastName }
 */
export async function POST(req: NextRequest) {
  const { setupToken, email, password, firstName, lastName } = await req.json();

  // Prevent accidental use — require a token set in env
  const expected = process.env.ADMIN_SETUP_TOKEN;
  if (!expected || setupToken !== expected) {
    return NextResponse.json({ message: "Invalid setup token" }, { status: 403 });
  }

  if (!email || !password || !firstName || !lastName) {
    return NextResponse.json({ message: "All fields required" }, { status: 400 });
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ message: "User already exists" }, { status: 409 });
  }

  const passwordHash = await hashPassword(password);
  const user = await prisma.user.create({
    data: { email, passwordHash, firstName, lastName, role: "admin", status: "active" },
    select: { id: true, email: true, role: true },
  });

  return NextResponse.json({ user }, { status: 201 });
}
