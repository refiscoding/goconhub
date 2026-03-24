"use client";
import { useEffect, useState, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Toast, PageSpinner } from "@/components/ui";
import { useToast } from "@/hooks/useToast";
import { fmtPrice } from "@/lib/fmt";
import { Star, AlertTriangle } from "lucide-react";

interface ApiBooking {
  id: string;
  serviceName: string;
  date: string;
  time: string;
  amount: number;
  status: string;
  completedByVendor: boolean;
  adminApprovedComplete: boolean;
  paymentStatus: string;
  paymentMethod: string | null;
  paymentReference: string | null;
  paidAt: string | null;
  vendor: { id: string; user: { firstName: string; lastName: string } };
}

const STATUS_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  pending:   { label: "Pending",   color: "#f59e0b",       bg: "rgba(245,158,11,.12)"  },
  confirmed: { label: "Confirmed", color: "var(--green)",  bg: "var(--green-bg)"       },
  completed: { label: "Completed", color: "#6366f1",       bg: "rgba(99,102,241,.12)"  },
  declined:  { label: "Declined",  color: "var(--red)",    bg: "var(--red-bg)"         },
};

const METHOD_ICONS: Record<string, string> = { dpo: "💳", orange: "🟠", ewallet: "👜" };
const METHOD_NAMES: Record<string, string> = { dpo: "DPO Pay", orange: "Orange Money", ewallet: "eWallet" };

const LBL: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <label style={{ fontSize: 11, fontWeight: 700, color: "var(--ink3)", textTransform: "uppercase", letterSpacing: ".06em", display: "block", marginBottom: 7 }}>{children}</label>
);

// Format expiry as MM/YY
function fmtExpiry(v: string) {
  const d = v.replace(/\D/g, "").slice(0, 4);
  return d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d;
}

