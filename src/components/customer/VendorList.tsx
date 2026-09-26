"use client";
import { FC, useState, ChangeEvent, useEffect, useCallback } from "react";
import { Search, Bell, LayoutGrid, Wrench, Zap, Hammer, Paintbrush, SprayCan, Grid2X2, BrickWall, type LucideIcon } from "lucide-react";
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

/* ── Category icons ─────────────────────────────────────────────────── */
/* Unselected: Flaticon color-fill PNGs · Selected: Lucide outline icons */
const CAT_ICONS: Record<string, string> = {
  All:         "/icons/cat-all.png",
  Plumber:     "/icons/cat-plumber.png",
  Electrician: "/icons/cat-electrician.png",
  Carpenter:   "/icons/cat-carpenter.png",
  Painter:     "/icons/cat-painter.png",
  Cleaner:     "/icons/cat-cleaner.png",
  Tiler:       "/icons/cat-tiler.png",
  Mason:       "/icons/cat-mason.png",
};
const CAT_OUTLINE: Record<string, LucideIcon> = {
  All:         LayoutGrid,
  Plumber:     Wrench,
  Electrician: Zap,
  Carpenter:   Hammer,
  Painter:     Paintbrush,
  Cleaner:     SprayCan,
  Tiler:       Grid2X2,
  Mason:       BrickWall,
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
            <p style={{ fontSize: 12, color: "var(--navy)", fontWeight: 700, textTransform: "uppercase", letterSpacing: ".06em", display: "flex", alignItems: "center", gap: 4 }}>
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
          const src = CAT_ICONS[c] ?? CAT_ICONS.All;
          const OutlineIcon = CAT_OUTLINE[c] ?? LayoutGrid;
          const isOn = cat === c;
          return (
            <button key={c} className={`cat-chip${isOn ? " on" : ""}`} onClick={() => setCat(c)}>
              {isOn
                ? <OutlineIcon size={18} color="#fff" strokeWidth={2.2} />
                : <img src={src} alt="" width={18} height={18} style={{ objectFit: "contain" }} />}
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
