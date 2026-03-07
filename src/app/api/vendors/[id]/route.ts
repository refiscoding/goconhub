import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const [vendor, completedCount] = await Promise.all([
      prisma.vendor.findUnique({
        where: { id: params.id },
        include: {
          user:     { select: { firstName: true, lastName: true, avatarUrl: true, city: true, area: true } },
          services: { where: { active: true }, select: { id: true, name: true, price: true, unit: true, desc: true } },
          reviews:  { orderBy: { createdAt: "desc" }, include: { reviewer: { select: { firstName: true, lastName: true, avatarUrl: true } } } },
          _count:   { select: { bookings: true } },
        },
      }),
      prisma.booking.count({ where: { vendorId: params.id, status: "completed" } }),
    ]);

    if (!vendor) return NextResponse.json({ message: "Not found" }, { status: 404 });
    return NextResponse.json({ vendor: { ...vendor, completedBookings: completedCount } });
  } catch (err) {
    console.error("[GET /api/vendors/[id]]", err);
    return NextResponse.json({ message: "Server error", error: String(err) }, { status: 500 });
  }
}
