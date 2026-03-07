"use client";
import { FC } from "react";
import { Avatar } from "@/components/ui";
import type { AppUser } from "@/lib/types";
import { STATUS_TAG } from "@/lib/constants";

interface UsersTabProps {
  customers: AppUser[];
  onApprove: (id: string) => void;
  onSuspend: (id: string) => void;
}

export const UsersTab: FC<UsersTabProps> = ({ customers, onApprove, onSuspend }) => (
  <div className="page-enter" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
    <h2 className="serif" style={{ fontSize: 22, letterSpacing: "-.02em" }}>Customer Accounts</h2>
    {customers.length === 0 && (
      <p style={{ textAlign: "center", color: "var(--ink3)", padding: "40px 0" }}>No customers yet</p>
    )}
    {customers.map((u) => (
      <div key={u.id} className="card" style={{ padding: "14px 16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
          <Avatar name={u.name} size={40} />
          <div style={{ flex: 1 }}>
            <p style={{ fontWeight: 700, fontSize: 14 }}>{u.name}</p>
            <p style={{ fontSize: 12, color: "var(--ink2)", marginTop: 2 }}>{u.email}</p>
            {u.phone && <p style={{ fontSize: 12, color: "var(--ink3)", marginTop: 1 }}>{u.phone}</p>}
          </div>
          <span className={`tag ${STATUS_TAG[u.status] ?? "tag-ink"}`}>{u.status}</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "var(--ink2)", marginBottom: 10 }}>
          <span>Joined: {u.joined}</span><span>{u.bookings} bookings</span>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          {u.status === "active"    && <button className="btn-danger"  style={{ flex: 1, fontSize: 12, padding: "8px 0" }} onClick={() => onSuspend(u.id)}>Suspend Account</button>}
          {u.status === "suspended" && <button className="btn-success" style={{ flex: 1, fontSize: 12, padding: "8px 0" }} onClick={() => onApprove(u.id)}>Reactivate</button>}
        </div>
      </div>
    ))}
  </div>
);
