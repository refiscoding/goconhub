import Link from "next/link";
import { getSession } from "@/lib/session";
import { FileText, ChevronRight } from "lucide-react";
import { BackButton } from "@/components/legal/BackButton";

export const dynamic = "force-dynamic";
export const metadata = { title: "Terms & Conditions — HandyHub" };

export default async function TermsPage() {
  const session = await getSession();
  const role = session?.role ?? null;

  return (
    <LegalShell
      title="Terms & Conditions"
      subtitle="Last updated: March 2026"
      icon={<FileText size={22} color="#d97706" />}
      role={role}
      current="terms"
    >
      <Section title="1. Acceptance of Terms">
        By accessing or using HandyHub (&quot;the Platform&quot;), you agree to be bound by these Terms
        and Conditions. If you do not agree, please do not use the Platform. HandyHub reserves the
        right to update these terms at any time; continued use constitutes acceptance of any changes.
      </Section>

      <Section title="2. Platform Overview">
        HandyHub is a marketplace that connects customers with independent handymen and contractors
        (&quot;Vendors&quot;) in Botswana. HandyHub facilitates the booking process and payment
        handling but is not a direct party to any service agreement between customers and vendors.
      </Section>

      <Section title="3. User Accounts">
        You must be at least 18 years of age to create an account. You are responsible for
        maintaining the confidentiality of your login credentials and for all activity under your
        account. Notify us immediately of any unauthorised use at{" "}
        <a href="mailto:support@handyhub.co.bw" style={{ color: "#d97706", fontWeight: 600 }}>support@handyhub.co.bw</a>.
      </Section>

      <Section title="4. Vendor Obligations">
        Vendors must provide accurate information about their qualifications, experience, and
        services. Vendors are responsible for completing booked jobs to a professional standard and
        in compliance with all applicable Botswana laws and regulations, including trade licensing
        requirements.
        {(role === "vendor" || !role) && (
          <RoleCallout color="#0d9488" bg="#f0fdfa" border="#ccfbf1" label="For Handymen">
            As a registered vendor on HandyHub, you are solely responsible for the quality and
            safety of the services you provide. You must carry any required trade licences or
            certifications and maintain appropriate insurance. HandyHub may suspend your account if
            you fail to meet these standards.
          </RoleCallout>
        )}
      </Section>

      <Section title="5. Customer Obligations">
        Customers must provide accurate information when booking, including the nature of the work
        and service address. All payments must be made through the HandyHub platform. Payments made
        outside the platform are not protected by HandyHub&apos;s escrow or dispute process.
        {(role === "customer" || !role) && (
          <RoleCallout color="#d97706" bg="#fffbeb" border="#fde68a" label="For Customers">
            You are responsible for ensuring a safe working environment for the handyman. Please
            be present or available at the agreed time. Inaccurate job descriptions may result in
            additional charges agreed directly with the vendor.
          </RoleCallout>
        )}
      </Section>

      <Section title="6. Payments & Fees">
        All payments are processed through HandyHub. Funds are held in escrow and released to the
        vendor only after job completion is confirmed. HandyHub charges a platform fee on each
        transaction, deducted from the vendor&apos;s payout. All prices are in Botswana Pula (BWP).
        {role === "vendor" && (
          <RoleCallout color="#0d9488" bg="#f0fdfa" border="#ccfbf1" label="Vendor Payouts">
            You will receive 95% of the agreed job price after HandyHub&apos;s 5% platform fee.
            Payouts are processed once the admin confirms payment. Your earnings are visible in
            your dashboard under Earnings.
          </RoleCallout>
        )}
        {role === "customer" && (
          <RoleCallout color="#d97706" bg="#fffbeb" border="#fde68a" label="Customer Payments">
            Your payment is securely held by HandyHub until the job is completed and confirmed.
            You will not be charged until you confirm the work is done or the admin approves
            completion.
          </RoleCallout>
        )}
      </Section>

      <Section title="7. Cancellations & Refunds">
        Customers may cancel a booking before it is accepted by the vendor with no charge.
        Cancellations after acceptance may be subject to a cancellation fee. Disputes regarding
        service quality must be raised within 48 hours of job completion via the HandyHub disputes
        process.
      </Section>

      <Section title="8. Prohibited Conduct">
        Users may not use the Platform to: share contact details to arrange off-platform payments;
        post false or misleading reviews; harass or threaten other users; impersonate any person or
        entity; or violate any applicable law. Violations may result in immediate account suspension.
      </Section>

      <Section title="9. Limitation of Liability">
        HandyHub is a technology platform and intermediary. We are not liable for the quality,
        safety, legality, or any other aspect of services provided by vendors. Our total liability
        shall not exceed the total fees paid through the Platform in the 3 months preceding the claim.
      </Section>

      <Section title="10. Governing Law">
        These Terms are governed by the laws of the Republic of Botswana. Any disputes shall be
        subject to the exclusive jurisdiction of the courts of Botswana.
      </Section>

      <Section title="11. Contact">
        For questions about these Terms:{" "}
        <a href="mailto:legal@handyhub.co.bw" style={{ color: "#d97706", fontWeight: 600 }}>legal@handyhub.co.bw</a>
      </Section>
    </LegalShell>
  );
}

