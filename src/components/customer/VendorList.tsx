"use client";
import { FC, useState, ChangeEvent, useEffect, useCallback } from "react";
import { Search, Bell } from "lucide-react";
import { PageSpinner } from "@/components/ui";
import { VendorCard } from "./VendorCard";
import { FILTER_CATS } from "@/lib/constants";
import type { Vendor } from "@/lib/types";

interface ApiVendor {
  id: string;
  bio: string;
  category: string;
  skills: string[];
  location: string;
  rating: number;
  reviewCount: number;
  available: boolean;
  verified: boolean;
  user: { firstName: string; lastName: string; avatarUrl: string | null };
  services: { name: string; price: number; unit: string }[];
}

function toVendor(v: ApiVendor): Vendor {
  const svc = v.services[0];
  return {
    id:        v.id,
    name:    `${v.user.firstName} ${v.user.lastName}`,
    cat:     v.category,
    loc:     v.location,
    rating:  v.rating,
    rev:     v.reviewCount,
    price:   svc?.price ?? 0,
    unit:    (svc?.unit ?? "hr") as "hr" | "job" | "day",
    avail:    v.available,
    verified: v.verified,
    tags:    v.skills,
    bio:     v.bio,
    avatarUrl: v.user.avatarUrl,
    services: v.services.map((s) => ({ id: null, name: s.name, price: s.price, unit: (s.unit ?? "hr") as "hr" | "job" | "day" })),
  };
}

/* ── Category SVG Icons ────────────────────────────────────────────── */
const CatIcons: Record<string, { icon: FC<{ size?: number }>; color: string }> = {
  All:         { icon: ({ size = 16 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>, color: "#64748b" },
  Plumber:     { icon: ({ size = 16 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 14v-3a1 1 0 0 1 1-1h4"/><path d="M14 10h4a1 1 0 0 1 1 1v3"/><path d="M9 10V6a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v4"/><path d="M7 14a3 3 0 0 0-3 3v1h8v-1a3 3 0 0 0-3-3z"/><path d="M15 14a3 3 0 0 0-3 3v1h8v-1a3 3 0 0 0-3-3z"/></svg>, color: "#0ea5e9" },
  Electrician: { icon: ({ size = 16 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>, color: "#f59e0b" },
  Carpenter:   { icon: ({ size = 16 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>, color: "#a16207" },
  Painter:     { icon: ({ size = 16 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 3H5a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2z"/><path d="M12 11v6"/><path d="M8 17h8a2 2 0 0 1 2 2H6a2 2 0 0 1 2-2z"/></svg>, color: "#e11d48" },
  Cleaner:     { icon: ({ size = 16 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v8"/><path d="m4.93 10.93 1.41 1.41"/><path d="M2 18h2"/><path d="M20 18h2"/><path d="m19.07 10.93-1.41 1.41"/><path d="M22 22H2"/><path d="m8 22 4-10 4 10"/></svg>, color: "#06b6d4" },
  Tiler:       { icon: ({ size = 16 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="8" height="8" rx="1"/><rect x="13" y="3" width="8" height="8" rx="1"/><rect x="3" y="13" width="8" height="8" rx="1"/><rect x="13" y="13" width="8" height="8" rx="1"/></svg>, color: "#8b5cf6" },
  Mason:       { icon: ({ size = 16 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="6" width="20" height="4" rx="1"/><rect x="4" y="10" width="7" height="4"/><rect x="13" y="10" width="7" height="4"/><rect x="2" y="14" width="9" height="4"/><rect x="13" y="14" width="9" height="4"/><line x1="2" y1="18" x2="22" y2="18"/></svg>, color: "#78716c" },
};

export const VendorList: FC = () => {
  const [cat,     setCat]     = useState("All");
  const [q,       setQ]       = useState("");
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchVendors = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (cat !== "All") params.set("cat", cat);
      if (q)             params.set("q", q);
      const res  = await fetch(`/api/vendors?${params}`);
      const data = await res.json();
      setVendors((data.vendors ?? []).map(toVendor));
    } catch { setVendors([]); }
    finally { setLoading(false); }
  }, [cat, q]);

  useEffect(() => {
    const t = setTimeout(fetchVendors, 300);
    return () => clearTimeout(t);
  }, [fetchVendors]);

  return (
    <div className="cust-page-wrap">
      {/* Header */}
      <div className="page-top cust-page-header">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <div>
            <p style={{ fontSize: 12, color: "#1A7A5E", fontWeight: 700, textTransform: "uppercase", letterSpacing: ".06em", display: "flex", alignItems: "center", gap: 4 }}>
              <MapPinIcon /> Gaborone
            </p>
            <h1 className="serif" style={{ fontSize: 28, marginTop: 4, letterSpacing: "-.03em", fontWeight: 800 }}>Find Handymen</h1>
          </div>
          <div style={{ width: 40, height: 40, background: "var(--card)", border: "1.5px solid var(--border)", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--ink2)", cursor: "pointer", transition: "all .2s" }}>
            <Bell size={18} />
          </div>
        </div>
        {/* Search */}
        <div style={{ position: "relative" }}>
          <div style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "var(--ink3)" }}>
            <Search size={18} />
          </div>
          <input className="field field-search" placeholder="Search services or handymen…" value={q}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setQ(e.target.value)}
            style={{ paddingLeft: 42 }} />
        </div>
      </div>

      {/* Category chips with icons */}
      <div style={{ display: "flex", gap: 8, padding: "14px 22px 8px", overflowX: "auto", scrollbarWidth: "none" }}>
        {FILTER_CATS.map((c) => {
          const catDef = CatIcons[c] ?? CatIcons.All;
          const Icon = catDef.icon;
          const isOn = cat === c;
          return (
            <button key={c} className={`cat-chip${isOn ? " on" : ""}`} onClick={() => setCat(c)}>
              <span style={{ color: isOn ? "#fff" : catDef.color, display: "flex" }}><Icon size={16} /></span>
              {c}
            </button>
          );
        })}
      </div>

      {/* Result count */}
      <div style={{ padding: "8px 22px 10px" }}>
        <span style={{ fontSize: 13, color: "var(--ink2)", display: "block", fontWeight: 500 }}>
          {loading ? <PageSpinner inline /> : <><strong style={{ color: "var(--ink)", fontWeight: 700 }}>{vendors.length}</strong> handymen found</>}
        </span>
      </div>

      {/* Vendor grid */}
      <div className="vendor-grid cust-page-body" style={{ paddingTop: 0 }}>
        {vendors.map((v) => <VendorCard key={v.id} vendor={v} />)}
        {!loading && vendors.length === 0 && (
          <div style={{ textAlign: "center", padding: "56px 0", color: "var(--ink3)" }}>
            <Search size={40} style={{ margin: "0 auto 12px", opacity: 0.3 }} />
            <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, fontSize: 16 }}>No handymen found</p>
            <p style={{ fontSize: 13, marginTop: 6, color: "var(--ink3)" }}>Try a different category or search term</p>
          </div>
        )}
      </div>
    </div>
  );
};

/* Small inline map pin icon for the location label */
function MapPinIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
      <circle cx="12" cy="10" r="3"/>
    </svg>
  );
}
