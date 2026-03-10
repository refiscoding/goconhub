"use client";
import { FC, useState, ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { IconWrench, IconCheck, IconEye } from "@/components/icons";
import { useUser } from "@/context/UserContext";
import type { Role, AuthMode } from "@/lib/types";

const ROLES: { id: Role; label: string; icon: string; desc: string }[] = [
  { id: "customer", label: "Customer", icon: "👤", desc: "I need a handyman" },
  { id: "vendor",   label: "Handyman", icon: "🔧", desc: "I offer services"  },
];

const FEATURES = [
  "Find trusted handymen near you",
  "Book services in minutes",
  "Secure payments & reviews",
];

export const AuthPage: FC = () => {
  const router = useRouter();
  const { refresh } = useUser();

  const [mode,  setMode]  = useState<AuthMode>("login");
  const [role,  setRole]  = useState<Role>("customer");
  const [fn,    setFn]    = useState("");
  const [ln,    setLn]    = useState("");
  const [email, setEmail] = useState("");
  const [pass,  setPass]  = useState("");
  const [show,  setShow]  = useState(false);
  const [error, setError] = useState("");
  const [busy,  setBusy]  = useState(false);

  const handleSubmit = async () => {
    setError("");
    if (!email || !pass) { setError("Email and password are required."); return; }
    if (mode === "register" && (!fn || !ln)) { setError("First and last name are required."); return; }

    setBusy(true);
    try {
      const endpoint = mode === "login" ? "/api/auth/login" : "/api/auth/register";
      const body = mode === "login"
        ? { email, password: pass }
        : { email, password: pass, firstName: fn, lastName: ln, role };

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message ?? "Something went wrong.");
        return;
      }

      await refresh();

      if (mode === "login") {
        const userRole = data.user?.role ?? role;
        if (userRole === "vendor")  router.push("/vendor/dashboard");
        else if (userRole === "admin") router.push("/admin/dashboard");
        else router.push("/customer/explore");
      } else {
        // New registration → onboarding
        if (role === "vendor") router.push("/onboarding/vendor");
        else                   router.push("/onboarding/customer");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div data-theme="customer" className="auth-wrap">

      {/* ── Left / Hero panel ─────────────────────────────────────── */}
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

          <h1 className="serif" style={{ color: "#fff", fontSize: 38, fontWeight: 300, lineHeight: 1.12, letterSpacing: "-.02em" }}>
            {mode === "login" ? "Welcome" : "Create your"}<br />
            <em style={{ fontStyle: "italic", color: "#d97706" }}>
              {mode === "login" ? "back." : "account."}
            </em>
          </h1>
          <p style={{ color: "#78716c", fontSize: 14, marginTop: 12, lineHeight: 1.6 }}>
            Botswana&apos;s trusted handyman platform.<br />
            Serving Gaborone &amp; beyond.
          </p>

          <div className="auth-feats">
            {FEATURES.map((f) => (
              <div key={f} className="auth-feat">
                <span className="auth-feat-dot" />
                <span className="auth-feat-txt">{f}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Right / Form panel ────────────────────────────────────── */}
      <div className="auth-body">
        <div style={{ display: "flex", flexDirection: "column", width: "100%", maxWidth: 420, alignSelf: "stretch" }}>
        <div className="auth-form">

          <div className="auth-dsk-title">
            <p style={{ fontSize: 11, fontWeight: 700, color: "var(--ink3)", textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 6 }}>HandyHub</p>
            <h2 style={{ fontSize: 26, fontWeight: 700, color: "var(--ink)", letterSpacing: "-.02em", lineHeight: 1.2 }}>
              {mode === "login" ? "Sign in to your account" : "Create your account"}
            </h2>
          </div>

          {/* Mode toggle */}
          <div style={{ display: "flex", background: "var(--bg2)", borderRadius: 999, padding: 4, gap: 2 }}>
            {(["login", "register"] as AuthMode[]).map((m) => (
              <div key={m} onClick={() => { setMode(m); setError(""); }}
                style={{ flex: 1, padding: "9px 0", borderRadius: 999, textAlign: "center", fontSize: 13, fontWeight: 700, cursor: "pointer", background: mode === m ? "var(--card)" : "transparent", color: mode === m ? "var(--ink)" : "var(--ink2)", transition: "all .2s", textTransform: "capitalize", boxShadow: mode === m ? "0 1px 6px rgba(0,0,0,.08)" : "none" }}>
                {m}
              </div>
            ))}
          </div>

          {/* Role picker — only for register */}
          {mode === "register" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: "var(--ink2)", textTransform: "uppercase", letterSpacing: ".05em" }}>I am a…</p>
              {ROLES.map((r) => (
                <div key={r.id} onClick={() => setRole(r.id)}
                  style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 16px", borderRadius: 12, border: `1.5px solid ${role === r.id ? "#d97706" : "var(--border)"}`, background: role === r.id ? "#fef3c7" : "var(--card)", cursor: "pointer", transition: "all .2s" }}>
                  <span style={{ fontSize: 22 }}>{r.icon}</span>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontWeight: 700, fontSize: 14, color: role === r.id ? "#92400e" : "var(--ink)" }}>{r.label}</p>
                    <p style={{ fontSize: 12, color: "var(--ink2)", marginTop: 1 }}>{r.desc}</p>
                  </div>
                  {role === r.id && <IconCheck style={{ width: 17, height: 17, color: "#d97706" }} />}
                </div>
              ))}
            </div>
          )}

          {mode === "register" && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <input className="field" placeholder="First name" value={fn} onChange={(e: ChangeEvent<HTMLInputElement>) => setFn(e.target.value)} />
              <input className="field" placeholder="Last name"  value={ln} onChange={(e: ChangeEvent<HTMLInputElement>) => setLn(e.target.value)} />
            </div>
          )}

          <input className="field" type="email" placeholder="Email address" value={email}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)} />

          <div style={{ position: "relative" }}>
            <input className="field" type={show ? "text" : "password"} placeholder="Password"
              value={pass} onChange={(e: ChangeEvent<HTMLInputElement>) => setPass(e.target.value)}
              style={{ paddingRight: 44 }}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()} />
            <button onClick={() => setShow(!show)}
              style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "var(--ink3)", display: "flex" }}>
              <IconEye style={{ width: 18, height: 18 }} />
            </button>
          </div>

          {error && (
            <p style={{ fontSize: 13, color: "#dc2626", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 8, padding: "10px 12px" }}>
              {error}
            </p>
          )}

          <button className="btn-pri" onClick={handleSubmit} disabled={busy}
            style={{ opacity: busy ? 0.7 : 1, cursor: busy ? "wait" : "pointer" }}>
            {busy ? "Please wait…" : mode === "login" ? "Sign in →" : "Create account →"}
          </button>

          <button className="btn-ghost" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
            <svg width="17" height="17" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.47 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </button>

          {mode === "login" && (
            <p style={{ textAlign: "center", fontSize: 12, color: "var(--ink3)" }}>
              Forgot your password?{" "}
              <span onClick={() => router.push(`/forgot-password?role=${role}`)} style={{ color: "var(--acc)", fontWeight: 600, cursor: "pointer" }}>Reset it</span>
            </p>
          )}
        </div>

        {/* Legal footer */}
        <div style={{ marginTop: "auto", paddingTop: 20, paddingBottom: 8, display: "flex", justifyContent: "center", gap: 18, flexWrap: "wrap" }}>
          <Link href="/legal/terms"   style={{ fontSize: 11, color: "var(--ink3)", textDecoration: "none" }}>Terms & Conditions</Link>
          <span style={{ color: "var(--ink3)", fontSize: 11 }}>·</span>
          <Link href="/legal/privacy" style={{ fontSize: 11, color: "var(--ink3)", textDecoration: "none" }}>Privacy Policy</Link>
          <span style={{ color: "var(--ink3)", fontSize: 11 }}>·</span>
          <Link href="/legal/cookies" style={{ fontSize: 11, color: "var(--ink3)", textDecoration: "none" }}>Cookie Policy</Link>
        </div>
        </div>
      </div>
    </div>
  );
};
