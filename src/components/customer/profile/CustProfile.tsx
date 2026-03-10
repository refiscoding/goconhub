"use client";
import { FC, useState, ChangeEvent, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { IconEdit, IconCheck, IconMapPin, IconLogout, IconUser, IconBell, IconShield, IconWallet } from "@/components/icons";
import { Toast, AvatarUpload, PageSpinner } from "@/components/ui";
import { useToast } from "@/hooks/useToast";
import { useUser } from "@/context/UserContext";
import type { ProfileData } from "@/lib/types";


const EMPTY: ProfileData = { fn: "", ln: "", email: "", phone: "", city: "", area: "", bio: "" };

export const CustProfile: FC = () => {
  const router = useRouter();
  const { user, loading: userLoading, logout, refresh } = useUser();
  const [toast, showToast] = useToast();
  const [editing, setEditing] = useState(false);
  const [busy,    setBusy]    = useState(false);
  const [profile, setProfile] = useState<ProfileData>(EMPTY);
  const [draft,   setDraft]   = useState<ProfileData>(EMPTY);
  const [avatar,  setAvatar]  = useState<string | null>(null);

  // Change password
  const [pwOpen,    setPwOpen]    = useState(false);
  const [pwCurrent, setPwCurrent] = useState("");
  const [pwNew,     setPwNew]     = useState("");
  const [pwConfirm, setPwConfirm] = useState("");
  const [pwBusy,    setPwBusy]    = useState(false);

  // Payment history
  interface PayRecord { id: string; serviceName: string; amount: number; paidAt: string | null; paymentMethod: string | null; vendor: { user: { firstName: string; lastName: string } } }
  const [payments, setPayments] = useState<PayRecord[]>([]);
  const loadPayments = useCallback(() => {
    fetch("/api/customer/payments").then((r) => r.json()).then((d) => setPayments(d.payments ?? [])).catch(() => {});
  }, []);
  useEffect(() => { loadPayments(); }, [loadPayments]);

  const METHOD_NAMES: Record<string, string> = { dpo: "DPO Pay", orange: "Orange Money", ewallet: "eWallet" };

  useEffect(() => {
    if (user) {
      const p: ProfileData = {
        fn: user.firstName, ln: user.lastName,
        email: user.email, phone: user.phone ?? "",
        city: user.city ?? "", area: user.area ?? "", bio: "",
      };
      setProfile(p); setDraft(p);
      setAvatar(user.avatarUrl ?? null);
    }
  }, [user]);

  const save = async () => {
    setBusy(true);
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ firstName: draft.fn, lastName: draft.ln, phone: draft.phone, city: draft.city, area: draft.area }),
      });
      if (!res.ok) { showToast("Failed to save profile", "err"); return; }
      await refresh();
      setEditing(false);
      showToast("Profile updated ✓", "ok");
    } catch { showToast("Network error", "err"); }
    finally { setBusy(false); }
  };

  const handleAvatarUpload = async (dataUrl: string) => {
    const res = await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ avatarUrl: dataUrl }),
    });
    if (!res.ok) { showToast("Upload failed", "err"); return; }
    setAvatar(dataUrl);
    await refresh();
    showToast("Photo updated ✓", "ok");
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
      showToast("Password changed ✓", "ok");
      setPwOpen(false); setPwCurrent(""); setPwNew(""); setPwConfirm("");
    } catch { showToast("Network error", "err"); }
    finally { setPwBusy(false); }
  };

  type StrField = { [K in keyof ProfileData]: ProfileData[K] extends string ? K : never }[keyof ProfileData] & string;

  const Field: FC<{ label: string; field: StrField; type?: string; full?: boolean }> = ({ label, field, type = "text", full }) => (
    <div style={full ? { gridColumn: "1/-1" } : {}}>
      <label style={{ fontSize: 11, fontWeight: 700, color: "var(--ink3)", textTransform: "uppercase", letterSpacing: ".06em", display: "block", marginBottom: 6 }}>{label}</label>
      {editing
        ? <input type={type} className="field" value={draft[field] as string} onChange={(e: ChangeEvent<HTMLInputElement>) => setDraft((d) => ({ ...d, [field]: e.target.value }))} />
        : <p style={{ fontSize: 15, fontWeight: 500, padding: "2px 0", color: "var(--ink)" }}>{(profile[field] as string) || <span style={{ color: "var(--ink3)" }}>Not set</span>}</p>}
    </div>
  );

  const fullName = `${profile.fn} ${profile.ln}`.trim();

  if (userLoading) {
    return <PageSpinner paddingY="120px" />;
  }

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", paddingBottom: 100 }}>
      {toast && <Toast msg={toast.msg} type={toast.type} />}

      {/* ── Hero banner ── */}
      <div style={{ height: 160, background: "linear-gradient(135deg,var(--acc) 0%,#b45309 100%)", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: -40, right: -40, width: 200, height: 200, borderRadius: "50%", background: "rgba(255,255,255,.08)" }} />
        <div style={{ position: "absolute", bottom: -60, left: -20, width: 160, height: 160, borderRadius: "50%", background: "rgba(0,0,0,.1)" }} />
        <div style={{ position: "absolute", top: 16, right: 16 }}>
          <button
            onClick={() => editing ? save() : setEditing(true)}
            disabled={busy}
            style={{ background: "rgba(255,255,255,.2)", backdropFilter: "blur(10px)", border: "1.5px solid rgba(255,255,255,.35)", borderRadius: 999, padding: "8px 18px", color: "#fff", fontSize: 13, fontWeight: 700, display: "flex", alignItems: "center", gap: 7, cursor: "pointer", opacity: busy ? 0.7 : 1 }}
          >
            {editing
              ? <><IconCheck style={{ width: 15, height: 15 }} />{busy ? "Saving…" : "Save"}</>
              : <><IconEdit style={{ width: 15, height: 15 }} />Edit Profile</>}
          </button>
        </div>
      </div>

      {/* ── Avatar (overlaps hero) ── */}
      <div style={{ display: "flex", justifyContent: "center", marginTop: -55, position: "relative", zIndex: 10 }}>
        <div style={{ padding: 4, background: "var(--bg)", borderRadius: "50%", boxShadow: "0 4px 20px rgba(0,0,0,.15)" }}>
          <AvatarUpload src={avatar} name={fullName || "?"} size={110} onUpload={handleAvatarUpload} />
        </div>
      </div>

      {/* ── Name + location ── */}
      <div style={{ textAlign: "center", padding: "14px 24px 0" }}>
        <h2 style={{ fontSize: 24, fontWeight: 800, letterSpacing: "-.02em", color: "var(--ink)" }}>{fullName || "Your Name"}</h2>
        <p style={{ fontSize: 13, color: "var(--ink3)", marginTop: 5, display: "flex", alignItems: "center", justifyContent: "center", gap: 4 }}>
          <IconMapPin style={{ width: 13, height: 13 }} />
          {profile.city || "Gaborone"}{profile.area ? `, ${profile.area}` : ""}
        </p>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 6, marginTop: 8, padding: "4px 12px", borderRadius: 999, background: "var(--green-bg)", border: "1px solid rgba(12,166,120,.2)" }}>
          <div style={{ width: 7, height: 7, borderRadius: "50%", background: "var(--green)" }} />
          <span style={{ fontSize: 11, fontWeight: 700, color: "var(--green)" }}>Active</span>
        </div>
      </div>

      {/* ── Quick stats ── */}
      <div style={{ display: "flex", gap: 10, margin: "20px 20px 0" }}>
        {[
          { label: "Email", value: profile.email || "—", icon: "✉️" },
          { label: "Phone", value: profile.phone || "—", icon: "📞" },
        ].map((s) => (
          <div key={s.label} style={{ flex: 1, background: "var(--card)", borderRadius: 14, boxShadow: "0 2px 8px rgba(0,0,0,0.08)", padding: "14px 10px", textAlign: "center" }}>
            <span style={{ fontSize: 20 }}>{s.icon}</span>
            <p style={{ fontSize: 12, fontWeight: 700, color: "var(--ink)", marginTop: 6, wordBreak: "break-all" }}>{s.value}</p>
            <p style={{ fontSize: 10, color: "var(--ink3)", fontWeight: 600, marginTop: 2, textTransform: "uppercase", letterSpacing: ".05em" }}>{s.label}</p>
          </div>
        ))}
      </div>

      <div style={{ padding: "20px 20px 0", display: "flex", flexDirection: "column", gap: 14 }}>

        {/* ── Personal info card ── */}
        <div style={{ background: "var(--card)", borderRadius: 18, boxShadow: "0 2px 8px rgba(0,0,0,0.08)", overflow: "hidden" }}>
          <div style={{ padding: "16px 20px 12px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: 10, background: "var(--acc-bg)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <IconUser style={{ width: 16, height: 16, color: "var(--acc)" }} />
            </div>
            <p style={{ fontWeight: 700, fontSize: 14, color: "var(--ink)" }}>Personal Information</p>
          </div>
          <div style={{ padding: "20px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
            <Field label="First Name" field="fn" />
            <Field label="Last Name"  field="ln" />
            <Field label="Email"      field="email" type="email" full />
            <Field label="Phone"      field="phone" type="tel" />
            <Field label="City"       field="city" />
            <Field label="Area"       field="area" />
          </div>
        </div>

        {/* ── Preferences placeholder ── */}
        <div style={{ background: "var(--card)", borderRadius: 18, boxShadow: "0 2px 8px rgba(0,0,0,0.08)", overflow: "hidden" }}>
          <div style={{ padding: "16px 20px 12px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: 10, background: "rgba(99,102,241,.12)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <IconBell style={{ width: 16, height: 16, color: "#6366f1" }} />
            </div>
            <p style={{ fontWeight: 700, fontSize: 14, color: "var(--ink)" }}>Preferences</p>
          </div>
          <div style={{ padding: "16px 20px" }}>
            {(user?.preferredServices?.length ?? 0) > 0
              ? <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {user!.preferredServices.map((s) => (
                    <span key={s} style={{ padding: "5px 12px", borderRadius: 999, background: "var(--acc-bg)", border: "1px solid var(--acc-bd)", fontSize: 12, fontWeight: 600, color: "var(--acc)" }}>{s}</span>
                  ))}
                </div>
              : <p style={{ fontSize: 13, color: "var(--ink3)" }}>No preferred services set yet.</p>
            }
          </div>
        </div>

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

        {/* ── Payment History ── */}
        <div style={{ background: "var(--card)", borderRadius: 18, boxShadow: "0 2px 8px rgba(0,0,0,0.08)", overflow: "hidden" }}>
          <div style={{ padding: "16px 20px 12px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: 10, background: "rgba(99,102,241,.12)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <IconWallet style={{ width: 16, height: 16, color: "#6366f1" }} />
            </div>
            <p style={{ fontWeight: 700, fontSize: 14, color: "var(--ink)" }}>Payment History</p>
          </div>
          {payments.length === 0
            ? <p style={{ padding: "16px 20px", fontSize: 13, color: "var(--ink3)" }}>No payments yet.</p>
            : payments.map((p, i) => (
              <div key={p.id} style={{ padding: "14px 20px", borderTop: i > 0 ? "1px solid var(--border)" : undefined }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <p style={{ fontWeight: 700, fontSize: 14, color: "var(--ink)" }}>{p.serviceName}</p>
                    <p style={{ fontSize: 12, color: "var(--ink3)", marginTop: 2 }}>
                      {p.vendor.user.firstName} {p.vendor.user.lastName}
                    </p>
                    <div style={{ display: "flex", gap: 8, marginTop: 4, alignItems: "center" }}>
                      {p.paymentMethod && (
                        <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 999, background: "rgba(99,102,241,.1)", color: "#6366f1" }}>
                          {METHOD_NAMES[p.paymentMethod] ?? p.paymentMethod}
                        </span>
                      )}
                      {p.paidAt && (
                        <span style={{ fontSize: 11, color: "var(--ink3)" }}>
                          {new Date(p.paidAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                          {" · "}
                          {new Date(p.paidAt).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      )}
                    </div>
                  </div>
                  <p style={{ fontWeight: 800, fontSize: 16, color: "var(--acc)" }}>P{p.amount}</p>
                </div>
              </div>
            ))
          }
        </div>

      </div>
    </div>
  );
};
