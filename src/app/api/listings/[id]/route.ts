import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

// PATCH /api/listings/[id] — vendor edits listing
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session || session.role !== "vendor") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const vendor = await prisma.vendor.findUnique({ where: { userId: session.userId } });
  if (!vendor) return NextResponse.json({ message: "Vendor not found" }, { status: 404 });

  const listing = await prisma.listing.findFirst({ where: { id: params.id, vendorId: vendor.id } });
  if (!listing) return NextResponse.json({ message: "Not found" }, { status: 404 });

  const body = await req.json();
  const updated = await prisma.listing.update({
    where: { id: params.id },
    data: {
      ...(body.title     !== undefined && { title:     body.title.trim() }),
      ...(body.desc      !== undefined && { desc:      body.desc.trim() }),
      ...(body.price     !== undefined && { price:     Number(body.price) }),
      ...(body.condition !== undefined && { condition: body.condition }),
      ...(body.photos    !== undefined && { photos:    body.photos }),
      ...(body.status    !== undefined && { status:    body.status }),
    },
  });

  return NextResponse.json({ listing: updated });
}

// DELETE /api/listings/[id] — vendor removes listing
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session || session.role !== "vendor") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const vendor = await prisma.vendor.findUnique({ where: { userId: session.userId } });
  if (!vendor) return NextResponse.json({ message: "Vendor not found" }, { status: 404 });

  const listing = await prisma.listing.findFirst({ where: { id: params.id, vendorId: vendor.id } });
  if (!listing) return NextResponse.json({ message: "Not found" }, { status: 404 });

  await prisma.listing.update({ where: { id: params.id }, data: { status: "removed" } });
  return NextResponse.json({ ok: true });
}
