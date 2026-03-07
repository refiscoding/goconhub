"use client";
import { FC, useState, useEffect } from "react";
import { Avatar } from "@/components/ui";
import { IconBell } from "@/components/icons";
import { StatCard } from "./StatCard";
import { BookingRequestCard } from "./BookingRequestCard";
import { Toast } from "@/components/ui";
import { useToast } from "@/hooks/useToast";
import { useUser } from "@/context/UserContext";
import type { Booking, BookingStatus } from "@/lib/types";

interface ApiBooking {
  id: string;
  serviceName: string;
  date: string;
  time: string;
  location: string;
  amount: number;
  status: BookingStatus;
  completedByVendor: boolean;
  adminApprovedComplete: boolean;
  paymentStatus: string;
  customer: { firstName: string; lastName: string; phone: string | null };
  vendor: { user: { firstName: string; lastName: string } };
}

function toBooking(b: ApiBooking): Booking {
  return {
    id:       b.id,
    customer: `${b.customer.firstName} ${b.customer.lastName}`,
    vendor:   `${b.vendor.user.firstName} ${b.vendor.user.lastName}`,
    service:  b.serviceName,
    date:     b.date,
    time:     b.time,
    status:   b.status,
    amount:   b.amount,
    loc:      b.location,
  };
}

interface EarningRecord {
  id: string; serviceName: string; amount: number; vendorAmount?: number; paidAt: string | null; paymentMethod: string | null;
  customer: { firstName: string; lastName: string };
}

const METHOD_NAMES: Record<string, string> = { dpo: "DPO Pay", orange: "Orange Money", ewallet: "eWallet" };

