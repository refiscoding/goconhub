"use client";
import { FC, useState, useEffect, useRef, ChangeEvent, CSSProperties } from "react";
import { useRouter } from "next/navigation";
import {
  HardHat, Shield, Banknote, CheckCircle2, Wrench,
  Zap, Hammer, Paintbrush, Wind, Star,
  Calendar, Clock, CreditCard, Info, ArrowRight, ChevronLeft,
  User, Lock, Trash2, Plus,
  type LucideIcon,
} from "lucide-react";
import { VENDOR_CATS, VENDOR_SKILLS } from "@/lib/constants";
import { useUser } from "@/context/UserContext";
import type { VendorOnboardData, ServiceDraft } from "@/lib/types";

/* ── brand colours ───────────────────────────────────── */
const A  = "#27272a";
const AL = "#ffffff";
const AM = "#e5e5e5";
const NAVY = "#27435f";

/* ── steps ───────────────────────────────────────────── */
const STEPS = ["Welcome", "Info", "Skills", "Services", "Verify", "Go Live!"];
const DEFAULT_DATA: VendorOnboardData = {
  fn: "", ln: "", phone: "", city: "", area: "", bio: "", cat: "", skills: [],
  entityType: "individual", idNumber: "", bankName: "", accountNumber: "",
  companyName: "", companyRegNumber: "",
};

const catIcons: Record<string, LucideIcon> = {
  Plumbing: Wrench, Electrical: Zap, Carpentry: Hammer,
  Painting: Paintbrush, Cleaning: Star, HVAC: Wind,
};

