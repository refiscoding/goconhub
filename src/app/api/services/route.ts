import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

// GET /api/services — list current vendor's services
export async function GET() {
  const session = await getSession();
  if (!session || session.role !== "vendor") {
    return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
  }

  const vendor = await prisma.vendor.findUnique({ where: { userId: session.userId } });
  if (!vendor) return NextResponse.json({ message: "Vendor not found." }, { status: 404 });

  const services = await prisma.service.findMany({
    where: { vendorId: vendor.id },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json({ services });
}

// POST /api/services — add a service
export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "vendor") {
    return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
  }

  const vendor = await prisma.vendor.findUnique({ where: { userId: session.userId } });
  if (!vendor) return NextResponse.json({ message: "Vendor not found." }, { status: 404 });

  const { name, price, unit, desc, active } = await req.json();
  if (!name || price == null) {
    return NextResponse.json({ message: "name and price are required." }, { status: 400 });
  }

  try {
    const service = await prisma.service.create({
      data: {
        vendorId: vendor.id,
        name,
        price:  Number(price),
        unit:   unit ?? "hr",
        desc:   desc ?? "",
        active: active ?? true,
      },
    });
    return NextResponse.json({ service }, { status: 201 });
  } catch (e) {
    console.error("[POST /api/services]", e);
    return NextResponse.json({ message: "Failed to save service. Please try again." }, { status: 500 });
  }
}
