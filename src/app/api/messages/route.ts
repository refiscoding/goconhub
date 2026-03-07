import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

const MAX_MESSAGE_LENGTH = 2000;

async function getBookingIfAuthorized(bookingId: string, userId: string, role: string) {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    select: { customerId: true, vendor: { select: { userId: true } } },
  });
  if (!booking) return null;

  const isCustomer = role === "customer" && booking.customerId === userId;
  const isVendor   = role === "vendor"   && booking.vendor.userId === userId;
  const isAdmin    = role === "admin";

  return (isCustomer || isVendor || isAdmin) ? booking : null;
}

// GET /api/messages?bookingId=xxx
export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ message: "Unauthorized." }, { status: 401 });

  const bookingId = new URL(req.url).searchParams.get("bookingId");
  if (!bookingId) return NextResponse.json({ message: "bookingId required." }, { status: 400 });

  const booking = await getBookingIfAuthorized(bookingId, session.userId, session.role);
  if (!booking) return NextResponse.json({ message: "Forbidden." }, { status: 403 });

  const messages = await prisma.message.findMany({
    where: { bookingId },
    include: { sender: { select: { id: true, firstName: true, lastName: true, role: true } } },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json({ messages });
}

// POST /api/messages
export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ message: "Unauthorized." }, { status: 401 });

  const { bookingId, text } = await req.json();
  if (!bookingId || !text) {
    return NextResponse.json({ message: "bookingId and text required." }, { status: 400 });
  }

  if (typeof text !== "string" || text.trim().length === 0) {
    return NextResponse.json({ message: "Message cannot be empty." }, { status: 400 });
  }

  if (text.length > MAX_MESSAGE_LENGTH) {
    return NextResponse.json({ message: `Message cannot exceed ${MAX_MESSAGE_LENGTH} characters.` }, { status: 400 });
  }

  const booking = await getBookingIfAuthorized(bookingId, session.userId, session.role);
  if (!booking) return NextResponse.json({ message: "Forbidden." }, { status: 403 });

  const message = await prisma.message.create({
    data: { bookingId, senderId: session.userId, text: text.trim() },
    include: { sender: { select: { id: true, firstName: true, lastName: true, role: true } } },
  });

  return NextResponse.json({ message }, { status: 201 });
}
