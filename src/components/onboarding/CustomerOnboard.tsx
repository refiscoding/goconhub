"use client";
import { FC, useState, ChangeEvent, CSSProperties } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/context/UserContext";
import {
  Shield, CreditCard, CheckCircle2,
  Wrench, Zap, Hammer, Paintbrush, Wind, Star,
  MapPin, User, Lock, ArrowRight, ChevronLeft,
  type LucideIcon,
} from "lucide-react";
import { CUSTOMER_SERVICES } from "@/lib/constants";
import type { CustOnboardData } from "@/lib/types";

/* ── brand colours ───────────────────────────────────── */
const C  = "#0d9488";  // teal-600
const CL = "#f0fdfa";  // teal-50
const CM = "#ccfbf1";  // teal-100

/* ── step config ─────────────────────────────────────── */
type Kind = "splash" | "form";
interface Meta { title: string; sub: string; kind: Kind; img: string }

const STEPS: Meta[] = [
  { title: "Welcome to Gocon Hub",    sub: "Book trusted local handymen in minutes.\nPay only when the job is done.",        kind: "splash", img: "/onboarding/greetings.svg"      },
  { title: "Your details",            sub: "Help handymen know who they're working with.",                                   kind: "form",   img: "/onboarding/fill-form.svg"       },
  { title: "Your location",           sub: "We'll show the best handymen near you.",                                         kind: "form",   img: "/onboarding/location-globe.svg"  },
  { title: "Your money is protected", sub: "Payment is held in escrow and released only after you confirm the job.",         kind: "splash", img: "/onboarding/safe-payment.svg"    },
  { title: "What do you need?",       sub: "Personalise your feed — select the services you need most.",                     kind: "form",   img: "/onboarding/handyman.svg"        },
  { title: "You're all set!",         sub: "Your profile is live. Start exploring verified handymen near you.",              kind: "splash", img: "/onboarding/account-created.svg" },
];

const TRADES = [
  { id: "Plumbing",   Icon: Wrench    },
  { id: "Electrical", Icon: Zap       },
  { id: "Carpentry",  Icon: Hammer    },
  { id: "Painting",   Icon: Paintbrush},
  { id: "Cleaning",   Icon: Star      },
  { id: "HVAC",       Icon: Wind      },
];

const EMPTY: CustOnboardData = { fn: "", ln: "", phone: "", city: "", area: "", services: [] };

/* ── illustration ────────────────────────────────────── */
const Illus: FC<{ img: string }> = ({ img }) => (
  <img src={img} alt="" style={{ width: "100%", objectFit: "contain", padding: "12px 20px", animation: "illusEnter 1s cubic-bezier(.22,1,.36,1) both" }} />
);

/* ── dots ────────────────────────────────────────────── */
const Dots: FC<{ cur: number; tot: number }> = ({ cur, tot }) => (
  <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
    {Array.from({ length: tot }).map((_, i) => (
      <div key={i} style={{ height: 6, borderRadius: 3, width: i === cur ? 22 : 6, background: i === cur ? "white" : "rgba(255,255,255,.3)", transition: "all .3s" }} />
    ))}
  </div>
);

/* ── escrow flow ─────────────────────────────────────── */
const EscrowFlow: FC = () => (
  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
    {[
      { Icon: User,    label: "You",    sub: "Pay securely" },
      { Icon: Shield,  label: "Escrow", sub: "Funds held"   },
      { Icon: Wrench,  label: "Pro",    sub: "Paid on done" },
    ].map((n, i, arr) => (
      <div key={n.label} style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 5, minWidth: 68 }}>
          <div style={{ width: 48, height: 48, borderRadius: "50%", background: "rgba(255,255,255,.18)", border: "1.5px solid rgba(255,255,255,.32)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <n.Icon size={21} color="white" strokeWidth={1.6} />
          </div>
          <p style={{ fontSize: 12, fontWeight: 700, color: "white" }}>{n.label}</p>
          <p style={{ fontSize: 10, color: "rgba(255,255,255,.62)", textAlign: "center" }}>{n.sub}</p>
        </div>
        {i < arr.length - 1 && <ArrowRight size={15} color="rgba(255,255,255,.45)" style={{ marginBottom: 24, flexShrink: 0 }} />}
      </div>
    ))}
  </div>
);

