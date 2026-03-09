"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Avatar, PageSpinner } from "@/components/ui";
import { IconChevL, IconMapPin } from "@/components/icons";

interface PageProps { params: { customerId: string } }
interface CustomerDetail {
  id: string; firstName: string; lastName: string;
  avatarUrl: string | null; city: string | null; area: string | null; createdAt: string;
}

export default function CustomerProfilePage({ params }: PageProps) {
  const { customerId } = params;
  const router = useRouter();
  const [customer, setCustomer] = useState<CustomerDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/users/${customerId}`)
      .then((r) => r.json())
      .then((d) => setCustomer(d.user ?? null))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [customerId]);

  if (loading) return <PageSpinner paddingY="120px" />;
  if (!customer) return <div style={{ paddingTop: 120, textAlign: "center", color: "var(--ink3)" }}>Customer not found.</div>;

  const fullName = `${customer.firstName} ${customer.lastName}`;
  const joined = new Date(customer.createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" });

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", paddingBottom: 80 }}>
      {/* Hero */}
      <div style={{ height: 160, background: "linear-gradient(135deg,#0f1923 0%,#0d2333 100%)", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(ellipse at 70% 50%,rgba(45,212,191,.2) 0%,transparent 65%)" }} />
        <button onClick={() => router.back()} style={{ position: "absolute", top: 16, left: 16, background: "rgba(255,255,255,.1)", border: "none", borderRadius: "50%", width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
          <IconChevL style={{ width: 20, height: 20, color: "#fff" }} />
        </button>
      </div>

      {/* Avatar overlap */}
      <div style={{ display: "flex", justifyContent: "center", marginTop: -55, position: "relative", zIndex: 10 }}>
        <div style={{ padding: 4, background: "var(--bg)", borderRadius: "50%", boxShadow: "0 4px 20px rgba(0,0,0,.2)" }}>
          <Avatar name={fullName} size={110} src={customer.avatarUrl} />
        </div>
      </div>

      <div style={{ textAlign: "center", padding: "14px 24px 0" }}>
        <h2 style={{ fontSize: 24, fontWeight: 800, letterSpacing: "-.02em" }}>{fullName}</h2>
        <p style={{ fontSize: 13, color: "var(--ink3)", marginTop: 4 }}>Customer</p>
        {(customer.city || customer.area) && (
          <p style={{ fontSize: 12, color: "var(--ink3)", marginTop: 3, display: "flex", alignItems: "center", justifyContent: "center", gap: 4 }}>
            <IconMapPin style={{ width: 12, height: 12 }} />
            {[customer.city, customer.area].filter(Boolean).join(", ")}
          </p>
        )}
        <p style={{ fontSize: 12, color: "var(--ink3)", marginTop: 4 }}>Member since {joined}</p>
      </div>

      <div style={{ padding: "24px 20px 0" }}>
        <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 18, padding: "20px", textAlign: "center" }}>
          <span style={{ fontSize: 36 }}>👤</span>
          <p style={{ fontWeight: 700, fontSize: 15, marginTop: 10 }}>{fullName}</p>
          <p style={{ fontSize: 13, color: "var(--ink3)", marginTop: 4 }}>Verified HandyHub Customer</p>
        </div>
      </div>
    </div>
  );
}
