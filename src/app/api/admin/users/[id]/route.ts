import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/guards";
import { UpdateUserStatusSchema } from "@/lib/schemas";
import { createNotification } from "@/lib/notifications";
import { logger } from "@/lib/logger";

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

  // Handle verify action separately
  const body = parsed.data as { status?: string; action?: string };
  if (body.action === "verify") {
    const vendor = await prisma.vendor.findUnique({ where: { userId: id } });
    if (!vendor) return NextResponse.json({ message: "Vendor not found." }, { status: 404 });
    await prisma.vendor.update({ where: { id: vendor.id }, data: { verified: true } });
    await createNotification({
      userId:  id,
      type:    "account_verified",
      title:   "Account Verified ✓",
      body:    "Congratulations! Your HandyHub account has been verified by our team. You are now visible to customers.",
      linkUrl: "/vendor/profile",
    });
    return NextResponse.json({ ok: true });
  }

  if (!body.status) return NextResponse.json({ message: "Invalid input." }, { status: 400 });
  await prisma.user.update({ where: { id }, data: { status: body.status as "active" | "pending" | "suspended" } });
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
    logger.error("Admin user delete failed", { error: e instanceof Error ? e.message : String(e) });
    return NextResponse.json({ message: "Cannot delete user with active bookings or disputes." }, { status: 409 });
  }
}
