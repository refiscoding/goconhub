"use client";
import { FC, useState, ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { IconChevL, IconCheck } from "@/components/icons";
import { ProgressBar } from "@/components/ui";
import { CUSTOMER_SERVICES } from "@/lib/constants";
import type { CustOnboardData } from "@/lib/types";

const STEPS = ["Welcome", "Details", "Location", "Interests"];

const DEFAULT: CustOnboardData = { fn: "", ln: "", phone: "", city: "", area: "", services: [] };

export const CustomerOnboard: FC = () => {
  const router = useRouter();
  const [step,  setStep]  = useState(0);
  const [data,  setData]  = useState<CustOnboardData>(DEFAULT);
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

  return (
    <div data-theme="customer" style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", flexDirection: "column" }}>
      <div style={{ padding: "20px 22px 14px", display: "flex", alignItems: "center", gap: 14, background: "var(--bg2)", borderBottom: "1px solid var(--border)" }}>
        {step > 0 && (
          <button className="back-btn" onClick={() => setStep((s) => s - 1)}>
            <IconChevL style={{ width: 20, height: 20 }} />
          </button>
        )}
        <ProgressBar step={step + 1} total={STEPS.length} label={STEPS[step]} />
      </div>

      <div style={{ flex: 1, padding: "24px 22px 120px", overflowY: "auto" }}>
        {step === 0 && (
          <div className="page-enter" style={{ display: "flex", flexDirection: "column", gap: 22, alignItems: "center", textAlign: "center", paddingTop: 28 }}>
            <div style={{ width: 96, height: 96, background: "var(--acc-bg)", border: "2px solid var(--acc-bd)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 42 }}>🔧</div>
            <div>
              <h2 className="serif" style={{ fontSize: 32, letterSpacing: "-.02em" }}>Welcome to<br /><em style={{ color: "var(--acc)" }}>HandyHub</em></h2>
              <p style={{ color: "var(--ink2)", marginTop: 10, lineHeight: 1.7 }}>Find and book trusted local handymen in minutes.</p>
            </div>
            {["Browse verified handymen nearby", "Book & track in real-time", "Pay securely after completion"].map((t, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12, padding: "12px 16px", textAlign: "left", width: "100%" }}>
                <div style={{ width: 28, height: 28, borderRadius: "50%", background: "var(--acc-bg)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--acc)", fontSize: 12, fontWeight: 700, flexShrink: 0 }}>{i + 1}</div>
                <span style={{ fontSize: 14, fontWeight: 500 }}>{t}</span>
              </div>
            ))}
          </div>
        )}

        {step === 1 && (
          <div className="page-enter" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div><h2 className="serif" style={{ fontSize: 26 }}>Your details</h2><p style={{ color: "var(--ink2)", fontSize: 14, marginTop: 4 }}>Help handymen know who they're working with.</p></div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div><label style={{ fontSize: 11, fontWeight: 700, color: "var(--ink2)", textTransform: "uppercase", letterSpacing: ".05em", display: "block", marginBottom: 5 }}>First Name</label><input className="field" placeholder="Lesego" value={data.fn} onChange={(e: ChangeEvent<HTMLInputElement>) => set("fn", e.target.value)} /></div>
              <div><label style={{ fontSize: 11, fontWeight: 700, color: "var(--ink2)", textTransform: "uppercase", letterSpacing: ".05em", display: "block", marginBottom: 5 }}>Last Name</label><input className="field" placeholder="Mokoena" value={data.ln} onChange={(e: ChangeEvent<HTMLInputElement>) => set("ln", e.target.value)} /></div>
            </div>
            <div><label style={{ fontSize: 11, fontWeight: 700, color: "var(--ink2)", textTransform: "uppercase", letterSpacing: ".05em", display: "block", marginBottom: 5 }}>Phone</label><input className="field" placeholder="+267 7x xxx xxx" value={data.phone} onChange={(e: ChangeEvent<HTMLInputElement>) => set("phone", e.target.value)} /></div>
          </div>
        )}

        {step === 2 && (
          <div className="page-enter" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div><h2 className="serif" style={{ fontSize: 26 }}>Your location</h2><p style={{ color: "var(--ink2)", fontSize: 14, marginTop: 4 }}>We'll show nearby handymen first.</p></div>
            <div><label style={{ fontSize: 11, fontWeight: 700, color: "var(--ink2)", textTransform: "uppercase", letterSpacing: ".05em", display: "block", marginBottom: 5 }}>City / Town</label><input className="field" placeholder="Gaborone" value={data.city} onChange={(e: ChangeEvent<HTMLInputElement>) => set("city", e.target.value)} /></div>
            <div><label style={{ fontSize: 11, fontWeight: 700, color: "var(--ink2)", textTransform: "uppercase", letterSpacing: ".05em", display: "block", marginBottom: 5 }}>Neighbourhood</label><input className="field" placeholder="e.g. Phase 2, Extension 10…" value={data.area} onChange={(e: ChangeEvent<HTMLInputElement>) => set("area", e.target.value)} /></div>
            <div style={{ background: "var(--bg2)", border: "2px dashed var(--border)", borderRadius: 14, height: 150, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 6, color: "var(--ink3)", cursor: "pointer" }}>
              <span style={{ fontSize: 28 }}>📍</span><p style={{ fontSize: 13, fontWeight: 600 }}>Use my current location</p>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="page-enter" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div><h2 className="serif" style={{ fontSize: 26 }}>What do you need?</h2><p style={{ color: "var(--ink2)", fontSize: 14, marginTop: 4 }}>Personalises your feed.</p></div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {CUSTOMER_SERVICES.map((s) => (
                <div key={s} className={`chip ${data.services.includes(s) ? "on" : ""}`} onClick={() => toggleSvc(s)}>
                  {data.services.includes(s) && <IconCheck style={{ width: 13, height: 13 }} />}{s}
                </div>
              ))}
            </div>
            {data.services.length > 0 && (
              <div style={{ background: "var(--acc-bg)", border: "1px solid var(--acc-bd)", borderRadius: 10, padding: "12px 14px" }}>
                <p style={{ fontSize: 13, color: "var(--acc)" }}>✨ We'll prioritise <strong>{data.services.slice(0, 2).join(" & ")}</strong> experts near you.</p>
              </div>
            )}
          </div>
        )}
      </div>

      <div style={{ position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: 430, padding: "14px 22px 28px", background: "rgba(250,247,242,.95)", backdropFilter: "blur(12px)", borderTop: "1px solid var(--border)" }}>
        {error && <p style={{ fontSize: 12, color: "#dc2626", marginBottom: 8, textAlign: "center" }}>{error}</p>}
        <button className="btn-pri" disabled={busy} style={{ opacity: busy ? 0.7 : 1 }}
          onClick={() => step < STEPS.length - 1 ? setStep((s) => s + 1) : finish()}>
          {busy ? "Saving…" : step === STEPS.length - 1 ? "Let's go! →" : "Continue →"}
        </button>
      </div>
    </div>
  );
};
