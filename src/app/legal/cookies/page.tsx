import Link from "next/link";

export const metadata = { title: "Cookie Policy — HandyHub" };

export default function CookiesPage() {
  return (
    <div style={{ minHeight: "100vh", background: "#fafaf9", fontFamily: "inherit" }}>
      <div style={{ maxWidth: 720, margin: "0 auto", padding: "40px 24px 80px" }}>

        <div style={{ marginBottom: 32 }}>
          <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, color: "#92400e", fontWeight: 600, textDecoration: "none", marginBottom: 24 }}>
            ← Back to HandyHub
          </Link>
          <h1 style={{ fontSize: 32, fontWeight: 800, color: "#1c1917", letterSpacing: "-0.02em", marginBottom: 6 }}>Cookie Policy</h1>
          <p style={{ fontSize: 14, color: "#78716c" }}>Last updated: March 2026</p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 28, fontSize: 15, color: "#44403c", lineHeight: 1.75 }}>

          <Section title="1. What Are Cookies">
            Cookies are small text files placed on your device when you visit a website. They help the site remember information about your visit, making it easier to use and more relevant to you. HandyHub uses cookies and similar technologies such as local storage to operate the platform.
          </Section>

          <Section title="2. Cookies We Use">
            <strong>Essential cookies:</strong> Required for the platform to function. These include your session cookie (<code>hh_session</code>) which keeps you logged in securely. Without these cookies, certain features cannot be provided.
            <br /><br />
            <strong>Preference cookies:</strong> Remember your settings such as navigation sidebar state and theme preferences.
            <br /><br />
            <strong>Analytics cookies:</strong> Help us understand how users interact with the platform so we can improve it. These are anonymised and do not identify you personally.
          </Section>

          <Section title="3. Session Cookie">
            Our primary authentication cookie (<code>hh_session</code>) is an HTTP-only, secure cookie with a 7-day expiry. It stores a signed token that authenticates your session. It cannot be accessed by JavaScript and is protected against cross-site scripting.
          </Section>

          <Section title="4. Local Storage">
            We use browser local storage to remember UI preferences such as whether your sidebar is collapsed and unread message counts. This data stays on your device and is not transmitted to our servers.
          </Section>

          <Section title="5. Third-Party Cookies">
            HandyHub may integrate with third-party services (such as payment processors) that set their own cookies. We do not control these cookies. Please refer to the respective privacy policies of those services for details.
          </Section>

          <Section title="6. Managing Cookies">
            You can control and delete cookies through your browser settings. Note that disabling essential cookies will prevent you from logging in and using core platform features. Most browsers allow you to block cookies or alert you when cookies are being sent.
          </Section>

          <Section title="7. Changes to This Policy">
            We may update this Cookie Policy as our platform evolves. We will notify you of significant changes. Continued use of HandyHub after changes constitutes acceptance.
          </Section>

          <Section title="8. Contact">
            For cookie-related questions: <strong>privacy@handyhub.co.bw</strong>
          </Section>
        </div>

        <LegalFooter />
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 style={{ fontSize: 17, fontWeight: 700, color: "#1c1917", marginBottom: 8 }}>{title}</h2>
      <p>{children}</p>
    </div>
  );
}

function LegalFooter() {
  return (
    <div style={{ marginTop: 48, paddingTop: 24, borderTop: "1px solid #e7e5e4", display: "flex", gap: 20, flexWrap: "wrap", fontSize: 13, color: "#78716c" }}>
      <Link href="/legal/terms"   style={{ color: "#78716c", textDecoration: "none" }}>Terms & Conditions</Link>
      <Link href="/legal/privacy" style={{ color: "#78716c", textDecoration: "none" }}>Privacy Policy</Link>
      <Link href="/legal/cookies" style={{ color: "#d97706", fontWeight: 600, textDecoration: "none" }}>Cookie Policy</Link>
    </div>
  );
}