/* ── field ───────────────────────────────────────────── */
const F: FC<{ label: string; placeholder?: string; value: string; onChange: (v: string) => void; type?: string }> =
  ({ label, placeholder, value, onChange, type = "text" }) => (
    <div style={{ background: "rgba(255,255,255,.13)", borderRadius: 14, padding: "10px 14px", border: "1.5px solid rgba(255,255,255,.2)" }}>
      <p style={fLbl}>{label}</p>
      <input type={type} placeholder={placeholder} value={value}
        onChange={(e: ChangeEvent<HTMLInputElement>) => onChange(e.target.value)}
        style={{ display: "block", width: "100%", background: "transparent", border: "none", outline: "none", fontSize: 15, fontWeight: 600, color: "white", fontFamily: "inherit" }} />
    </div>
  );

/* ── main ────────────────────────────────────────────── */
export const CustomerOnboard: FC = () => {
  const router = useRouter();
  const { user } = useUser();
  const [step,  setStep]  = useState(0);
  const [data,  setData]  = useState<CustOnboardData>({
    ...EMPTY,
    fn: user?.firstName ?? "",
    ln: user?.lastName  ?? "",
    phone: user?.phone  ?? "",
  });
  const [busy,  setBusy]  = useState(false);
  const [error, setError] = useState("");

  const set = <K extends keyof CustOnboardData>(k: K, v: CustOnboardData[K]) =>
    setData((d) => ({ ...d, [k]: v }));

  const toggleSvc = (s: string) =>
    set("services", data.services.includes(s) ? data.services.filter((x) => x !== s) : [...data.services, s]);

  const finish = async () => {
    setBusy(true); setError("");
    try {
      const res = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ firstName: data.fn, lastName: data.ln, phone: data.phone, city: data.city, area: data.area, preferredServices: data.services }),
      });
      if (!res.ok) { const d = await res.json(); setError(d.message ?? "Failed to save."); return; }
      router.push("/customer/explore");
    } catch { setError("Network error."); }
    finally { setBusy(false); }
  };

  const canAdvance = (): boolean => {
    if (step === 1) return !!(data.fn.trim() && data.ln.trim() && data.phone.trim());
    if (step === 2) return !!(data.city.trim() && data.area.trim());
    if (step === 4) return data.services.length > 0;
    return true;
  };

  const handleNext = () => {
    if (!canAdvance()) { setError("Please fill in all required fields."); return; }
    setError("");
    if (step < STEPS.length - 1) setStep((s) => s + 1); else finish();
  };

  const meta = STEPS[step];
  const isSplash = meta.kind === "splash";
  const isLast = step === STEPS.length - 1;

  return (
    <div style={{ height: "100dvh", overflow: "hidden", display: "flex", flexDirection: "column", background: CL, maxWidth: 430, margin: "0 auto" }}>

      {/* illustration area */}
      <div style={{ flexShrink: 0, height: "30dvh", display: "flex", alignItems: "stretch", justifyContent: "center", position: "relative", overflow: "hidden" }}>
        {step > 0 && (
          <button onClick={() => { setError(""); setStep((s) => s - 1); }} style={{ position: "absolute", top: 48, left: 20, width: 36, height: 36, borderRadius: 12, background: "white", border: `1.5px solid ${CM}`, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", boxShadow: `0 2px 8px ${C}20`, zIndex: 1 }}>
            <ChevronLeft size={18} color={C} strokeWidth={2.5} />
          </button>
        )}
        <Illus key={step} img={meta.img} />
      </div>

      {/* wave */}
      <div style={{ flex: 1, background: C, borderRadius: "36px 36px 0 0", display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <div style={{ flex: 1, overflowY: "auto", padding: isSplash ? "26px 26px 0" : "20px 24px 0" }}>
          <h2 style={{ fontSize: isSplash ? 26 : 22, fontWeight: 800, color: "white", letterSpacing: "-.02em", lineHeight: 1.25, marginBottom: 10 }}>{meta.title}</h2>
          <p style={{ fontSize: 14, color: "rgba(255,255,255,.72)", lineHeight: 1.7, whiteSpace: "pre-line", marginBottom: 20 }}>{meta.sub}</p>

          {/* ── Welcome ── */}
          {step === 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {[
                { Icon: MapPin, text: "Find verified handymen near you" },
                { Icon: Zap,    text: "Book & track jobs in real-time"  },
                { Icon: Lock,   text: "Pay only when the job is done"   },
              ].map(({ Icon, text }, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, background: "rgba(255,255,255,.12)", borderRadius: 14, padding: "12px 16px" }}>
                  <div style={{ width: 34, height: 34, borderRadius: 10, background: "rgba(255,255,255,.15)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <Icon size={16} color="white" />
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,.9)" }}>{text}</span>
                </div>
              ))}
            </div>
          )}

          {/* ── Details ── */}
          {step === 1 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <F label="First name" placeholder="Lesego"  value={data.fn}    onChange={(v) => set("fn", v)} />
                <F label="Last name"  placeholder="Mokoena" value={data.ln}    onChange={(v) => set("ln", v)} />
              </div>
              <F label="Phone" placeholder="+267 7x xxx xxx" value={data.phone} onChange={(v) => set("phone", v)} type="tel" />
            </div>
          )}

          {/* ── Location ── */}
          {step === 2 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <F label="City / town"       placeholder="Gaborone"                value={data.city} onChange={(v) => set("city", v)} />
              <F label="Neighbourhood"     placeholder="e.g. Phase 2, Extension 10…" value={data.area} onChange={(v) => set("area", v)} />
              <div style={{ background: "rgba(255,255,255,.1)", border: "2px dashed rgba(255,255,255,.25)", borderRadius: 14, height: 82, display: "flex", alignItems: "center", justifyContent: "center", gap: 10, cursor: "pointer" }}>
                <MapPin size={18} color="rgba(255,255,255,.6)" />
                <p style={{ fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,.65)" }}>Use my current location</p>
              </div>
            </div>
          )}

          {/* ── Escrow ── */}
          {step === 3 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={{ background: "rgba(255,255,255,.1)", borderRadius: 20, padding: "18px 14px" }}>
                <EscrowFlow />
              </div>
              {[
                { Icon: CreditCard,   title: "You pay",       body: "Payment is captured and placed into a secure escrow account." },
                { Icon: Lock,         title: "Funds held",    body: "The handyman cannot access the money until you confirm completion." },
                { Icon: CheckCircle2, title: "Job confirmed", body: "Approve the job and funds are released to the handyman within 24 h." },
              ].map((s) => (
                <div key={s.title} style={{ display: "flex", gap: 12, alignItems: "flex-start", background: "rgba(255,255,255,.1)", borderRadius: 14, padding: "13px 15px" }}>
                  <div style={{ width: 34, height: 34, borderRadius: 10, background: "rgba(255,255,255,.15)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <s.Icon size={16} color="white" strokeWidth={1.8} />
                  </div>
                  <div>
                    <p style={{ fontWeight: 700, fontSize: 13, color: "white" }}>{s.title}</p>
                    <p style={{ fontSize: 12, color: "rgba(255,255,255,.68)", marginTop: 3, lineHeight: 1.55 }}>{s.body}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ── Interests ── */}
          {step === 4 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                {TRADES.map(({ id, Icon }) => {
                  const on = data.services.includes(id);
                  return (
                    <div key={id} onClick={() => toggleSvc(id)}
                      style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 14px", borderRadius: 14, border: `2px solid ${on ? "white" : "rgba(255,255,255,.2)"}`, background: on ? "rgba(255,255,255,.22)" : "rgba(255,255,255,.08)", cursor: "pointer", transition: "all .15s" }}>
                      <Icon size={17} color={on ? "white" : "rgba(255,255,255,.5)"} strokeWidth={1.7} />
                      <span style={{ fontSize: 13, fontWeight: 600, color: on ? "white" : "rgba(255,255,255,.65)", flex: 1 }}>{id}</span>
                      {on && <CheckCircle2 size={14} color="white" />}
                    </div>
                  );
                })}
              </div>
              {/* also show CUSTOMER_SERVICES chips */}
              {CUSTOMER_SERVICES.filter((s) => !TRADES.find((t) => t.id === s)).length > 0 && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {CUSTOMER_SERVICES.filter((s) => !TRADES.find((t) => t.id === s)).map((s) => {
                    const on = data.services.includes(s);
                    return (
                      <div key={s} onClick={() => toggleSvc(s)}
                        style={{ padding: "7px 14px", borderRadius: 999, fontSize: 12, fontWeight: 600, cursor: "pointer", transition: "all .15s", border: `1.5px solid ${on ? "white" : "rgba(255,255,255,.22)"}`, background: on ? "rgba(255,255,255,.22)" : "rgba(255,255,255,.08)", color: on ? "white" : "rgba(255,255,255,.65)" }}>
                        {s}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ── Done ── */}
          {step === 5 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {[
                  { label: "Profile set",     ok: !!(data.fn || data.ln) },
                  { label: "Location saved",  ok: !!data.city  },
                  { label: "Escrow active",   ok: true         },
                  { label: "Services chosen", ok: data.services.length > 0 },
                ].map((b) => (
                  <div key={b.label} style={{ display: "flex", alignItems: "center", gap: 5, padding: "6px 12px", borderRadius: 999, background: b.ok ? "rgba(255,255,255,.2)" : "rgba(255,255,255,.08)", border: `1px solid ${b.ok ? "rgba(255,255,255,.4)" : "rgba(255,255,255,.15)"}`, fontSize: 12, fontWeight: 600, color: b.ok ? "white" : "rgba(255,255,255,.4)" }}>
                    {b.ok ? <CheckCircle2 size={12} color="white" /> : <div style={{ width: 12, height: 12, borderRadius: "50%", border: "1.5px solid rgba(255,255,255,.25)" }} />}
                    {b.label}
                  </div>
                ))}
              </div>
              <div style={{ background: "rgba(255,255,255,.1)", borderRadius: 16, overflow: "hidden" }}>
                {([
                  ["Name",     `${data.fn} ${data.ln}`.trim() || "—"],
                  ["Location", data.city || "—"],
                  ["Services", data.services.length ? data.services.slice(0, 3).join(", ") : "—"],
                ] as [string, string][]).map(([k, v], i, arr) => (
                  <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "11px 16px", borderBottom: i < arr.length - 1 ? "1px solid rgba(255,255,255,.1)" : "none", fontSize: 13 }}>
                    <span style={{ color: "rgba(255,255,255,.6)" }}>{k}</span>
                    <span style={{ fontWeight: 700, color: "white", maxWidth: "55%", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{v}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div style={{ height: 90 }} />
        </div>

        {/* CTA */}
        <div style={{ flexShrink: 0, padding: "12px 26px 34px", borderTop: "1px solid rgba(255,255,255,.1)" }}>
          {error && <p style={{ fontSize: 12, color: "#ff6b6b", marginBottom: 8, textAlign: "center", fontWeight: 700 }}>{error}</p>}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <Dots cur={step} tot={STEPS.length} />
            <button onClick={handleNext}
              disabled={busy}
              style={{ width: 56, height: 56, borderRadius: "50%", background: "white", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", boxShadow: "0 4px 16px rgba(0,0,0,.2)", flexShrink: 0, opacity: busy ? 0.7 : 1 }}>
              {isLast ? <CheckCircle2 size={24} color={C} strokeWidth={2.5} /> : <ArrowRight size={24} color={C} strokeWidth={2.5} />}
            </button>
          </div>
          {isLast && (
            <p style={{ textAlign: "center", fontSize: 13, fontWeight: 700, color: "rgba(255,255,255,.65)", marginTop: 12, cursor: "pointer" }}
              onClick={handleNext}>
              {busy ? "Saving…" : "Explore handymen →"}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

/* ── helpers ─────────────────────────────────────────── */
const fLbl: CSSProperties = { fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,.58)", textTransform: "uppercase", letterSpacing: ".07em", marginBottom: 4 };
