import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

// PATCH /api/admin/listings/[id] — approve or reject a buy order
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  const { status } = await req.json();
  if (status !== "approved" && status !== "rejected") {
    return NextResponse.json({ message: "Invalid status" }, { status: 400 });
  }

  const order = await prisma.listingOrder.update({
    where: { id: params.id },
    data:  { status },
  });

  // Mark listing as sold when approved
  if (status === "approved") {
    await prisma.listing.update({
      where: { id: order.listingId },
      data:  { status: "sold" },
    });
    // Reject all other pending orders for the same listing
    await prisma.listingOrder.updateMany({
      where: { listingId: order.listingId, id: { not: params.id }, status: "pending" },
      data:  { status: "rejected" },
    });
  }

  return NextResponse.json({ order });
}
