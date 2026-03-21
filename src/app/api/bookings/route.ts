import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { CreateBookingSchema } from "@/lib/schemas";
import { createNotification } from "@/lib/notifications";
import { logger } from "@/lib/logger";
import { Prisma } from "@prisma/client";

// GET /api/bookings — list bookings for the current user
export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ message: "Unauthorized." }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const vendorIdFilter = searchParams.get("vendorId");
  const statusFilter   = searchParams.get("status");

  const baseWhere =
    session.role === "customer"
      ? { customerId: session.userId }
      : session.role === "vendor"
      ? { vendor: { userId: session.userId } }
      : {};

  const where: Prisma.BookingWhereInput = { ...baseWhere };
  if (vendorIdFilter) where.vendorId = vendorIdFilter;
  if (statusFilter)   where.status   = { in: statusFilter.split(",") as Prisma.EnumBookingStatusFilter["in"] };

  const bookings = await prisma.booking.findMany({
    where,
    select: {
      id: true, serviceName: true, date: true, time: true, location: true, note: true,
      amount: true, status: true, completedByVendor: true, adminApprovedComplete: true,
      paymentStatus: true, paymentMethod: true, paymentReference: true, paidAt: true,
      customer: { select: { id: true, firstName: true, lastName: true, phone: true, avatarUrl: true } },
      vendor:   { select: { id: true, userId: true, user: { select: { firstName: true, lastName: true, avatarUrl: true } } } },
      service:  { select: { name: true } },
      _count:   { select: { messages: true } },
      messages: { select: { createdAt: true, text: true }, orderBy: { createdAt: "desc" }, take: 1 },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ bookings });
}

// POST /api/bookings — create a booking
export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "customer") {
    return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
  }

  let parsed: ReturnType<typeof CreateBookingSchema.safeParse>;
  try {
    parsed = CreateBookingSchema.safeParse(await req.json());
  } catch {
    return NextResponse.json({ message: "Invalid request body." }, { status: 400 });
  }

  if (!parsed.success) {
    return NextResponse.json(
      { message: parsed.error.issues[0]?.message ?? "Invalid input." },
      { status: 400 }
    );
  }

  const { vendorId, serviceId, serviceName, date, time, location, note, amount } = parsed.data;

  try {
    // Server-side amount: always use the price stored in DB when a serviceId is provided
    let finalAmount: number;
    if (serviceId) {
      const service = await prisma.service.findUnique({
        where: { id: serviceId },
        select: { price: true, vendorId: true, active: true },
      });
      if (!service || !service.active) {
        return NextResponse.json({ message: "Service not found." }, { status: 404 });
      }
      // Ensure service belongs to the requested vendor
      const vendor = await prisma.vendor.findUnique({ where: { id: vendorId }, select: { id: true } });
      if (!vendor || service.vendorId !== vendor.id) {
        return NextResponse.json({ message: "Service does not belong to this vendor." }, { status: 400 });
      }
      finalAmount = service.price;
    } else {
      finalAmount = Number(amount);
      if (!isFinite(finalAmount) || finalAmount <= 0) {
        return NextResponse.json({ message: "Invalid amount." }, { status: 400 });
      }
    }

    const booking = await prisma.booking.create({
      data: {
        customerId:  session.userId,
        vendorId,
        serviceId:   serviceId ?? null,
        serviceName: serviceName.slice(0, 200),
        date,
        time,
        location:    location.slice(0, 300),
        note:        note.slice(0, 1000),
        amount:      finalAmount,
        status:      "pending",
      },
    });

    // Notify vendor of new booking request
    const vendor = await prisma.vendor.findUnique({
      where: { id: vendorId },
      select: { userId: true },
    });
    if (vendor) {
      await createNotification({
        userId:  vendor.userId,
        type:    "booking_request",
        title:   "New booking request",
        body:    `A customer requested ${serviceName}.`,
        linkUrl: `/vendor/dashboard`,
      });
    }

    return NextResponse.json({ booking }, { status: 201 });
  } catch (e) {
    logger.error("Booking creation failed", { error: e instanceof Error ? e.message : String(e) });
    return NextResponse.json({ message: "Failed to create booking." }, { status: 500 });
  }
}
