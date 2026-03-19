import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/guards";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { id } = await params;
  const { status, adminNote } = await req.json();

  const data: Record<string, string> = {};
  if (status)    data.status    = status;
  if (adminNote !== undefined) data.adminNote = adminNote;

  const ticket = await prisma.supportTicket.update({ where: { id }, data });
  return NextResponse.json({ ticket });
}
