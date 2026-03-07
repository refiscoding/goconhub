import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth";
import { resetTokenStore } from "@/lib/otpStore";

// POST /api/otp/reset-password
// Body: { resetToken: string, password: string }
// resetToken is issued by /api/otp/verify after successful OTP check — cannot be skipped.
export async function POST(req: NextRequest) {
  try {
    const { resetToken, password } = await req.json();

    if (!resetToken || !password) {
      return NextResponse.json({ message: "Reset token and new password are required." }, { status: 400 });
    }

    if (password.length < 8) {
      return NextResponse.json({ message: "Password must be at least 8 characters." }, { status: 400 });
    }

    // Validate the reset token
    const stored = resetTokenStore.get(resetToken);
    if (!stored) {
      return NextResponse.json({ message: "Invalid or expired reset link. Please start over." }, { status: 400 });
    }
    if (Date.now() > stored.expires) {
      resetTokenStore.delete(resetToken);
      return NextResponse.json({ message: "Reset link has expired. Please start over." }, { status: 400 });
    }

    // Single-use: delete immediately
    resetTokenStore.delete(resetToken);

    const { contact } = stored;
    const isEmail = contact.includes("@");
    const where   = isEmail ? { email: contact } : { phone: contact };

    const newHash = await hashPassword(password);
    const updated = await prisma.user.updateMany({ where, data: { passwordHash: newHash } });

    if (updated.count === 0) {
      return NextResponse.json({ message: "No account found for that contact." }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ message: "Failed to reset password." }, { status: 500 });
  }
}