function CustomerBookingsPage() {
  const [bookings,   setBookings]   = useState<ApiBooking[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [toast, showToast] = useToast();
  const searchParams = useSearchParams();

  // Modal
  const [payTarget,  setPayTarget]  = useState<ApiBooking | null>(null);
  const [payMethod,  setPayMethod]  = useState<"dpo" | "orange" | "ewallet" | "">("");
  const [step,       setStep]       = useState<"method" | "dpo-redirect" | "manual" | "success">("method");
  const [submitting, setSubmitting] = useState(false);
  const [dpoLoading, setDpoLoading] = useState(false);

  // Orange / eWallet reference
  const [payRef, setPayRef] = useState("");

  // Dispute
  const [disputeTarget,  setDisputeTarget]  = useState<ApiBooking | null>(null);
  const [disputeReason,  setDisputeReason]  = useState("");
  const [disputeBusy,    setDisputeBusy]    = useState(false);
  const [disputed,       setDisputed]       = useState<Set<string>>(new Set());

  const openDispute  = (b: ApiBooking) => { setDisputeTarget(b); setDisputeReason(""); };
  const closeDispute = () => setDisputeTarget(null);

  const submitDispute = async () => {
    if (!disputeTarget || !disputeReason.trim()) return;
    setDisputeBusy(true);
    try {
      const res  = await fetch("/api/disputes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId: disputeTarget.id, reason: disputeReason.trim() }),
      });
      const data = await res.json();
      if (!res.ok) { showToast(data.message ?? "Failed to raise dispute", "err"); return; }
      setDisputed((s) => new Set(s).add(disputeTarget.id));
      showToast("Dispute submitted — admin will review shortly", "ok");
      closeDispute();
    } catch { showToast("Network error", "err"); }
    finally { setDisputeBusy(false); }
  };

  // Review
  const [reviewTarget, setReviewTarget] = useState<ApiBooking | null>(null);
  const [reviewRating,  setReviewRating]  = useState(0);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewHover,   setReviewHover]   = useState(0);
  const [reviewBusy,    setReviewBusy]    = useState(false);
  const [reviewed,      setReviewed]      = useState<Set<string>>(new Set());

  const openReview = (b: ApiBooking) => { setReviewTarget(b); setReviewRating(0); setReviewComment(""); };
  const closeReview = () => { setReviewTarget(null); };

  const submitReview = async () => {
    if (!reviewTarget || !reviewRating) return;
    setReviewBusy(true);
    try {
      const res = await fetch(`/api/vendors/${reviewTarget.vendor.id}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating: reviewRating, comment: reviewComment }),
      });
      const data = await res.json();
      if (!res.ok) { showToast(data.message ?? "Failed", "err"); return; }
      setReviewed((s) => new Set(s).add(reviewTarget.id));
      showToast("Review submitted", "ok");
      closeReview();
    } catch { showToast("Network error", "err"); }
    finally { setReviewBusy(false); }
  };

  // Success data (from DPO callback query params)
  const [successRef,    setSuccessRef]    = useState("");
  const [successAmount, setSuccessAmount] = useState("");

  const load = useCallback(() => {
    setLoading(true);
    fetch("/api/bookings")
      .then((r) => r.json())
      .then((d) => setBookings(d.bookings ?? []))
      .catch(() => showToast("Failed to load bookings", "err"))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  // Handle DPO callback query params on page load
  useEffect(() => {
    const payment = searchParams.get("payment");
    const ref     = searchParams.get("ref");
    const amount  = searchParams.get("amount");

    if (payment === "success") {
      setSuccessRef(ref ?? "");
      setSuccessAmount(amount ?? "");
      setStep("success");
      setPayTarget({} as ApiBooking); // open modal in success state
      // Clean URL
      window.history.replaceState({}, "", "/customer/bookings");
    } else if (payment === "failed") {
      showToast("Payment failed. Please try again.", "err");
      window.history.replaceState({}, "", "/customer/bookings");
    } else if (payment === "cancelled") {
      showToast("Payment was cancelled.", "err");
      window.history.replaceState({}, "", "/customer/bookings");
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openPay = (b: ApiBooking) => {
    setPayTarget(b);
    setPayMethod("");
    setStep("method");
    setPayRef("");
  };

  const closeModal = () => {
    setPayTarget(null);
    setStep("method");
  };

  // DPO — create token then redirect customer to DPO's hosted checkout
  const handleDpo = async (b: ApiBooking) => {
    setDpoLoading(true);
    try {
      const res  = await fetch("/api/payments/dpo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId: b.id }),
      });
      const data = await res.json();
      if (!res.ok) {
        showToast(data.message ?? "Could not initiate payment.", "err");
        return;
      }
      // Redirect to DPO's hosted payment page
      window.location.href = data.payUrl;
    } catch {
      showToast("Network error. Please try again.", "err");
    } finally {
      setDpoLoading(false);
    }
  };

  const goToMethod = (m: "dpo" | "orange" | "ewallet") => {
    setPayMethod(m);
    if (m === "dpo") {
      // Immediately initiate DPO redirect (no card form in our UI)
      if (payTarget && payTarget.id) handleDpo(payTarget);
    } else {
      setStep("manual");
    }
  };

  // Orange / eWallet — submit reference for admin confirmation
  const submitManual = async () => {
    if (!payTarget || !payMethod) return;
    if (!payRef.trim()) { showToast("Enter the transaction reference", "err"); return; }
    setSubmitting(true);
    try {
      const res  = await fetch(`/api/bookings/${payTarget.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentStatus: "submitted", paymentMethod: payMethod, paymentReference: payRef.trim() }),
      });
      const data = await res.json();
      if (!res.ok) { showToast(data.message ?? "Failed", "err"); return; }
      showToast("Payment submitted — awaiting admin confirmation", "ok");
      closeModal(); load();
    } catch { showToast("Network error", "err"); }
    finally { setSubmitting(false); }
  };

  const awaitingPayment = bookings.filter((b) => b.adminApprovedComplete && b.paymentStatus === "unpaid");

  return (
    <div className="cust-page-wrap">
      {toast && <Toast msg={toast.msg} type={toast.type} />}

      <div className="page-top cust-page-header">
        <h1 className="cust-heading" style={{ fontSize: 26 }}>My Bookings</h1>
        <p style={{ fontSize: 13, color: "var(--ink3)", marginTop: 3 }}>{bookings.length} total</p>
      </div>

      <div className="cust-page-body" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {loading ? (
          <PageSpinner paddingY="48px" />
        ) : bookings.length === 0 ? (
          <div style={{ textAlign: "center", padding: "48px 0", color: "var(--ink3)" }}>
            <p style={{ fontSize: 32, marginBottom: 8 }}>📋</p>
            <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, fontSize: 16 }}>No bookings yet</p>
            <p style={{ fontSize: 13, marginTop: 6, color: "var(--ink3)" }}>Your bookings will appear here</p>
          </div>
        ) : bookings.map((b) => {
          const s          = STATUS_LABELS[b.status] ?? STATUS_LABELS.pending;
          const vendorName = `${b.vendor.user.firstName} ${b.vendor.user.lastName}`;
          const needsPay   = b.adminApprovedComplete && b.paymentStatus === "unpaid";
          const submitted  = b.paymentStatus === "submitted";
          const paid       = b.paymentStatus === "confirmed";
          return (
            <div key={b.id} className="cust-card" style={{ padding: "16px 18px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                <div>
                  <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, fontSize: 15 }}>{b.serviceName}</p>
                  <p style={{ fontSize: 13, color: "var(--ink2)", marginTop: 2 }}>{vendorName}</p>
                  <p style={{ fontSize: 12, color: "var(--ink3)", marginTop: 2 }}>{b.date} · {b.time}</p>
                </div>
                <span className="cust-pill" style={{ background: s.bg, color: s.color }}>{s.label}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 10, borderTop: "1px solid var(--border)" }}>
                <p style={{ fontWeight: 800, fontSize: 16, color: "#1A7A5E" }}>{fmtPrice(b.amount)}</p>
                <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", justifyContent: "flex-end" }}>
                  {paid && (
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <span className="cust-pill" style={{ background: "var(--green-bg)", color: "var(--green)" }}>Paid</span>
                      {b.paidAt && <span style={{ fontSize: 11, color: "var(--ink3)" }}>{new Date(b.paidAt).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}</span>}
                    </div>
                  )}
                  {submitted && <span className="cust-pill" style={{ background: "rgba(99,102,241,.12)", color: "#6366f1" }}>Payment Pending</span>}
                  {needsPay && (
                    <button onClick={() => openPay(b)} style={{ padding: "8px 18px", fontSize: 13, fontWeight: 700, background: "linear-gradient(135deg, #1A7A5E, #2ECC9A)", color: "#fff", border: "none", borderRadius: 999, cursor: "pointer", transition: "all .2s" }}>Pay Now</button>
                  )}
                  {b.status === "completed" && !reviewed.has(b.id) && (
                    <button onClick={() => openReview(b)}
                      style={{ display: "flex", alignItems: "center", gap: 5, padding: "7px 14px", borderRadius: 999, border: "1.5px solid #f59e0b", background: "rgba(245,158,11,.08)", color: "#d97706", fontWeight: 700, fontSize: 12, cursor: "pointer" }}>
                      <Star size={13} fill="#f59e0b" color="#f59e0b" /> Review
                    </button>
                  )}
                  {b.status === "completed" && reviewed.has(b.id) && (
                    <span className="cust-pill" style={{ background: "rgba(245,158,11,.1)", color: "#d97706" }}>Reviewed</span>
                  )}
                  {(b.status === "confirmed" || b.status === "completed") && !disputed.has(b.id) && (
                    <button onClick={() => openDispute(b)}
                      style={{ display: "flex", alignItems: "center", gap: 5, padding: "7px 14px", borderRadius: 999, border: "1.5px solid var(--red)", background: "var(--red-bg)", color: "var(--red)", fontWeight: 700, fontSize: 12, cursor: "pointer" }}>
                      <AlertTriangle size={12} /> Dispute
                    </button>
                  )}
                  {disputed.has(b.id) && (
                    <span className="cust-pill" style={{ background: "var(--red-bg)", color: "var(--red)" }}>Disputed</span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Pay Now modal ── */}
      {payTarget && (
        <div style={{ position: "fixed", inset: 0, zIndex: 100 }}>
          <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,.5)" }} onClick={step !== "success" ? closeModal : undefined} />
          <div style={{ position: "absolute", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: 430, background: "var(--bg)", borderRadius: "24px 24px 0 0", padding: "24px 22px 44px", maxHeight: "92vh", overflowY: "auto" }}>
            <div style={{ width: 40, height: 4, borderRadius: 999, background: "var(--border2)", margin: "0 auto 20px" }} />

            {/* ── Step: Method selection ── */}
            {step === "method" && (
              <>
                <h3 className="cust-heading" style={{ fontSize: 20, marginBottom: 4 }}>Pay for Service</h3>
                <p style={{ fontSize: 13, color: "var(--ink3)", marginBottom: 20 }}>
                  {payTarget.serviceName} · <strong style={{ color: "var(--acc)" }}>{fmtPrice(payTarget.amount)}</strong>
                </p>
                <p style={{ fontSize: 11, fontWeight: 700, color: "var(--ink3)", textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 12 }}>Select Payment Method</p>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {(["dpo", "orange", "ewallet"] as const).map((m) => (
                    <button key={m} onClick={() => goToMethod(m)}
                      disabled={dpoLoading}
                      style={{ padding: "16px 18px", borderRadius: 14, border: "1.5px solid var(--border)", background: "var(--card)", display: "flex", alignItems: "center", gap: 14, cursor: dpoLoading ? "not-allowed" : "pointer", textAlign: "left", opacity: dpoLoading && m !== "dpo" ? 0.5 : 1 }}
                    >
                      <span style={{ fontSize: 26 }}>{dpoLoading && m === "dpo" ? "⏳" : METHOD_ICONS[m]}</span>
                      <div style={{ flex: 1 }}>
                        <p style={{ fontWeight: 700, fontSize: 14, color: "var(--ink)" }}>{METHOD_NAMES[m]}</p>
                        <p style={{ fontSize: 12, color: "var(--ink3)", marginTop: 2 }}>
                          {m === "dpo"     && (dpoLoading ? "Connecting to DPO gateway…" : "Pay securely via DPO Pay online gateway")}
                          {m === "orange"  && "Transfer via Orange Money, submit reference"}
                          {m === "ewallet" && "Transfer via eWallet, submit reference"}
                        </p>
                      </div>
                      {!dpoLoading && <span style={{ color: "var(--ink3)", fontSize: 18 }}>›</span>}
                    </button>
                  ))}
                </div>
                {/* DPO secure badge */}
                <div style={{ marginTop: 16, padding: "10px 14px", borderRadius: 12, background: "var(--card)", border: "1px solid var(--border)", display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 16 }}>🔒</span>
                  <p style={{ fontSize: 11, color: "var(--ink3)", lineHeight: 1.5 }}>
                    DPO Pay is a certified payment gateway. Your card details are entered securely on DPO&apos;s encrypted checkout page — never on this site.
                  </p>
                </div>
              </>
            )}

            {/* ── Step: Manual reference (Orange / eWallet) ── */}
            {step === "manual" && (
              <>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
                  <button onClick={() => setStep("method")} style={{ background: "none", border: "none", fontSize: 22, cursor: "pointer", color: "var(--ink3)", lineHeight: 1 }}>‹</button>
                  <div>
                    <h3 className="cust-heading" style={{ fontSize: 20 }}>{METHOD_NAMES[payMethod] || ""}</h3>
                    <p style={{ fontSize: 13, color: "var(--ink3)", marginTop: 1 }}>
                      {payTarget.serviceName} · <strong style={{ color: "var(--acc)" }}>{fmtPrice(payTarget.amount)}</strong>
                    </p>
                  </div>
                </div>

                {/* Transfer instructions */}
                <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 14, padding: "16px 18px", marginBottom: 20 }}>
                  <p style={{ fontSize: 12, fontWeight: 700, color: "var(--ink3)", textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 10 }}>Transfer Instructions</p>
                  {payMethod === "orange" && (
                    <p style={{ fontSize: 14, color: "var(--ink)", lineHeight: 1.7 }}>
                      1. Open Orange Money on your phone<br />
                      2. Select <strong>Send Money</strong><br />
                      3. Enter number: <strong style={{ color: "var(--acc)", fontSize: 16 }}>74 000 000</strong><br />
                      4. Amount: <strong style={{ color: "var(--acc)" }}>{fmtPrice(payTarget.amount)}</strong><br />
                      5. Reference: <strong>HH-{payTarget.id.slice(-6).toUpperCase()}</strong>
                    </p>
                  )}
                  {payMethod === "ewallet" && (
                    <p style={{ fontSize: 14, color: "var(--ink)", lineHeight: 1.7 }}>
                      1. Open your eWallet app<br />
                      2. Select <strong>Transfer</strong><br />
                      3. Enter number: <strong style={{ color: "var(--acc)", fontSize: 16 }}>72 000 000</strong><br />
                      4. Amount: <strong style={{ color: "var(--acc)" }}>{fmtPrice(payTarget.amount)}</strong><br />
                      5. Reference: <strong>HH-{payTarget.id.slice(-6).toUpperCase()}</strong>
                    </p>
                  )}
                </div>

                <div>
                  <LBL>Transaction Reference / Receipt No.</LBL>
                  <input className="field" placeholder="e.g. TXN123456789"
                    value={payRef} onChange={(e) => setPayRef(e.target.value)} />
                  <p style={{ fontSize: 12, color: "var(--ink3)", marginTop: 6 }}>
                    After completing the transfer, enter the reference from your confirmation SMS. Admin will verify and confirm.
                  </p>
                </div>

                <button
                  onClick={submitManual}
                  disabled={submitting || !payRef.trim()}
                  className="btn-pri"
                  style={{ width: "100%", padding: 16, fontSize: 15, fontWeight: 700, marginTop: 18, opacity: (submitting || !payRef.trim()) ? 0.6 : 1 }}
                >{submitting ? "Submitting…" : "Submit Payment"}</button>
              </>
            )}

            {/* ── Step: Success (from DPO callback redirect) ── */}
            {step === "success" && (
              <div style={{ textAlign: "center", padding: "12px 0 8px" }}>
                <div style={{ width: 72, height: 72, borderRadius: "50%", background: "var(--green-bg)", border: "2px solid rgba(12,166,120,.3)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 18px", fontSize: 32 }}></div>
                <h3 className="cust-heading" style={{ fontSize: 22, color: "var(--green)" }}>Payment Successful!</h3>
                {successAmount && (
                  <p style={{ fontSize: 14, color: "var(--ink2)", marginTop: 8, lineHeight: 1.6 }}>
                    <strong>{fmtPrice(Number(successAmount))}</strong> paid via DPO Pay.
                  </p>
                )}
                {successRef && (
                  <div style={{ margin: "16px 0", background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12, padding: "12px 16px" }}>
                    <p style={{ fontSize: 11, color: "var(--ink3)", fontWeight: 700, textTransform: "uppercase", letterSpacing: ".06em" }}>Transaction Reference</p>
                    <p style={{ fontFamily: "'DM Mono', monospace", fontWeight: 700, fontSize: 14, color: "#1A7A5E", marginTop: 4 }}>{successRef}</p>
                  </div>
                )}
                <p style={{ fontSize: 12, color: "var(--ink3)", marginTop: 8 }}>Your booking is now complete.</p>
                <button
                  onClick={() => { closeModal(); load(); }}
                  className="btn-pri"
                  style={{ width: "100%", padding: 15, fontSize: 15, fontWeight: 700, marginTop: 20 }}
                >Done</button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Review modal ── */}
      {reviewTarget && (
        <div style={{ position: "fixed", inset: 0, zIndex: 100 }}>
          <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,.5)" }} onClick={closeReview} />
          <div style={{ position: "absolute", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: 430, background: "var(--bg)", borderRadius: "24px 24px 0 0", padding: "24px 22px 44px" }}>
            <div style={{ width: 40, height: 4, borderRadius: 999, background: "var(--border2)", margin: "0 auto 20px" }} />
            <h3 className="cust-heading" style={{ fontSize: 20, marginBottom: 4 }}>How was it?</h3>
            <p style={{ fontSize: 13, color: "var(--ink3)", marginBottom: 20 }}>
              {reviewTarget.serviceName} · {reviewTarget.vendor.user.firstName} {reviewTarget.vendor.user.lastName}
            </p>
            <div style={{ display: "flex", justifyContent: "center", gap: 10, marginBottom: 20 }}>
              {[1,2,3,4,5].map((n) => (
                <button key={n}
                  onMouseEnter={() => setReviewHover(n)} onMouseLeave={() => setReviewHover(0)}
                  onClick={() => setReviewRating(n)}
                  style={{ background: "none", border: "none", cursor: "pointer", fontSize: 38, lineHeight: 1, color: n <= (reviewHover || reviewRating) ? "#f59e0b" : "var(--border2)", transition: "color .1s" }}>★</button>
              ))}
            </div>
            {reviewRating > 0 && (
              <p style={{ textAlign: "center", fontSize: 14, fontWeight: 700, color: "#d97706", marginBottom: 16 }}>
                {["","Poor","Fair","Good","Great","Excellent"][reviewRating]}
              </p>
            )}
            <textarea className="field" rows={3} placeholder="Share your experience (optional)…"
              value={reviewComment} onChange={(e) => setReviewComment(e.target.value)} style={{ resize: "vertical" }} />
            <button onClick={submitReview} disabled={reviewBusy || !reviewRating} className="btn-pri"
              style={{ width: "100%", padding: 15, fontSize: 15, fontWeight: 700, marginTop: 14, opacity: (!reviewRating || reviewBusy) ? 0.6 : 1 }}>
              {reviewBusy ? "Submitting…" : "Submit Review"}
            </button>
          </div>
        </div>
      )}

      {/* ── Dispute modal ── */}
      {disputeTarget && (
        <div style={{ position: "fixed", inset: 0, zIndex: 100 }}>
          <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,.5)" }} onClick={closeDispute} />
          <div style={{ position: "absolute", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: 430, background: "var(--bg)", borderRadius: "24px 24px 0 0", padding: "24px 22px 44px" }}>
            <div style={{ width: 40, height: 4, borderRadius: 999, background: "var(--border2)", margin: "0 auto 20px" }} />
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: "var(--red-bg)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <AlertTriangle size={18} color="var(--red)" />
              </div>
              <h3 className="cust-heading" style={{ fontSize: 20 }}>Raise a Dispute</h3>
            </div>
            <p style={{ fontSize: 13, color: "var(--ink3)", marginBottom: 20 }}>
              {disputeTarget.serviceName} · {disputeTarget.vendor?.user.firstName} {disputeTarget.vendor?.user.lastName}
            </p>
            <div style={{ background: "var(--red-bg)", border: "1px solid rgba(220,38,38,.2)", borderRadius: 12, padding: "12px 14px", marginBottom: 18 }}>
              <p style={{ fontSize: 12, color: "var(--red)", lineHeight: 1.6 }}>
                Disputes are reviewed by admin within 24–48 hours. Please describe the issue clearly so we can resolve it quickly.
              </p>
            </div>
            <label style={{ fontSize: 11, fontWeight: 700, color: "var(--ink3)", textTransform: "uppercase", letterSpacing: ".06em", display: "block", marginBottom: 7 }}>
              Describe the issue *
            </label>
            <textarea className="field" rows={4}
              placeholder="e.g. The vendor did not show up, work was incomplete, quality was poor…"
              value={disputeReason}
              onChange={(e) => setDisputeReason(e.target.value)}
              style={{ resize: "vertical", minHeight: 100 }}
            />
            <button
              onClick={submitDispute}
              disabled={disputeBusy || !disputeReason.trim()}
              style={{ width: "100%", padding: 15, fontSize: 15, fontWeight: 700, marginTop: 14, borderRadius: 14, border: "none", background: "var(--red)", color: "#fff", cursor: disputeBusy || !disputeReason.trim() ? "not-allowed" : "pointer", opacity: (disputeBusy || !disputeReason.trim()) ? 0.6 : 1 }}
            >{disputeBusy ? "Submitting…" : "Submit Dispute"}</button>
          </div>
        </div>
      )}

      {/* Alert banner */}
      {awaitingPayment.length > 0 && !payTarget && (
        <div className="pay-alert-banner">
          <p style={{ color: "#fff", fontWeight: 700, fontSize: 13 }}>
            {awaitingPayment.length} booking{awaitingPayment.length > 1 ? "s" : ""} ready to pay
          </p>
          <button
            onClick={() => openPay(awaitingPayment[0])}
            style={{ background: "rgba(255,255,255,.25)", border: "none", borderRadius: 999, color: "#fff", fontWeight: 700, fontSize: 12, padding: "6px 14px", cursor: "pointer" }}
          >Pay Now</button>
        </div>
      )}
    </div>
  );
}

export default function BookingsPageWrapper() {
  return (
    <Suspense fallback={null}>
      <CustomerBookingsPage />
    </Suspense>
  );
}
