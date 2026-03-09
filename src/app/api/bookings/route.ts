import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { CreateBookingSchema } from "@/lib/schemas";

// GET /api/bookings — list bookings for the current user
export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ message: "Unauthorized." }, { status: 401 });

  const where =
    session.role === "customer"
      ? { customerId: session.userId }
      : session.role === "vendor"
      ? { vendor: { userId: session.userId } }
      : {};

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
      { message: parsed.error.errors[0]?.message ?? "Invalid input." },
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

    return NextResponse.json({ booking }, { status: 201 });
  } catch (e) {
    console.error("[bookings POST]", e);
    return NextResponse.json({ message: "Failed to create booking." }, { status: 500 });
  }
}
