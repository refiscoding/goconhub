import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/vendors?cat=Plumber&loc=Gaborone&q=search
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const cat = searchParams.get("cat");
  const q   = searchParams.get("q");

  const vendors = await prisma.vendor.findMany({
    where: {
      user: { status: "active" },
      verified: true,
      ...(cat ? { category: { equals: cat, mode: "insensitive" } } : {}),
      ...(q ? {
        OR: [
          { category: { contains: q, mode: "insensitive" } },
          { bio:      { contains: q, mode: "insensitive" } },
          { skills:   { has: q } },
          { user: { firstName: { contains: q, mode: "insensitive" } } },
          { user: { lastName:  { contains: q, mode: "insensitive" } } },
        ],
      } : {}),
    },
    include: {
      user:     { select: { firstName: true, lastName: true, avatarUrl: true } },
      services: { where: { active: true }, select: { name: true, price: true, unit: true } },
    },
    orderBy: { rating: "desc" },
  });

  return NextResponse.json({ vendors });
}
