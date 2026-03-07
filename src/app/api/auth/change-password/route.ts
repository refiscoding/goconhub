import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { verifyPassword, hashPassword } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ message: "Unauthorized." }, { status: 401 });

  try {
    const { currentPassword, newPassword } = await req.json();
    if (!currentPassword || !newPassword)
      return NextResponse.json({ message: "Both fields are required." }, { status: 400 });
    if (newPassword.length < 8)
      return NextResponse.json({ message: "New password must be at least 8 characters." }, { status: 400 });

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { passwordHash: true },
    });
    if (!user) return NextResponse.json({ message: "User not found." }, { status: 404 });

    const ok = await verifyPassword(currentPassword, user.passwordHash);
    if (!ok) return NextResponse.json({ message: "Current password is incorrect." }, { status: 400 });

    const newHash = await hashPassword(newPassword);
    await prisma.user.update({ where: { id: session.userId }, data: { passwordHash: newHash } });

    return NextResponse.json({ message: "Password changed successfully." });
  } catch (e) {
    console.error("[change-password]", e);
    return NextResponse.json({ message: "Failed to change password." }, { status: 500 });
  }
}
