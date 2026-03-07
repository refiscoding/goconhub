"use client";
import { FC } from "react";
import { Toggle } from "@/components/ui";
import { IconEdit, IconTrash } from "@/components/icons";
import type { VendorService } from "@/lib/types";

interface ServiceCardProps {
  service: VendorService;
  onToggle: (id: number) => void;
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
}

export const ServiceCard: FC<ServiceCardProps> = ({ service: s, onToggle, onEdit, onDelete }) => (
  <div className="card" style={{ overflow: "hidden", opacity: s.active ? 1 : 0.6, transition: "opacity .2s" }}>
    <div style={{ padding: "16px 16px 12px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10 }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <p style={{ fontWeight: 700, fontSize: 15 }}>{s.name}</p>
            <span className={`tag ${s.active ? "tag-green" : "tag-red"}`}>{s.active ? "Live" : "Hidden"}</span>
          </div>
          <p style={{ fontSize: 13, color: "var(--ink2)", marginTop: 4 }}>{s.desc}</p>
          <p style={{ fontSize: 16, fontWeight: 800, color: "var(--acc)", marginTop: 8 }}>
            P{s.price} <span style={{ fontSize: 12, fontWeight: 500, color: "var(--ink2)" }}>/{s.unit}</span>
          </p>
        </div>
        <Toggle on={s.active} onChange={() => onToggle(s.id)} />
      </div>
      <div className="divider" style={{ margin: "12px 0" }} />
      <div style={{ display: "flex", gap: 8 }}>
        <button onClick={() => onEdit(s.id)}
          style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, background: "var(--bg3)", border: "1px solid var(--border)", borderRadius: 10, padding: "9px 0", fontSize: 13, fontWeight: 600, color: "var(--ink2)" }}>
          <IconEdit style={{ width: 14, height: 14 }} /> Edit
        </button>
        <button onClick={() => onDelete(s.id)}
          style={{ width: 38, display: "flex", alignItems: "center", justifyContent: "center", background: "var(--red-bg)", border: "1px solid rgba(239,68,68,.2)", borderRadius: 10, color: "var(--red)" }}>
          <IconTrash style={{ width: 14, height: 14 }} />
        </button>
      </div>
    </div>
  </div>
);
