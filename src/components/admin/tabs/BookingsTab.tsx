import { FC } from "react";
import type { Booking } from "@/lib/types";
import { STATUS_TAG } from "@/lib/constants";

export const BookingsTab: FC<{ bookings: Booking[] }> = ({ bookings }) => (
  <div className="page-enter" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
    <h2 className="serif" style={{ fontSize: 22, letterSpacing: "-.02em" }}>All Bookings</h2>
    {bookings.map((b) => (
      <div key={b.id} className="card" style={{ padding: "14px 16px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
          <div>
            <p style={{ fontWeight: 700, fontSize: 14 }}>{b.customer}</p>
            <p style={{ fontSize: 12, color: "var(--ink2)", marginTop: 2 }}>{b.service}</p>
          </div>
          <span className={`tag ${STATUS_TAG[b.status] ?? "tag-ink"}`}>{b.status}</span>
        </div>
        <div className="divider" style={{ marginBottom: 10 }} />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, fontSize: 12 }}>
          <p style={{ color: "var(--ink2)" }}><span style={{ fontWeight: 600, color: "var(--ink)" }}>Vendor: </span>{b.vendor}</p>
          <p style={{ color: "var(--ink2)" }}><span style={{ fontWeight: 600, color: "var(--ink)" }}>Date: </span>{b.date}</p>
          <p style={{ color: "var(--ink2)" }}><span style={{ fontWeight: 600, color: "var(--ink)" }}>Amount: </span><span style={{ color: "var(--acc)", fontWeight: 700 }}>P{b.amount}</span></p>
          <p style={{ color: "var(--ink2)" }}><span style={{ fontWeight: 600, color: "var(--ink)" }}>Location: </span>{b.loc}</p>
        </div>
      </div>
    ))}
  </div>
);
