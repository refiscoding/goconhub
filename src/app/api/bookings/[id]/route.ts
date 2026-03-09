import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { getCommissionRate } from "@/lib/settings";

// PATCH /api/bookings/[id]
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ message: "Unauthorized." }, { status: 401 });

  const body = await req.json();

  const booking = await prisma.booking.findUnique({
    where: { id: params.id },
    include: { vendor: true },
  });
  if (!booking) return NextResponse.json({ message: "Booking not found." }, { status: 404 });

  const isVendor   = session.role === "vendor"   && booking.vendor.userId === session.userId;
  const isCustomer = session.role === "customer" && booking.customerId   === session.userId;
  const isAdmin    = session.role === "admin";

  if (!isVendor && !isCustomer && !isAdmin) {
    return NextResponse.json({ message: "Forbidden." }, { status: 403 });
  }

  // Build update data based on role and action
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data: Record<string, any> = {};

  // Status change (vendor: confirm/decline/complete; customer: cancel; admin: any)
  if (body.status) {
    data.status = body.status;
  }

  // Vendor marks job complete
  if (body.completedByVendor === true && (isVendor || isAdmin)) {
    data.completedByVendor = true;
  }

  // Admin approves job completion (unlocks payment for customer)
  if (body.adminApprovedComplete === true && isAdmin) {
    data.adminApprovedComplete = true;
  }

  // Customer submits payment
  if (body.paymentStatus === "submitted" && isCustomer) {
    if (!booking.adminApprovedComplete)
      return NextResponse.json({ message: "Admin has not yet approved job completion." }, { status: 400 });
    data.paymentStatus     = "submitted";
    data.paymentMethod     = body.paymentMethod ?? null;
    data.paymentReference  = body.paymentReference ?? null;
  }

  // Admin confirms payment (Orange / eWallet — DPO is auto-confirmed via /api/payments/dpo)
  if (body.paymentStatus === "confirmed" && isAdmin) {
    const rate   = await getCommissionRate();
    const fee    = Math.round(booking.amount * rate * 100) / 100;
    data.paymentStatus = "confirmed";
    data.status        = "completed";
    data.paidAt        = new Date();
    data.platformFee   = fee;
    data.vendorAmount  = Math.round((booking.amount - fee) * 100) / 100;
  }

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ message: "Nothing to update." }, { status: 400 });
  }

  const updated = await prisma.booking.update({ where: { id: params.id }, data });
  return NextResponse.json({ booking: updated });
}
