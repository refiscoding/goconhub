import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

// POST /api/listings/[id]/buy — customer places buy request
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session || session.role !== "customer") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const listing = await prisma.listing.findFirst({ where: { id: params.id, status: "active" } });
  if (!listing) return NextResponse.json({ message: "Listing not available" }, { status: 404 });

  // Prevent duplicate pending orders
  const existing = await prisma.listingOrder.findFirst({
    where: { listingId: params.id, customerId: session.userId, status: "pending" },
  });
  if (existing) {
    return NextResponse.json({ message: "You already have a pending request for this item." }, { status: 409 });
  }

  const { note } = await req.json().catch(() => ({ note: "" }));

  const order = await prisma.listingOrder.create({
    data: {
      listingId:  params.id,
      customerId: session.userId,
      note:       note?.trim() ?? "",
    },
  });

  return NextResponse.json({ order }, { status: 201 });
}
