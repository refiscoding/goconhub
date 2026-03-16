"use client";
import { FC } from "react";
import type { Dispute } from "@/lib/types";
import { fmtPrice } from "@/lib/fmt";

interface DisputesTabProps {
  disputes: Dispute[];
  onResolve: (id: string) => void;
}

export const DisputesTab: FC<DisputesTabProps> = ({ disputes, onResolve }) => (
  <div className="page-enter" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
    <h2 className="serif" style={{ fontSize: 22, letterSpacing: "-.02em" }}>Disputes</h2>
    {disputes.length === 0 && (
      <p style={{ textAlign: "center", color: "var(--ink3)", padding: "40px 0" }}>No disputes</p>
    )}
    {disputes.map((d) => (
      <div key={d.id} className="card pop-enter" style={{ overflow: "hidden" }}>
        <div style={{ background: d.status === "open" ? "var(--red-bg)" : "var(--green-bg)", borderBottom: `1px solid ${d.status === "open" ? "rgba(248,113,113,.2)" : "rgba(52,211,153,.2)"}`, padding: "8px 16px", display: "flex", justifyContent: "space-between" }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: d.status === "open" ? "var(--red)" : "var(--green)", textTransform: "uppercase", letterSpacing: ".05em" }}>
            {d.status === "open" ? "Open" : "Resolved"}
          </span>
          <span style={{ fontSize: 12, color: "var(--ink2)" }}>{d.date}</span>
        </div>
        <div style={{ padding: "14px 16px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
            <div>
              <p style={{ fontSize: 14, fontWeight: 700 }}>{d.customer}</p>
              <p style={{ fontSize: 12, color: "var(--ink2)", marginTop: 2 }}>vs {d.vendor}</p>
            </div>
            <p style={{ fontWeight: 800, color: "var(--acc)" }}>{fmtPrice(d.amount)}</p>
          </div>
          <div style={{ background: "var(--bg3)", borderRadius: 10, padding: "10px 12px", borderLeft: "2px solid var(--acc)", marginBottom: 12 }}>
            <p style={{ fontSize: 13, color: "var(--ink2)", fontStyle: "italic" }}>"{d.reason}"</p>
          </div>
          {d.status === "open" && (
            <button className="btn-success" style={{ width: "100%" }} onClick={() => onResolve(d.id)}>Mark Resolved</button>
          )}
        </div>
      </div>
    ))}
  </div>
);
