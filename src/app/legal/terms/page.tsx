import Link from "next/link";

export const metadata = { title: "Terms & Conditions — HandyHub" };

export default function TermsPage() {
  return (
    <div style={{ minHeight: "100vh", background: "#fafaf9", fontFamily: "inherit" }}>
      <div style={{ maxWidth: 720, margin: "0 auto", padding: "40px 24px 80px" }}>

        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, color: "#92400e", fontWeight: 600, textDecoration: "none", marginBottom: 24 }}>
            ← Back to HandyHub
          </Link>
          <h1 style={{ fontSize: 32, fontWeight: 800, color: "#1c1917", letterSpacing: "-0.02em", marginBottom: 6 }}>Terms & Conditions</h1>
          <p style={{ fontSize: 14, color: "#78716c" }}>Last updated: March 2026</p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 28, fontSize: 15, color: "#44403c", lineHeight: 1.75 }}>

          <Section title="1. Acceptance of Terms">
            By accessing or using HandyHub (&quot;the Platform&quot;), you agree to be bound by these Terms and Conditions. If you do not agree to these terms, please do not use the Platform. HandyHub reserves the right to update these terms at any time, and continued use of the Platform constitutes acceptance of any changes.
          </Section>

          <Section title="2. Platform Overview">
            HandyHub is a marketplace that connects customers with independent handymen and contractors (&quot;Vendors&quot;) in Botswana. HandyHub facilitates the booking process and payment handling but is not a direct party to any service agreement between customers and vendors.
          </Section>

          <Section title="3. User Accounts">
            You must be at least 18 years of age to create an account. You are responsible for maintaining the confidentiality of your login credentials and for all activity under your account. Please notify us immediately of any unauthorised use of your account at support@handyhub.co.bw.
          </Section>

          <Section title="4. Vendor Obligations">
            Vendors must provide accurate information about their qualifications, experience, and services. Vendors are responsible for completing booked jobs to a professional standard and in compliance with all applicable Botswana laws and regulations, including any trade licensing requirements.
          </Section>

          <Section title="5. Customer Obligations">
            Customers must provide accurate information when booking a service, including the nature of the work required and the service address. Customers must make payment through the HandyHub platform only. Payments made outside the platform are not protected.
          </Section>

          <Section title="6. Payments & Fees">
            All payments are processed through HandyHub. Funds are held securely and released to the vendor only after job completion is confirmed. HandyHub charges a platform fee on each transaction, which is deducted from the vendor&apos;s payout. Prices displayed are in Botswana Pula (BWP).
          </Section>

          <Section title="7. Cancellations & Refunds">
            Customers may cancel a booking before it is accepted by the vendor with no charge. Cancellations after acceptance may be subject to a cancellation fee. Disputes regarding service quality must be raised within 48 hours of job completion via the HandyHub disputes process.
          </Section>

          <Section title="8. Prohibited Conduct">
            Users may not use the Platform to: share contact details to arrange off-platform payments; post false reviews; harass or threaten other users; impersonate any person or entity; or violate any applicable law. Violations may result in immediate account suspension.
          </Section>

          <Section title="9. Limitation of Liability">
            HandyHub is a technology platform and intermediary. We are not liable for the quality, safety, legality, or any other aspect of services provided by vendors. Our total liability to you in any circumstances shall not exceed the total fees paid by you through the Platform in the 3 months preceding the claim.
          </Section>

          <Section title="10. Governing Law">
            These Terms are governed by the laws of the Republic of Botswana. Any disputes shall be subject to the exclusive jurisdiction of the courts of Botswana.
          </Section>

          <Section title="11. Contact">
            For questions about these Terms, contact us at: <strong>legal@handyhub.co.bw</strong>
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
      <Link href="/legal/terms"   style={{ color: "#d97706", fontWeight: 600, textDecoration: "none" }}>Terms & Conditions</Link>
      <Link href="/legal/privacy" style={{ color: "#78716c", textDecoration: "none" }}>Privacy Policy</Link>
      <Link href="/legal/cookies" style={{ color: "#78716c", textDecoration: "none" }}>Cookie Policy</Link>
    </div>
  );
}