/* ─────────── shared layout ─────────── */
function LegalShell({
  title, subtitle, icon, role, current, children,
}: {
  title: string; subtitle: string; icon: React.ReactNode;
  role: string | null; current: "terms" | "privacy" | "cookies";
  children: React.ReactNode;
}) {
  const links = [
    { href: "/legal/terms",   label: "Terms & Conditions" },
    { href: "/legal/privacy", label: "Privacy Policy"     },
    { href: "/legal/cookies", label: "Cookie Policy"      },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "#f8f7f5", fontFamily: "inherit" }}>

      {/* ── top bar ── */}
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

        {/* ── sidebar nav ── */}
        <div style={{ width: 200, flexShrink: 0, position: "sticky", top: 72 }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 10 }}>Policies</p>
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              style={{
                display: "block", padding: "9px 14px", borderRadius: 10, marginBottom: 4,
                fontSize: 13, fontWeight: l.href.includes(current) ? 700 : 500,
                color:      l.href.includes(current) ? "#d97706" : "#374151",
                background: l.href.includes(current) ? "#fffbeb" : "transparent",
                border:     l.href.includes(current) ? "1px solid #fde68a" : "1px solid transparent",
                textDecoration: "none",
              }}
            >
              {l.label}
            </Link>
          ))}
          <div style={{ marginTop: 20, padding: "12px 14px", background: "white", borderRadius: 12, border: "1px solid #e7e5e4" }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: ".05em", marginBottom: 6 }}>Need help?</p>
            <p style={{ fontSize: 12, color: "#6b7280", lineHeight: 1.5 }}>Questions about our policies?</p>
            <a href="mailto:legal@handyhub.co.bw" style={{ fontSize: 12, color: "#d97706", fontWeight: 700, textDecoration: "none", display: "block", marginTop: 6 }}>legal@handyhub.co.bw</a>
          </div>
        </div>

        {/* ── main content ── */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ marginBottom: 28, paddingBottom: 24, borderBottom: "1px solid #e7e5e4" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: "#fffbeb", border: "1px solid #fde68a", display: "flex", alignItems: "center", justifyContent: "center" }}>
                {icon}
              </div>
              <div>
                <h1 style={{ fontSize: 26, fontWeight: 800, color: "#1c1917", letterSpacing: "-0.02em", margin: 0 }}>{title}</h1>
                <p style={{ fontSize: 13, color: "#9ca3af", marginTop: 2 }}>{subtitle}</p>
              </div>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
            {children}
          </div>
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

function RoleCallout({ color, bg, border, label, children }: {
  color: string; bg: string; border: string; label: string; children: React.ReactNode;
}) {
  return (
    <div style={{ marginTop: 12, background: bg, border: `1px solid ${border}`, borderRadius: 10, padding: "12px 14px", borderLeft: `3px solid ${color}` }}>
      <p style={{ fontSize: 11, fontWeight: 800, color, textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 5 }}>{label}</p>
      <p style={{ fontSize: 13, color: "#44403c", lineHeight: 1.65, margin: 0 }}>{children}</p>
    </div>
  );
}
