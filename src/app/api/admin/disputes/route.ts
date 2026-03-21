import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/guards";

export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;

  const disputes = await prisma.dispute.findMany({
    select: {
      id: true,
      reason: true,
      status: true,
      createdAt: true,
      booking: {
        select: {
          amount: true,
          customer: { select: { firstName: true, lastName: true } },
          vendor: { select: { user: { select: { firstName: true, lastName: true } } } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ disputes });
}
