import { NextRequest, NextResponse } from "next/server";

// GET /api/payments/dpo/test-pay?bookingId=...&amount=...
// DEV ONLY — simulates DPO's hosted payment page.
// Remove or guard this route before going to production.
export async function GET(req: NextRequest) {
  // Require explicit opt-in — NODE_ENV alone is not sufficient (staging environments may not be "production")
  if (process.env.NODE_ENV === "production" || process.env.ENABLE_TEST_PAYMENTS !== "true") {
    return NextResponse.json({ message: "Not found." }, { status: 404 });
  }

  const { searchParams } = new URL(req.url);
  const bookingId = searchParams.get("bookingId") ?? "";
  const amount    = searchParams.get("amount")    ?? "0";
  const baseUrl   = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  const callbackUrl = `${baseUrl}/api/payments/dpo/callback?TransactionToken=DEV-${Date.now()}&CompanyRef=${bookingId}`;

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>DPO Pay — Test Checkout</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; background: #f0f4f8; min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 24px; }
    .card { background: #fff; border-radius: 20px; padding: 32px 28px; max-width: 420px; width: 100%; box-shadow: 0 8px 32px rgba(0,0,0,.12); }
    .badge { display: inline-block; background: #fef3c7; color: #92400e; font-size: 11px; font-weight: 700; padding: 4px 12px; border-radius: 999px; letter-spacing: .06em; text-transform: uppercase; margin-bottom: 20px; }
    .logo { font-size: 22px; font-weight: 800; color: #1a56db; margin-bottom: 6px; }
    .sub { font-size: 13px; color: #6b7280; margin-bottom: 24px; }
    .amount { font-size: 32px; font-weight: 800; color: #111827; margin-bottom: 4px; }
    .amount-label { font-size: 13px; color: #6b7280; margin-bottom: 28px; }
    .field { width: 100%; padding: 12px 14px; border: 1.5px solid #e5e7eb; border-radius: 10px; font-size: 15px; outline: none; margin-top: 6px; transition: border-color .15s; }
    .field:focus { border-color: #1a56db; }
    label { font-size: 11px; font-weight: 700; color: #6b7280; text-transform: uppercase; letter-spacing: .06em; display: block; margin-top: 14px; }
    .row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
    .btn { width: 100%; padding: 15px; border-radius: 12px; border: none; font-size: 16px; font-weight: 700; cursor: pointer; margin-top: 24px; }
    .btn-pay { background: #1a56db; color: #fff; }
    .btn-cancel { background: #f3f4f6; color: #374151; margin-top: 10px; }
    .lock { font-size: 12px; color: #9ca3af; text-align: center; margin-top: 14px; }
  </style>
</head>
<body>
  <div class="card">
    <div class="badge">Test Mode — No real charge</div>
    <div class="logo">DPO Pay</div>
    <div class="sub">Secure hosted checkout (simulated)</div>
    <div class="amount">BWP ${amount}</div>
    <div class="amount-label">Booking ref: ${bookingId.slice(-8).toUpperCase()}</div>

    <label>Card Number</label>
    <input class="field" placeholder="4111 1111 1111 1111" maxlength="19" />

    <div class="row">
      <div>
        <label>Expiry</label>
        <input class="field" placeholder="MM/YY" maxlength="5" />
      </div>
      <div>
        <label>CVV</label>
        <input class="field" placeholder="123" maxlength="4" type="password" />
      </div>
    </div>

    <label>Cardholder Name</label>
    <input class="field" placeholder="Name as on card" style="text-transform:uppercase" />

    <label>Email for Receipt</label>
    <input class="field" placeholder="you@email.com" type="email" />

    <button class="btn btn-pay" onclick="window.location.href='${callbackUrl}'">Pay BWP ${amount}</button>
    <button class="btn btn-cancel" onclick="window.location.href='${baseUrl}/customer/bookings?payment=cancelled'">Cancel</button>

    <p class="lock">🔒 Test mode — clicking Pay simulates a successful payment</p>
  </div>
</body>
</html>`;

  return new NextResponse(html, { headers: { "Content-Type": "text/html" } });
}
