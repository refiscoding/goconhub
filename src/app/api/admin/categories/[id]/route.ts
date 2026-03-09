import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/guards";
import { z } from "zod";

const CategorySchema = z.object({
  name: z.string().min(1, "Name is required.").max(80).transform((s) => s.trim()),
});

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { id } = await params;

  let parsed: ReturnType<typeof CategorySchema.safeParse>;
  try { parsed = CategorySchema.safeParse(await req.json()); }
  catch { return NextResponse.json({ message: "Invalid request body." }, { status: 400 }); }

  if (!parsed.success) {
    return NextResponse.json({ message: parsed.error.issues[0]?.message ?? "Invalid input." }, { status: 400 });
  }

  try {
    const category = await prisma.serviceCategory.update({ where: { id }, data: { name: parsed.data.name } });
    return NextResponse.json({ category });
  } catch {
    return NextResponse.json({ message: "Category not found or name already exists." }, { status: 409 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { id } = await params;
  await prisma.serviceCategory.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
