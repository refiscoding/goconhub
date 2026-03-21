import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

// PATCH /api/notifications/[id] — mark single notification as read
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ message: "Unauthorized." }, { status: 401 });

  const notif = await prisma.notification.findUnique({ where: { id: params.id } });
  if (!notif || notif.userId !== session.userId) {
    return NextResponse.json({ message: "Not found." }, { status: 404 });
  }

  await prisma.notification.update({ where: { id: params.id }, data: { read: true } });
  return NextResponse.json({ ok: true });
}
