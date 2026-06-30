export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const userCount = await prisma.user.count();

    return Response.json({
      ok: true,
      databaseConnected: true,
      userCount,
      time: new Date().toISOString(),
    });
  } catch (error) {
    console.error("DEBUG_DB_ERROR:", error);

    return Response.json(
      {
        ok: false,
        databaseConnected: false,
        error: error instanceof Error ? error.message : String(error),
        time: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}