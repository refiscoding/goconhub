import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

// GET /api/vendor/earnings — vendor's confirmed payment history
export async function GET() {
  const session = await getSession();
  if (!session || session.role !== "vendor")
    return NextResponse.json({ message: "Unauthorized." }, { status: 401 });

  const vendor = await prisma.vendor.findUnique({ where: { userId: session.userId } });
  if (!vendor) return NextResponse.json({ message: "Vendor not found." }, { status: 404 });

  const payments = await prisma.booking.findMany({
    where: { vendorId: vendor.id, paymentStatus: "confirmed" },
    select: {
      id: true, serviceName: true, amount: true, vendorAmount: true,
      paidAt: true, paymentMethod: true,
      customer: { select: { firstName: true, lastName: true } },
    },
    orderBy: { paidAt: "desc" },
  });

  type Payment = typeof payments[number];
  const total = payments.reduce((sum: number, p: Payment) => sum + (p.vendorAmount || p.amount * 0.95), 0);

  return NextResponse.json({ payments, total });
}
