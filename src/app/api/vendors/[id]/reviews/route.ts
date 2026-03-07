import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

// POST /api/vendors/[id]/reviews
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  if (session.role !== "customer") return NextResponse.json({ message: "Only customers can leave reviews" }, { status: 403 });

  const { rating, comment } = await req.json();
  if (!rating || rating < 1 || rating > 5) return NextResponse.json({ message: "Rating must be 1–5" }, { status: 400 });

  try {
    const review = await prisma.review.upsert({
      where: { vendorId_reviewerId: { vendorId: params.id, reviewerId: session.userId } },
      create: { vendorId: params.id, reviewerId: session.userId, rating: Number(rating), comment: comment ?? "" },
      update: { rating: Number(rating), comment: comment ?? "" },
      include: { reviewer: { select: { firstName: true, lastName: true, avatarUrl: true } } },
    });

    // Recalculate vendor rating
    const agg = await prisma.review.aggregate({
      where: { vendorId: params.id },
      _avg: { rating: true },
      _count: { rating: true },
    });
    await prisma.vendor.update({
      where: { id: params.id },
      data: { rating: agg._avg.rating ?? 0, reviewCount: agg._count.rating },
    });

    return NextResponse.json({ review });
  } catch (err) {
    console.error("[POST /api/vendors/[id]/reviews]", err);
    return NextResponse.json({ message: "Failed to save review" }, { status: 500 });
  }
}
