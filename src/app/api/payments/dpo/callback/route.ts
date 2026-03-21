import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCommissionRate } from "@/lib/settings";
import { logger } from "@/lib/logger";

// GET /api/payments/dpo/callback
// DPO Pay redirects here after the customer completes (or cancels) payment.
// Query params: TransactionToken, CompanyRef (bookingId)
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const transToken = searchParams.get("TransactionToken");
  const companyRef = searchParams.get("CompanyRef"); // bookingId

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  if (!transToken) {
    return NextResponse.redirect(`${baseUrl}/customer/bookings?payment=cancelled`);
  }

  const companyToken = process.env.DPO_COMPANY_TOKEN;
  if (!companyToken) {
    return NextResponse.redirect(`${baseUrl}/customer/bookings?payment=failed`);
  }

  // Verify the transaction with DPO
  const xml = `<?xml version="1.0" encoding="utf-8"?>
<API3G>
  <CompanyToken>${companyToken}</CompanyToken>
  <Request>verifyToken</Request>
  <TransactionToken>${transToken}</TransactionToken>
</API3G>`;

  try {
    const dpoRes = await fetch("https://secure.3gdirectpay.com/API/v6/", {
      method: "POST",
      headers: { "Content-Type": "application/xml" },
      body: xml,
    });

    const text     = await dpoRes.text();
    const result   = text.match(/<Result>(\d+)<\/Result>/)?.[1];
    const transRef = text.match(/<TransactionRef>([^<]+)<\/TransactionRef>/)?.[1]
                  ?? text.match(/<TransRef>([^<]+)<\/TransRef>/)?.[1]
                  ?? transToken;

    if (result !== "000") {
      logger.error("DPO callback verifyToken failed", { result, transToken });
      return NextResponse.redirect(`${baseUrl}/customer/bookings?payment=failed`);
    }

    const bookingId = companyRef ?? text.match(/<CompanyRef>([^<]+)<\/CompanyRef>/)?.[1];
    if (!bookingId) {
      return NextResponse.redirect(`${baseUrl}/customer/bookings?payment=failed`);
    }

    const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
    if (booking && booking.paymentStatus !== "confirmed") {
      const rate         = await getCommissionRate();
      const platformFee  = Math.round(booking.amount * rate * 100) / 100;
      const vendorAmount = Math.round((booking.amount - platformFee) * 100) / 100;

      await prisma.booking.update({
        where: { id: bookingId },
        data: {
          paymentStatus:    "confirmed",
          paymentMethod:    "dpo",
          paymentReference: transRef,
          status:           "completed",
          paidAt:           new Date(),
          platformFee,
          vendorAmount,
        },
      });
    }

    return NextResponse.redirect(
      `${baseUrl}/customer/bookings?payment=success&ref=${encodeURIComponent(transRef)}&amount=${booking?.amount ?? ""}`
    );
  } catch (e) {
    logger.error("DPO callback network error", { error: e instanceof Error ? e.message : String(e) });
    return NextResponse.redirect(`${baseUrl}/customer/bookings?payment=failed`);
  }
}
