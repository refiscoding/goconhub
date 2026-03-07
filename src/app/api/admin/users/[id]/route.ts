import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const { status } = await req.json();

  if (!["active", "suspended", "pending"].includes(status)) {
    return NextResponse.json({ message: "Invalid status" }, { status: 400 });
  }

  await prisma.user.update({ where: { id }, data: { status } });
  return NextResponse.json({ ok: true });
}
