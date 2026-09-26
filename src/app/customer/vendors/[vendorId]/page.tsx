"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Avatar, Stars, Toast, PageSpinner } from "@/components/ui";
import { IconChevL, IconMapPin, IconChat } from "@/components/icons";
import { User, Wrench, Star } from "lucide-react";
import { useToast } from "@/hooks/useToast";
import { useUser } from "@/context/UserContext";
import { fmtPrice } from "@/lib/fmt";

interface PageProps { params: { vendorId: string } }

interface Service { id: string; name: string; price: number; unit: string; desc: string }
interface ReviewUser { id: string; firstName: string; lastName: string; avatarUrl: string | null }
interface Review { id: string; rating: number; comment: string; createdAt: string; reviewer: ReviewUser }
interface VendorDetail {
  id: string; bio: string; category: string; skills: string[]; location: string;
  rating: number; reviewCount: number; available: boolean; verified: boolean;
  completedBookings: number;
  user: { firstName: string; lastName: string; avatarUrl: string | null; city: string | null; area: string | null };
  services: Service[];
  reviews: Review[];
}

const TABS: { id: string; label: string; Icon: React.FC<{ size: number; color: string }> }[] = [
  { id: "About",    label: "About",    Icon: ({ size, color }) => <User    size={size} color={color} /> },
  { id: "Services", label: "Services", Icon: ({ size, color }) => <Wrench  size={size} color={color} /> },
  { id: "Reviews",  label: "Reviews",  Icon: ({ size, color }) => <Star    size={size} color={color} /> },
];
type Tab = "About" | "Services" | "Reviews";

