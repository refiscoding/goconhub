import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

// PATCH /api/services/[id]
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session || session.role !== "vendor") {
    return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
  }

  const vendor = await prisma.vendor.findUnique({ where: { userId: session.userId } });
  if (!vendor) return NextResponse.json({ message: "Vendor not found." }, { status: 404 });

  const service = await prisma.service.findFirst({ where: { id: params.id, vendorId: vendor.id } });
  if (!service) return NextResponse.json({ message: "Service not found." }, { status: 404 });

  const data = await req.json();
  const updated = await prisma.service.update({
    where: { id: params.id },
    data: {
      ...(data.name   != null && { name:   data.name }),
      ...(data.price  != null && { price:  Number(data.price) }),
      ...(data.unit   != null && { unit:   data.unit }),
      ...(data.desc   != null && { desc:   data.desc }),
      ...(data.active != null && { active: data.active }),
    },
  });

  return NextResponse.json({ service: updated });
}

// DELETE /api/services/[id]
export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session || session.role !== "vendor") {
    return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
  }

  const vendor = await prisma.vendor.findUnique({ where: { userId: session.userId } });
  if (!vendor) return NextResponse.json({ message: "Vendor not found." }, { status: 404 });

  await prisma.service.deleteMany({ where: { id: params.id, vendorId: vendor.id } });
  return NextResponse.json({ success: true });
}
