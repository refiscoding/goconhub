import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

// GET /api/notifications — list for current user
export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ message: "Unauthorized." }, { status: 401 });

  const notifications = await prisma.notification.findMany({
    where:   { userId: session.userId },
    orderBy: { createdAt: "desc" },
    take:    50,
  });

  const unread = notifications.filter((n) => !n.read).length;
  return NextResponse.json({ notifications, unread });
}

// PATCH /api/notifications — mark all as read
export async function PATCH() {
  const session = await getSession();
  if (!session) return NextResponse.json({ message: "Unauthorized." }, { status: 401 });

  await prisma.notification.updateMany({
    where: { userId: session.userId, read: false },
    data:  { read: true },
  });

  return NextResponse.json({ ok: true });
}
