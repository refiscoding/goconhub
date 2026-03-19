import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/guards";

export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;

  const tickets = await prisma.supportTicket.findMany({
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ tickets });
}
