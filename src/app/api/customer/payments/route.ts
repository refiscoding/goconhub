import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

// GET /api/customer/payments — customer's payment history
export async function GET() {
  const session = await getSession();
  if (!session || session.role !== "customer")
    return NextResponse.json({ message: "Unauthorized." }, { status: 401 });

  const payments = await prisma.booking.findMany({
    where: { customerId: session.userId, paymentStatus: "confirmed" },
    select: {
      id: true, serviceName: true, amount: true, paidAt: true, paymentMethod: true,
      vendor: { select: { user: { select: { firstName: true, lastName: true } } } },
    },
    orderBy: { paidAt: "desc" },
  });

  return NextResponse.json({ payments });
}
