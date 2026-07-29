"use client";
import { FC } from "react";
import { IconShield } from "@/components/icons";

interface AdminHeaderProps {
  tab: string;
  pendingVendors?: number;
  openDisputes?: number;
  pendingPayments?: number;
  onTabChange: (tab: string) => void;
}

const TABS = ["overview", "bookings", "payments", "vendors", "users", "disputes"] as const;

export const AdminHeader: FC<AdminHeaderProps> = ({ tab, pendingVendors = 0, openDisputes = 0, pendingPayments = 0, onTabChange }) => (
  <div style={{ background: "var(--bg2)", borderBottom: "1px solid var(--border)", padding: "0 24px" }}>
    <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "18px 0 14px" }}>
      <div style={{ width: 34, height: 34, background: "var(--acc-bg)", border: "1px solid var(--acc-bd)", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--acc)" }}>
        <IconShield style={{ width: 18, height: 18 }} />
      </div>
      <div>
        <p style={{ fontWeight: 800, fontSize: 16 }}>GoCon <span style={{ color: "var(--acc)" }}>Admin</span></p>
        <p style={{ fontSize: 11, color: "var(--ink3)" }}>Platform Control Centre</p>
      </div>
      {pendingVendors > 0 && (
        <div style={{ marginLeft: "auto", background: "var(--amber-bg)", border: "1px solid rgba(251,191,36,.3)", borderRadius: 999, padding: "4px 12px", fontSize: 12, fontWeight: 700, color: "var(--amber)" }}>
          {pendingVendors} awaiting approval
        </div>
      )}
    </div>
    <div style={{ display: "flex", gap: 0, overflowX: "auto", scrollbarWidth: "none" }}>
      {TABS.map((t) => {
        const badge =
          t === "payments" && pendingPayments > 0 ? ` (${pendingPayments})` :
          t === "vendors"  && pendingVendors > 0  ? ` (${pendingVendors})`  :
          t === "disputes" && openDisputes > 0    ? ` (${openDisputes})`    : "";
        return (
          <button key={t} onClick={() => onTabChange(t)}
            style={{ flexShrink: 0, padding: "10px 16px", background: "none", border: "none", borderBottom: `2px solid ${tab === t ? "var(--acc)" : "transparent"}`, color: tab === t ? "var(--acc)" : "var(--ink3)", fontSize: 13, fontWeight: 700, cursor: "pointer", textTransform: "capitalize", transition: "all .2s" }}>
            {t}{badge}
          </button>
        );
      })}
    </div>
  </div>
);
