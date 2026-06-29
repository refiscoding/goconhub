export const dynamic = "force-dynamic";

export async function GET() {
  console.log("DEBUG_ROUTE_HIT");

  return Response.json({
    ok: true,
    hasDatabaseUrl: Boolean(process.env.DATABASE_URL),
    hasJwtSecret: Boolean(process.env.JWT_SECRET),
    hasAuthSecret: Boolean(process.env.AUTH_SECRET),
    hasSupabaseUrl: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL),
    hasSupabaseKey: Boolean(process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY),
    time: new Date().toISOString(),
  });
}