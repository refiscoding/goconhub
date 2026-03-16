import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/guards";

export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;

  const users = await prisma.user.findMany({
    where: { role: { not: "admin" } },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      phone: true,
      role: true,
      status: true,
      createdAt: true,
      _count: { select: { bookings: true } },
      vendor: {
        select: {
          id: true,
          verified: true,
          entityType: true,
          idDocumentUrl: true,
          cipaDocumentUrl: true,
          companyName: true,
          companyRegNumber: true,
          bankName: true,
          accountNumber: true,
          category: true,
          location: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ users });
}
