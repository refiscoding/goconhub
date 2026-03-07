import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  const bookings = await prisma.booking.findMany({
    select: {
      id: true,
      status: true,
      date: true,
      time: true,
      location: true,
      amount: true,
      serviceName: true,
      completedByVendor: true,
      adminApprovedComplete: true,
      paymentStatus: true,
      paymentMethod: true,
      paymentReference: true,
      paidAt: true,
      customer: { select: { id: true, firstName: true, lastName: true } },
      vendor: { select: { id: true, user: { select: { firstName: true, lastName: true } } } },
      service: { select: { name: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return NextResponse.json({ bookings });
}
