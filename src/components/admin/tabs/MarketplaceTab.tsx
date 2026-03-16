"use client";
import { FC } from "react";
import type { ListingOrder, OrderStatus } from "@/lib/types";
import { fmtPrice } from "@/lib/fmt";

interface Props {
  orders: ListingOrder[];
  onApprove: (id: string) => void;
  onReject:  (id: string) => void;
}

const badge = (s: OrderStatus) => {
  const map: Record<OrderStatus, { bg: string; color: string; label: string }> = {
    pending:  { bg: "#fef3c7", color: "#92400e", label: "Pending"  },
    approved: { bg: "#dcfce7", color: "#166534", label: "Approved" },
    rejected: { bg: "#fee2e2", color: "#991b1b", label: "Rejected" },
  };
  const c = map[s];
  return (
    <span style={{ fontSize: 11, fontWeight: 700, background: c.bg, color: c.color, padding: "2px 8px", borderRadius: 999 }}>
      {c.label}
    </span>
  );
};

export const MarketplaceTab: FC<Props> = ({ orders, onApprove, onReject }) => {
  const pending  = orders.filter((o) => o.status === "pending");
  const resolved = orders.filter((o) => o.status !== "pending");

  return (
    <div>
      <h2 style={{ fontSize: 19, fontWeight: 800, color: "var(--ink)", marginBottom: 4 }}>Marketplace Orders</h2>
      <p style={{ fontSize: 13, color: "var(--ink2)", marginBottom: 24 }}>Review and approve customer buy requests for vendor listings.</p>

      {orders.length === 0 ? (
        <p style={{ color: "var(--ink2)", fontSize: 14 }}>No buy requests yet.</p>
      ) : (
        <>
          {pending.length > 0 && (
            <>
              <p style={{ fontWeight: 700, fontSize: 13, color: "var(--ink2)", textTransform: "uppercase", letterSpacing: ".05em", marginBottom: 10 }}>
                Pending ({pending.length})
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 28 }}>
                {pending.map((o) => (
                  <OrderRow key={o.id} order={o} onApprove={onApprove} onReject={onReject} />
                ))}
              </div>
            </>
          )}

          {resolved.length > 0 && (
            <>
              <p style={{ fontWeight: 700, fontSize: 13, color: "var(--ink2)", textTransform: "uppercase", letterSpacing: ".05em", marginBottom: 10 }}>
                Resolved
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {resolved.map((o) => (
                  <OrderRow key={o.id} order={o} />
                ))}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
};

const OrderRow: FC<{ order: ListingOrder; onApprove?: (id: string) => void; onReject?: (id: string) => void }> = ({ order, onApprove, onReject }) => (
  <div className="card" style={{ padding: "16px 18px", display: "flex", alignItems: "flex-start", gap: 16, flexWrap: "wrap" }}>
    <div style={{ flex: 1, minWidth: 200 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 4 }}>
        <span style={{ fontWeight: 700, fontSize: 15, color: "var(--ink)" }}>{order.listingTitle}</span>
        {badge(order.status)}
      </div>
      <p style={{ fontSize: 13, color: "var(--ink2)" }}>
        Customer: <strong>{order.customerName}</strong>
      </p>
      <p style={{ fontSize: 13, color: "var(--ink2)" }}>
        Price: <strong style={{ color: "var(--acc)" }}>{fmtPrice(order.listingPrice)}</strong>
      </p>
      {order.note && (
        <p style={{ fontSize: 13, color: "var(--ink3)", marginTop: 4, fontStyle: "italic" }}>&ldquo;{order.note}&rdquo;</p>
      )}
      <p style={{ fontSize: 11, color: "var(--ink3)", marginTop: 6 }}>
        {new Date(order.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
      </p>
    </div>

    {order.status === "pending" && onApprove && onReject && (
      <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
        <button className="btn-pri" style={{ padding: "8px 16px", fontSize: 13 }} onClick={() => onApprove(order.id)}>
          Approve
        </button>
        <button className="btn-ghost" style={{ padding: "8px 16px", fontSize: 13 }} onClick={() => onReject(order.id)}>
          Reject
        </button>
      </div>
    )}
  </div>
);
