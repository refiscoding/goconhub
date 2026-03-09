import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/guards";

// GET /api/admin/revenue — platform fee totals
export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;

  const confirmed = await prisma.booking.findMany({
    where: { paymentStatus: "confirmed" },
    select: { amount: true, platformFee: true, vendorAmount: true, paymentMethod: true, paidAt: true },
  });

  type Row = typeof confirmed[number];
  const totalRevenue     = confirmed.reduce((s: number, b: Row) => s + (b.platformFee || b.amount * 0.05), 0);
  const totalTransacted  = confirmed.reduce((s: number, b: Row) => s + b.amount, 0);
  const totalVendorPaid  = confirmed.reduce((s: number, b: Row) => s + (b.vendorAmount || b.amount * 0.95), 0);
  const count            = confirmed.length;

  return NextResponse.json({ totalRevenue, totalTransacted, totalVendorPaid, count });
}
