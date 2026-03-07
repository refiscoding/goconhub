"use client";
import { FC, useState } from "react";

interface AdminBooking {
  id: string;
  serviceName: string;
  date: string;
  amount: number;
  platformFee?: number;
  vendorAmount?: number;
  completedByVendor: boolean;
  adminApprovedComplete: boolean;
  paymentStatus: string;
  paymentMethod: string | null;
  paymentReference: string | null;
  paidAt: string | null;
  customer: { firstName: string; lastName: string };
  vendor: { user: { firstName: string; lastName: string } };
}

interface Props {
  bookings: AdminBooking[];
  onApproveComplete: (id: string) => void;
  onConfirmPayment: (id: string) => void;
}

const METHOD_LABELS: Record<string, string> = {
  dpo: "DPO Pay",
  orange: "Orange Money",
  ewallet: "eWallet",
};

export const PaymentsTab: FC<Props> = ({ bookings, onApproveComplete, onConfirmPayment }) => {
  const [busy, setBusy] = useState<string | null>(null);

  const awaitingApproval       = bookings.filter((b) => b.completedByVendor && !b.adminApprovedComplete);
  const awaitingConfirm        = bookings.filter((b) => b.adminApprovedComplete && b.paymentStatus === "submitted");
  const confirmed              = bookings.filter((b) => b.paymentStatus === "confirmed");

  // Revenue summary
  const totalTransacted  = confirmed.reduce((s, b) => s + b.amount, 0);
  const totalPlatformFee = confirmed.reduce((s, b) => s + (b.platformFee ?? b.amount * 0.05), 0);
  const totalVendorPaid  = confirmed.reduce((s, b) => s + (b.vendorAmount ?? b.amount * 0.95), 0);

  const handle = (id: string, action: () => void) => {
    setBusy(id);
    action();
    // Clear busy after short delay to allow UI update
    setTimeout(() => setBusy(null), 800);
  };

  return (
    <div>
      {/* Revenue summary cards */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 20 }}>
        {[
          { label: "Total Transacted", value: `P${totalTransacted.toFixed(2)}`, icon: "💰", color: "var(--acc)" },
          { label: "Platform (5%)",    value: `P${totalPlatformFee.toFixed(2)}`, icon: "🏦", color: "#6366f1"  },
          { label: "Vendor Payouts",   value: `P${totalVendorPaid.toFixed(2)}`,  icon: "👷", color: "var(--green)" },
        ].map((s) => (
          <div key={s.label} style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 14, padding: "12px 10px", textAlign: "center" }}>
            <span style={{ fontSize: 18 }}>{s.icon}</span>
            <p style={{ fontSize: 13, fontWeight: 800, color: s.color, marginTop: 6, wordBreak: "break-all" }}>{s.value}</p>
            <p style={{ fontSize: 9, color: "var(--ink3)", fontWeight: 700, marginTop: 3, textTransform: "uppercase", letterSpacing: ".04em" }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Jobs awaiting completion approval */}
      <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 18, overflow: "hidden", marginBottom: 16 }}>
        <div style={{ padding: "14px 18px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: 10, background: "rgba(245,158,11,.15)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>🔔</div>
          <p style={{ fontWeight: 700, fontSize: 14, color: "var(--ink)" }}>Jobs Marked Complete by Vendor</p>
          {awaitingApproval.length > 0 && (
            <span style={{ marginLeft: "auto", background: "#f59e0b", color: "#fff", fontSize: 11, fontWeight: 700, padding: "3px 8px", borderRadius: 999 }}>{awaitingApproval.length}</span>
          )}
        </div>
        {awaitingApproval.length === 0
          ? <p style={{ padding: "16px 18px", fontSize: 13, color: "var(--ink3)" }}>No jobs awaiting approval.</p>
          : awaitingApproval.map((b) => (
            <div key={b.id} style={{ padding: "14px 18px", borderBottom: "1px solid var(--border)", display: "flex", gap: 12, alignItems: "center" }}>
              <div style={{ flex: 1 }}>
                <p style={{ fontWeight: 700, fontSize: 14 }}>{b.customer.firstName} {b.customer.lastName}</p>
                <p style={{ fontSize: 12, color: "var(--ink2)", marginTop: 2 }}>{b.serviceName} · {b.vendor.user.firstName} {b.vendor.user.lastName}</p>
                <p style={{ fontSize: 12, color: "var(--ink3)", marginTop: 2 }}>{b.date}</p>
              </div>
              <div style={{ textAlign: "right" }}>
                <p style={{ fontWeight: 800, color: "var(--acc)", fontSize: 15 }}>P{b.amount}</p>
                <button
                  onClick={() => handle(b.id, () => onApproveComplete(b.id))}
                  disabled={busy === b.id}
                  style={{ marginTop: 8, padding: "8px 16px", borderRadius: 10, background: "var(--green)", border: "none", color: "#fff", fontWeight: 700, fontSize: 12, cursor: "pointer", opacity: busy === b.id ? 0.7 : 1 }}
                >{busy === b.id ? "…" : "Approve Completion"}</button>
              </div>
            </div>
          ))
        }
      </div>

      {/* Payments submitted by customers */}
      <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 18, overflow: "hidden", marginBottom: 16 }}>
        <div style={{ padding: "14px 18px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: 10, background: "rgba(99,102,241,.15)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>💳</div>
          <p style={{ fontWeight: 700, fontSize: 14, color: "var(--ink)" }}>Payments Submitted by Customers</p>
          {awaitingConfirm.length > 0 && (
            <span style={{ marginLeft: "auto", background: "#6366f1", color: "#fff", fontSize: 11, fontWeight: 700, padding: "3px 8px", borderRadius: 999 }}>{awaitingConfirm.length}</span>
          )}
        </div>
        {awaitingConfirm.length === 0
          ? <p style={{ padding: "16px 18px", fontSize: 13, color: "var(--ink3)" }}>No payments awaiting confirmation.</p>
          : awaitingConfirm.map((b) => (
            <div key={b.id} style={{ padding: "14px 18px", borderBottom: "1px solid var(--border)" }}>
              <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                <div style={{ flex: 1 }}>
                  <p style={{ fontWeight: 700, fontSize: 14 }}>{b.customer.firstName} {b.customer.lastName}</p>
                  <p style={{ fontSize: 12, color: "var(--ink2)", marginTop: 2 }}>{b.serviceName} · {b.vendor.user.firstName} {b.vendor.user.lastName}</p>
                  <div style={{ marginTop: 8, background: "var(--bg2)", borderRadius: 10, padding: "10px 14px", display: "flex", flexDirection: "column", gap: 4 }}>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ fontSize: 12, color: "var(--ink3)" }}>Method</span>
                      <span style={{ fontSize: 12, fontWeight: 700 }}>{METHOD_LABELS[b.paymentMethod ?? ""] ?? b.paymentMethod ?? "—"}</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ fontSize: 12, color: "var(--ink3)" }}>Reference</span>
                      <span style={{ fontSize: 12, fontWeight: 700, fontFamily: "monospace" }}>{b.paymentReference ?? "—"}</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ fontSize: 12, color: "var(--ink3)" }}>Total Amount</span>
                      <span style={{ fontSize: 14, fontWeight: 800, color: "var(--acc)" }}>P{b.amount}</span>
                    </div>
                    <div style={{ borderTop: "1px solid var(--border)", paddingTop: 6, marginTop: 2, display: "flex", flexDirection: "column", gap: 3 }}>
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span style={{ fontSize: 11, color: "var(--ink3)" }}>Platform fee (5%)</span>
                        <span style={{ fontSize: 11, fontWeight: 700, color: "#6366f1" }}>P{(b.amount * 0.05).toFixed(2)}</span>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span style={{ fontSize: 11, color: "var(--ink3)" }}>Vendor receives (95%)</span>
                        <span style={{ fontSize: 11, fontWeight: 700, color: "var(--green)" }}>P{(b.amount * 0.95).toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => handle(b.id, () => onConfirmPayment(b.id))}
                  disabled={busy === b.id}
                  style={{ marginTop: 4, padding: "10px 16px", borderRadius: 10, background: "var(--acc)", border: "none", color: "#fff", fontWeight: 700, fontSize: 12, cursor: "pointer", opacity: busy === b.id ? 0.7 : 1, whiteSpace: "nowrap" }}
                >{busy === b.id ? "…" : "Confirm Payment"}</button>
              </div>
            </div>
          ))
        }
      </div>

      {/* Confirmed payments history */}
      <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 18, overflow: "hidden" }}>
        <div style={{ padding: "14px 18px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: 10, background: "rgba(12,166,120,.15)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>✅</div>
          <p style={{ fontWeight: 700, fontSize: 14, color: "var(--ink)" }}>Confirmed Payments</p>
        </div>
        {confirmed.length === 0
          ? <p style={{ padding: "16px 18px", fontSize: 13, color: "var(--ink3)" }}>No confirmed payments yet.</p>
          : confirmed.map((b) => {
            const fee    = b.platformFee ?? b.amount * 0.05;
            const vendor = b.vendorAmount ?? b.amount * 0.95;
            return (
              <div key={b.id} style={{ padding: "12px 18px", borderBottom: "1px solid var(--border)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <p style={{ fontWeight: 600, fontSize: 13 }}>{b.customer.firstName} {b.customer.lastName} → {b.vendor.user.firstName} {b.vendor.user.lastName}</p>
                    <p style={{ fontSize: 12, color: "var(--ink3)", marginTop: 2 }}>{b.serviceName} · {METHOD_LABELS[b.paymentMethod ?? ""] ?? b.paymentMethod ?? "—"}</p>
                    {b.paidAt && <p style={{ fontSize: 11, color: "var(--ink3)", marginTop: 2 }}>{new Date(b.paidAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })} {new Date(b.paidAt).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}</p>}
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <p style={{ fontWeight: 800, color: "var(--ink)", fontSize: 15 }}>P{b.amount.toFixed(2)}</p>
                    <p style={{ fontSize: 11, color: "#6366f1", marginTop: 2 }}>Fee: P{fee.toFixed(2)}</p>
                    <p style={{ fontSize: 11, color: "var(--green)" }}>Vendor: P{vendor.toFixed(2)}</p>
                  </div>
                </div>
              </div>
            );
          })
        }
      </div>
    </div>
  );
};
