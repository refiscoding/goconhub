import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { BookingFlow } from "@/components/customer/booking/BookingFlow";
import type { Vendor } from "@/lib/types";

interface PageProps {
  params: Promise<{ vendorId: string }>;
}

export default async function BookVendorPage({ params }: PageProps) {
  const session = await getSession();
  if (!session || session.role !== "customer") redirect("/auth?next=/customer/explore");

  const { vendorId } = await params;

  const v = await prisma.vendor.findUnique({
    where: { id: vendorId },
    include: {
      user:     { select: { firstName: true, lastName: true } },
      services: { where: { active: true }, select: { id: true, name: true, price: true, unit: true }, orderBy: { price: "asc" } },
    },
  });

  if (!v) notFound();

  const first = v.services[0];
  const vendor: Vendor = {
    id:       v.id,
    name:     `${v.user.firstName} ${v.user.lastName}`,
    cat:      v.category,
    loc:      v.location,
    rating:   v.rating,
    rev:      v.reviewCount,
    price:    first?.price ?? 0,
    unit:     (first?.unit ?? "hr") as "hr" | "job" | "day",
    avail:    v.available,
    verified: v.verified,
    tags:     v.skills,
    bio:      v.bio,
    services: v.services.map((s: { id: string; name: string; price: number; unit: string }) => ({ id: s.id, name: s.name, price: s.price, unit: s.unit as "hr" | "job" | "day" })),
  };

  return (
    <div data-theme="customer" style={{ minHeight: "100vh", background: "var(--bg)" }}>
      <BookingFlow vendor={vendor} />
    </div>
  );
}
