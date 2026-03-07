"use client";
import { FC, useState, useRef, ChangeEvent, KeyboardEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { IconWrench, IconEye, IconCheck, IconChevL } from "@/components/icons";

type Method = "email" | "whatsapp";
type Step   = "contact" | "otp" | "newpass" | "done";

export const ForgotPassword: FC = () => {
  const router      = useRouter();
  const searchParams = useSearchParams();
  const role        = searchParams.get("role") ?? "customer";
  const profilePath = role === "vendor" ? "/vendor/profile" : "/customer/profile";

  const [step,    setStep]    = useState<Step>("contact");
  const [method,  setMethod]  = useState<Method>("whatsapp");
  const [contact, setContact] = useState("");
  const [otp,     setOtp]     = useState(["", "", "", "", "", ""]);
  const [pass,    setPass]    = useState("");
  const [confirm, setConfirm] = useState("");
  const [showP,   setShowP]   = useState(false);
  const [showC,   setShowC]   = useState(false);
  const [loading,     setLoading]     = useState(false);
  const [error,       setError]       = useState("");
  const [resent,      setResent]      = useState(false);
  const [devCode,     setDevCode]     = useState("");
  const [resetToken,  setResetToken]  = useState("");

  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  /* ── Step handlers ───────────────────────────────────────────────── */
  const sendOtp = async () => {
    if (!contact.trim()) { setError("Please enter your email or phone number."); return; }
    setError(""); setLoading(true);
    try {
      const res = await fetch("/api/otp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contact, method }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to send OTP.");
      if (data.devCode) setDevCode(data.devCode); // dev mode only
      setStep("otp");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async () => {
    const code = otp.join("");
    if (code.length < 6) { setError("Please enter the 6-digit code."); return; }
    setError(""); setLoading(true);
    try {
      const res  = await fetch("/api/otp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contact, code }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Invalid or expired code.");
      setResetToken(data.resetToken);
      setStep("newpass");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async () => {
    if (pass.length < 8)  { setError("Password must be at least 8 characters."); return; }
    if (pass !== confirm)  { setError("Passwords do not match."); return; }
    setError(""); setLoading(true);
    try {
      const res = await fetch("/api/otp/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resetToken, password: pass }),
      });
      if (!res.ok) throw new Error((await res.json()).message || "Failed to reset password.");
      setStep("done");
      // Auto-redirect to profile after 2 seconds
      setTimeout(() => router.push(profilePath), 2000);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const resendOtp = async () => {
    setResent(false);
    await fetch("/api/otp/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contact, method }),
    });
    setResent(true);
    setTimeout(() => setResent(false), 4000);
  };

  /* ── OTP digit input helpers ────────────────────────────────────── */
  const handleOtpChange = (i: number, val: string) => {
    if (!/^\d?$/.test(val)) return;
    const next = [...otp];
    next[i] = val;
    setOtp(next);
    if (val && i < 5) otpRefs.current[i + 1]?.focus();
  };

  const handleOtpKey = (i: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[i] && i > 0) otpRefs.current[i - 1]?.focus();
  };

  /* ── Progress dots ──────────────────────────────────────────────── */
  const steps: Step[] = ["contact", "otp", "newpass"];
  const stepIdx = steps.indexOf(step);

  /* ── Render ─────────────────────────────────────────────────────── */
  return (
    <div data-theme="customer" className="auth-wrap">

      {/* Left panel */}
      <div className="auth-hero">
        <div style={{ position: "absolute", top: -60, right: -40, width: 220, height: 220, background: "rgba(217,119,6,.15)", borderRadius: "50%", filter: "blur(60px)" }} />
        <div style={{ position: "absolute", bottom: -80, left: -60, width: 300, height: 300, background: "rgba(217,119,6,.07)", borderRadius: "50%", filter: "blur(70px)" }} />

        <div style={{ position: "relative" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 28 }}>
            <div style={{ width: 40, height: 40, background: "#d97706", borderRadius: 11, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", boxShadow: "0 4px 14px rgba(217,119,6,.4)" }}>
              <IconWrench style={{ width: 21, height: 21 }} />
            </div>
            <span className="serif" style={{ color: "#fff", fontSize: 25, fontWeight: 800, letterSpacing: "-.01em" }}>HandyHub</span>
          </div>

          <h1 className="serif" style={{ color: "#fff", fontSize: 34, fontWeight: 300, lineHeight: 1.15, letterSpacing: "-.02em" }}>
            Reset your<br />
            <em style={{ fontStyle: "italic", color: "#d97706" }}>password.</em>
          </h1>
          <p style={{ color: "#78716c", fontSize: 14, marginTop: 12, lineHeight: 1.6 }}>
            We&apos;ll send a one-time code to verify it&apos;s you before letting you set a new password.
          </p>

          {/* Steps indicator (desktop) */}
          <div className="auth-feats" style={{ marginTop: 44 }}>
            {[["1", "Enter your contact"], ["2", "Verify with OTP"], ["3", "Set new password"]].map(([n, label], i) => (
              <div key={n} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 26, height: 26, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 800, flexShrink: 0, background: i <= stepIdx ? "#d97706" : "rgba(255,255,255,.1)", color: i <= stepIdx ? "#fff" : "rgba(255,255,255,.4)", transition: "all .3s" }}>
                  {i < stepIdx ? <IconCheck style={{ width: 13, height: 13 }} /> : n}
                </div>
                <span style={{ fontSize: 13, color: i <= stepIdx ? "rgba(255,255,255,.85)" : "rgba(255,255,255,.35)", transition: "color .3s" }}>{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right / Form panel */}
      <div className="auth-body">
        <div className="auth-form">

          {/* Back button */}
          {step !== "done" && (
            <button className="back-btn" onClick={() => step === "contact" ? router.push("/") : setStep(step === "otp" ? "contact" : "otp")} style={{ width: "fit-content" }}>
              <IconChevL style={{ width: 16, height: 16 }} /> Back
            </button>
          )}

          {/* ── Step 1: Contact ──────────────────────────────────────── */}
          {step === "contact" && (
            <>
              <div className="auth-dsk-title">
                <p style={{ fontSize: 11, fontWeight: 700, color: "var(--ink3)", textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 6 }}>Step 1 of 3</p>
                <h2 style={{ fontSize: 24, fontWeight: 700, color: "var(--ink)", letterSpacing: "-.02em" }}>Where should we send the code?</h2>
              </div>

              {/* Method toggle */}
              <div style={{ display: "flex", background: "var(--bg2)", borderRadius: 999, padding: 4, gap: 2 }}>
                {(["whatsapp", "email"] as Method[]).map((m) => (
                  <div key={m} onClick={() => setMethod(m)}
                    style={{ flex: 1, padding: "9px 0", borderRadius: 999, textAlign: "center", fontSize: 13, fontWeight: 700, cursor: "pointer", background: method === m ? "var(--card)" : "transparent", color: method === m ? "var(--ink)" : "var(--ink2)", transition: "all .2s", boxShadow: method === m ? "0 1px 6px rgba(0,0,0,.08)" : "none" }}>
                    {m === "whatsapp" ? "💬 WhatsApp" : "📧 Email"}
                  </div>
                ))}
              </div>

              <input
                className="field"
                type={method === "email" ? "email" : "tel"}
                placeholder={method === "email" ? "your@email.com" : "+267 7X XXX XXX (WhatsApp number)"}
                value={contact}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setContact(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendOtp()}
              />

              {error && <p style={{ fontSize: 13, color: "var(--red)", fontWeight: 600 }}>{error}</p>}

              <button className="btn-pri" onClick={sendOtp} disabled={loading}>
                {loading ? "Sending…" : method === "whatsapp" ? "Send WhatsApp code →" : "Send email code →"}
              </button>
            </>
          )}

          {/* ── Step 2: OTP ──────────────────────────────────────────── */}
          {step === "otp" && (
            <>
              <div className="auth-dsk-title">
                <p style={{ fontSize: 11, fontWeight: 700, color: "var(--ink3)", textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 6 }}>Step 2 of 3</p>
                <h2 style={{ fontSize: 24, fontWeight: 700, color: "var(--ink)", letterSpacing: "-.02em" }}>Enter the 6-digit code</h2>
              </div>
              <p style={{ fontSize: 14, color: "var(--ink2)", marginTop: -8, lineHeight: 1.6 }}>
                We sent a code to <strong style={{ color: "var(--ink)" }}>{contact}</strong>. It expires in 10 minutes.
              </p>

              {/* OTP boxes */}
              <div style={{ display: "flex", gap: 10 }}>
                {otp.map((digit, i) => (
                  <input
                    key={i}
                    ref={(el) => { otpRefs.current[i] = el; }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(i, e.target.value)}
                    onKeyDown={(e) => handleOtpKey(i, e)}
                    style={{ width: "100%", aspectRatio: "1", textAlign: "center", fontSize: 22, fontWeight: 800, background: "var(--bg3)", border: `1.5px solid ${digit ? "var(--acc)" : "var(--border)"}`, borderRadius: 12, color: "var(--ink)", outline: "none", transition: "border-color .2s" }}
                  />
                ))}
              </div>

              {devCode && (
                <div style={{ background: "#fef9c3", border: "1.5px solid #fde047", borderRadius: 10, padding: "12px 16px", fontSize: 13 }}>
                  <p style={{ fontWeight: 700, color: "#854d0e", marginBottom: 4 }}>⚠ Dev mode — no credentials configured</p>
                  <p style={{ color: "#713f12" }}>Your OTP is: <strong style={{ fontSize: 20, letterSpacing: 4 }}>{devCode}</strong></p>
                </div>
              )}

              {error && <p style={{ fontSize: 13, color: "var(--red)", fontWeight: 600 }}>{error}</p>}
              {resent && <p style={{ fontSize: 13, color: "var(--green)", fontWeight: 600 }}>Code resent successfully!</p>}

              <button className="btn-pri" onClick={verifyOtp} disabled={loading}>
                {loading ? "Verifying…" : "Verify code →"}
              </button>

              <p style={{ textAlign: "center", fontSize: 13, color: "var(--ink3)" }}>
                Didn&apos;t receive it?{" "}
                <span onClick={resendOtp} style={{ color: "var(--acc)", fontWeight: 600, cursor: "pointer" }}>Resend code</span>
              </p>
            </>
          )}

          {/* ── Step 3: New password ─────────────────────────────────── */}
          {step === "newpass" && (
            <>
              <div className="auth-dsk-title">
                <p style={{ fontSize: 11, fontWeight: 700, color: "var(--ink3)", textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 6 }}>Step 3 of 3</p>
                <h2 style={{ fontSize: 24, fontWeight: 700, color: "var(--ink)", letterSpacing: "-.02em" }}>Set a new password</h2>
              </div>

              <div style={{ position: "relative" }}>
                <input className="field" type={showP ? "text" : "password"} placeholder="New password" value={pass}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setPass(e.target.value)} style={{ paddingRight: 44 }} />
                <button onClick={() => setShowP(!showP)} style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "var(--ink3)", display: "flex" }}>
                  <IconEye style={{ width: 18, height: 18 }} />
                </button>
              </div>

              <div style={{ position: "relative" }}>
                <input className="field" type={showC ? "text" : "password"} placeholder="Confirm new password" value={confirm}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setConfirm(e.target.value)} style={{ paddingRight: 44 }} />
                <button onClick={() => setShowC(!showC)} style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "var(--ink3)", display: "flex" }}>
                  <IconEye style={{ width: 18, height: 18 }} />
                </button>
              </div>

              {/* Password strength hint */}
              {pass.length > 0 && (
                <div style={{ display: "flex", gap: 4, marginTop: -8 }}>
                  {[1, 2, 3].map((n) => (
                    <div key={n} style={{ flex: 1, height: 3, borderRadius: 99, background: pass.length >= n * 3 ? (pass.length >= 9 ? "var(--green)" : "var(--acc)") : "var(--border)" }} />
                  ))}
                </div>
              )}

              {error && <p style={{ fontSize: 13, color: "var(--red)", fontWeight: 600 }}>{error}</p>}

              <button className="btn-pri" onClick={resetPassword} disabled={loading}>
                {loading ? "Saving…" : "Save new password →"}
              </button>
            </>
          )}

          {/* ── Done ────────────────────────────────────────────────── */}
          {step === "done" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 20, alignItems: "center", textAlign: "center", padding: "20px 0" }}>
              <div style={{ width: 64, height: 64, borderRadius: "50%", background: "var(--green-bg)", border: "2px solid rgba(74,222,128,.3)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--green)" }}>
                <IconCheck style={{ width: 28, height: 28 }} />
              </div>
              <div>
                <h2 style={{ fontSize: 22, fontWeight: 700, color: "var(--ink)", letterSpacing: "-.01em" }}>Password updated!</h2>
                <p style={{ fontSize: 14, color: "var(--ink2)", marginTop: 8, lineHeight: 1.6 }}>
                  Your password has been changed successfully.<br />
                  Taking you to your profile…
                </p>
              </div>
              <button className="btn-pri" onClick={() => router.push(profilePath)}>
                Go to profile →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
