import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const session = await getSession();
  if (!session || session.role !== "customer") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { bookingId, reason } = await req.json();

  if (!bookingId || !reason?.trim()) {
    return NextResponse.json({ message: "bookingId and reason are required" }, { status: 400 });
  }

  // Verify booking belongs to this customer and is in a disputable state
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    select: { id: true, customerId: true, vendorId: true, amount: true, status: true, dispute: { select: { id: true } } },
  });

  if (!booking) return NextResponse.json({ message: "Booking not found" }, { status: 404 });
  if (booking.customerId !== session.userId) return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  if (!["confirmed", "completed"].includes(booking.status)) {
    return NextResponse.json({ message: "Disputes can only be raised on confirmed or completed bookings" }, { status: 400 });
  }
  if (booking.dispute) {
    return NextResponse.json({ message: "A dispute already exists for this booking" }, { status: 409 });
  }

  const dispute = await prisma.dispute.create({
    data: {
      bookingId,
      customerId: session.userId,
      vendorId: booking.vendorId,
      reason: reason.trim(),
      amount: booking.amount,
    },
  });

  return NextResponse.json({ dispute }, { status: 201 });
}
