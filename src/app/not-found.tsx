import Link from "next/link";

export default function NotFound() {
  return (
    <div data-theme="customer" style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "0 28px", textAlign: "center", gap: 20 }}>
      <div style={{ fontSize: 64 }}>🔧</div>
      <h1 className="serif" style={{ fontSize: 40, letterSpacing: "-.03em" }}>
        404 — <em style={{ color: "var(--acc)" }}>Lost?</em>
      </h1>
      <p style={{ color: "var(--ink2)", fontSize: 16, lineHeight: 1.6 }}>
        This page doesn't exist. Let's get you back on track.
      </p>
      <Link href="/" style={{ background: "var(--acc)", color: "var(--bg)", borderRadius: 10, padding: "14px 28px", fontSize: 15, fontWeight: 700, textDecoration: "none" }}>
        Back to Home
      </Link>
    </div>
  );
}
