import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

const MAX_AVATAR_BYTES  = 512 * 1024;  // 512 KB base64 string limit
const MAX_NAME_LEN      = 100;
const MAX_BIO_LEN       = 1000;
const MAX_CITY_LEN      = 100;

// PATCH /api/profile — update current user's profile
export async function PATCH(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ message: "Unauthorized." }, { status: 401 });

  let data: Record<string, unknown>;
  try {
    data = await req.json();
  } catch {
    return NextResponse.json({ message: "Invalid request body." }, { status: 400 });
  }

  // Input length validation
  if (data.firstName != null && (typeof data.firstName !== "string" || data.firstName.length > MAX_NAME_LEN))
    return NextResponse.json({ message: "First name is too long." }, { status: 400 });
  if (data.lastName != null && (typeof data.lastName !== "string" || data.lastName.length > MAX_NAME_LEN))
    return NextResponse.json({ message: "Last name is too long." }, { status: 400 });
  if (data.city != null && (typeof data.city !== "string" || data.city.length > MAX_CITY_LEN))
    return NextResponse.json({ message: "City name is too long." }, { status: 400 });
  if (data.area != null && (typeof data.area !== "string" || data.area.length > MAX_CITY_LEN))
    return NextResponse.json({ message: "Area name is too long." }, { status: 400 });
  if (data.bio != null && (typeof data.bio !== "string" || data.bio.length > MAX_BIO_LEN))
    return NextResponse.json({ message: `Bio cannot exceed ${MAX_BIO_LEN} characters.` }, { status: 400 });

  // avatarUrl size guard (base64-encoded images can be large)
  if (data.avatarUrl != null) {
    if (typeof data.avatarUrl !== "string")
      return NextResponse.json({ message: "Invalid avatar." }, { status: 400 });
    if (data.avatarUrl.length > MAX_AVATAR_BYTES)
      return NextResponse.json({ message: "Image is too large. Please use a smaller photo (max 512 KB)." }, { status: 400 });
  }

  try {
    const user = await prisma.user.update({
      where: { id: session.userId },
      data: {
        ...(data.firstName != null && { firstName: (data.firstName as string).trim() }),
        ...(data.lastName  != null && { lastName:  (data.lastName  as string).trim() }),
        ...(data.phone     != null && { phone:     data.phone     as string }),
        ...(data.city      != null && { city:      (data.city     as string).trim() }),
        ...(data.area      != null && { area:      (data.area     as string).trim() }),
        ...(data.preferredServices != null && { preferredServices: data.preferredServices as string[] }),
        ...(data.avatarUrl != null && { avatarUrl: data.avatarUrl as string }),
      },
      select: {
        id: true, email: true, phone: true, firstName: true, lastName: true,
        city: true, area: true, preferredServices: true, role: true, avatarUrl: true,
      },
    });

    if (session.role === "vendor" && (data.bio != null || data.category != null || data.skills != null || data.available != null)) {
      await prisma.vendor.update({
        where: { userId: session.userId },
        data: {
          ...(data.bio       != null && { bio:       (data.bio      as string).trim() }),
          ...(data.category  != null && { category:  data.category  as string }),
          ...(data.skills    != null && { skills:    data.skills    as string[] }),
          ...(data.available != null && { available: data.available as boolean }),
        },
      });
    }

    return NextResponse.json({ user });
  } catch {
    return NextResponse.json({ message: "Failed to update profile." }, { status: 500 });
  }
}
