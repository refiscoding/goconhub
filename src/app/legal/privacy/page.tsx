import Link from "next/link";

export const metadata = { title: "Privacy Policy — HandyHub" };

export default function PrivacyPage() {
  return (
    <div style={{ minHeight: "100vh", background: "#fafaf9", fontFamily: "inherit" }}>
      <div style={{ maxWidth: 720, margin: "0 auto", padding: "40px 24px 80px" }}>

        <div style={{ marginBottom: 32 }}>
          <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, color: "#92400e", fontWeight: 600, textDecoration: "none", marginBottom: 24 }}>
            ← Back to HandyHub
          </Link>
          <h1 style={{ fontSize: 32, fontWeight: 800, color: "#1c1917", letterSpacing: "-0.02em", marginBottom: 6 }}>Privacy Policy</h1>
          <p style={{ fontSize: 14, color: "#78716c" }}>Last updated: March 2026</p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 28, fontSize: 15, color: "#44403c", lineHeight: 1.75 }}>

          <Section title="1. Introduction">
            HandyHub (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;) is committed to protecting your personal information. This Privacy Policy explains what data we collect, how we use it, and your rights regarding that data. By using the HandyHub platform, you agree to the collection and use of information as described in this policy.
          </Section>

          <Section title="2. Information We Collect">
            We collect information you provide directly: name, email address, phone number, city and area, profile photo, and for vendors, business and bank account details. We also collect information generated through use of our platform: booking history, messages, payment records, and reviews.
          </Section>

          <Section title="3. How We Use Your Information">
            We use your information to: create and manage your account; process bookings and payments; facilitate communication between customers and vendors; send service-related notifications; improve platform features and performance; and comply with legal obligations.
          </Section>

          <Section title="4. Sharing of Information">
            We share your information only as necessary: with the other party in a booking (e.g. your name and location with a vendor); with payment processors to facilitate transactions; with service providers who help us operate the platform under strict confidentiality obligations; and with authorities where required by law.
          </Section>

          <Section title="5. Data Retention">
            We retain your personal data for as long as your account is active or as needed to provide services. You may request deletion of your account and associated data by contacting us. Some data may be retained for legal and financial record-keeping purposes for up to 7 years.
          </Section>

          <Section title="6. Security">
            We implement industry-standard security measures including encrypted storage, HTTPS transmission, and access controls. Passwords are hashed and never stored in plain text. However, no method of transmission over the internet is 100% secure, and we cannot guarantee absolute security.
          </Section>

          <Section title="7. Your Rights">
            You have the right to access, correct, or delete your personal data. You may update your profile information at any time from your account settings. To exercise any rights regarding your data, contact us at privacy@handyhub.co.bw.
          </Section>

          <Section title="8. Cookies">
            We use cookies and similar technologies to maintain your session, remember preferences, and analyse platform usage. See our <Link href="/legal/cookies" style={{ color: "#d97706", fontWeight: 600 }}>Cookie Policy</Link> for details.
          </Section>

          <Section title="9. Children's Privacy">
            HandyHub is not intended for users under the age of 18. We do not knowingly collect personal information from children. If you believe a minor has provided us with personal data, please contact us immediately.
          </Section>

          <Section title="10. Changes to This Policy">
            We may update this Privacy Policy from time to time. We will notify you of significant changes via email or a notice on the platform. Continued use of HandyHub after changes constitutes acceptance of the updated policy.
          </Section>

          <Section title="11. Contact">
            For privacy-related enquiries: <strong>privacy@handyhub.co.bw</strong>
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
      <Link href="/legal/privacy" style={{ color: "#d97706", fontWeight: 600, textDecoration: "none" }}>Privacy Policy</Link>
      <Link href="/legal/cookies" style={{ color: "#78716c", textDecoration: "none" }}>Cookie Policy</Link>
    </div>
  );
}
