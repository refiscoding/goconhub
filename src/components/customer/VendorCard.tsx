"use client";
import { FC } from "react";
import { useRouter } from "next/navigation";
import { Avatar, Stars } from "@/components/ui";
import { IconMapPin, IconChat } from "@/components/icons";
import type { Vendor } from "@/lib/types";

interface VendorCardProps { vendor: Vendor; }

export const VendorCard: FC<VendorCardProps> = ({ vendor: v }) => {
  const router = useRouter();
  return (
    <div className="card" style={{ overflow: "hidden", transition: "transform .2s, box-shadow .2s" }}>
      <div style={{ padding: "16px 16px 12px", display: "flex", gap: 12, cursor: "pointer" }} onClick={() => router.push(`/customer/vendors/${v.id}`)}>
        <Avatar name={v.name} size={50} src={v.avatarUrl ?? undefined} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <p style={{ fontWeight: 700, fontSize: 15, color: "var(--acc)", textDecoration: "underline", textDecorationColor: "transparent", textUnderlineOffset: 2 }}
                onMouseEnter={(e) => (e.currentTarget.style.textDecorationColor = "var(--acc)")}
                onMouseLeave={(e) => (e.currentTarget.style.textDecorationColor = "transparent")}
              >{v.name}</p>
              <p style={{ fontSize: 13, color: "var(--ink2)", marginTop: 1 }}>{v.cat}</p>
            </div>
            <span className={`tag ${v.avail ? "tag-green" : "tag-red"}`}>{v.avail ? "Available" : "Busy"}</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 5 }}>
            <Stars n={Math.round(v.rating)} />
            <span style={{ fontSize: 12, color: "var(--ink2)" }}>{v.rating} ({v.rev})</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 4, color: "var(--ink3)", fontSize: 12 }}>
            <IconMapPin style={{ width: 13, height: 13 }} />
            {v.loc}
            <span style={{ margin: "0 4px" }}>·</span>
            <strong style={{ color: "var(--acc)" }}>P{v.price}/{v.unit}</strong>
          </div>
        </div>
      </div>

      <div style={{ padding: "0 16px", display: "flex", gap: 6, flexWrap: "wrap" }}>
        {v.tags.map((t) => <span key={t} className="tag tag-acc">{t}</span>)}
      </div>

      <div style={{ padding: "12px 16px", display: "flex", gap: 8, borderTop: "1px solid var(--border)", marginTop: 12 }}>
        <button className="btn-pri" style={{ flex: 1, padding: 11, fontSize: 14 }}
          onClick={(e) => { e.stopPropagation(); router.push(`/customer/book/${v.id}`); }}>
          Book Now
        </button>
        <button className="btn-ghost" style={{ padding: "10px 14px" }}
          onClick={(e) => { e.stopPropagation(); router.push("/customer/messages"); }}>
          <IconChat style={{ width: 18, height: 18 }} />
        </button>
      </div>
    </div>
  );
};
