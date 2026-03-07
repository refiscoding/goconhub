import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

// POST /api/payments/dpo
// Creates a DPO Pay payment token and returns the redirect URL to DPO's hosted checkout.
export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "customer")
    return NextResponse.json({ message: "Unauthorized." }, { status: 401 });

  const { bookingId } = await req.json();
  if (!bookingId)
    return NextResponse.json({ message: "bookingId required." }, { status: 400 });

  const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
  if (!booking) return NextResponse.json({ message: "Booking not found." }, { status: 404 });
  if (booking.customerId !== session.userId)
    return NextResponse.json({ message: "Forbidden." }, { status: 403 });
  if (!booking.adminApprovedComplete)
    return NextResponse.json({ message: "Job completion not yet approved." }, { status: 400 });
  if (booking.paymentStatus === "confirmed")
    return NextResponse.json({ message: "Already paid." }, { status: 400 });

  const companyToken = process.env.DPO_COMPANY_TOKEN;
  const serviceType  = process.env.DPO_SERVICE_TYPE ?? "3854";
  const baseUrl      = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  // Dev mode — no real DPO token configured
  if (!companyToken) {
    if (process.env.NODE_ENV === "production" || process.env.ENABLE_TEST_PAYMENTS !== "true")
      return NextResponse.json({ message: "DPO_COMPANY_TOKEN not configured." }, { status: 500 });
    return NextResponse.json({
      payUrl: `${baseUrl}/api/payments/dpo/test-pay?bookingId=${booking.id}&amount=${booking.amount.toFixed(2)}`,
      token: "dev-mode",
    });
  }

  const serviceDate = new Date().toISOString().slice(0, 10).replace(/-/g, "/");

  const xml = `<?xml version="1.0" encoding="utf-8"?>
<API3G>
  <CompanyToken>${companyToken}</CompanyToken>
  <Request>createToken</Request>
  <Transaction>
    <PaymentAmount>${booking.amount.toFixed(2)}</PaymentAmount>
    <PaymentCurrency>BWP</PaymentCurrency>
    <CompanyRef>${booking.id}</CompanyRef>
    <RedirectURL>${baseUrl}/api/payments/dpo/callback</RedirectURL>
    <BackURL>${baseUrl}/customer/bookings</BackURL>
    <CompanyRefUnique>0</CompanyRefUnique>
    <PTL>5</PTL>
  </Transaction>
  <Services>
    <Service>
      <ServiceType>${serviceType}</ServiceType>
      <ServiceDescription>${booking.serviceName}</ServiceDescription>
      <ServiceDate>${serviceDate}</ServiceDate>
    </Service>
  </Services>
</API3G>`;

  try {
    const dpoRes = await fetch("https://secure.3gdirectpay.com/API/v6/", {
      method: "POST",
      headers: { "Content-Type": "application/xml" },
      body: xml,
    });

    const text        = await dpoRes.text();
    const result      = text.match(/<Result>(\d+)<\/Result>/)?.[1];
    const token       = text.match(/<TransToken>([^<]+)<\/TransToken>/)?.[1];
    const explanation = text.match(/<ResultExplanation>([^<]+)<\/ResultExplanation>/)?.[1];

    if (result !== "000" || !token) {
      console.error("[DPO createToken]", explanation, text);
      return NextResponse.json({ message: explanation ?? "Failed to create DPO payment token." }, { status: 400 });
    }

    return NextResponse.json({
      payUrl: `https://secure.3gdirectpay.com/payv2.php?ID=${token}`,
      token,
    });
  } catch (e) {
    console.error("[DPO createToken network]", e);
    return NextResponse.json({ message: "Could not reach DPO gateway." }, { status: 502 });
  }
}
