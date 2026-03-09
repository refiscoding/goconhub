import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/guards";
import { UpdateUserStatusSchema } from "@/lib/schemas";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { id } = await params;

  let parsed: ReturnType<typeof UpdateUserStatusSchema.safeParse>;
  try {
    parsed = UpdateUserStatusSchema.safeParse(await req.json());
  } catch {
    return NextResponse.json({ message: "Invalid request body." }, { status: 400 });
  }

  if (!parsed.success) {
    return NextResponse.json(
      { message: parsed.error.issues[0]?.message ?? "Invalid input." },
      { status: 400 }
    );
  }

  await prisma.user.update({ where: { id }, data: { status: parsed.data.status } });
  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { id } = await params;

  try {
    // Delete in FK-safe order
    await prisma.$transaction([
      prisma.message.deleteMany({ where: { senderId: id } }),
      prisma.review.deleteMany({ where: { reviewerId: id } }),
      prisma.user.delete({ where: { id } }),
    ]);
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[DELETE /api/admin/users/:id]", e);
    return NextResponse.json({ message: "Cannot delete user with active bookings or disputes." }, { status: 409 });
  }
}
