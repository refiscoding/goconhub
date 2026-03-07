import { NextRequest, NextResponse } from "next/server";
import { otpStore } from "@/lib/otpStore";

// ─────────────────────────────────────────────────────────────────────────────
// To go live, pick ONE option and fill in your .env.local, then uncomment it.
//
// OPTION A — Twilio WhatsApp (easiest, free trial credit at twilio.com)
//   .env.local:
//     TWILIO_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
//     TWILIO_TOKEN=your_auth_token
//     TWILIO_WA_FROM=whatsapp:+14155238886   ← sandbox number
//
// OPTION B — Meta WhatsApp Cloud API (free 1,000 conversations/month)
//   .env.local:
//     META_WA_TOKEN=your_access_token
//     META_WA_PHONE_ID=your_phone_number_id
//
// OPTION C — Resend email (free 3,000 emails/month at resend.com)
//   .env.local:
//     RESEND_API_KEY=re_xxxxxxxxxxxx
// ─────────────────────────────────────────────────────────────────────────────

const IS_DEV = process.env.NODE_ENV === "development";

function generateOtp(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

async function sendWhatsApp(to: string, code: string): Promise<void> {
  // ── OPTION A: Twilio WhatsApp ─────────────────────────────────────────────
  if (process.env.TWILIO_SID && process.env.TWILIO_TOKEN) {
    const twilio = (await import("twilio")).default;
    const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_TOKEN);
    await client.messages.create({
      from: process.env.TWILIO_WA_FROM ?? "whatsapp:+14155238886",
      to: `whatsapp:${to}`,
      body: `Your HandyHub verification code: *${code}*\n\nValid for 10 minutes. Do not share this code.`,
    });
    return;
  }

  // ── OPTION B: Meta WhatsApp Cloud API ────────────────────────────────────
  if (process.env.META_WA_TOKEN && process.env.META_WA_PHONE_ID) {
    await fetch(`https://graph.facebook.com/v19.0/${process.env.META_WA_PHONE_ID}/messages`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.META_WA_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to: to.replace(/\D/g, ""),
        type: "text",
        text: { body: `Your HandyHub verification code: *${code}*\n\nValid for 10 minutes. Do not share this code.` },
      }),
    });
    return;
  }

  // No credentials configured
  throw new Error("No WhatsApp credentials configured. Add TWILIO_SID/TOKEN or META_WA_TOKEN to .env.local");
}

async function sendEmail(to: string, code: string): Promise<void> {
  // ── OPTION C: Resend email ────────────────────────────────────────────────
  if (process.env.RESEND_API_KEY) {
    const { Resend } = await import("resend");
    const resend = new Resend(process.env.RESEND_API_KEY);
    await resend.emails.send({
      from: "HandyHub <noreply@handyhub.co.bw>",
      to,
      subject: "Your HandyHub verification code",
      html: `
        <div style="font-family:sans-serif;max-width:400px;margin:0 auto;padding:32px">
          <h2 style="margin:0 0 8px">HandyHub verification code</h2>
          <p style="color:#666;margin:0 0 24px">Use this code to reset your password. Valid for 10 minutes.</p>
          <div style="background:#f5f5f5;border-radius:8px;padding:20px;text-align:center;font-size:32px;font-weight:800;letter-spacing:8px">${code}</div>
          <p style="color:#999;font-size:12px;margin-top:20px">If you did not request this, you can ignore this email.</p>
        </div>
      `,
    });
    return;
  }

  throw new Error("No email credentials configured. Add RESEND_API_KEY to .env.local");
}

export async function POST(req: NextRequest) {
  try {
    const { contact, method } = await req.json();

    if (!contact || !method) {
      return NextResponse.json({ message: "Contact and method are required." }, { status: 400 });
    }

    // Rate limit: max 1 OTP per 60 seconds per contact
    const existing = otpStore.get(contact);
    if (existing && Date.now() - existing.sentAt < 60 * 1000) {
      return NextResponse.json({ message: "Please wait 60 seconds before requesting a new code." }, { status: 429 });
    }

    const code = generateOtp();
    otpStore.set(contact, { code, expires: Date.now() + 10 * 60 * 1000, attempts: 0, sentAt: Date.now() });

    // ── Development mode: skip sending, return code directly ─────────────────
    if (IS_DEV && !process.env.TWILIO_SID && !process.env.META_WA_TOKEN && !process.env.RESEND_API_KEY) {
      console.log(`\n🔑 [DEV OTP] ${contact} → ${code}\n`);
      return NextResponse.json({
        success: true,
        message: `Code sent to ${contact}.`,
        devCode: code, // only present in dev with no credentials
      });
    }

    if (method === "whatsapp") {
      await sendWhatsApp(contact, code);
    } else {
      await sendEmail(contact, code);
    }

    return NextResponse.json({ success: true, message: `Code sent to ${contact}.` });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Failed to send OTP.";
    console.error("[OTP send error]", msg);
    return NextResponse.json({ message: msg }, { status: 500 });
  }
}
