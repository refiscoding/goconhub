import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

// GET /api/admin/revenue — platform fee totals
export async function GET() {
  const session = await getSession();
  if (!session || session.role !== "admin")
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });

  const confirmed = await prisma.booking.findMany({
    where: { paymentStatus: "confirmed" },
    select: { amount: true, platformFee: true, vendorAmount: true, paymentMethod: true, paidAt: true },
  });

  const totalRevenue     = confirmed.reduce((s, b) => s + (b.platformFee || b.amount * 0.05), 0);
  const totalTransacted  = confirmed.reduce((s, b) => s + b.amount, 0);
  const totalVendorPaid  = confirmed.reduce((s, b) => s + (b.vendorAmount || b.amount * 0.95), 0);
  const count            = confirmed.length;

  return NextResponse.json({ totalRevenue, totalTransacted, totalVendorPaid, count });
}
