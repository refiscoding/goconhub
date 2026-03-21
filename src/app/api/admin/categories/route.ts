import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/guards";
import { z } from "zod";

const CategorySchema = z.object({
  name: z.string().min(1, "Name is required.").max(80).transform((s) => s.trim()),
});

export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;

  const categories = await prisma.serviceCategory.findMany({
    orderBy: { name: "asc" },
  });
  return NextResponse.json({ categories });
}

export async function POST(req: NextRequest) {
  const { error } = await requireAdmin();
  if (error) return error;

  let parsed: ReturnType<typeof CategorySchema.safeParse>;
  try { parsed = CategorySchema.safeParse(await req.json()); }
  catch { return NextResponse.json({ message: "Invalid request body." }, { status: 400 }); }

  if (!parsed.success) {
    return NextResponse.json({ message: parsed.error.issues[0]?.message ?? "Invalid input." }, { status: 400 });
  }

  try {
    const category = await prisma.serviceCategory.create({ data: { name: parsed.data.name } });
    return NextResponse.json({ category }, { status: 201 });
  } catch {
    return NextResponse.json({ message: "Category already exists." }, { status: 409 });
  }
}