export const VendorDash: FC = () => {
  const { user } = useUser();
  const [apiBookings, setApiBookings] = useState<ApiBooking[]>([]);
  const [bookings,    setBookings]    = useState<Booking[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [earnings,    setEarnings]    = useState<EarningRecord[]>([]);
  const [totalPaid,   setTotalPaid]   = useState(0);
  const [toast, showToast] = useToast();

  useEffect(() => {
    fetch("/api/bookings")
      .then((r) => r.json())
      .then((data) => {
        const api: ApiBooking[] = data.bookings ?? [];
        setApiBookings(api);
        setBookings(api.map(toBooking));
      })
      .catch(() => {})
      .finally(() => setLoading(false));

    fetch("/api/vendor/earnings")
      .then((r) => r.json())
      .then((d) => { setEarnings(d.payments ?? []); setTotalPaid(d.total ?? 0); })
      .catch(() => {});
  }, []);

  const pending   = bookings.filter((b) => b.status === "pending");
  const confirmed = bookings.filter((b) => b.status === "confirmed");
  const done      = bookings.filter((b) => b.status === "completed");
  const totalEarnings = done.reduce((sum, b) => sum + b.amount, 0);

  const update = async (id: string, status: BookingStatus) => {
    const api = apiBookings.find((b) => b.id === id);
    if (!api) return;
    try {
      await fetch(`/api/bookings/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      setApiBookings((prev) => prev.map((b) => b.id === id ? { ...b, status } : b));
      setBookings((prev) => prev.map((b) => b.id === id ? { ...b, status } : b));
      showToast(status === "confirmed" ? "Booking accepted ✓" : "Booking declined", status === "confirmed" ? "ok" : "err");
    } catch {
      showToast("Failed to update booking", "err");
    }
  };

  const markComplete = async (id: string) => {
    try {
      const res = await fetch(`/api/bookings/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completedByVendor: true }),
      });
      if (!res.ok) { showToast("Failed to mark complete", "err"); return; }
      setApiBookings((prev) => prev.map((b) => b.id === id ? { ...b, completedByVendor: true } : b));
      showToast("Job marked complete — awaiting admin approval", "ok");
    } catch {
      showToast("Network error", "err");
    }
  };

  const name       = user ? `${user.firstName} ${user.lastName}` : "Vendor";
  const vendorInfo = user?.vendor;

  return (
    <div style={{ paddingBottom: 88 }}>
      {toast && <Toast msg={toast.msg} type={toast.type} />}

      <div style={{ background: "var(--bg2)", borderBottom: "1px solid var(--border)", padding: "52px 22px 20px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <p style={{ fontSize: 12, color: "var(--acc)", fontWeight: 700, textTransform: "uppercase", letterSpacing: ".06em" }}>Good morning 👋</p>
            <h1 className="serif" style={{ fontSize: 26, marginTop: 4, letterSpacing: "-.02em" }}>{name}</h1>
            <p style={{ fontSize: 13, color: "var(--ink2)", marginTop: 2 }}>{vendorInfo?.category ?? "Handyman"} · {vendorInfo?.location ?? "Gaborone"}</p>
          </div>
          <div style={{ width: 38, height: 38, background: "var(--bg3)", border: "1px solid var(--border)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--ink2)" }}>
            <IconBell style={{ width: 18, height: 18 }} />
          </div>
        </div>
      </div>

      <div style={{ padding: "20px 22px", display: "flex", flexDirection: "column", gap: 20 }}>
        {loading ? (
          <p style={{ textAlign: "center", color: "var(--ink3)", padding: "32px 0" }}>Loading…</p>
        ) : (
          <>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <StatCard icon="💰" value={`P${totalPaid.toLocaleString()}`}                  label="Earned"   sub="Confirmed payments" />
              <StatCard icon="📅" value={bookings.length}                                   label="Bookings" sub={`${confirmed.length} upcoming`} />
              <StatCard icon="⏳" value={pending.length}                                     label="Pending"  sub="Needs response" />
              <StatCard icon="⭐" value={`${vendorInfo?.rating?.toFixed(1) ?? "—"}★`}       label="Rating"   sub={`${vendorInfo?.reviewCount ?? 0} reviews`} />
            </div>

            {pending.length > 0 && (
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                  <h2 style={{ fontSize: 16, fontWeight: 700 }}>Booking Requests</h2>
                  <span className="tag tag-amber">{pending.length} pending</span>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {pending.map((b) => <BookingRequestCard key={b.id} booking={b} onUpdate={update} />)}
                </div>
              </div>
            )}

            {confirmed.length > 0 && (
              <div>
                <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 12 }}>Upcoming Jobs</h2>
                {confirmed.map((b) => {
                  const api = apiBookings.find((a) => a.id === b.id);
                  const alreadyMarked = api?.completedByVendor ?? false;
                  const paid = api?.paymentStatus === "confirmed";
                  return (
                    <div key={b.id} className="card" style={{ padding: "14px 16px", marginBottom: 10 }}>
                      <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                        <Avatar name={b.customer} size={40} />
                        <div style={{ flex: 1 }}>
                          <p style={{ fontWeight: 700, fontSize: 14 }}>{b.customer}</p>
                          <p style={{ fontSize: 12, color: "var(--ink2)", marginTop: 2 }}>{b.service}</p>
                          <p style={{ fontSize: 12, color: "var(--acc)", marginTop: 3 }}>{b.date} · {b.time}</p>
                        </div>
                        <div style={{ textAlign: "right" }}>
                          {paid
                            ? <span className="tag tag-green">Paid</span>
                            : alreadyMarked
                              ? <span className="tag tag-amber">Awaiting Admin</span>
                              : <span className="tag tag-green">Confirmed</span>}
                          <p style={{ fontSize: 13, fontWeight: 700, color: "var(--acc)", marginTop: 4 }}>P{b.amount}</p>
                        </div>
                      </div>
                      {!alreadyMarked && !paid && (
                        <button
                          onClick={() => markComplete(b.id)}
                          style={{ marginTop: 12, width: "100%", padding: "10px 0", borderRadius: 10, background: "var(--acc)", border: "none", color: "#fff", fontWeight: 700, fontSize: 13, cursor: "pointer" }}
                        >
                          Mark Job Complete
                        </button>
                      )}
                      {alreadyMarked && !paid && (
                        <p style={{ marginTop: 10, fontSize: 12, color: "var(--ink3)", textAlign: "center" }}>
                          Job completion sent to admin for approval. Customer will be notified to pay.
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Earnings / Payout History */}
            <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 18, overflow: "hidden" }}>
              <div style={{ padding: "16px 18px 12px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 32, height: 32, borderRadius: 10, background: "rgba(45,212,191,.15)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>💰</div>
                  <p style={{ fontWeight: 700, fontSize: 14, color: "var(--ink)" }}>Earnings</p>
                </div>
                <p style={{ fontWeight: 800, fontSize: 18, color: "var(--acc)" }}>P{totalPaid.toLocaleString()}</p>
              </div>
              {earnings.length === 0
                ? <p style={{ padding: "16px 18px", fontSize: 13, color: "var(--ink3)" }}>No confirmed payments yet. Earnings appear here once admin confirms a customer payment.</p>
                : earnings.map((e, i) => (
                  <div key={e.id} style={{ padding: "14px 18px", borderTop: i > 0 ? "1px solid var(--border)" : undefined, display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div>
                      <p style={{ fontWeight: 700, fontSize: 14, color: "var(--ink)" }}>{e.serviceName}</p>
                      <p style={{ fontSize: 12, color: "var(--ink3)", marginTop: 2 }}>{e.customer.firstName} {e.customer.lastName}</p>
                      <div style={{ display: "flex", gap: 8, marginTop: 4, alignItems: "center" }}>
                        {e.paymentMethod && (
                          <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 999, background: "rgba(45,212,191,.12)", color: "var(--acc)" }}>
                            {METHOD_NAMES[e.paymentMethod] ?? e.paymentMethod}
                          </span>
                        )}
                        {e.paidAt && (
                          <span style={{ fontSize: 11, color: "var(--ink3)" }}>
                            {new Date(e.paidAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                            {" · "}
                            {new Date(e.paidAt).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}
                          </span>
                        )}
                      </div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <p style={{ fontWeight: 800, fontSize: 16, color: "var(--green)" }}>+P{(e.vendorAmount ?? e.amount * 0.95).toFixed(2)}</p>
                      <p style={{ fontSize: 10, color: "var(--ink3)", marginTop: 2 }}>of P{e.amount} total</p>
                    </div>
                  </div>
                ))
              }
            </div>

            {bookings.length === 0 && (
              <div style={{ textAlign: "center", padding: "48px 0", color: "var(--ink3)" }}>
                <p style={{ fontSize: 32, marginBottom: 8 }}>📭</p>
                <p style={{ fontWeight: 600 }}>No bookings yet</p>
                <p style={{ fontSize: 13, marginTop: 4 }}>When customers book you, they&apos;ll appear here</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
