"use client";
import { FC, useState, ChangeEvent, KeyboardEvent } from "react";
import { useRouter } from "next/navigation";
import { IconShield, IconX, IconEye } from "@/components/icons";

export const AdminLogin: FC = () => {
  const router = useRouter();
  const [email,   setEmail]   = useState("");
  const [pass,    setPass]    = useState("");
  const [show,    setShow]    = useState(false);
  const [error,   setError]   = useState("");
  const [loading, setLoading] = useState(false);

  const attempt = async () => {
    if (!email || !pass) {
      setError("Please enter your email and password.");
      setTimeout(() => setError(""), 3000);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password: pass }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message ?? "Invalid credentials.");
        setTimeout(() => setError(""), 3000);
        return;
      }
      if (data.user?.role !== "admin") {
        setError("Access denied. Admin accounts only.");
        setTimeout(() => setError(""), 3000);
        // Clear cookie set by login
        await fetch("/api/auth/logout", { method: "POST" });
        return;
      }
      router.push("/admin/dashboard");
    } catch {
      setError("Network error. Please try again.");
      setTimeout(() => setError(""), 3000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div data-theme="admin" style={{ minHeight: "100vh", display: "flex" }}>
      {/* Left brand panel — hidden on small screens */}
      <div style={{ display: "none", width: 380, background: "linear-gradient(160deg, #1E1B4B 0%, #312E81 60%, #4338CA 100%)", flexDirection: "column", justifyContent: "space-between", padding: "48px 40px", flexShrink: 0 }} className="admin-login-panel">
        <div>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: "linear-gradient(135deg,#6366F1,#4F46E5)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 40 }}>
            <IconShield style={{ width: 22, height: 22, color: "#fff" }} />
          </div>
          <h2 style={{ fontSize: 28, fontWeight: 800, color: "#fff", letterSpacing: "-.02em", lineHeight: 1.3, marginBottom: 12 }}>
            HandyHub<br />Control Centre
          </h2>
          <p style={{ fontSize: 14, color: "rgba(255,255,255,.55)", lineHeight: 1.7 }}>
            Manage vendors, bookings, disputes and platform settings from one place.
          </p>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {[
            { label: "Vendor verification & KYC" },
            { label: "Payment & escrow oversight" },
            { label: "Dispute resolution centre" },
            { label: "Real-time platform metrics" },
          ].map((f) => (
            <div key={f.label} style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#818CF8", flexShrink: 0 }} />
              <span style={{ fontSize: 13, color: "rgba(255,255,255,.6)" }}>{f.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right form panel */}
      <div style={{ flex: 1, background: "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center", padding: "0 28px" }}>
        <div style={{ width: "100%", maxWidth: 380 }}>
          <div style={{ textAlign: "center", marginBottom: 36 }}>
            <div style={{ width: 52, height: 52, background: "linear-gradient(135deg,#6366F1,#4F46E5)", borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", boxShadow: "0 6px 20px rgba(79,70,229,.35)" }}>
              <IconShield style={{ width: 24, height: 24, color: "#fff" }} />
            </div>
            <h1 className="serif" style={{ fontSize: 26, letterSpacing: "-.02em", color: "var(--ink)" }}>
              Admin <em style={{ color: "var(--acc)" }}>Portal</em>
            </h1>
            <p style={{ fontSize: 13, color: "var(--ink3)", marginTop: 6 }}>Restricted access · HandyHub Control Centre</p>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {error && (
              <div style={{ background: "var(--red-bg)", border: "1px solid rgba(220,38,38,.2)", borderRadius: 10, padding: "11px 14px", fontSize: 13, color: "var(--red)", fontWeight: 600, display: "flex", alignItems: "center", gap: 8 }}>
                <IconX style={{ width: 16, height: 16 }} /> {error}
              </div>
            )}
            <div>
              <label style={{ fontSize: 11, fontWeight: 700, color: "var(--ink3)", textTransform: "uppercase", letterSpacing: ".05em", display: "block", marginBottom: 5 }}>Admin Email</label>
              <input className="field" type="email" placeholder="admin@handyhub.co.bw"
                value={email} onChange={(e: ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => e.key === "Enter" && attempt()} />
            </div>
            <div>
              <label style={{ fontSize: 11, fontWeight: 700, color: "var(--ink3)", textTransform: "uppercase", letterSpacing: ".05em", display: "block", marginBottom: 5 }}>Password</label>
              <div style={{ position: "relative" }}>
                <input className="field" type={show ? "text" : "password"} placeholder="••••••••••"
                  value={pass} onChange={(e: ChangeEvent<HTMLInputElement>) => setPass(e.target.value)}
                  onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => e.key === "Enter" && attempt()}
                  style={{ paddingRight: 44 }} />
                <button onClick={() => setShow(!show)}
                  style={{ position: "absolute", right: 13, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "var(--ink3)", display: "flex", cursor: "pointer" }}>
                  <IconEye style={{ width: 18, height: 18 }} />
                </button>
              </div>
            </div>
            <button className="btn-pri" style={{ marginTop: 4, opacity: loading ? 0.7 : 1, background: "linear-gradient(135deg,#6366F1,#4F46E5)", boxShadow: "0 4px 14px rgba(79,70,229,.35)" }} onClick={attempt} disabled={loading}>
              {loading ? "Signing in…" : "Sign in to Admin Panel →"}
            </button>
          </div>

          <p style={{ textAlign: "center", fontSize: 12, color: "var(--ink3)", marginTop: 24, lineHeight: 1.6 }}>
            This portal is for authorised staff only.<br />
            Unauthorised access attempts are logged.
          </p>
        </div>
      </div>
    </div>
  );
};
