import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

// GET /api/listings — browse active listings (or vendor's own if ?mine=1)
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q    = searchParams.get("q")?.toLowerCase() ?? "";
  const mine = searchParams.get("mine") === "1";

  let vendorId: string | undefined;
  if (mine) {
    const session = await getSession();
    if (session?.role === "vendor") {
      const vendor = await prisma.vendor.findUnique({ where: { userId: session.userId } });
      vendorId = vendor?.id;
    }
  }

  const listings = await prisma.listing.findMany({
    where: {
      ...(vendorId ? { vendorId } : { status: "active" }),
      ...(q ? {
        OR: [
          { title: { contains: q, mode: "insensitive" } },
          { desc:  { contains: q, mode: "insensitive" } },
        ],
      } : {}),
    },
    include: { vendor: { include: { user: { select: { firstName: true, lastName: true, avatarUrl: true } } } } },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ listings });
}

// POST /api/listings — vendor creates listing
export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== "vendor") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    let body: { title?: string; desc?: string; price?: number; condition?: string; photos?: string[] };
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ message: "Request body too large or invalid." }, { status: 413 });
    }

    const { title, desc, price, condition, photos } = body;
    if (!title?.trim() || !price || Number(price) <= 0) {
      return NextResponse.json({ message: "Title and valid price are required." }, { status: 400 });
    }

    const vendor = await prisma.vendor.findUnique({ where: { userId: session.userId } });
    if (!vendor) return NextResponse.json({ message: "Vendor profile not found. Complete onboarding first." }, { status: 404 });

    const listing = await prisma.listing.create({
      data: {
        vendorId:  vendor.id,
        title:     title.trim(),
        desc:      desc?.trim() ?? "",
        price:     Number(price),
        condition: condition ?? "used",
        photos:    Array.isArray(photos) ? photos.slice(0, 4).filter(Boolean) : [],
      },
    });

    return NextResponse.json({ listing }, { status: 201 });
  } catch (err) {
    console.error("POST /api/listings error:", err);
    return NextResponse.json({ message: "Server error. Please try again." }, { status: 500 });
  }
}
