import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ user: null }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: {
      id: true, email: true, phone: true, role: true, status: true,
      firstName: true, lastName: true, city: true, area: true,
      preferredServices: true, avatarUrl: true, createdAt: true,
      vendor: {
        select: {
          id: true, bio: true, category: true, skills: true,
          location: true, rating: true, reviewCount: true, available: true, verified: true,
        },
      },
    },
  });

  if (!user) return NextResponse.json({ user: null }, { status: 401 });
  return NextResponse.json({ user });
}
