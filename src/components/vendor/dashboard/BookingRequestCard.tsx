"use client";
import { FC } from "react";
import { useRouter } from "next/navigation";
import { Avatar } from "@/components/ui";
import { IconCheck, IconX, IconChat, IconMapPin } from "@/components/icons";
import type { Booking, BookingStatus } from "@/lib/types";
import { fmtPrice } from "@/lib/fmt";

interface BookingRequestCardProps {
  booking: Booking;
  onUpdate: (id: string, status: BookingStatus) => void;
}

export const BookingRequestCard: FC<BookingRequestCardProps> = ({ booking: b, onUpdate }) => {
  const router = useRouter();
  return (
    <div className="pop-enter card" style={{ overflow: "hidden" }}>
      <div style={{ background: "var(--acc-bg)", borderBottom: "1px solid var(--acc-bd)", padding: "8px 16px", display: "flex", justifyContent: "space-between" }}>
        <span style={{ fontSize: 12, fontWeight: 700, color: "var(--acc)", textTransform: "uppercase", letterSpacing: ".05em" }}>⏳ New Request</span>
        <span style={{ fontSize: 12, color: "var(--ink2)" }}>{b.date} · {b.time}</span>
      </div>
      <div style={{ padding: "14px 16px" }}>
        <div style={{ display: "flex", gap: 12, marginBottom: 12 }}>
          <Avatar name={b.customer} size={44} />
          <div style={{ flex: 1 }}>
            <p style={{ fontWeight: 700, fontSize: 15 }}>{b.customer}</p>
            <p style={{ fontSize: 13, color: "var(--acc)", marginTop: 2 }}>{b.service}</p>
            <p style={{ fontSize: 12, color: "var(--ink2)", marginTop: 3, display: "flex", alignItems: "center", gap: 4 }}>
              <IconMapPin style={{ width: 13, height: 13 }} />{b.loc}
            </p>
          </div>
          <p style={{ fontWeight: 800, fontSize: 16, color: "var(--acc)" }}>{fmtPrice(b.amount)}</p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="btn-success" style={{ flex: 1 }} onClick={() => onUpdate(b.id, "confirmed")}>
            <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
              <IconCheck style={{ width: 15, height: 15 }} /> Accept
            </span>
          </button>
          <button className="btn-danger" style={{ flex: 1 }} onClick={() => onUpdate(b.id, "declined")}>
            <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
              <IconX style={{ width: 15, height: 15 }} /> Decline
            </span>
          </button>
          <button className="btn-ghost" style={{ padding: "10px 13px" }}
            onClick={() => router.push(`/vendor/messages/${b.id}`)}>
            <IconChat style={{ width: 18, height: 18 }} />
          </button>
        </div>
      </div>
    </div>
  );
};
