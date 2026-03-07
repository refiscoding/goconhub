import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { otpStore, resetTokenStore } from "@/lib/otpStore";

const MAX_ATTEMPTS = 5;
const RESET_TOKEN_TTL = 15 * 60 * 1000; // 15 minutes

// POST /api/otp/verify
// Body: { contact: string, code: string }
// Returns: { resetToken } on success — must be passed to /api/otp/reset-password
export async function POST(req: NextRequest) {
  try {
    const { contact, code } = await req.json();

    if (!contact || !code) {
      return NextResponse.json({ message: "Contact and code are required." }, { status: 400 });
    }

    const stored = otpStore.get(contact);

    if (!stored) {
      return NextResponse.json({ message: "No code found. Please request a new one." }, { status: 400 });
    }

    if (Date.now() > stored.expires) {
      otpStore.delete(contact);
      return NextResponse.json({ message: "Code has expired. Please request a new one." }, { status: 400 });
    }

    // Brute-force lockout
    if (stored.attempts >= MAX_ATTEMPTS) {
      otpStore.delete(contact);
      return NextResponse.json({ message: "Too many failed attempts. Please request a new code." }, { status: 429 });
    }

    if (stored.code !== code) {
      // Increment failed attempt counter
      otpStore.set(contact, { ...stored, attempts: stored.attempts + 1 });
      const remaining = MAX_ATTEMPTS - stored.attempts - 1;
      return NextResponse.json({
        message: remaining > 0
          ? `Incorrect code. ${remaining} attempt${remaining === 1 ? "" : "s"} remaining.`
          : "Too many failed attempts. Please request a new code.",
      }, { status: 400 });
    }

    // Code is correct — remove from store
    otpStore.delete(contact);

    // Issue a one-time reset token (short-lived, single-use)
    const resetToken = randomBytes(32).toString("hex");
    resetTokenStore.set(resetToken, { contact, expires: Date.now() + RESET_TOKEN_TTL });

    return NextResponse.json({ success: true, resetToken });
  } catch {
    return NextResponse.json({ message: "Verification failed." }, { status: 500 });
  }
}
