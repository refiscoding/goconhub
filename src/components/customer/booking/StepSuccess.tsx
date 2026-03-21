"use client";
import { FC } from "react";
import { useRouter } from "next/navigation";
import type { BookingSelection, Vendor } from "@/lib/types";
import { fmtPrice } from "@/lib/fmt";

interface StepSuccessProps {
  vendor: Vendor;
  selection: BookingSelection;
  bookingId: string | null;
  onDone: () => void;
}

export const StepSuccess: FC<StepSuccessProps> = ({ vendor, selection, bookingId, onDone }) => {
  const router = useRouter();
  return (
    <div className="page-enter" style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "0 28px", textAlign: "center", gap: 20 }}>
      <div style={{ width: 88, height: 88, background: "var(--green-bg)", border: "2px solid rgba(34,197,94,.3)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 38 }}>✓</div>
      <div>
        <h2 className="serif" style={{ fontSize: 30, letterSpacing: "-.02em" }}>
          Booking <em style={{ color: "var(--green)" }}>Sent!</em>
        </h2>
        <p style={{ color: "var(--ink2)", marginTop: 10, lineHeight: 1.7 }}>
          Your request to <strong>{vendor.name}</strong> for <strong>{selection.service?.name}</strong> on <strong>{selection.date?.short}</strong> at <strong>{selection.time}</strong> has been sent. Awaiting confirmation.
        </p>
      </div>

      <div className="card" style={{ width: "100%", padding: 18, textAlign: "left" }}>
        {([
          ["Vendor",     vendor.name],
          ["Service",    selection.service?.name ?? ""],
          ["Date & Time",`${selection.date?.label} · ${selection.time}`],
          ["Location",   vendor.loc],
          ["Total",      `${fmtPrice(selection.service?.price ?? 0)}`],
          ["Status",     "Pending vendor confirmation"],
        ] as [string, string][]).map(([k, v]) => (
          <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid var(--border)", fontSize: 14 }}>
            <span style={{ color: "var(--ink2)" }}>{k}</span>
            <span style={{ fontWeight: 700 }}>{v}</span>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10, width: "100%" }}>
        {bookingId && (
          <button className="btn-pri" onClick={() => router.push(`/customer/messages/${bookingId}`)}>
            Message Vendor →
          </button>
        )}
        <button className="btn-ghost" onClick={onDone}>Back to home</button>
      </div>
    </div>
  );
};