export default function VendorProfilePage({ params }: PageProps) {
  const { vendorId } = params;
  const router = useRouter();
  const { user } = useUser();
  const [toast, showToast] = useToast();
  const [vendor, setVendor] = useState<VendorDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>("About");

  // Review state
  const [myRating,  setMyRating]  = useState(0);
  const [myComment, setMyComment] = useState("");
  const [hovering,  setHovering]  = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [canReview, setCanReview] = useState(false);

  useEffect(() => {
    fetch(`/api/vendors/${vendorId}`)
      .then((r) => { if (!r.ok) throw new Error(); return r.json(); })
      .then((d) => { setVendor(d.vendor ?? null); })
      .catch(() => showToast("Failed to load vendor", "err"))
      .finally(() => setLoading(false));
  }, [vendorId]);

  useEffect(() => {
    if (user?.role !== "customer") return;
    fetch(`/api/bookings?vendorId=${vendorId}&status=completed`)
      .then((r) => r.json())
      .then((d) => setCanReview((d.bookings ?? []).length > 0))
      .catch(() => {/* non-critical */});
  }, [user, vendorId]);

  const submitReview = async () => {
    if (!myRating) { showToast("Please select a star rating", "err"); return; }
    setSubmitting(true);
    try {
      const res = await fetch(`/api/vendors/${vendorId}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating: myRating, comment: myComment }),
      });
      const data = await res.json();
      if (!res.ok) { showToast(data.message ?? "Failed to submit", "err"); return; }
      showToast("Review submitted", "ok");
      setMyRating(0); setMyComment("");
      // Reload vendor to reflect new review + updated rating
      const v = await fetch(`/api/vendors/${vendorId}`).then((r) => r.json());
      setVendor(v.vendor ?? null);
    } catch { showToast("Network error", "err"); }
    finally { setSubmitting(false); }
  };

  if (loading) return <PageSpinner paddingY="120px" />;
  if (!vendor)  return <div style={{ paddingTop: 120, textAlign: "center", color: "var(--ink3)" }}>Vendor not found.</div>;

  const fullName = `${vendor.user.firstName} ${vendor.user.lastName}`;
  const myReview = user ? vendor.reviews.find((r) => r.reviewer.id === user.id) : undefined;

  return (
    <div className="cust-page-wrap" style={{ paddingBottom: 120 }}>
      {toast && <Toast msg={toast.msg} type={toast.type} />}

      {/* Hero */}
      <div style={{ height: 160, background: "linear-gradient(135deg, #27272a 0%, #27435f 100%)", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: -40, right: -40, width: 200, height: 200, borderRadius: "50%", background: "rgba(255,255,255,.07)" }} />
        <button onClick={() => router.back()} style={{ position: "absolute", top: 16, left: 16, background: "rgba(0,0,0,.3)", border: "none", borderRadius: "50%", width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
          <IconChevL style={{ width: 20, height: 20, color: "#fff" }} />
        </button>
        <div style={{ position: "absolute", top: 14, right: 16, display: "flex", gap: 8 }}>
          {vendor.verified && <span style={{ background: "rgba(0,0,0,.3)", color: "#fff", fontSize: 11, fontWeight: 700, padding: "4px 10px", borderRadius: 999 }}>Verified</span>}
          <span style={{ background: vendor.available ? "rgba(12,166,120,.7)" : "rgba(224,49,49,.6)", color: "#fff", fontSize: 11, fontWeight: 700, padding: "4px 10px", borderRadius: 999 }}>{vendor.available ? "Available" : "Busy"}</span>
        </div>
      </div>

      {/* Avatar overlap */}
      <div style={{ display: "flex", justifyContent: "center", marginTop: -55, position: "relative", zIndex: 10 }}>
        <div style={{ padding: 4, background: "var(--bg)", borderRadius: "50%", boxShadow: "0 4px 20px rgba(0,0,0,.15)" }}>
          <Avatar name={fullName} size={110} src={vendor.user.avatarUrl} />
        </div>
      </div>

      {/* Name + meta */}
      <div style={{ textAlign: "center", padding: "14px 24px 0" }}>
        <h2 className="cust-heading" style={{ fontSize: 24 }}>{fullName}</h2>
        <p style={{ fontSize: 13, color: "var(--ink3)", marginTop: 4 }}>{vendor.category || "Handyman"}</p>
        {(vendor.user.city || vendor.user.area) && (
          <p style={{ fontSize: 12, color: "var(--ink3)", marginTop: 3, display: "flex", alignItems: "center", justifyContent: "center", gap: 4 }}>
            <IconMapPin style={{ width: 12, height: 12 }} />
            {[vendor.user.city, vendor.user.area].filter(Boolean).join(", ")}
          </p>
        )}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, marginTop: 8 }}>
          <Stars n={Math.round(vendor.rating)} />
          <span style={{ fontSize: 13, fontWeight: 700, color: "var(--ink)" }}>{vendor.rating > 0 ? vendor.rating.toFixed(1) : "New"}</span>
          <span style={{ fontSize: 12, color: "var(--ink3)" }}>({vendor.reviewCount} review{vendor.reviewCount !== 1 ? "s" : ""})</span>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: "flex", gap: 10, margin: "16px 20px 0" }}>
        {[
          { label: "Rating",    value: vendor.rating > 0 ? vendor.rating.toFixed(1) : "New", icon: "⭐", color: "var(--navy)" },
          { label: "Reviews",   value: String(vendor.reviewCount), icon: "💬", color: "var(--acc)" },
          { label: "Completed", value: String(vendor.completedBookings), icon: "✅", color: "var(--green)" },
        ].map((s) => (
          <div key={s.label} style={{ flex: 1, background: "var(--card)", borderRadius: 16, padding: "12px 8px", textAlign: "center", border: "1.5px solid var(--border)", boxShadow: "var(--shadow)" }}>
            <span style={{ fontSize: 18 }}>{s.icon}</span>
            <p style={{ fontSize: 16, fontWeight: 800, color: s.color, marginTop: 4 }}>{s.value}</p>
            <p style={{ fontSize: 10, color: "var(--ink3)", fontWeight: 700, marginTop: 2, textTransform: "uppercase", letterSpacing: ".05em" }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="cust-card" style={{ margin: "20px 20px 0" }}>
        <div style={{ display: "flex", borderBottom: "1px solid var(--border)" }}>
          {TABS.map(({ id, label, Icon }) => {
            const active = tab === id;
            return (
              <button key={id} onClick={() => setTab(id as Tab)}
                style={{ flex: 1, padding: "12px 0", border: "none", background: "transparent", cursor: "pointer", position: "relative", display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                <Icon size={15} color={active ? "var(--navy)" : "var(--ink3)"} />
                <span style={{ fontSize: 12, fontWeight: 700, color: active ? "var(--navy)" : "var(--ink3)", transition: "color .15s" }}>{label}</span>
                {active && <div style={{ position: "absolute", bottom: 0, left: "10%", width: "80%", height: 2.5, background: "var(--navy)", borderRadius: 999 }} />}
              </button>
            );
          })}
        </div>

        <div style={{ padding: "16px 20px", display: "flex", flexDirection: "column", gap: 14 }}>

        {/* ── About tab ── */}
        {tab === "About" && <>
          {vendor.bio && (
            <>
              <p style={{ fontSize: 11, fontWeight: 700, color: "var(--ink3)", textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 6 }}>Bio</p>
              <p style={{ fontSize: 14, color: "var(--ink)", lineHeight: 1.7, marginBottom: 14 }}>{vendor.bio}</p>
            </>
          )}
          {vendor.skills.length > 0 && (
            <>
              <p style={{ fontSize: 11, fontWeight: 700, color: "var(--ink3)", textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 8 }}>Skills</p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {vendor.skills.map((s) => (
                  <span key={s} style={{ padding: "5px 12px", borderRadius: 999, background: "var(--navy-soft)", border: "1px solid var(--navy-border)", fontSize: 12, fontWeight: 600, color: "var(--navy)" }}>{s}</span>
                ))}
              </div>
            </>
          )}
          {!vendor.bio && vendor.skills.length === 0 && (
            <p style={{ textAlign: "center", color: "var(--ink3)", fontSize: 13, padding: "24px 0" }}>No information added yet.</p>
          )}
        </>}

        {/* ── Services tab ── */}
        {tab === "Services" && (
          vendor.services.length > 0
            ? <>{vendor.services.map((svc, i) => (
                <div key={svc.id} style={{ paddingTop: i > 0 ? 14 : 0, borderTop: i > 0 ? "1px solid var(--border)" : undefined, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <p style={{ fontWeight: 700, fontSize: 14 }}>{svc.name}</p>
                    {svc.desc && <p style={{ fontSize: 12, color: "var(--ink3)", marginTop: 2 }}>{svc.desc}</p>}
                  </div>
                  <p style={{ fontWeight: 800, fontSize: 15, color: "var(--navy)", whiteSpace: "nowrap", marginLeft: 12 }}>{fmtPrice(svc.price)}/{svc.unit}</p>
                </div>
              ))}</>
            : <p style={{ textAlign: "center", color: "var(--ink3)", fontSize: 13, padding: "24px 0" }}>No services listed yet.</p>
        )}

        {/* ── Reviews tab ── */}
        {tab === "Reviews" && <>
          {vendor.reviews.length === 0
            ? <p style={{ fontSize: 13, color: "var(--ink3)", padding: "8px 0 16px" }}>No reviews yet. Be the first!</p>
            : vendor.reviews.map((rv, i) => (
              <div key={rv.id} style={{ paddingTop: i > 0 ? 14 : 0, borderTop: i > 0 ? "1px solid var(--border)" : undefined }}>
                <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                  <Avatar name={`${rv.reviewer.firstName} ${rv.reviewer.lastName}`} size={36} src={rv.reviewer.avatarUrl} />
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <p style={{ fontWeight: 700, fontSize: 13 }}>{rv.reviewer.firstName} {rv.reviewer.lastName}</p>
                      <Stars n={rv.rating} size={12} />
                    </div>
                    {rv.comment && <p style={{ fontSize: 13, color: "var(--ink2)", marginTop: 4, lineHeight: 1.5 }}>{rv.comment}</p>}
                    <p style={{ fontSize: 11, color: "var(--ink3)", marginTop: 4 }}>{new Date(rv.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
            ))
          }
          {user?.role === "customer" && (
            <div style={{ borderTop: "1px solid var(--border)", paddingTop: 16, marginTop: 4 }}>
              <div style={{ opacity: canReview ? 1 : 0.45, pointerEvents: canReview ? "auto" : "none" }}>
                <p style={{ fontSize: 11, fontWeight: 700, color: "var(--ink3)", textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 12 }}>
                  {myReview ? "Update Your Review" : "Leave a Review"}
                </p>
                {!canReview && (
                  <p style={{ fontSize: 12, color: "var(--ink3)", marginBottom: 10 }}>Book and confirm a service to leave a review.</p>
                )}
                <div style={{ display: "flex", gap: 6, marginBottom: 14 }}>
                  {[1,2,3,4,5].map((n) => (
                    <button key={n} onMouseEnter={() => setHovering(n)} onMouseLeave={() => setHovering(0)} onClick={() => setMyRating(n)}
                      style={{ background: "none", border: "none", cursor: "pointer", fontSize: 28, lineHeight: 1, color: n <= (hovering || myRating) ? "var(--navy)" : "var(--border2)", transition: "color .15s" }}>★</button>
                  ))}
                  {myRating > 0 && <span style={{ alignSelf: "center", fontSize: 13, color: "var(--ink3)", marginLeft: 4 }}>{["","Poor","Fair","Good","Great","Excellent"][myRating]}</span>}
                </div>
                <textarea className="field" rows={3} placeholder="Share your experience (optional)…" value={myComment} onChange={(e) => setMyComment(e.target.value)} style={{ resize: "vertical" }} />
                <button onClick={submitReview} disabled={submitting || !myRating}
                  style={{ width: "100%", marginTop: 12, padding: 14, fontSize: 14, fontWeight: 700, borderRadius: 14, border: "none", cursor: (!myRating || submitting) ? "not-allowed" : "pointer", color: "#fff", background: (!myRating || submitting) ? "var(--border2)" : "linear-gradient(135deg, var(--navy-dark), var(--navy))", opacity: (!myRating || submitting) ? 0.6 : 1, transition: "all .2s", boxShadow: (!myRating || submitting) ? "none" : "0 4px 16px rgba(39,67,95,.22)" }}>
                  {submitting ? "Submitting…" : "Submit Review"}
                </button>
              </div>
            </div>
          )}
        </>}
        </div>
      </div>

      {/* CTA bar — sidebar-aware on desktop, compact on mobile */}
      <div className="page-cta-bar">
        <button
          className="btn-ghost page-cta-btn"
          onClick={() => router.push("/customer/messages")}
        >
          <IconChat style={{ width: 17, height: 17 }} />
          Message
        </button>
        <button
          className="btn-pri page-cta-btn"
          onClick={() => router.push(`/customer/book/${vendorId}`)}
        >
          Book {fullName.split(" ")[0]}
        </button>
      </div>
    </div>
  );
}
