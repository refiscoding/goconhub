"use client";
import { FC, useState, useEffect, useRef, ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { IconChevL, IconShield, IconWallet, IconPlus, IconTrash } from "@/components/icons";
import { ProgressBar, Toggle } from "@/components/ui";
import { VENDOR_CATS, VENDOR_SKILLS } from "@/lib/constants";
import { useUser } from "@/context/UserContext";
import type { VendorOnboardData, ServiceDraft } from "@/lib/types";

const STEPS = ["Welcome", "Info", "Skills", "Services", "Verify", "Go Live!"];
const DEFAULT_DATA: VendorOnboardData = {
  fn: "", ln: "", phone: "", city: "", area: "", bio: "", cat: "", skills: [],
  entityType: "individual", idNumber: "", bankName: "", accountNumber: "", companyName: "", companyRegNumber: "",
};

interface LabelInputProps {
  label: string;
  field: keyof VendorOnboardData;
  placeholder?: string;
  data: VendorOnboardData;
  set: <K extends keyof VendorOnboardData>(k: K, v: VendorOnboardData[K]) => void;
}

const LabelInput: FC<LabelInputProps> = ({ label, field, placeholder, data, set }) => (
  <div>
    <label style={{ fontSize: 11, fontWeight: 700, color: "var(--ink2)", textTransform: "uppercase", letterSpacing: ".05em", display: "block", marginBottom: 5 }}>{label}</label>
    <input className="field" placeholder={placeholder} value={data[field] as string} onChange={(e: ChangeEvent<HTMLInputElement>) => set(field, e.target.value)} />
  </div>
);

export const VendorOnboard: FC = () => {
  const router = useRouter();
  const { user } = useUser();
  const [step,     setStep]     = useState(0);
  const [data,     setData]     = useState<VendorOnboardData>(DEFAULT_DATA);
  const [services, setServices] = useState<ServiceDraft[]>([{ id: 1, name: "", price: "", unit: "hr", desc: "", active: true }]);
  const [busy,     setBusy]     = useState(false);
  const [error,    setError]    = useState("");
  const [idFile,   setIdFile]   = useState<File | null>(null);
  const [cipaFile, setCipaFile] = useState<File | null>(null);
  const idFileRef   = useRef<HTMLInputElement>(null);
  const cipaFileRef = useRef<HTMLInputElement>(null);

  // Autofill from registration data once user is loaded
  useEffect(() => {
    if (user) {
      setData((d) => ({
        ...d,
        fn:    d.fn    || user.firstName        || "",
        ln:    d.ln    || user.lastName         || "",
        phone: d.phone || user.phone            || "",
        city:  d.city  || user.city             || "",
        area:  d.area  || user.area             || "",
      }));
    }
  }, [user]);

  const set = <K extends keyof VendorOnboardData>(k: K, v: VendorOnboardData[K]) => setData((d) => ({ ...d, [k]: v }));
  const toggleSkill = (s: string) => set("skills", data.skills.includes(s) ? data.skills.filter((x) => x !== s) : [...data.skills, s]);

  const addSvc = () => setServices((s) => [...s, { id: Date.now(), name: "", price: "", unit: "hr", desc: "", active: true }]);
  const delSvc = (id: number) => setServices((s) => s.filter((x) => x.id !== id));
  const updSvc = (id: number, k: keyof ServiceDraft, v: string) =>
    setServices((s) => s.map((x) => x.id === id ? { ...x, [k]: v } : x));

  return (
    <div data-theme="vendor" style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", flexDirection: "column" }}>
      <div style={{ padding: "20px 22px 14px", display: "flex", alignItems: "center", gap: 14, background: "var(--bg2)", borderBottom: "1px solid var(--border)" }}>
        {step > 0 && <button className="back-btn" onClick={() => setStep((s) => s - 1)}><IconChevL style={{ width: 20, height: 20 }} /></button>}
        <ProgressBar step={step + 1} total={STEPS.length} label={STEPS[step]} />
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "24px 22px 120px" }}>
        {step === 0 && (
          <div className="page-enter" style={{ display: "flex", flexDirection: "column", gap: 22, alignItems: "center", textAlign: "center", paddingTop: 28 }}>
            <div style={{ width: 96, height: 96, background: "var(--acc-bg)", border: "2px solid var(--acc-bd)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 42 }}>🔧</div>
            <div><h2 className="serif" style={{ fontSize: 32 }}>Join as a<br /><em style={{ color: "var(--acc)" }}>Handyman</em></h2><p style={{ color: "var(--ink2)", marginTop: 10, lineHeight: 1.7 }}>Get discovered by hundreds of customers in Gaborone.</p></div>
            {["Set your own prices & schedule", "Accept or decline jobs", "Receive secure payouts"].map((t, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12, padding: "12px 16px", textAlign: "left", width: "100%" }}>
                <div style={{ width: 28, height: 28, borderRadius: "50%", background: "var(--acc-bg)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--acc)", fontSize: 12, fontWeight: 700, flexShrink: 0 }}>{i + 1}</div>
                <span style={{ fontSize: 14, fontWeight: 500 }}>{t}</span>
              </div>
            ))}
          </div>
        )}

        {step === 1 && (
          <div className="page-enter" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <h2 className="serif" style={{ fontSize: 26 }}>Personal Info</h2>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <LabelInput label="First Name" field="fn" placeholder="Marcus" data={data} set={set} />
              <LabelInput label="Last Name"  field="ln" placeholder="Osei"   data={data} set={set} />
            </div>
            <LabelInput label="Phone"        field="phone" placeholder="+267 7x xxx xxx" data={data} set={set} />
            <LabelInput label="City"         field="city"  placeholder="Gaborone"         data={data} set={set} />
            <LabelInput label="Service Area" field="area"  placeholder="e.g. CBD, Phase 2…" data={data} set={set} />
            <div>
              <label style={{ fontSize: 11, fontWeight: 700, color: "var(--ink2)", textTransform: "uppercase", letterSpacing: ".05em", display: "block", marginBottom: 5 }}>Bio</label>
              <textarea className="field" rows={3} placeholder="Tell customers about your experience…" value={data.bio} onChange={(e: ChangeEvent<HTMLTextAreaElement>) => set("bio", e.target.value)} />
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="page-enter" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <h2 className="serif" style={{ fontSize: 26 }}>Trade & Skills</h2>
            <div><p style={{ fontSize: 11, fontWeight: 700, color: "var(--ink2)", textTransform: "uppercase", letterSpacing: ".05em", marginBottom: 8 }}>Primary Category</p><div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>{VENDOR_CATS.map((c) => <div key={c} className={`chip ${data.cat === c ? "on" : ""}`} onClick={() => set("cat", c)}>{c}</div>)}</div></div>
            <div><p style={{ fontSize: 11, fontWeight: 700, color: "var(--ink2)", textTransform: "uppercase", letterSpacing: ".05em", marginBottom: 8 }}>Skills</p><div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>{VENDOR_SKILLS.map((s) => <div key={s} className={`chip ${data.skills.includes(s) ? "on" : ""}`} onClick={() => toggleSkill(s)}>{s}</div>)}</div></div>
          </div>
        )}

        {step === 3 && (
          <div className="page-enter" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <h2 className="serif" style={{ fontSize: 26 }}>Services & Pricing</h2>
            {services.map((svc, i) => (
              <div key={svc.id} className="card" style={{ padding: 16 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: "var(--acc)", textTransform: "uppercase" }}>Service {i + 1}</span>
                  {services.length > 1 && <button onClick={() => delSvc(svc.id)} style={{ background: "var(--red-bg)", border: "none", borderRadius: 8, width: 26, height: 26, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--red)" }}><IconTrash style={{ width: 13, height: 13 }} /></button>}
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  <input className="field" placeholder="Service name" value={svc.name} onChange={(e: ChangeEvent<HTMLInputElement>) => updSvc(svc.id, "name", e.target.value)} />
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                    <div className="pfx"><span className="sym">P</span><input className="field" type="number" placeholder="250" value={svc.price} onChange={(e: ChangeEvent<HTMLInputElement>) => updSvc(svc.id, "price", e.target.value)} /></div>
                    <select className="field" value={svc.unit} onChange={(e: ChangeEvent<HTMLSelectElement>) => updSvc(svc.id, "unit", e.target.value)}><option value="hr">Per Hour</option><option value="job">Per Job</option><option value="day">Per Day</option></select>
                  </div>
                  <textarea className="field" rows={2} placeholder="Description…" value={svc.desc} onChange={(e: ChangeEvent<HTMLTextAreaElement>) => updSvc(svc.id, "desc", e.target.value)} />
                </div>
              </div>
            ))}
            <button onClick={addSvc} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, background: "var(--bg3)", border: "1.5px dashed var(--border2)", borderRadius: 10, padding: 13, color: "var(--acc)", fontWeight: 700, fontSize: 14 }}>
              <IconPlus style={{ width: 17, height: 17 }} /> Add Service
            </button>
          </div>
        )}

        {step === 4 && (
          <div className="page-enter" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div>
              <h2 className="serif" style={{ fontSize: 26 }}>Verification</h2>
              <p style={{ color: "var(--ink2)", fontSize: 14, marginTop: 4 }}>Required to receive payments.</p>
            </div>

            {/* Entity type selector */}
            <div className="card" style={{ padding: 16 }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: "var(--ink2)", textTransform: "uppercase", letterSpacing: ".05em", marginBottom: 10 }}>Account Type</p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                {(["individual", "company"] as const).map((type) => (
                  <div key={type} onClick={() => { set("entityType", type); setError(""); }}
                    style={{ border: `2px solid ${data.entityType === type ? "var(--acc)" : "var(--border)"}`, borderRadius: 10, padding: "12px 14px", cursor: "pointer", background: data.entityType === type ? "var(--acc-bg)" : "var(--bg3)", textAlign: "center", transition: "all .15s" }}>
                    <p style={{ fontSize: 20, marginBottom: 4 }}>{type === "individual" ? "👤" : "🏢"}</p>
                    <p style={{ fontWeight: 700, fontSize: 13, color: data.entityType === type ? "var(--acc)" : "var(--ink)" }}>{type === "individual" ? "Individual" : "Registered Company"}</p>
                    <p style={{ fontSize: 11, color: "var(--ink3)", marginTop: 2 }}>{type === "individual" ? "Omang / ID" : "CIPA Registered"}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Individual path */}
            {data.entityType === "individual" && (
              <div className="card" style={{ padding: 16, display: "flex", flexDirection: "column", gap: 14 }}>
                <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                  <IconShield style={{ width: 22, height: 22, color: "var(--acc)" }} />
                  <p style={{ fontWeight: 700, fontSize: 15 }}>Identity Verification</p>
                </div>
                <input className="field" placeholder="Omang / ID Number *"
                  value={data.idNumber} onChange={(e: ChangeEvent<HTMLInputElement>) => set("idNumber", e.target.value)} />
                <input ref={idFileRef} type="file" accept="image/*,.pdf" style={{ display: "none" }}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setIdFile(e.target.files?.[0] ?? null)} />
                <div onClick={() => idFileRef.current?.click()}
                  style={{ background: "var(--bg3)", border: `2px dashed ${idFile ? "var(--acc)" : "var(--border2)"}`, borderRadius: 10, padding: 18, textAlign: "center", cursor: "pointer", color: "var(--ink2)" }}>
                  <p style={{ fontSize: 22, marginBottom: 6 }}>{idFile ? "✅" : "📄"}</p>
                  <p style={{ fontSize: 13, fontWeight: 700, color: idFile ? "var(--acc)" : undefined }}>
                    {idFile ? idFile.name : "Upload Omang / Passport *"}
                  </p>
                  {!idFile && <p style={{ fontSize: 11, marginTop: 2 }}>JPG, PNG or PDF</p>}
                </div>
              </div>
            )}

            {/* Company path */}
            {data.entityType === "company" && (
              <div className="card" style={{ padding: 16, display: "flex", flexDirection: "column", gap: 14 }}>
                <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                  <IconShield style={{ width: 22, height: 22, color: "var(--acc)" }} />
                  <p style={{ fontWeight: 700, fontSize: 15 }}>Company Verification</p>
                </div>
                <input className="field" placeholder="Registered Company Name *"
                  value={data.companyName} onChange={(e: ChangeEvent<HTMLInputElement>) => set("companyName", e.target.value)} />
                <input className="field" placeholder="CIPA Registration Number *"
                  value={data.companyRegNumber} onChange={(e: ChangeEvent<HTMLInputElement>) => set("companyRegNumber", e.target.value)} />
                <input ref={cipaFileRef} type="file" accept="image/*,.pdf" style={{ display: "none" }}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setCipaFile(e.target.files?.[0] ?? null)} />
                <div onClick={() => cipaFileRef.current?.click()}
                  style={{ background: "var(--bg3)", border: `2px dashed ${cipaFile ? "var(--acc)" : "var(--border2)"}`, borderRadius: 10, padding: 18, textAlign: "center", cursor: "pointer", color: "var(--ink2)" }}>
                  <p style={{ fontSize: 22, marginBottom: 6 }}>{cipaFile ? "✅" : "🏛️"}</p>
                  <p style={{ fontSize: 13, fontWeight: 700, color: cipaFile ? "var(--acc)" : undefined }}>
                    {cipaFile ? cipaFile.name : "Upload CIPA Certificate of Incorporation *"}
                  </p>
                  {!cipaFile && <p style={{ fontSize: 11, marginTop: 2 }}>JPG, PNG or PDF</p>}
                </div>
              </div>
            )}

            {/* Bank account — both paths */}
            <div className="card" style={{ padding: 16, display: "flex", flexDirection: "column", gap: 14 }}>
              <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <IconWallet style={{ width: 22, height: 22, color: "var(--acc)" }} />
                <p style={{ fontWeight: 700, fontSize: 15 }}>{data.entityType === "company" ? "Company Bank Account" : "Bank Account"}</p>
              </div>
              <input className="field" placeholder="Bank name (e.g. FNB, Standard Bank) *"
                value={data.bankName} onChange={(e: ChangeEvent<HTMLInputElement>) => set("bankName", e.target.value)} />
              <input className="field" placeholder="Account number *"
                value={data.accountNumber} onChange={(e: ChangeEvent<HTMLInputElement>) => set("accountNumber", e.target.value)} />
            </div>
          </div>
        )}

        {step === 5 && (
          <div className="page-enter" style={{ display: "flex", flexDirection: "column", gap: 22, alignItems: "center", textAlign: "center", paddingTop: 28 }}>
            <div style={{ width: 96, height: 96, background: "var(--acc-bg)", border: "2px solid var(--acc-bd)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 42 }}>🎉</div>
            <div><h2 className="serif" style={{ fontSize: 30 }}>You're all set!<br /><em style={{ color: "var(--acc)" }}>Ready to go live.</em></h2><p style={{ color: "var(--ink2)", marginTop: 10, lineHeight: 1.7 }}>Activate your profile to start receiving bookings.</p></div>
            <div className="card" style={{ width: "100%", padding: 18, textAlign: "left" }}>
              {([["Category", data.cat || "Plumber"], ["Services", `${services.length} listed`], ["Location", data.city || "Gaborone"]] as [string, string][]).map(([k, v]) => (
                <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid var(--border)", fontSize: 14 }}><span style={{ color: "var(--ink2)" }}>{k}</span><span style={{ fontWeight: 600 }}>{v}</span></div>
              ))}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 12 }}><p style={{ fontWeight: 700 }}>Profile Visible</p><Toggle on={true} onChange={() => {}} /></div>
            </div>
          </div>
        )}
      </div>

      <div style={{ position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: 430, padding: "14px 22px 28px", background: "rgba(14,17,23,.96)", backdropFilter: "blur(14px)", borderTop: "1px solid var(--border)" }}>
        {error && <p style={{ fontSize: 12, color: "#f87171", marginBottom: 8, textAlign: "center" }}>{error}</p>}
        <button className="btn-pri" disabled={busy} style={{ opacity: busy ? 0.7 : 1 }}
          onClick={async () => {
            if (step === 4) {
              const isIndividual = data.entityType === "individual";
              if (isIndividual && (!data.idNumber.trim() || !idFile)) { setError("Please enter your ID number and upload your ID document."); return; }
              if (!isIndividual && (!data.companyName.trim() || !data.companyRegNumber.trim() || !cipaFile)) { setError("Please fill in company details and upload your CIPA certificate."); return; }
              if (!data.bankName.trim() || !data.accountNumber.trim()) { setError("Please enter your bank account details."); return; }
              setError("");
            }
            if (step < STEPS.length - 1) { setStep((s) => s + 1); return; }
            setBusy(true); setError("");
            try {
              const res = await fetch("/api/onboarding", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  firstName: data.fn, lastName: data.ln, phone: data.phone, city: data.city, area: data.area,
                  vendorData: { bio: data.bio, category: data.cat, skills: data.skills, city: data.city, services },
                }),
              });
              if (!res.ok) { const d = await res.json(); setError(d.message ?? "Failed to save."); return; }
              router.push("/vendor/dashboard");
            } catch { setError("Network error."); }
            finally { setBusy(false); }
          }}>
          {busy ? "Saving…" : step === STEPS.length - 1 ? "Enter Dashboard →" : "Continue →"}
        </button>
      </div>
    </div>
  );
};
