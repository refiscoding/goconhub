import { prisma } from "@/lib/prisma";

const DEFAULT_COMMISSION = 5; // 5%

/** Returns the platform commission rate as a decimal (e.g. 0.10 for 10%). */
export async function getCommissionRate(): Promise<number> {
  const row = await prisma.adminSetting.findUnique({ where: { key: "commissionRate" } });
  const pct = row ? parseFloat(row.value) : DEFAULT_COMMISSION;
  return isNaN(pct) ? DEFAULT_COMMISSION / 100 : pct / 100;
}
