"use client";
import { FC, useState, ChangeEvent } from "react";
import { CheckCircle2, LifeBuoy, AlertCircle } from "lucide-react";

const ISSUE_OPTIONS = [
  { value: "billing",      label: "Billing & Payments" },
  { value: "booking",      label: "Booking Issue" },
  { value: "account",      label: "Account Access" },
  { value: "verification", label: "Vendor Verification" },
  { value: "other",        label: "Other" },
];

const ROLE_OPTIONS = [
  { value: "customer", label: "Customer" },
  { value: "vendor",   label: "Service Provider (Vendor)" },
  { value: "other",    label: "Other" },
];

export const SupportForm: FC<{ defaultRole?: string }> = ({ defaultRole = "customer" }) => {
  const [form, setForm] = useState({ name: "", email: "", role: defaultRole, issueType: "other", message: "" });
  const [busy,    setBusy]    = useState(false);
  const [done,    setDone]    = useState(false);
  const [error,   setError]   = useState("");

  const set = (k: keyof typeof form) => (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async () => {
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      setError("Please fill in all required fields.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const d = await res.json();
        setError(d.message ?? "Something went wrong.");
        return;
      }
      setDone(true);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  if (done) {
    return (
      <div style={{ maxWidth: 520, margin: "0 auto", padding: "60px 24px", textAlign: "center" }}>
        <div style={{ width: 64, height: 64, borderRadius: "50%", background: "var(--green-bg)", border: "2px solid rgba(5,150,105,.25)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
          <CheckCircle2 size={30} color="var(--green)" />
        </div>
        <h2 className="serif" style={{ fontSize: 22, fontWeight: 800, color: "var(--ink)", marginBottom: 10 }}>
          Ticket submitted!
        </h2>
        <p style={{ fontSize: 14, color: "var(--ink3)", lineHeight: 1.7, marginBottom: 24 }}>
          We&apos;ve received your request and will get back to you at <strong style={{ color: "var(--ink)" }}>{form.email}</strong> as soon as possible.
        </p>
        <button
          className="btn-ghost"
          style={{ maxWidth: 200, margin: "0 auto" }}
          onClick={() => { setForm({ name: "", email: "", role: "customer", issueType: "other", message: "" }); setDone(false); }}
        >
          Submit another
        </button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 560, margin: "0 auto", padding: "32px 24px 48px" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
        <div style={{ width: 40, height: 40, borderRadius: 12, background: "var(--acc-bg)", border: "1.5px solid var(--acc-bd)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <LifeBuoy size={20} color="var(--acc)" />
        </div>
        <div>
          <h1 className="serif" style={{ fontSize: 20, fontWeight: 800, color: "var(--ink)", letterSpacing: "-.02em" }}>Support &amp; Help</h1>
          <p style={{ fontSize: 12, color: "var(--ink3)", marginTop: 1 }}>We typically respond within 24 hours</p>
        </div>
      </div>

      <div style={{ height: 1, background: "var(--border)", margin: "16px 0 24px" }} />

      {/* Error */}
      {error && (
        <div style={{ display: "flex", alignItems: "center", gap: 8, background: "var(--red-bg)", border: "1px solid rgba(220,38,38,.2)", borderRadius: 10, padding: "10px 14px", fontSize: 13, color: "var(--red)", fontWeight: 600, marginBottom: 16 }}>
          <AlertCircle size={15} style={{ flexShrink: 0 }} /> {error}
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {/* Name + Email */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div>
            <label style={lbl}>Full Name *</label>
            <input className="field" placeholder="Marcus Osei" value={form.name} onChange={set("name")} />
          </div>
          <div>
            <label style={lbl}>Email *</label>
            <input className="field" type="email" placeholder="you@example.com" value={form.email} onChange={set("email")} />
          </div>
        </div>

        {/* Role + Issue Type */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div>
            <label style={lbl}>I am a</label>
            <select className="field" value={form.role} onChange={set("role")}>
              {ROLE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
          <div>
            <label style={lbl}>Issue Type</label>
            <select className="field" value={form.issueType} onChange={set("issueType")}>
              {ISSUE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
        </div>

        {/* Message */}
        <div>
          <label style={lbl}>Message *</label>
          <textarea
            className="field"
            rows={5}
            placeholder="Describe your issue in as much detail as possible…"
            value={form.message}
            onChange={set("message")}
            style={{ resize: "vertical", minHeight: 110 }}
          />
        </div>

        <button className="btn-pri" onClick={submit} disabled={busy} style={{ opacity: busy ? 0.7 : 1 }}>
          {busy ? "Submitting…" : "Submit Ticket →"}
        </button>
      </div>
    </div>
  );
};

const lbl: React.CSSProperties = {
  display: "block", fontSize: 11, fontWeight: 700,
  color: "var(--ink3)", textTransform: "uppercase",
  letterSpacing: ".05em", marginBottom: 5,
};
