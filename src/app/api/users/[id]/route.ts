import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { id: params.id },
    select: { id: true, firstName: true, lastName: true, avatarUrl: true, city: true, area: true, createdAt: true },
  });

  if (!user) return NextResponse.json({ message: "Not found" }, { status: 404 });
  return NextResponse.json({ user });
}
