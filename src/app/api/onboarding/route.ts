import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

// POST /api/onboarding
// Saves profile details collected during the onboarding wizard.
export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ message: "Unauthorized." }, { status: 401 });

  const data = await req.json();

  // Update common user fields
  await prisma.user.update({
    where: { id: session.userId },
    data: {
      ...(data.firstName != null && { firstName: data.firstName }),
      ...(data.lastName  != null && { lastName:  data.lastName }),
      ...(data.phone     != null && { phone:     data.phone }),
      ...(data.city      != null && { city:      data.city }),
      ...(data.area      != null && { area:      data.area }),
      ...(data.preferredServices != null && { preferredServices: data.preferredServices }),
    },
  });

  // Update vendor-specific fields
  if (session.role === "vendor" && data.vendorData) {
    const vd = data.vendorData;
    const vendor = await prisma.vendor.findUnique({ where: { userId: session.userId } });
    if (vendor) {
      await prisma.vendor.update({
        where: { id: vendor.id },
        data: {
          ...(vd.bio             != null && { bio:             vd.bio }),
          ...(vd.category        != null && { category:        vd.category }),
          ...(vd.skills          != null && { skills:          vd.skills }),
          ...(vd.city            != null && { location:        vd.city }),
          ...(vd.entityType      != null && { entityType:      vd.entityType }),
          ...(vd.idDocumentUrl   != null && { idDocumentUrl:   vd.idDocumentUrl }),
          ...(vd.cipaDocumentUrl != null && { cipaDocumentUrl: vd.cipaDocumentUrl }),
          ...(vd.companyName     != null && { companyName:     vd.companyName }),
          ...(vd.companyRegNumber != null && { companyRegNumber: vd.companyRegNumber }),
        },
      });

      // Create services if provided
      if (Array.isArray(vd.services) && vd.services.length > 0) {
        const validServices = vd.services.filter((s: { name: string; price: string }) => s.name && s.price);
        if (validServices.length > 0) {
          await prisma.service.createMany({
            data: validServices.map((s: { name: string; price: string; unit?: string; desc?: string }) => ({
              vendorId: vendor.id,
              name:  s.name,
              price: Number(s.price),
              unit:  (s.unit ?? "hr") as "hr" | "job" | "day",
              desc:  s.desc ?? "",
              active: true,
            })),
          });
        }
      }
    }
  }

  return NextResponse.json({ success: true });
}
