"use client";
import { FC, useState, ChangeEvent, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Toggle, Toast, AvatarUpload, PageSpinner } from "@/components/ui";
import { IconEdit, IconCheck, IconUser, IconShield, IconMapPin, IconWrench } from "@/components/icons";
import { BadgeCheck, Building2, CircleCheck, X, CircleDot, CircleCheckBig, Banknote } from "lucide-react";
import { FileText, ShieldCheck, Cookie, ExternalLink, RotateCcw } from "lucide-react";
import { useToast } from "@/hooks/useToast";
import { useUser } from "@/context/UserContext";
import type { ProfileData } from "@/lib/types";

const EMPTY: ProfileData = { fn: "", ln: "", email: "", phone: "", city: "", area: "", bio: "", cat: "" };

type StrField = { [K in keyof ProfileData]: NonNullable<ProfileData[K]> extends string ? K : never }[keyof ProfileData] & string;

interface FieldProps {
  label: string; field: StrField; type?: string;
  editing: boolean; draft: ProfileData; profile: ProfileData;
  onChange: (f: StrField, v: string) => void;
}
const Field: FC<FieldProps> = ({ label, field, type = "text", editing, draft, profile, onChange }) => (
  <div>
    <label style={{ fontSize: 11, fontWeight: 700, color: "var(--ink3)", textTransform: "uppercase", letterSpacing: ".06em", display: "block", marginBottom: 6 }}>{label}</label>
    {editing
      ? <input type={type} className="field" value={draft[field] as string} onChange={(e: ChangeEvent<HTMLInputElement>) => onChange(field, e.target.value)} />
      : <p style={{ fontSize: 15, fontWeight: 500, padding: "2px 0", color: "var(--ink)" }}>{(profile[field] as string) || <span style={{ color: "var(--ink3)" }}>Not set</span>}</p>}
  </div>
);

