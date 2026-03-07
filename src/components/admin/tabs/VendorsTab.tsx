"use client";
import { FC } from "react";
import { Avatar } from "@/components/ui";
import type { AppUser } from "@/lib/types";
import { STATUS_TAG } from "@/lib/constants";

interface VendorsTabProps {
  vendors: AppUser[];
  onApprove: (id: string) => void;
  onSuspend: (id: string) => void;
}

export const VendorsTab: FC<VendorsTabProps> = ({ vendors, onApprove, onSuspend }) => {
  const pending = vendors.filter((v) => v.status === "pending");
  return (
    <div className="page-enter" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <h2 className="serif" style={{ fontSize: 22, letterSpacing: "-.02em" }}>Vendor Management</h2>
      {pending.length > 0 && (
        <div style={{ background: "var(--amber-bg)", border: "1px solid rgba(251,191,36,.2)", borderRadius: 12, padding: "12px 14px", fontSize: 13, color: "var(--amber)", fontWeight: 600 }}>
          {pending.length} vendor{pending.length > 1 ? "s" : ""} awaiting approval
        </div>
      )}
      {vendors.length === 0 && (
        <p style={{ textAlign: "center", color: "var(--ink3)", padding: "40px 0" }}>No vendors yet</p>
      )}
      {vendors.map((v) => (
        <div key={v.id} className="card" style={{ padding: "14px 16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
            <Avatar name={v.name} size={42} />
            <div style={{ flex: 1 }}>
              <p style={{ fontWeight: 700, fontSize: 15 }}>{v.name}</p>
              <p style={{ fontSize: 12, color: "var(--ink2)", marginTop: 2 }}>{v.email}</p>
              {v.phone && <p style={{ fontSize: 12, color: "var(--ink3)", marginTop: 1 }}>{v.phone}</p>}
            </div>
            <span className={`tag ${STATUS_TAG[v.status] ?? "tag-ink"}`}>{v.status}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "var(--ink2)", marginBottom: 10 }}>
            <span>Joined: {v.joined}</span><span>{v.bookings} bookings</span>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            {v.status === "pending"   && <button className="btn-success" style={{ flex: 1 }} onClick={() => onApprove(v.id)}>Approve</button>}
            {v.status === "active"    && <button className="btn-danger"  style={{ flex: 1 }} onClick={() => onSuspend(v.id)}>Suspend</button>}
            {v.status === "suspended" && <button className="btn-success" style={{ flex: 1 }} onClick={() => onApprove(v.id)}>Reactivate</button>}
          </div>
        </div>
      ))}
    </div>
  );
};
