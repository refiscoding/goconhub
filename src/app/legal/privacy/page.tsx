import Link from "next/link";
import { getSession } from "@/lib/session";
import { ShieldCheck, ChevronRight } from "lucide-react";
import { BackButton } from "@/components/legal/BackButton";

export const dynamic = "force-dynamic";
export const metadata = { title: "Privacy Policy — GoCon" };

export default async function PrivacyPage() {
  const session = await getSession();
  const role = session?.role ?? null;

  return (
    <LegalShell
      title="Privacy Policy"
      subtitle="Last updated: March 2026"
      icon={<ShieldCheck size={22} color="var(--navy)" />}
      role={role}
      current="privacy"
    >
      <Section title="1. Introduction">
        GoCon (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;) is committed to protecting your personal
        information. This Privacy Policy explains what data we collect, how we use it, and your
        rights. By using GoCon, you agree to the collection and use of information as described here.
      </Section>

      <Section title="2. Information We Collect">
        We collect information you provide directly: name, email address, phone number, city and
        area, and profile photo. We also collect usage data: booking history, messages, payment
        records, and reviews generated through use of the platform.
        {role === "vendor" && (
          <RoleCallout color="#3f3f46" bg="#f4f4f5" border="#d4d4d8" label="Additional data collected from Vendors">
            As a vendor, we also collect your professional information: trade category, skills,
            bio, verification documents (ID/CIPA number), and bank account details for payouts.
            This information is required to process payments and verify your identity.
          </RoleCallout>
        )}
        {role === "customer" && (
          <RoleCallout color="var(--navy)" bg="var(--navy-soft)" border="var(--navy-border)" label="Data collected from Customers">
            As a customer, we collect your service preferences, booking history, and any job
            descriptions or photos you upload when requesting a booking. Payment confirmation
            details are also stored for your records.
          </RoleCallout>
        )}
      </Section>

      <Section title="3. How We Use Your Information">
        We use your information to: create and manage your account; process bookings and payments;
        facilitate communication between customers and vendors; send service-related notifications;
        improve platform features; and comply with legal obligations.
        {role === "vendor" && (
          <RoleCallout color="#3f3f46" bg="#f4f4f5" border="#d4d4d8" label="How we use your vendor data">
            Your bank account and identity details are used exclusively for processing payouts and
            verifying your account. They are never shared with customers or used for any purpose
            other than facilitating payments and compliance.
          </RoleCallout>
        )}
      </Section>

      <Section title="4. Sharing of Information">
        We share your information only as necessary: with the other party in a booking (e.g. your
        name and area with a vendor); with payment processors to facilitate transactions; with
        service providers under strict confidentiality obligations; and with authorities where
        required by Botswana law.
        {role === "customer" && (
          <RoleCallout color="var(--navy)" bg="var(--navy-soft)" border="var(--navy-border)" label="What vendors see about you">
            When you book a handyman, they will see your name, service area, and the job description
            you provided. Your full home address is only shared after a booking is confirmed.
            Your contact number is shared to allow coordination.
          </RoleCallout>
        )}
        {role === "vendor" && (
          <RoleCallout color="#3f3f46" bg="#f4f4f5" border="#d4d4d8" label="What customers see about you">
            Customers can see your name, profile photo, category, rating, reviews, and service
            area. Your bank account details, identity documents, and contact number are never
            visible to customers.
          </RoleCallout>
        )}
      </Section>

      <Section title="5. Data Retention">
        We retain your personal data for as long as your account is active or as needed to provide
        services. You may request deletion of your account by contacting us. Some financial and
        legal records may be retained for up to 7 years as required by Botswana law.
      </Section>

      <Section title="6. Security">
        We implement industry-standard security measures: encrypted storage, HTTPS transmission,
        and strict access controls. Passwords are hashed and never stored in plain text. Session
        cookies are HTTP-only and cannot be accessed by JavaScript.
      </Section>

      <Section title="7. Your Rights">
        You have the right to access, correct, or delete your personal data. You may update your
        profile at any time from account settings. To exercise data rights, contact:{" "}
        <a href="mailto:privacy@handyhub.co.bw" style={{ color: "var(--navy)", fontWeight: 600 }}>privacy@handyhub.co.bw</a>
      </Section>

      <Section title="8. Cookies">
        We use cookies and similar technologies to maintain your session and remember preferences.
        See our{" "}
        <Link href="/legal/cookies" style={{ color: "var(--navy)", fontWeight: 600 }}>Cookie Policy</Link>{" "}
        for full details.
      </Section>

      <Section title="9. Children&apos;s Privacy">
        GoCon is not intended for users under the age of 18. We do not knowingly collect personal
        information from children. Contact us immediately if you believe a minor has created an account.
      </Section>

      <Section title="10. Changes to This Policy">
        We may update this Privacy Policy from time to time and will notify you of significant
        changes via email or a notice on the platform. Continued use of GoCon after changes
        constitutes acceptance of the updated policy.
      </Section>

      <Section title="11. Contact">
        Privacy enquiries:{" "}
        <a href="mailto:privacy@handyhub.co.bw" style={{ color: "var(--navy)", fontWeight: 600 }}>privacy@handyhub.co.bw</a>
      </Section>
    </LegalShell>
  );
}

/* ─────────── shared layout (duplicated to keep pages self-contained) ─────────── */
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
    <div style={{ minHeight: "100vh", background: "#f4f4f5", fontFamily: "inherit" }}>
      <div style={{ background: "white", borderBottom: "1px solid #e4e4e7", position: "sticky", top: 0, zIndex: 40 }}>
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
            <Link key={l.href} href={l.href} style={{ display: "block", padding: "9px 14px", borderRadius: 10, marginBottom: 4, fontSize: 13, fontWeight: l.href.includes(current) ? 700 : 500, color: l.href.includes(current) ? "var(--navy)" : "#374151", background: l.href.includes(current) ? "var(--navy-soft)" : "transparent", border: l.href.includes(current) ? "1px solid var(--navy-border)" : "1px solid transparent", textDecoration: "none" }}>
              {l.label}
            </Link>
          ))}
          <div style={{ marginTop: 20, padding: "12px 14px", background: "white", borderRadius: 12, border: "1px solid #e7e5e4" }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: ".05em", marginBottom: 6 }}>Need help?</p>
            <a href="mailto:privacy@handyhub.co.bw" style={{ fontSize: 12, color: "var(--navy)", fontWeight: 700, textDecoration: "none" }}>privacy@handyhub.co.bw</a>
          </div>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ marginBottom: 28, paddingBottom: 24, borderBottom: "1px solid #e7e5e4" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: "var(--navy-soft)", border: "1px solid var(--navy-border)", display: "flex", alignItems: "center", justifyContent: "center" }}>{icon}</div>
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
        <span style={{ display: "inline-block", width: 4, height: 16, borderRadius: 2, background: "var(--navy)", flexShrink: 0 }} />
        {title}
      </h2>
      <div style={{ fontSize: 14, color: "#44403c", lineHeight: 1.75 }}>{children}</div>
    </div>
  );
}

function RoleCallout({ color, bg, border, label, children }: { color: string; bg: string; border: string; label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginTop: 12, background: bg, border: `1px solid ${border}`, borderRadius: 10, padding: "12px 14px", borderLeft: `3px solid ${color}` }}>
      <p style={{ fontSize: 11, fontWeight: 800, color, textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 5 }}>{label}</p>
      <p style={{ fontSize: 13, color: "#44403c", lineHeight: 1.65, margin: 0 }}>{children}</p>
    </div>
  );
}
