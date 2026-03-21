"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Cookie, X } from "lucide-react";

const CONSENT_KEY = "hh_cookie_consent";

export function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem(CONSENT_KEY)) {
      setVisible(true);
    }
  }, []);

  const accept = () => {
    localStorage.setItem(CONSENT_KEY, "accepted");
    setVisible(false);
  };

  const dismiss = () => {
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 9999,
        background: "white",
        borderTop: "1px solid #e7e5e4",
        boxShadow: "0 -4px 24px rgba(0,0,0,.10)",
        padding: "14px 20px",
        display: "flex",
        alignItems: "center",
        gap: 14,
        flexWrap: "wrap",
      }}
    >
      <div style={{ width: 36, height: 36, borderRadius: 10, background: "#fffbeb", border: "1px solid #fde68a", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        <Cookie size={18} color="#d97706" />
      </div>

      <p style={{ flex: 1, fontSize: 13, color: "#44403c", lineHeight: 1.5, margin: 0, minWidth: 200 }}>
        We use cookies to improve your experience and keep you signed in.
      </p>

      <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
        <Link
          href="/legal/cookies"
          style={{ fontSize: 13, fontWeight: 600, color: "#6b7280", textDecoration: "none", padding: "7px 14px", borderRadius: 999, border: "1px solid #e5e7eb" }}
        >
          Learn More
        </Link>
        <button
          onClick={accept}
          style={{ fontSize: 13, fontWeight: 700, color: "white", background: "#d97706", border: "none", padding: "7px 18px", borderRadius: 999, cursor: "pointer" }}
        >
          Accept
        </button>
        <button
          onClick={dismiss}
          aria-label="Dismiss"
          style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 30, height: 30, borderRadius: "50%", background: "none", border: "1px solid #e5e7eb", cursor: "pointer", color: "#9ca3af", flexShrink: 0 }}
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
}