/* ── illustration ────────────────────────────────────── */
const Illus: FC<{ Icon: LucideIcon }> = ({ Icon }) => (
  <div style={{ width: 96, height: 96, borderRadius: "50%", background: AM, border: `2px solid ${NAVY}50`, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 6px 24px ${NAVY}24` }}>
    <Icon size={44} color={NAVY} strokeWidth={1.5} />
  </div>
);

/* ── step icons mapping ──────────────────────────────── */
const stepIcons: LucideIcon[] = [
  HardHat, User, Wrench, Banknote, Shield, CheckCircle2,
];

/* ── dots ────────────────────────────────────────────── */
const Dots: FC<{ cur: number; tot: number }> = ({ cur, tot }) => (
  <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
    {Array.from({ length: tot }).map((_, i) => (
      <div key={i} style={{ height: 6, borderRadius: 3, width: i === cur ? 22 : 6, background: i === cur ? "white" : "rgba(255,255,255,.3)", transition: "all .3s" }} />
    ))}
  </div>
);

/* ── payout flow ─────────────────────────────────────── */
const PayoutFlow: FC = () => (
  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
    {[
      { Icon: CreditCard, label: "Customer", sub: "pays in full" },
      { Icon: Shield,     label: "Escrow",   sub: "holds funds"  },
      { Icon: Banknote,   label: "You",      sub: "get 95%"      },
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
export const VendorOnboard: FC = () => {
  const router         = useRouter();
  const { user, refresh } = useUser();
  const [step,     setStep]     = useState(0);
  const [data,     setData]     = useState<VendorOnboardData>(DEFAULT_DATA);
  const [services, setServices] = useState<ServiceDraft[]>([{ id: 1, name: "", price: "", unit: "hr", desc: "", active: true }]);
  const [busy,     setBusy]     = useState(false);
  const [error,    setError]    = useState("");
  const [idFile,   setIdFile]   = useState<File | null>(null);
  const [cipaFile, setCipaFile] = useState<File | null>(null);
  const idRef   = useRef<HTMLInputElement>(null);
  const cipaRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user) setData((d) => ({
      ...d,
      fn: d.fn || user.firstName || "", ln: d.ln || user.lastName || "",
      phone: d.phone || user.phone || "", city: d.city || user.city || "",
      area: d.area || user.area || "",
    }));
  }, [user]);

  const set = <K extends keyof VendorOnboardData>(k: K, v: VendorOnboardData[K]) =>
    setData((d) => ({ ...d, [k]: v }));

  const toggleSkill = (s: string) =>
    set("skills", data.skills.includes(s) ? data.skills.filter((x) => x !== s) : [...data.skills, s]);

  const addSvc = () => setServices((s) => [...s, { id: Date.now(), name: "", price: "", unit: "hr", desc: "", active: true }]);
  const delSvc = (id: number) => setServices((s) => s.filter((x) => x.id !== id));
  const updSvc = (id: number, k: keyof ServiceDraft, v: string) =>
    setServices((s) => s.map((x) => x.id === id ? { ...x, [k]: v } : x));

  const validate = (): string => {
    if (step === 1) {
      if (!data.fn.trim() || !data.ln.trim()) return "Please enter your first and last name.";
      if (!data.phone.trim()) return "Please enter your phone number.";
      if (!data.city.trim()) return "Please enter your city.";
    }
    if (step === 2) {
      if (!data.cat) return "Please select your primary trade.";
      if (data.skills.length === 0) return "Please select at least one skill.";
    }
    if (step === 3) {
      const valid = services.filter((s) => s.name.trim() && s.price.trim());
      if (valid.length === 0) return "Please add at least one service with a name and price.";
    }
    if (step === 4) {
      if (data.entityType === "individual" && (!data.idNumber.trim() || !idFile)) return "Please enter your ID number and upload your ID document.";
      if (data.entityType === "company" && (!data.companyName.trim() || !data.companyRegNumber.trim() || !cipaFile)) return "Please fill in company details and upload your CIPA certificate.";
      if (!data.bankName.trim() || !data.accountNumber.trim()) return "Please enter your bank account details.";
    }
    return "";
  };

  const isLast = step === STEPS.length - 1;
  const isSplash = step === 0 || step === STEPS.length - 1;
  const StepIcon = stepIcons[step] ?? HardHat;

  return (
    <div style={{ height: "100dvh", overflow: "hidden", display: "flex", flexDirection: "column", background: AL, maxWidth: 430, margin: "0 auto" }}>

      {/* illustration area */}
      <div style={{ flexShrink: 0, height: "30dvh", display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
        {step > 0 && step < STEPS.length - 1 && (
          <button onClick={() => { setError(""); setStep((s) => s - 1); }} style={{ position: "absolute", top: 48, left: 20, width: 36, height: 36, borderRadius: 12, background: "white", border: `1.5px solid ${AM}`, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", boxShadow: `0 2px 8px ${NAVY}25` }}>
            <ChevronLeft size={18} color={NAVY} strokeWidth={2.5} />
          </button>
        )}
        <Illus Icon={StepIcon} />
      </div>

      {/* wave */}
      <div style={{ flex: 1, background: A, borderRadius: "36px 36px 0 0", display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <div style={{ flex: 1, overflowY: "auto", padding: isSplash ? "26px 26px 0" : "20px 24px 0" }}>

          {/* ── Welcome ── */}
          {step === 0 && (
            <>
              <h2 style={wh2}>Get paid,<br />guaranteed.</h2>
              <p style={wsub}>Join handymen earning on their own terms across Botswana.</p>
              <div style={{ background: "rgba(255,255,255,.15)", border: "1px solid rgba(255,255,255,.2)", borderRadius: 14, padding: "14px 16px", display: "flex", gap: 12, alignItems: "flex-start", marginBottom: 12 }}>
                <div style={iconBox}><Shield size={17} color="white" /></div>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 700, color: "white" }}>Escrow protection</p>
                  <p style={{ fontSize: 12, color: "rgba(255,255,255,.7)", marginTop: 2, lineHeight: 1.6 }}>Funds are locked in before you start — so you&apos;re always paid on completion.</p>
                </div>
              </div>
              {[
                { Icon: Star,         text: "Set your own prices & schedule" },
                { Icon: CheckCircle2, text: "Accept or decline any job"      },
                { Icon: Banknote,     text: "Secure payouts in 24 h"         },
              ].map(({ Icon, text }, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, background: "rgba(255,255,255,.12)", borderRadius: 14, padding: "12px 16px", marginBottom: 8 }}>
                  <div style={iconBox}><Icon size={16} color="white" /></div>
                  <span style={{ fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,.9)" }}>{text}</span>
                </div>
              ))}
            </>
          )}

          {/* ── Info ── */}
          {step === 1 && (
            <>
              <h2 style={fh2}>Personal info</h2>
              <p style={fsub}>Customers will see your name and city.</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 16 }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  <F label="First name" placeholder="Marcus" value={data.fn}  onChange={(v) => set("fn", v)} />
                  <F label="Last name"  placeholder="Osei"   value={data.ln}  onChange={(v) => set("ln", v)} />
                </div>
                <F label="Phone" placeholder="+267 7x xxx xxx" value={data.phone} onChange={(v) => set("phone", v)} type="tel" />
                <F label="City / town"  placeholder="Gaborone"          value={data.city}  onChange={(v) => set("city", v)} />
                <F label="Service area" placeholder="e.g. CBD, Phase 2…" value={data.area}  onChange={(v) => set("area", v)} />
                <div style={{ background: "rgba(255,255,255,.13)", borderRadius: 14, padding: "10px 14px", border: "1.5px solid rgba(255,255,255,.2)" }}>
                  <p style={fLbl}>Short bio</p>
                  <textarea rows={3} placeholder="Tell customers about your experience…"
                    value={data.bio} onChange={(e: ChangeEvent<HTMLTextAreaElement>) => set("bio", e.target.value)}
                    style={{ display: "block", width: "100%", background: "transparent", border: "none", outline: "none", fontSize: 14, fontWeight: 600, color: "white", fontFamily: "inherit", resize: "none" }} />
                </div>
              </div>
            </>
          )}

          {/* ── Skills ── */}
          {step === 2 && (
            <>
              <h2 style={fh2}>Trade &amp; skills</h2>
              <p style={fsub}>Select your primary trade and specific skills.</p>
              <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 16 }}>
                <div>
                  <p style={fLbl}>Primary trade</p>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8, marginTop: 8 }}>
                    {VENDOR_CATS.map((c) => {
                      const on = data.cat === c;
                      const CatIcon = catIcons[c] ?? Wrench;
                      return (
                        <div key={c} onClick={() => set("cat", data.cat === c ? "" : c)}
                          style={{ padding: "12px 8px", borderRadius: 14, textAlign: "center", border: `2px solid ${on ? "white" : "rgba(255,255,255,.2)"}`, background: on ? "rgba(255,255,255,.25)" : "rgba(255,255,255,.08)", cursor: "pointer", transition: "all .15s" }}>
                          <CatIcon size={20} color={on ? "white" : "rgba(255,255,255,.5)"} style={{ margin: "0 auto 5px" }} />
                          <p style={{ fontSize: 11, fontWeight: 700, color: on ? "white" : "rgba(255,255,255,.6)" }}>{c}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
                {data.cat && (
                  <div>
                    <p style={fLbl}>Specific skills</p>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 8 }}>
                      {VENDOR_SKILLS.map((s) => {
                        const on = data.skills.includes(s);
                        return (
                          <div key={s} onClick={() => toggleSkill(s)}
                            style={{ display: "flex", alignItems: "center", gap: 5, padding: "7px 13px", borderRadius: 999, border: `1.5px solid ${on ? "white" : "rgba(255,255,255,.2)"}`, background: on ? "rgba(255,255,255,.22)" : "rgba(255,255,255,.08)", cursor: "pointer", transition: "all .15s" }}>
                            {on && <CheckCircle2 size={12} color="white" />}
                            <span style={{ fontSize: 12, fontWeight: 600, color: on ? "white" : "rgba(255,255,255,.6)" }}>{s}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </>
          )}

          {/* ── Services ── */}
          {step === 3 && (
            <>
              <h2 style={fh2}>Services &amp; pricing</h2>
              <p style={fsub}>List what you offer and your rates.</p>
              <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 12 }}>
                {services.map((svc, i) => (
                  <div key={svc.id} style={{ background: "rgba(255,255,255,.12)", borderRadius: 16, padding: 16, border: "1.5px solid rgba(255,255,255,.2)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                      <span style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,.6)", textTransform: "uppercase", letterSpacing: ".07em" }}>Service {i + 1}</span>
                      {services.length > 1 && (
                        <button onClick={() => delSvc(svc.id)} style={{ width: 28, height: 28, borderRadius: 8, background: "rgba(255,255,255,.15)", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                          <Trash2 size={13} color="white" />
                        </button>
                      )}
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                      <div style={{ background: "rgba(255,255,255,.12)", borderRadius: 10, padding: "8px 12px", border: "1px solid rgba(255,255,255,.15)" }}>
                        <input placeholder="Service name (e.g. Pipe repair)" value={svc.name}
                          onChange={(e: ChangeEvent<HTMLInputElement>) => updSvc(svc.id, "name", e.target.value)}
                          style={{ display: "block", width: "100%", background: "transparent", border: "none", outline: "none", fontSize: 14, fontWeight: 600, color: "white", fontFamily: "inherit" }} />
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                        <div style={{ background: "rgba(255,255,255,.12)", borderRadius: 10, padding: "8px 12px", border: "1px solid rgba(255,255,255,.15)", display: "flex", gap: 6, alignItems: "center" }}>
                          <span style={{ fontSize: 13, color: "rgba(255,255,255,.6)", fontWeight: 700 }}>P</span>
                          <input type="number" placeholder="250" value={svc.price}
                            onChange={(e: ChangeEvent<HTMLInputElement>) => updSvc(svc.id, "price", e.target.value)}
                            style={{ display: "block", width: "100%", background: "transparent", border: "none", outline: "none", fontSize: 14, fontWeight: 600, color: "white", fontFamily: "inherit" }} />
                        </div>
                        <div style={{ background: "rgba(255,255,255,.12)", borderRadius: 10, padding: "8px 12px", border: "1px solid rgba(255,255,255,.15)" }}>
                          <select value={svc.unit} onChange={(e: ChangeEvent<HTMLSelectElement>) => updSvc(svc.id, "unit", e.target.value)}
                            style={{ display: "block", width: "100%", background: "transparent", border: "none", outline: "none", fontSize: 14, fontWeight: 600, color: "white", fontFamily: "inherit", appearance: "none" }}>
                            <option value="hr" style={{ color: "#333" }}>Per Hour</option>
                            <option value="job" style={{ color: "#333" }}>Per Job</option>
                            <option value="day" style={{ color: "#333" }}>Per Day</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                <button onClick={addSvc} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, background: "rgba(255,255,255,.1)", border: "2px dashed rgba(255,255,255,.25)", borderRadius: 14, padding: 14, color: "white", fontWeight: 700, fontSize: 14, cursor: "pointer" }}>
                  <Plus size={17} color="white" /> Add Service
                </button>
              </div>
            </>
          )}

          {/* ── Verify ── */}
          {step === 4 && (
            <>
              <h2 style={fh2}>Verification</h2>
              <p style={fsub}>Required to receive payments.</p>
              <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 12 }}>
                {/* Entity type */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  {(["individual", "company"] as const).map((type) => {
                    const on = data.entityType === type;
                    return (
                      <div key={type} onClick={() => { set("entityType", type); setError(""); }}
                        style={{ padding: "14px 12px", borderRadius: 14, textAlign: "center", border: `2px solid ${on ? "white" : "rgba(255,255,255,.2)"}`, background: on ? "rgba(255,255,255,.22)" : "rgba(255,255,255,.08)", cursor: "pointer", transition: "all .15s" }}>
                        <div style={{ width: 36, height: 36, borderRadius: 10, background: on ? "white" : "rgba(255,255,255,.15)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 8px" }}>
                          <User size={18} color={on ? NAVY : "rgba(255,255,255,.6)"} />
                        </div>
                        <p style={{ fontWeight: 700, fontSize: 13, color: "white" }}>{type === "individual" ? "Individual" : "Company"}</p>
                        <p style={{ fontSize: 11, color: "rgba(255,255,255,.6)", marginTop: 2 }}>{type === "individual" ? "Omang / ID" : "CIPA Registered"}</p>
                      </div>
                    );
                  })}
                </div>

                {/* Individual */}
                {data.entityType === "individual" && (
                  <div style={{ background: "rgba(255,255,255,.1)", borderRadius: 14, padding: 16, display: "flex", flexDirection: "column", gap: 10, border: "1px solid rgba(255,255,255,.2)" }}>
                    <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 4 }}>
                      <Shield size={18} color="white" />
                      <p style={{ fontWeight: 700, fontSize: 14, color: "white" }}>Identity Verification</p>
                    </div>
                    <F label="Omang / ID Number *" placeholder="123456789" value={data.idNumber} onChange={(v) => set("idNumber", v)} />
                    <input ref={idRef} type="file" accept="image/*,.pdf" style={{ display: "none" }}
                      onChange={(e: ChangeEvent<HTMLInputElement>) => setIdFile(e.target.files?.[0] ?? null)} />
                    <div onClick={() => idRef.current?.click()}
                      style={{ background: "rgba(255,255,255,.08)", border: `2px dashed ${idFile ? "white" : "rgba(255,255,255,.25)"}`, borderRadius: 12, padding: 16, textAlign: "center", cursor: "pointer" }}>
                      <div style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(255,255,255,.15)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 8px" }}>
                        {idFile ? <CheckCircle2 size={18} color="white" /> : <Info size={18} color="rgba(255,255,255,.6)" />}
                      </div>
                      <p style={{ fontSize: 13, fontWeight: 700, color: idFile ? "white" : "rgba(255,255,255,.65)" }}>
                        {idFile ? idFile.name : "Upload Omang / Passport *"}
                      </p>
                      {!idFile && <p style={{ fontSize: 11, color: "rgba(255,255,255,.45)", marginTop: 3 }}>JPG, PNG or PDF</p>}
                    </div>
                  </div>
                )}

                {/* Company */}
                {data.entityType === "company" && (
                  <div style={{ background: "rgba(255,255,255,.1)", borderRadius: 14, padding: 16, display: "flex", flexDirection: "column", gap: 10, border: "1px solid rgba(255,255,255,.2)" }}>
                    <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 4 }}>
                      <Shield size={18} color="white" />
                      <p style={{ fontWeight: 700, fontSize: 14, color: "white" }}>Company Verification</p>
                    </div>
                    <F label="Registered Company Name *" placeholder="Acme Plumbing Ltd" value={data.companyName} onChange={(v) => set("companyName", v)} />
                    <F label="CIPA Registration Number *" placeholder="BW-12345" value={data.companyRegNumber} onChange={(v) => set("companyRegNumber", v)} />
                    <input ref={cipaRef} type="file" accept="image/*,.pdf" style={{ display: "none" }}
                      onChange={(e: ChangeEvent<HTMLInputElement>) => setCipaFile(e.target.files?.[0] ?? null)} />
                    <div onClick={() => cipaRef.current?.click()}
                      style={{ background: "rgba(255,255,255,.08)", border: `2px dashed ${cipaFile ? "white" : "rgba(255,255,255,.25)"}`, borderRadius: 12, padding: 16, textAlign: "center", cursor: "pointer" }}>
                      <div style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(255,255,255,.15)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 8px" }}>
                        {cipaFile ? <CheckCircle2 size={18} color="white" /> : <Info size={18} color="rgba(255,255,255,.6)" />}
                      </div>
                      <p style={{ fontSize: 13, fontWeight: 700, color: cipaFile ? "white" : "rgba(255,255,255,.65)" }}>
                        {cipaFile ? cipaFile.name : "Upload CIPA Certificate *"}
                      </p>
                      {!cipaFile && <p style={{ fontSize: 11, color: "rgba(255,255,255,.45)", marginTop: 3 }}>JPG, PNG or PDF</p>}
                    </div>
                  </div>
                )}

                {/* Bank */}
                <div style={{ background: "rgba(255,255,255,.1)", borderRadius: 14, padding: 16, display: "flex", flexDirection: "column", gap: 10, border: "1px solid rgba(255,255,255,.2)" }}>
                  <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 4 }}>
                    <Banknote size={18} color="white" />
                    <p style={{ fontWeight: 700, fontSize: 14, color: "white" }}>Bank Account</p>
                  </div>
                  <F label="Bank name *" placeholder="e.g. FNB, Standard Bank" value={data.bankName} onChange={(v) => set("bankName", v)} />
                  <F label="Account number *" placeholder="123456789" value={data.accountNumber} onChange={(v) => set("accountNumber", v)} />
                  <div style={{ display: "flex", gap: 8, alignItems: "center", background: "rgba(255,255,255,.08)", borderRadius: 10, padding: "10px 12px" }}>
                    <Lock size={13} color="rgba(255,255,255,.55)" style={{ flexShrink: 0 }} />
                    <p style={{ fontSize: 12, color: "rgba(255,255,255,.65)" }}>Encrypted and never shared with customers.</p>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* ── Go Live ── */}
          {step === 5 && (
            <>
              <h2 style={wh2}>You&apos;re all set!<br /><span style={{ color: AM }}>Ready to go live.</span></h2>
              <p style={wsub}>Activate your profile to start receiving bookings from customers near you.</p>
              <div style={{ marginTop: 16 }}>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
                  {[
                    { label: "Profile set",  ok: !!(data.fn || data.ln) },
                    { label: "Trade added",  ok: !!data.cat             },
                    { label: "Skills set",   ok: data.skills.length > 0 },
                    { label: "Services",     ok: services.some((s) => s.name) },
                    { label: "Verified",     ok: !!(data.idNumber || data.companyName) },
                    { label: "Bank added",   ok: !!data.bankName        },
                  ].map((b) => (
                    <div key={b.label} style={{ display: "flex", alignItems: "center", gap: 5, padding: "6px 12px", borderRadius: 999, background: b.ok ? "rgba(255,255,255,.2)" : "rgba(255,255,255,.08)", border: `1px solid ${b.ok ? "rgba(255,255,255,.4)" : "rgba(255,255,255,.15)"}`, fontSize: 12, fontWeight: 600, color: b.ok ? "white" : "rgba(255,255,255,.38)" }}>
                      {b.ok ? <CheckCircle2 size={12} color="white" /> : <div style={{ width: 12, height: 12, borderRadius: "50%", border: "1.5px solid rgba(255,255,255,.25)" }} />}
                      {b.label}
                    </div>
                  ))}
                </div>
                <div style={{ background: "rgba(255,255,255,.1)", borderRadius: 16, overflow: "hidden" }}>
                  {([
                    ["Category", data.cat || "—"],
                    ["Services", `${services.filter((s) => s.name).length} listed`],
                    ["Location", data.city || "—"],
                  ] as [string, string][]).map(([k, v], i, arr) => (
                    <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "11px 16px", borderBottom: i < arr.length - 1 ? "1px solid rgba(255,255,255,.1)" : "none", fontSize: 13 }}>
                      <span style={{ color: "rgba(255,255,255,.6)" }}>{k}</span>
                      <span style={{ fontWeight: 700, color: "white" }}>{v}</span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          <div style={{ height: 90 }} />
        </div>

        {/* CTA */}
        <div style={{ flexShrink: 0, padding: "12px 26px 34px", borderTop: "1px solid rgba(255,255,255,.1)" }}>
          {error && <p style={{ fontSize: 12, color: "white", marginBottom: 8, textAlign: "center" }}>{error}</p>}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <Dots cur={step} tot={STEPS.length} />
            <button
              onClick={async () => {
                if (isLast) { router.push("/vendor/dashboard"); return; }
                const err = validate();
                if (err) { setError(err); return; }
                setError("");
                // Submit API on the "Verify" step (second-to-last) before showing Go Live
                if (step === STEPS.length - 2) {
                  setBusy(true);
                  try {
                    // Send text fields only — fast payload
                    const res = await fetch("/api/onboarding", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ firstName: data.fn, lastName: data.ln, phone: data.phone, city: data.city, area: data.area, vendorData: { bio: data.bio, category: data.cat, skills: data.skills, city: data.city, services, entityType: data.entityType, companyName: data.companyName, companyRegNumber: data.companyRegNumber, bankName: data.bankName, accountNumber: data.accountNumber } }),
                    });
                    if (!res.ok) { const d = await res.json(); setError(d.message ?? "Failed."); return; }
                    setStep((s) => s + 1);
                    refresh();
                    // Upload identity documents in the background via storage
                    const uploadDocs = async () => {
                      const uploadFile = async (file: File, type: string): Promise<string | undefined> => {
                        const form = new FormData();
                        form.append("file", file);
                        form.append("bucket", "documents");
                        form.append("type", type);
                        const res = await fetch("/api/upload", { method: "POST", body: form });
                        if (res.ok) {
                          const { url } = await res.json();
                          return url;
                        }
                        // Fallback to base64 if storage is not configured
                        return new Promise((resolve, reject) => {
                          const r = new FileReader();
                          r.onload = () => resolve(r.result as string);
                          r.onerror = reject;
                          r.readAsDataURL(file);
                        });
                      };
                      const idDocumentUrl   = idFile   ? await uploadFile(idFile, "id-document")     : undefined;
                      const cipaDocumentUrl = cipaFile ? await uploadFile(cipaFile, "cipa-document") : undefined;
                      if (idDocumentUrl || cipaDocumentUrl) {
                        await fetch("/api/onboarding", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ vendorData: { idDocumentUrl, cipaDocumentUrl } }),
                        });
                      }
                    };
                    uploadDocs();
                  } catch { setError("Network error."); }
                  finally { setBusy(false); }
                } else {
                  setStep((s) => s + 1);
                }
              }}
              disabled={busy}
              style={{ width: 56, height: 56, borderRadius: "50%", background: "white", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", boxShadow: "0 4px 16px rgba(0,0,0,.2)", flexShrink: 0, opacity: busy ? 0.7 : 1 }}>
              {isLast ? <CheckCircle2 size={24} color={NAVY} strokeWidth={2.5} /> : <ArrowRight size={24} color={NAVY} strokeWidth={2.5} />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ── helpers ─────────────────────────────────────────── */
const fLbl: CSSProperties = { fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,.58)", textTransform: "uppercase", letterSpacing: ".07em", marginBottom: 4 };
const wh2: CSSProperties  = { fontSize: 26, fontWeight: 800, color: "white", letterSpacing: "-.02em", lineHeight: 1.25, marginBottom: 10 };
const wsub: CSSProperties = { fontSize: 14, color: "rgba(255,255,255,.72)", lineHeight: 1.7, marginBottom: 20 };
const fh2: CSSProperties  = { fontSize: 22, fontWeight: 800, color: "white", letterSpacing: "-.02em", lineHeight: 1.25 };
const fsub: CSSProperties = { fontSize: 13, color: "rgba(255,255,255,.7)", marginTop: 5, lineHeight: 1.6 };
const iconBox: CSSProperties = { width: 34, height: 34, borderRadius: 10, background: "rgba(255,255,255,.15)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 };
