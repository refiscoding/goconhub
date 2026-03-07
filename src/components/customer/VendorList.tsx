"use client";
import { FC, useState, ChangeEvent, useEffect, useCallback } from "react";
import { IconSearch, IconBell } from "@/components/icons";
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
    avail:   v.available,
    tags:    v.skills,
    bio:     v.bio,
    avatarUrl: v.user.avatarUrl,
    services: v.services.map((s) => ({ id: null, name: s.name, price: s.price, unit: (s.unit ?? "hr") as "hr" | "job" | "day" })),
  };
}

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
    <div style={{ paddingBottom: 88 }}>
      <div style={{ background: "var(--bg)", borderBottom: "1px solid var(--border)", padding: "52px 22px 18px", position: "sticky", top: 0, zIndex: 50 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <div>
            <p style={{ fontSize: 12, color: "var(--acc)", fontWeight: 700, textTransform: "uppercase", letterSpacing: ".06em" }}>📍 Gaborone</p>
            <h1 className="serif" style={{ fontSize: 26, marginTop: 2, letterSpacing: "-.02em" }}>Find Handymen</h1>
          </div>
          <div style={{ width: 36, height: 36, background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--ink2)" }}>
            <IconBell style={{ width: 18, height: 18 }} />
          </div>
        </div>
        <div style={{ position: "relative" }}>
          <div style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", color: "var(--ink3)", width: 18, height: 18 }}>
            <IconSearch style={{ width: 18, height: 18 }} />
          </div>
          <input className="field" placeholder="Search services…" value={q}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setQ(e.target.value)}
            style={{ paddingLeft: 40 }} />
        </div>
      </div>

      <div style={{ display: "flex", gap: 8, padding: "12px 22px 6px", overflowX: "auto", scrollbarWidth: "none" }}>
        {FILTER_CATS.map((c) => (
          <button key={c} onClick={() => setCat(c)}
            style={{ flexShrink: 0, padding: "7px 16px", borderRadius: 999, fontSize: 13, fontWeight: 600, background: cat === c ? "var(--ink)" : "var(--card)", color: cat === c ? "var(--bg)" : "var(--ink2)", border: `1.5px solid ${cat === c ? "var(--ink)" : "var(--border)"}`, transition: "all .2s" }}>
            {c}
          </button>
        ))}
      </div>

      <div style={{ padding: "6px 22px", marginBottom: 8 }}>
        <p style={{ fontSize: 13, color: "var(--ink2)" }}>
          {loading ? "Loading…" : <><strong style={{ color: "var(--ink)" }}>{vendors.length}</strong> found</>}
        </p>
      </div>

      <div style={{ padding: "0 22px", display: "flex", flexDirection: "column", gap: 14 }}>
        {vendors.map((v) => <VendorCard key={v.id} vendor={v} />)}
        {!loading && vendors.length === 0 && (
          <div style={{ textAlign: "center", padding: "48px 0", color: "var(--ink3)" }}>
            <p style={{ fontSize: 32, marginBottom: 8 }}>🔍</p>
            <p style={{ fontWeight: 600 }}>No handymen found</p>
            <p style={{ fontSize: 13, marginTop: 4 }}>Try a different category or search term</p>
          </div>
        )}
      </div>
    </div>
  );
};
