import Link from "next/link";
import { Cookie, ChevronRight } from "lucide-react";
import { BackButton } from "@/components/legal/BackButton";

export const metadata = { title: "Cookie Policy — GoCon" };

export default function CookiesPage() {
  return (
    <LegalShell title="Cookie Policy" subtitle="Last updated: March 2026" icon={<Cookie size={22} color="#d97706" />} current="cookies">
      <Section title="1. What Are Cookies">
        Cookies are small text files placed on your device when you visit a website. They help the
        site remember information about your visit, making it easier to use and more relevant.
        GoCon uses cookies and similar technologies such as local storage to operate the platform.
      </Section>

      <Section title="2. Cookies We Use">
        <CookieType name="Essential cookies" desc="Required for the platform to function. Your session cookie (hh_session) keeps you logged in securely. Without these, core features cannot be provided." required />
        <CookieType name="Preference cookies" desc="Remember your settings such as navigation sidebar state and theme preferences. These are stored in your browser's local storage." />
        <CookieType name="Analytics cookies" desc="Help us understand how users interact with the platform so we can improve it. These are anonymised and do not identify you personally." />
      </Section>

      <Section title="3. Session Cookie">
        Our authentication cookie (<code style={{ background: "#f3f4f6", padding: "1px 5px", borderRadius: 4, fontSize: 13 }}>hh_session</code>) is an HTTP-only,
        secure cookie with a 7-day expiry. It stores a signed token that authenticates your session.
        It cannot be accessed by JavaScript and is protected against cross-site scripting (XSS).
      </Section>

      <Section title="4. Local Storage">
        We use browser local storage to remember UI preferences such as sidebar collapsed state and
        cookie consent. This data stays on your device and is not transmitted to our servers.
      </Section>

      <Section title="5. Third-Party Cookies">
        GoCon may integrate with third-party services (such as DPO Pay for payments) that set
        their own cookies. We do not control these. Please refer to the respective privacy policies
        of those services.
      </Section>

      <Section title="6. Managing Cookies">
        You can control and delete cookies through your browser settings. Disabling essential cookies
        will prevent you from logging in and using core platform features. You can also reset your
        cookie preferences from the{" "}
        <strong>Privacy Centre</strong>{" "}
        in your account settings.
      </Section>

      <Section title="7. Changes to This Policy">
        We may update this Cookie Policy as our platform evolves. We will notify you of significant
        changes. Continued use of GoCon after changes constitutes acceptance.
      </Section>

      <Section title="8. Contact">
        Cookie enquiries:{" "}
        <a href="mailto:privacy@gocon.co.bw" style={{ color: "#d97706", fontWeight: 600 }}>privacy@gocon.co.bw</a>
      </Section>
    </LegalShell>
  );
}

function CookieType({ name, desc, required }: { name: string; desc: string; required?: boolean }) {
  return (
    <div style={{ marginBottom: 14, padding: "12px 14px", background: "#f9fafb", borderRadius: 10, border: "1px solid #e5e7eb" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 5 }}>
        <p style={{ fontWeight: 700, fontSize: 13, color: "#1c1917", margin: 0 }}>{name}</p>
        {required && (
          <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 7px", borderRadius: 99, background: "#dcfce7", color: "#16a34a", border: "1px solid #bbf7d0" }}>Required</span>
        )}
      </div>
      <p style={{ fontSize: 13, color: "#6b7280", margin: 0, lineHeight: 1.6 }}>{desc}</p>
    </div>
  );
}

/* ─────────── shared layout ─────────── */
function LegalShell({ title, subtitle, icon, current, children }: {
  title: string; subtitle: string; icon: React.ReactNode;
  current: "terms" | "privacy" | "cookies"; children: React.ReactNode;
}) {
  const links = [
    { href: "/legal/terms",   label: "Terms & Conditions" },
    { href: "/legal/privacy", label: "Privacy Policy"     },
    { href: "/legal/cookies", label: "Cookie Policy"      },
  ];
  return (
    <div style={{ minHeight: "100vh", background: "#f8f7f5", fontFamily: "inherit" }}>
      <div style={{ background: "white", borderBottom: "1px solid #e7e5e4", position: "sticky", top: 0, zIndex: 40 }}>
        <div style={{ maxWidth: 860, margin: "0 auto", padding: "0 20px", height: 52, display: "flex", alignItems: "center", gap: 8 }}>
          <BackButton />
          <ChevronRight size={12} color="#9ca3af" />
          <Link href="/legal/terms" style={{ fontSize: 13, color: "#6b7280", textDecoration: "none" }}>Legal</Link>
          <ChevronRight size={12} color="#9ca3af" />
          <span style={{ fontSize: 13, color: "#1c1917", fontWeight: 600 }}>{title}</span>
        </div>
      </div>
      <div style={{ maxWidth: 860, margin: "0 auto", padding: "32px 20px 80px", display: "flex", gap: 32, alignItems: "flex-start" }}>
        <div style={{ width: 200, flexShrink: 0, position: "sticky", top: 72 }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 10 }}>Policies</p>
          {links.map((l) => (
            <Link key={l.href} href={l.href} style={{ display: "block", padding: "9px 14px", borderRadius: 10, marginBottom: 4, fontSize: 13, fontWeight: l.href.includes(current) ? 700 : 500, color: l.href.includes(current) ? "#d97706" : "#374151", background: l.href.includes(current) ? "#fffbeb" : "transparent", border: l.href.includes(current) ? "1px solid #fde68a" : "1px solid transparent", textDecoration: "none" }}>
              {l.label}
            </Link>
          ))}
          <div style={{ marginTop: 20, padding: "12px 14px", background: "white", borderRadius: 12, border: "1px solid #e7e5e4" }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: ".05em", marginBottom: 6 }}>Need help?</p>
            <a href="mailto:privacy@gocon.co.bw" style={{ fontSize: 12, color: "#d97706", fontWeight: 700, textDecoration: "none" }}>privacy@gocon.co.bw</a>
          </div>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ marginBottom: 28, paddingBottom: 24, borderBottom: "1px solid #e7e5e4" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: "#fffbeb", border: "1px solid #fde68a", display: "flex", alignItems: "center", justifyContent: "center" }}>{icon}</div>
              <div>
                <h1 style={{ fontSize: 26, fontWeight: 800, color: "#1c1917", letterSpacing: "-0.02em", margin: 0 }}>{title}</h1>
                <p style={{ fontSize: 13, color: "#9ca3af", marginTop: 2 }}>{subtitle}</p>
              </div>
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>{children}</div>
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ paddingBottom: 24, marginBottom: 24, borderBottom: "1px solid #f3f4f6" }}>
      <h2 style={{ fontSize: 15, fontWeight: 700, color: "#1c1917", marginBottom: 10, display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ display: "inline-block", width: 4, height: 16, borderRadius: 2, background: "#d97706", flexShrink: 0 }} />
        {title}
      </h2>
      <div style={{ fontSize: 14, color: "#44403c", lineHeight: 1.75 }}>{children}</div>
    </div>
  );
}
