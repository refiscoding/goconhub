"use client";
import { FC } from "react";
import { useRouter } from "next/navigation";
import { Avatar, Stars } from "@/components/ui";
import { IconMapPin } from "@/components/icons";
import { BadgeCheck } from "lucide-react";
import type { Vendor } from "@/lib/types";
import { fmtPrice } from "@/lib/fmt";

interface VendorCardProps { vendor: Vendor; }

export const VendorCard: FC<VendorCardProps> = ({ vendor: v }) => {
  const router = useRouter();
  return (
    <div className="card" style={{ overflow: "hidden", cursor: "pointer", width: "100%" }}
      onClick={() => router.push(`/customer/vendors/${v.id}`)}>
      <div style={{ padding: "14px 14px 10px", display: "flex", gap: 10 }}>
        <Avatar name={v.name} size={44} src={v.avatarUrl ?? undefined} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 6 }}>
            <div style={{ minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 5, overflow: "hidden" }}>
                <p style={{ fontWeight: 700, fontSize: 14, color: "var(--acc)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{v.name}</p>
                {v.verified && <BadgeCheck size={15} color="#16a34a" style={{ flexShrink: 0 }} />}
              </div>
              <p style={{ fontSize: 12, color: "var(--ink2)", marginTop: 1 }}>{v.cat}</p>
            </div>
            <span className={`tag ${v.avail ? "tag-green" : "tag-red"}`} style={{ flexShrink: 0, fontSize: 10 }}>
              {v.avail ? "Available" : "Busy"}
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 4 }}>
            <Stars n={Math.round(v.rating)} size={12} />
            <span style={{ fontSize: 11.5, color: "var(--ink2)" }}>{v.rating} ({v.rev})</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 3, color: "var(--ink3)", fontSize: 11.5 }}>
            <IconMapPin style={{ width: 11, height: 11, flexShrink: 0 }} />
            <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{v.loc}</span>
            <span style={{ margin: "0 3px", flexShrink: 0 }}>·</span>
            <strong style={{ color: "var(--acc)", flexShrink: 0 }}>{fmtPrice(v.price)}/{v.unit}</strong>
          </div>
        </div>
      </div>

      {v.tags.length > 0 && (
        <div style={{ padding: "0 14px 10px", display: "flex", gap: 5, flexWrap: "wrap" }}>
          {v.tags.slice(0, 4).map((t) => <span key={t} className="tag tag-acc" style={{ fontSize: 10 }}>{t}</span>)}
        </div>
      )}

      <div style={{ padding: "10px 14px", display: "flex", gap: 7, borderTop: "1px solid var(--border)" }}>
        <button className="btn-pri" style={{ flex: 1, padding: "9px 0", fontSize: 13, maxWidth: "none" }}
          onClick={(e) => { e.stopPropagation(); router.push(`/customer/book/${v.id}`); }}>
          Book Now
        </button>
        <button className="btn-ghost" style={{ flex: 1, padding: "9px 0", fontSize: 13, maxWidth: "none" }}
          onClick={(e) => { e.stopPropagation(); router.push("/customer/messages"); }}>
          Message
        </button>
      </div>
    </div>
  );
};
