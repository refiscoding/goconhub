"use client";
import { FC } from "react";
import { useRouter } from "next/navigation";
import { Avatar, Stars } from "@/components/ui";
import { BadgeCheck, MessageCircle, MapPin } from "lucide-react";
import type { Vendor } from "@/lib/types";
import { fmtPrice } from "@/lib/fmt";

interface VendorCardProps { vendor: Vendor; }

/* ── Skill tag color + icon mapping ────────────────────────────────── */
interface SkillStyle { bg: string; color: string; icon: FC<{ s?: number }> }

const W = 2.2; // stroke width for mini icons

const SKILL_STYLES: Record<string, SkillStyle> = {
  // Plumbing
  "Pipe Repair":     { bg: "rgba(14,165,233,.1)",  color: "#0284c7", icon: ({ s = 11 }) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={W} strokeLinecap="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg> },
  "Drain Cleaning":  { bg: "rgba(14,165,233,.1)",  color: "#0284c7", icon: ({ s = 11 }) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={W} strokeLinecap="round"><path d="M12 2v10"/><path d="m4.93 10.93 1.41 1.41"/><path d="m17.66 10.93-1.41 1.41"/><path d="M2 18h20"/><path d="M6 22v-4"/><path d="M18 22v-4"/></svg> },
  "Geyser Install":  { bg: "rgba(14,165,233,.1)",  color: "#0284c7", icon: ({ s = 11 }) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={W} strokeLinecap="round"><circle cx="12" cy="12" r="5"/><path d="M12 1v2"/><path d="M12 21v2"/><path d="M4.22 4.22l1.42 1.42"/><path d="M18.36 18.36l1.42 1.42"/><path d="M1 12h2"/><path d="M21 12h2"/></svg> },
  "Leak Detection":  { bg: "rgba(14,165,233,.1)",  color: "#0284c7", icon: ({ s = 11 }) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={W} strokeLinecap="round"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/></svg> },
  "Bathroom Fitting": { bg: "rgba(14,165,233,.1)", color: "#0284c7", icon: ({ s = 11 }) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={W} strokeLinecap="round"><path d="M4 12h16"/><path d="M4 12V6a2 2 0 0 1 2-2h1"/><path d="M4 18v-6"/><path d="M20 18v-6"/><path d="M6 18h12a2 2 0 0 0 2-2"/></svg> },
  // Electrical
  "Wiring":          { bg: "rgba(245,158,11,.1)",   color: "#b45309", icon: ({ s = 11 }) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={W} strokeLinecap="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg> },
  "Circuit Breakers": { bg: "rgba(245,158,11,.1)",  color: "#b45309", icon: ({ s = 11 }) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={W} strokeLinecap="round"><rect x="4" y="2" width="16" height="20" rx="2"/><line x1="12" y1="10" x2="12" y2="14"/><circle cx="12" cy="7" r="1" fill="currentColor"/></svg> },
  "Lighting":        { bg: "rgba(245,158,11,.1)",   color: "#b45309", icon: ({ s = 11 }) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={W} strokeLinecap="round"><path d="M9 18h6"/><path d="M10 22h4"/><path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 0 1 8.91 14"/></svg> },
  "Sockets":         { bg: "rgba(245,158,11,.1)",   color: "#b45309", icon: ({ s = 11 }) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={W} strokeLinecap="round"><rect x="4" y="4" width="16" height="16" rx="3"/><circle cx="9" cy="10" r="1.5"/><circle cx="15" cy="10" r="1.5"/><path d="M9 16h6"/></svg> },
};

/* Alternate neutral skill tags with a restrained navy accent. */
const FALLBACK_COLORS = [
  { bg: "var(--navy-soft)", color: "var(--navy)" },
  { bg: "var(--bg2)", color: "var(--ink2)" },
];

function getSkillStyle(skill: string, index: number): { bg: string; color: string; icon: FC<{ s?: number }> | null } {
  const mapped = SKILL_STYLES[skill];
  if (mapped) return { ...mapped, bg: "var(--navy-soft)", color: "var(--navy)" };
  const fb = FALLBACK_COLORS[index % FALLBACK_COLORS.length];
  return { ...fb, icon: null };
}

/* Generic small tag icon for unmapped skills */
const TagIcon: FC<{ s?: number; c?: string }> = ({ s = 11, c = "currentColor" }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={W} strokeLinecap="round">
    <path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>
  </svg>
);

export const VendorCard: FC<VendorCardProps> = ({ vendor: v }) => {
  const router = useRouter();
  return (
    <div className="vendor-card" onClick={() => router.push(`/customer/vendors/${v.id}`)}>
      <div style={{ padding: "16px 16px 12px", display: "flex", gap: 12 }}>
        <Avatar name={v.name} size={48} src={v.avatarUrl ?? undefined} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 6 }}>
            <div style={{ minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 5, overflow: "hidden" }}>
                <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, fontSize: 15, color: "var(--ink)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{v.name}</p>
                {v.verified && <BadgeCheck size={15} color="var(--navy)" fill="var(--navy)" stroke="#fff" style={{ flexShrink: 0 }} />}
              </div>
              <p style={{ fontSize: 12, color: "var(--ink2)", marginTop: 2 }}>{v.cat}</p>
            </div>
            {v.avail ? (
              <span className="avail-badge">
                <span className="avail-dot" />
                Available
              </span>
            ) : (
              <span className="busy-badge">Busy</span>
            )}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 6 }}>
            <Stars n={Math.round(v.rating)} size={13} />
            <span style={{ fontSize: 12, color: "var(--ink2)", fontWeight: 500 }}>{v.rating.toFixed(1)} ({v.rev})</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 4, color: "var(--ink3)", fontSize: 12 }}>
            <MapPin size={12} style={{ flexShrink: 0 }} />
            <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{v.loc}</span>
            <span style={{ margin: "0 3px", flexShrink: 0 }}>·</span>
            <strong style={{ color: "var(--navy)", flexShrink: 0 }}>{fmtPrice(v.price)}/{v.unit}</strong>
          </div>
        </div>
      </div>

      {v.tags.length > 0 && (
        <div style={{ padding: "0 16px 12px", display: "flex", gap: 6, flexWrap: "wrap" }}>
          {v.tags.slice(0, 4).map((t, i) => {
            const style = getSkillStyle(t, i);
            const Icon = style.icon;
            return (
              <span key={t} style={{
                display: "inline-flex", alignItems: "center", gap: 4,
                fontSize: 10.5, fontWeight: 600, padding: "3px 9px",
                borderRadius: 999, background: style.bg, color: style.color,
                letterSpacing: ".01em",
              }}>
                {Icon ? <Icon s={11} /> : <TagIcon s={11} c={style.color} />}
                {t}
              </span>
            );
          })}
        </div>
      )}

      <div style={{ padding: "12px 16px", display: "flex", gap: 8, borderTop: "1px solid var(--border)" }}>
        <button className="btn-book"
          onClick={(e) => { e.stopPropagation(); router.push(`/customer/book/${v.id}`); }}>
          Book Now
        </button>
        <button className="btn-msg"
          onClick={(e) => { e.stopPropagation(); router.push("/customer/messages"); }}>
          <MessageCircle size={18} />
        </button>
      </div>
    </div>
  );
};
