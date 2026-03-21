import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/guards";
import { z } from "zod";

const SettingsSchema = z.object({
  commissionRate: z.number().min(0).max(100).optional(),
  adminEmail:     z.string().email("Invalid email.").max(254).optional(),
});

export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;

  const rows = await prisma.adminSetting.findMany();
  const settings = Object.fromEntries(rows.map((r) => [r.key, r.value]));
  return NextResponse.json({ settings });
}

export async function PATCH(req: NextRequest) {
  const { error } = await requireAdmin();
  if (error) return error;

  let parsed: ReturnType<typeof SettingsSchema.safeParse>;
  try { parsed = SettingsSchema.safeParse(await req.json()); }
  catch { return NextResponse.json({ message: "Invalid request body." }, { status: 400 }); }

  if (!parsed.success) {
    return NextResponse.json({ message: parsed.error.issues[0]?.message ?? "Invalid input." }, { status: 400 });
  }

  const { commissionRate, adminEmail } = parsed.data;
  const ops = [];

  if (commissionRate !== undefined) {
    ops.push(prisma.adminSetting.upsert({
      where: { key: "commissionRate" },
      update: { value: String(commissionRate) },
      create: { key: "commissionRate", value: String(commissionRate) },
    }));
  }
  if (adminEmail !== undefined) {
    ops.push(prisma.adminSetting.upsert({
      where: { key: "adminEmail" },
      update: { value: adminEmail },
      create: { key: "adminEmail", value: adminEmail },
    }));
  }

  await prisma.$transaction(ops);
  return NextResponse.json({ ok: true });
}
