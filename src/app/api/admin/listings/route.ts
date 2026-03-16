import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

// GET /api/admin/listings — all buy orders with listing + customer info
export async function GET() {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  const orders = await prisma.listingOrder.findMany({
    include: {
      listing:  { include: { vendor: { include: { user: { select: { firstName: true, lastName: true } } } } } },
      customer: { select: { id: true, firstName: true, lastName: true, phone: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ orders });
}
