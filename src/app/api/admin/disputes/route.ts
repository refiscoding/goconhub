import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

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
