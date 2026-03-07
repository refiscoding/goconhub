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
    <div data-theme="admin" style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center", padding: "0 28px" }}>
      <div style={{ width: "100%", maxWidth: 380 }}>
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <div style={{ width: 56, height: 56, background: "var(--acc-bg)", border: "1.5px solid var(--acc-bd)", borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", color: "var(--acc)" }}>
            <IconShield style={{ width: 26, height: 26 }} />
          </div>
          <h1 className="serif" style={{ fontSize: 28, letterSpacing: "-.02em" }}>
            Admin <em style={{ color: "var(--acc)" }}>Portal</em>
          </h1>
          <p style={{ fontSize: 13, color: "var(--ink3)", marginTop: 6 }}>Restricted access · HandyHub Control Centre</p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {error && (
            <div style={{ background: "var(--red-bg)", border: "1px solid rgba(248,113,113,.2)", borderRadius: 10, padding: "11px 14px", fontSize: 13, color: "var(--red)", fontWeight: 600, display: "flex", alignItems: "center", gap: 8 }}>
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
                style={{ position: "absolute", right: 13, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "var(--ink3)", display: "flex" }}>
                <IconEye style={{ width: 18, height: 18 }} />
              </button>
            </div>
          </div>
          <button className="btn-pri" style={{ marginTop: 4, opacity: loading ? 0.7 : 1 }} onClick={attempt} disabled={loading}>
            {loading ? "Signing in…" : "Sign in to Admin Panel →"}
          </button>
        </div>

        <p style={{ textAlign: "center", fontSize: 12, color: "var(--ink3)", marginTop: 28, lineHeight: 1.6 }}>
          This portal is for authorised staff only.<br />
          Unauthorised access attempts are logged.
        </p>
      </div>
    </div>
  );
};