export const VendorProfile: FC = () => {
  const router = useRouter();
  const { user, loading: userLoading, logout, refresh } = useUser();
  const [toast, showToast] = useToast();
  const [live,      setLive]      = useState(true);
  const [editing,   setEditing]   = useState(false);
  const [busy,      setBusy]      = useState(false);
  const [profile,   setProfile]   = useState<ProfileData>(EMPTY);
  const [draft,     setDraft]     = useState<ProfileData>(EMPTY);
  const [avatar,    setAvatar]    = useState<string | null>(null);

  // Change password
  const [pwOpen,    setPwOpen]    = useState(false);
  const [pwCurrent, setPwCurrent] = useState("");
  const [pwNew,     setPwNew]     = useState("");
  const [pwConfirm, setPwConfirm] = useState("");
  const [pwBusy,    setPwBusy]    = useState(false);

  useEffect(() => {
    if (user) {
      const p: ProfileData = {
        fn: user.firstName, ln: user.lastName,
        email: user.email, phone: user.phone ?? "",
        city: user.city ?? "", area: user.area ?? "",
        bio: user.vendor?.bio ?? "", cat: user.vendor?.category ?? "",
      };
      setProfile(p); setDraft(p);
      setLive(user.vendor?.available ?? true);
      setAvatar(user.avatarUrl ?? null);
    }
  }, [user]);

  const save = async () => {
    setBusy(true);
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ firstName: draft.fn, lastName: draft.ln, phone: draft.phone, city: draft.city, area: draft.area, bio: draft.bio, category: draft.cat }),
      });
      if (!res.ok) { showToast("Failed to save profile", "err"); return; }
      await refresh();
      setEditing(false);
      showToast("Profile saved", "ok");
    } catch { showToast("Network error", "err"); }
    finally { setBusy(false); }
  };

  const handleAvatarUpload = async (croppedDataUrl: string) => {
    try {
      const blob = await fetch(croppedDataUrl).then((r) => r.blob());
      const form = new FormData();
      form.append("file", blob, `avatar.${blob.type.split("/")[1] || "jpg"}`);
      form.append("bucket", "avatars");
      form.append("type", "avatar");

      const upRes = await fetch("/api/upload", { method: "POST", body: form });
      const avatarUrl = upRes.ok
        ? (await upRes.json()).url
        : croppedDataUrl; // fallback to base64 if storage not configured

      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ avatarUrl }),
      });
      if (!res.ok) { showToast("Upload failed", "err"); return; }
      setAvatar(avatarUrl);
      await refresh();
      showToast("Photo updated", "ok");
    } catch {
      showToast("Upload failed", "err");
    }
  };

  const toggleLive = async (v: boolean) => {
    setLive(v);
    await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ available: v }),
    });
    showToast(v ? "Profile is now live" : "Profile hidden", "ok");
  };

  const handleLogout = async () => { await logout(); router.push("/"); };

  const changePassword = async () => {
    if (!pwCurrent || !pwNew || !pwConfirm) { showToast("Fill in all fields", "err"); return; }
    if (pwNew !== pwConfirm) { showToast("New passwords do not match", "err"); return; }
    if (pwNew.length < 8)    { showToast("Password must be at least 8 characters", "err"); return; }
    setPwBusy(true);
    try {
      const res  = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword: pwCurrent, newPassword: pwNew }),
      });
      const data = await res.json();
      if (!res.ok) { showToast(data.message ?? "Failed", "err"); return; }
      showToast("Password changed", "ok");
      setPwOpen(false); setPwCurrent(""); setPwNew(""); setPwConfirm("");
    } catch { showToast("Network error", "err"); }
    finally { setPwBusy(false); }
  };

  const onFieldChange = (f: StrField, v: string) => setDraft((d) => ({ ...d, [f]: v }));

  const fullName = `${profile.fn} ${profile.ln}`.trim();

  if (userLoading) {
    return <PageSpinner paddingY="120px" />;
  }

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", paddingBottom: 100 }}>
      {toast && <Toast msg={toast.msg} type={toast.type} />}

      {/* ── Hero banner ── */}
      <div className="profile-hero-banner" style={{ background: "linear-gradient(135deg,#0f1923 0%,#0d2333 100%)", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(ellipse at 70% 50%,rgba(45,212,191,.25) 0%,transparent 65%)" }} />
        <div style={{ position: "absolute", top: -50, right: -50, width: 200, height: 200, borderRadius: "50%", background: "rgba(45,212,191,.06)" }} />
        <div style={{ position: "absolute", top: 16, right: 16 }}>
          <button
            onClick={() => editing ? save() : setEditing(true)}
            disabled={busy}
            style={{ background: "rgba(255,255,255,.1)", backdropFilter: "blur(10px)", border: "1.5px solid rgba(255,255,255,.2)", borderRadius: 999, padding: "8px 18px", color: "#fff", fontSize: 13, fontWeight: 700, display: "flex", alignItems: "center", gap: 7, cursor: "pointer", opacity: busy ? 0.7 : 1 }}
          >
            {editing
              ? <><IconCheck style={{ width: 15, height: 15 }} />{busy ? "Saving…" : "Save"}</>
              : <><IconEdit style={{ width: 15, height: 15 }} />Edit Profile</>}
          </button>
        </div>
      </div>

      {/* ── Avatar ── */}
      <div style={{ display: "flex", justifyContent: "center", marginTop: -55, position: "relative", zIndex: 10 }}>
        <div style={{ padding: 4, background: "var(--bg)", borderRadius: "50%", boxShadow: "0 4px 20px rgba(0,0,0,.25)" }}>
          <AvatarUpload src={avatar} name={fullName || "?"} size={110} onUpload={handleAvatarUpload} />
        </div>
      </div>

      {/* ── Name + status ── */}
      <div style={{ textAlign: "center", padding: "14px 24px 0" }}>
        <h2 style={{ fontSize: 24, fontWeight: 800, letterSpacing: "-.02em", color: "var(--ink)" }}>{fullName || "Your Name"}</h2>
        <p style={{ fontSize: 13, color: "var(--ink3)", marginTop: 4 }}>
          {profile.cat || "Handyman"}
        </p>
        <p style={{ fontSize: 12, color: "var(--ink3)", marginTop: 3, display: "flex", alignItems: "center", justifyContent: "center", gap: 4 }}>
          <IconMapPin style={{ width: 12, height: 12 }} />
          {profile.city || "Gaborone"}{profile.area ? `, ${profile.area}` : ""}
        </p>
      </div>

      {/* ── Live toggle ── */}
      <div style={{ margin: "16px 20px 0", background: live ? "var(--acc-bg)" : "var(--red-bg)", border: `1px solid ${live ? "var(--acc-bd)" : "rgba(224,49,49,.25)"}`, borderRadius: 16, padding: "14px 18px", display: "flex", alignItems: "center", gap: 14 }}>
        <div style={{ flex: 1 }}>
          <p style={{ fontWeight: 700, fontSize: 15, color: live ? "var(--acc)" : "var(--red)" }}>{live ? "Profile is Live" : "Profile is Hidden"}</p>
          <p style={{ fontSize: 12, color: "var(--ink2)", marginTop: 3 }}>{live ? "Customers can find and book you." : "Your profile is invisible to customers."}</p>
        </div>
        <Toggle on={live} onChange={toggleLive} />
      </div>

      {/* ── Stats row ── */}
      <div style={{ display: "flex", gap: 10, margin: "14px 20px 0" }}>
        {[
          { label: "Rating",   value: user?.vendor?.rating?.toFixed(1) ?? "—",     color: "#f59e0b", icon: "⭐" },
          { label: "Reviews",  value: String(user?.vendor?.reviewCount ?? 0),       color: "var(--acc)", icon: "💬" },
          { label: "Verified", value: user?.vendor?.verified ? "Yes" : "No",        color: "var(--green)", icon: "" },
        ].map((s) => (
          <div key={s.label} style={{ flex: 1, background: "var(--card)", borderRadius: 14, boxShadow: "0 2px 8px rgba(0,0,0,0.08)", padding: "14px 8px", textAlign: "center" }}>
            <span style={{ fontSize: 20 }}>{s.icon}</span>
            <p style={{ fontSize: 17, fontWeight: 800, color: s.color, marginTop: 6 }}>{s.value}</p>
            <p style={{ fontSize: 10, color: "var(--ink3)", fontWeight: 700, marginTop: 2, textTransform: "uppercase", letterSpacing: ".05em" }}>{s.label}</p>
          </div>
        ))}
      </div>

      <div style={{ padding: "16px 20px 0", display: "flex", flexDirection: "column", gap: 14 }}>

        {/* ── Personal info ── */}
        <div style={{ background: "var(--card)", borderRadius: 18, boxShadow: "0 2px 8px rgba(0,0,0,0.08)", overflow: "hidden" }}>
          <div style={{ padding: "16px 20px 12px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: 10, background: "var(--acc-bg)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <IconUser style={{ width: 16, height: 16, color: "var(--acc)" }} />
            </div>
            <p style={{ fontWeight: 700, fontSize: 14, color: "var(--ink)" }}>Personal Information</p>
          </div>
          <div className="info-grid" style={{ padding: "20px" }}>
            <Field label="First Name" field="fn"    editing={editing} draft={draft} profile={profile} onChange={onFieldChange} />
            <Field label="Last Name"  field="ln"    editing={editing} draft={draft} profile={profile} onChange={onFieldChange} />
            <div style={{ gridColumn: "1/-1" }}><Field label="Email" field="email" editing={editing} draft={draft} profile={profile} onChange={onFieldChange} type="email" /></div>
            <Field label="Phone"    field="phone" editing={editing} draft={draft} profile={profile} onChange={onFieldChange} type="tel" />
            <Field label="City"     field="city"  editing={editing} draft={draft} profile={profile} onChange={onFieldChange} />
            <Field label="Area"     field="area"  editing={editing} draft={draft} profile={profile} onChange={onFieldChange} />
            <div style={{ gridColumn: "1/-1" }}><Field label="Category" field="cat" editing={editing} draft={draft} profile={profile} onChange={onFieldChange} /></div>
            {user?.vendor?.entityType === "company" && user.vendor.companyName && (
              <>
                <div style={{ gridColumn: "1/-1", height: 1, background: "var(--border)", margin: "4px 0" }} />
                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, color: "var(--ink3)", textTransform: "uppercase", letterSpacing: ".06em", display: "block", marginBottom: 6 }}>Company Name</label>
                  <p style={{ fontSize: 15, fontWeight: 500, padding: "2px 0", color: "var(--ink)" }}>{user.vendor.companyName}</p>
                </div>
                {user.vendor.companyRegNumber && (
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 700, color: "var(--ink3)", textTransform: "uppercase", letterSpacing: ".06em", display: "block", marginBottom: 6 }}>Reg. Number</label>
                    <p style={{ fontSize: 15, fontWeight: 500, padding: "2px 0", color: "var(--ink)" }}>{user.vendor.companyRegNumber}</p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* ── Bio ── */}
        <div style={{ background: "var(--card)", borderRadius: 18, boxShadow: "0 2px 8px rgba(0,0,0,0.08)", overflow: "hidden" }}>
          <div style={{ padding: "16px 20px 12px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: 10, background: "rgba(99,102,241,.12)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <IconWrench style={{ width: 16, height: 16, color: "#6366f1" }} />
            </div>
            <p style={{ fontWeight: 700, fontSize: 14, color: "var(--ink)" }}>About / Bio</p>
          </div>
          <div style={{ padding: "16px 20px" }}>
            {editing
              ? <textarea className="field" rows={4} value={draft.bio} onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setDraft((d) => ({ ...d, bio: e.target.value }))} placeholder="Tell customers about yourself…" style={{ resize: "vertical" }} />
              : <p style={{ fontSize: 14, color: profile.bio ? "var(--ink)" : "var(--ink3)", lineHeight: 1.7 }}>{profile.bio || "No bio yet. Tap Edit Profile to add one."}</p>
            }
          </div>
        </div>

        {/* ── Skills ── */}
        {(user?.vendor?.skills?.length ?? 0) > 0 && (
          <div style={{ background: "var(--card)", borderRadius: 18, boxShadow: "0 2px 8px rgba(0,0,0,0.08)", overflow: "hidden" }}>
            <div style={{ padding: "16px 20px 12px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 32, height: 32, borderRadius: 10, background: "var(--acc-bg)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <IconWrench style={{ width: 16, height: 16, color: "var(--acc)" }} />
              </div>
              <p style={{ fontWeight: 700, fontSize: 14, color: "var(--ink)" }}>Skills</p>
            </div>
            <div style={{ padding: "16px 20px", display: "flex", flexWrap: "wrap", gap: 8 }}>
              {user!.vendor!.skills.map((s) => (
                <span key={s} style={{ padding: "5px 14px", borderRadius: 999, background: "var(--acc-bg)", border: "1px solid var(--acc-bd)", fontSize: 12, fontWeight: 600, color: "var(--acc)" }}>{s}</span>
              ))}
            </div>
          </div>
        )}

        {/* ── Identity Verification ── */}
        {user?.vendor && (() => {
          const isIndividual = !user.vendor!.entityType || user.vendor!.entityType === "individual";
          const hasDoc = isIndividual ? !!user.vendor!.idDocumentUrl : !!user.vendor!.cipaDocumentUrl;
          const isVerified = user.vendor!.verified;
          return (
            <div style={{ background: "var(--card)", borderRadius: 18, boxShadow: "0 2px 8px rgba(0,0,0,0.08)", overflow: "hidden" }}>
              <div style={{ padding: "16px 20px 12px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 32, height: 32, borderRadius: 10, background: isVerified ? "rgba(68,146,53,.12)" : "rgba(209,170,31,.12)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {isVerified
                    ? <CircleCheckBig size={16} color="#449235" />
                    : <CircleDot size={16} color="#d1aa1f" />}
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontWeight: 700, fontSize: 14, color: "var(--ink)" }}>Identity Verification</p>
                  <p style={{ fontSize: 11, fontWeight: 600, color: isVerified ? "#449235" : "#d1aa1f", marginTop: 1 }}>
                    {isVerified ? "Verified by admin" : "Pending admin review"}
                  </p>
                </div>
              </div>
              <div style={{ padding: "16px 20px", display: "flex", flexDirection: "column", gap: 12 }}>
                {/* Entity type */}
                <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                  <div style={{ width: 32, height: 32, borderRadius: 10, background: isIndividual ? "rgba(99,102,241,.1)" : "rgba(217,119,6,.1)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    {isIndividual ? <IconUser style={{ width: 15, height: 15, color: "#6366f1" }} /> : <Building2 size={15} color="#d97706" />}
                  </div>
                  <div>
                    <p style={{ fontSize: 11, fontWeight: 700, color: "var(--ink3)", textTransform: "uppercase", letterSpacing: ".05em" }}>Entity Type</p>
                    <p style={{ fontSize: 14, fontWeight: 600, color: "var(--ink)", marginTop: 2, textTransform: "capitalize" }}>{user.vendor!.entityType || "Individual"}</p>
                  </div>
                </div>

                {/* Company details */}
                {!isIndividual && (
                  <>
                    <div style={{ height: 1, background: "var(--border)" }} />
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                      <div>
                        <p style={{ fontSize: 11, fontWeight: 700, color: "var(--ink3)", textTransform: "uppercase", letterSpacing: ".05em" }}>Company</p>
                        <p style={{ fontSize: 14, fontWeight: 600, color: "var(--ink)", marginTop: 2 }}>{user.vendor!.companyName || <span style={{ color: "var(--ink3)" }}>Not set</span>}</p>
                      </div>
                      <div>
                        <p style={{ fontSize: 11, fontWeight: 700, color: "var(--ink3)", textTransform: "uppercase", letterSpacing: ".05em" }}>Reg. No.</p>
                        <p style={{ fontSize: 14, fontWeight: 600, color: "var(--ink)", marginTop: 2 }}>{user.vendor!.companyRegNumber || <span style={{ color: "var(--ink3)" }}>Not set</span>}</p>
                      </div>
                    </div>
                  </>
                )}

                {/* Document upload status */}
                <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 14px", borderRadius: 12, background: hasDoc ? "rgba(80,251,100,.08)" : "rgba(243,18,18,.06)", border: `1px solid ${hasDoc ? "rgba(80,251,100,.3)" : "rgba(243,18,18,.2)"}` }}>
                  {hasDoc ? <CircleCheck size={15} color="#50fb64" /> : <X size={15} color="#f31212" />}
                  <p style={{ fontSize: 13, fontWeight: 700, color: hasDoc ? "#16a34a" : "#dc2626" }}>
                    {isIndividual ? "Omang / Passport" : "CIPA Certificate"} — {hasDoc ? "Submitted" : "Not submitted"}
                  </p>
                </div>
              </div>
            </div>
          );
        })()}

        {/* ── Bank Account ── */}
        {user?.vendor && (user.vendor.bankName || user.vendor.accountNumber) && (
          <div style={{ background: "var(--card)", borderRadius: 18, boxShadow: "0 2px 8px rgba(0,0,0,0.08)", overflow: "hidden" }}>
            <div style={{ padding: "16px 20px 12px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 32, height: 32, borderRadius: 10, background: "rgba(16,163,127,.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Banknote size={16} color="#10a37f" />
              </div>
              <p style={{ fontWeight: 700, fontSize: 14, color: "var(--ink)" }}>Bank Account</p>
            </div>
            <div className="info-grid" style={{ padding: "16px 20px" }}>
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: "var(--ink3)", textTransform: "uppercase", letterSpacing: ".06em", display: "block", marginBottom: 6 }}>Bank Name</label>
                <p style={{ fontSize: 15, fontWeight: 500, color: "var(--ink)" }}>{user.vendor.bankName || <span style={{ color: "var(--ink3)" }}>Not set</span>}</p>
              </div>
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: "var(--ink3)", textTransform: "uppercase", letterSpacing: ".06em", display: "block", marginBottom: 6 }}>Account No.</label>
                <p style={{ fontSize: 15, fontWeight: 500, color: "var(--ink)", fontFamily: "'DM Mono', monospace" }}>{user.vendor.accountNumber || <span style={{ color: "var(--ink3)" }}>Not set</span>}</p>
              </div>
            </div>
          </div>
        )}

        {/* ── Security ── */}
        <div style={{ background: "var(--card)", borderRadius: 18, boxShadow: "0 2px 8px rgba(0,0,0,0.08)", overflow: "hidden" }}>
          <div style={{ padding: "16px 20px 12px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: 10, background: "var(--green-bg)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <IconShield style={{ width: 16, height: 16, color: "var(--green)" }} />
            </div>
            <p style={{ fontWeight: 700, fontSize: 14, color: "var(--ink)" }}>Account Security</p>
          </div>
          <div style={{ padding: "16px 20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <p style={{ fontWeight: 600, fontSize: 14, color: "var(--ink)" }}>Password</p>
                <p style={{ fontSize: 12, color: "var(--ink3)", marginTop: 2 }}>Change your account password</p>
              </div>
              <button
                onClick={() => setPwOpen((o) => !o)}
                style={{ fontSize: 12, fontWeight: 700, color: "var(--acc)", background: "var(--acc-bg)", padding: "6px 14px", borderRadius: 999, border: "1px solid var(--acc-bd)", cursor: "pointer" }}
              >{pwOpen ? "Cancel" : "Change"}</button>
            </div>
            {pwOpen && (
              <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 12 }}>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, color: "var(--ink3)", textTransform: "uppercase", letterSpacing: ".06em", display: "block", marginBottom: 6 }}>Current Password</label>
                  <input type="password" className="field" placeholder="••••••••" value={pwCurrent} onChange={(e) => setPwCurrent(e.target.value)} />
                </div>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, color: "var(--ink3)", textTransform: "uppercase", letterSpacing: ".06em", display: "block", marginBottom: 6 }}>New Password</label>
                  <input type="password" className="field" placeholder="Min 8 characters" value={pwNew} onChange={(e) => setPwNew(e.target.value)} />
                </div>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, color: "var(--ink3)", textTransform: "uppercase", letterSpacing: ".06em", display: "block", marginBottom: 6 }}>Confirm New Password</label>
                  <input type="password" className="field" placeholder="Repeat new password" value={pwConfirm} onChange={(e) => setPwConfirm(e.target.value)} />
                </div>
                <button
                  onClick={changePassword}
                  disabled={pwBusy}
                  className="btn-pri"
                  style={{ padding: 13, fontSize: 14, opacity: pwBusy ? 0.7 : 1 }}
                >{pwBusy ? "Saving…" : "Update Password"}</button>
              </div>
            )}
          </div>
        </div>

        {/* ── Privacy Centre ── */}
        <div style={{ background: "var(--card)", borderRadius: 18, boxShadow: "0 2px 8px rgba(0,0,0,0.08)", overflow: "hidden" }}>
          <div style={{ padding: "16px 20px 12px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: 10, background: "rgba(13,148,136,.12)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <ShieldCheck size={16} color="#0d9488" />
            </div>
            <p style={{ fontWeight: 700, fontSize: 14, color: "var(--ink)" }}>Privacy Centre</p>
          </div>
          <div style={{ padding: "16px 20px", display: "flex", flexDirection: "column", gap: 10 }}>
            {[
              { href: "/legal/privacy", icon: <ShieldCheck size={15} color="#0d9488" />, label: "Privacy Policy",      desc: "How we handle your data as a vendor",    bg: "rgba(13,148,136,.08)" },
              { href: "/legal/terms",   icon: <FileText    size={15} color="#d97706" />, label: "Terms & Conditions", desc: "Your obligations and rights on GoCon", bg: "rgba(217,119,6,.08)"  },
              { href: "/legal/cookies", icon: <Cookie      size={15} color="#6366f1" />, label: "Cookie Policy",      desc: "How we use cookies and local storage",    bg: "rgba(99,102,241,.08)" },
            ].map((item) => (
              <a key={item.href} href={item.href} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 12px", borderRadius: 12, background: "var(--bg)", border: "1px solid var(--border)", textDecoration: "none" }}>
                <div style={{ width: 32, height: 32, borderRadius: 9, background: item.bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{item.icon}</div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontWeight: 700, fontSize: 13, color: "var(--ink)", margin: 0 }}>{item.label}</p>
                  <p style={{ fontSize: 11, color: "var(--ink3)", margin: 0, marginTop: 1 }}>{item.desc}</p>
                </div>
                <ExternalLink size={13} color="var(--ink3)" />
              </a>
            ))}
            <div style={{ marginTop: 4, padding: "12px 14px", borderRadius: 12, background: "var(--bg)", border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 32, height: 32, borderRadius: 9, background: "rgba(99,102,241,.08)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Cookie size={15} color="#6366f1" />
                </div>
                <div>
                  <p style={{ fontWeight: 700, fontSize: 13, color: "var(--ink)", margin: 0 }}>Cookie Preferences</p>
                  <p style={{ fontSize: 11, color: "var(--ink3)", margin: 0 }}>Reset your consent settings</p>
                </div>
              </div>
              <button onClick={() => { localStorage.removeItem("hh_cookie_consent"); window.location.reload(); }} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, fontWeight: 700, color: "var(--acc)", background: "var(--acc-bg)", padding: "6px 12px", borderRadius: 999, border: "1px solid var(--acc-bd)", cursor: "pointer", flexShrink: 0 }}>
                <RotateCcw size={11} />
                Reset
              </button>
            </div>
            <div style={{ padding: "12px 14px", borderRadius: 12, background: "#f0fdfa", border: "1px solid #ccfbf1" }}>
              <p style={{ fontWeight: 700, fontSize: 12, color: "#0d9488", marginBottom: 4 }}>Your Data Rights</p>
              <p style={{ fontSize: 12, color: "#44403c", lineHeight: 1.6, margin: 0 }}>
                To access, correct, or delete your personal data, contact{" "}
                <a href="mailto:privacy@gocon.co.bw" style={{ color: "#0d9488", fontWeight: 700 }}>privacy@gocon.co.bw</a>
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
