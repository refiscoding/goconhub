import { FC } from "react";
import type { Booking, Dispute } from "@/lib/types";
import { STATUS_TAG } from "@/lib/constants";

interface OverviewTabProps {
  bookings: Booking[];
  disputes: Dispute[];
  vendorCount: number;
  customerCount: number;
  pendingVendors: number;
}

export const OverviewTab: FC<OverviewTabProps> = ({ bookings, disputes, vendorCount, customerCount, pendingVendors }) => {
  const openDisputes = disputes.filter((d) => d.status === "open").length;
  const STATS = [
    { l: "Total Revenue", v: "P48,320", i: "💰", sub: "All time",                  c: "var(--green)" },
    { l: "Bookings",      v: bookings.length, i: "📅", sub: `${bookings.filter((b) => b.status === "confirmed").length} upcoming`, c: "var(--acc)" },
    { l: "Customers",     v: customerCount,   i: "👥", sub: "Registered",           c: "var(--acc)" },
    { l: "Vendors",       v: vendorCount,     i: "🔧", sub: `${pendingVendors} pending approval`, c: "var(--amber)" },
  ];
  const HEALTH = [
    { l: "Booking completion rate", v: "87%",          c: "var(--green)" },
    { l: "Average rating",          v: "4.8★",          c: "#f59e0b" },
    { l: "Response time (avg)",     v: "14 min",        c: "var(--acc)" },
    { l: "Open disputes",           v: openDisputes,    c: "var(--red)" },
  ];
  return (
    <div className="page-enter" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        {STATS.map((s, i) => (
          <div key={i} className="card" style={{ padding: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <span style={{ fontSize: 20 }}>{s.i}</span>
              <span style={{ fontSize: 22, fontWeight: 800, color: s.c }}>{s.v}</span>
            </div>
            <p style={{ fontSize: 13, fontWeight: 600, marginTop: 10 }}>{s.l}</p>
            <p style={{ fontSize: 11, color: "var(--ink3)", marginTop: 2 }}>{s.sub}</p>
          </div>
        ))}
      </div>
      <div className="card" style={{ padding: 18 }}>
        <p style={{ fontSize: 13, fontWeight: 700, marginBottom: 14 }}>Recent Bookings</p>
        {bookings.slice(0, 4).map((b) => (
          <div key={b.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid var(--border)" }}>
            <div>
              <p style={{ fontSize: 14, fontWeight: 600 }}>{b.customer}</p>
              <p style={{ fontSize: 12, color: "var(--ink2)", marginTop: 2 }}>{b.service} · {b.vendor}</p>
            </div>
            <div style={{ textAlign: "right" }}>
              <span className={`tag ${STATUS_TAG[b.status] ?? "tag-ink"}`}>{b.status}</span>
              <p style={{ fontSize: 12, fontWeight: 700, color: "var(--acc)", marginTop: 4 }}>P{b.amount}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="card" style={{ padding: 18 }}>
        <p style={{ fontSize: 13, fontWeight: 700, marginBottom: 14 }}>Platform Health</p>
        {HEALTH.map((m) => (
          <div key={m.l} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "9px 0", borderBottom: "1px solid var(--border)", fontSize: 14 }}>
            <span style={{ color: "var(--ink2)" }}>{m.l}</span>
            <span style={{ fontWeight: 800, color: m.c }}>{m.v}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
