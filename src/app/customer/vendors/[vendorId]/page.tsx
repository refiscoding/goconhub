"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Avatar, Stars, Toast } from "@/components/ui";
import { IconChevL, IconMapPin } from "@/components/icons";
import { useToast } from "@/hooks/useToast";
import { useUser } from "@/context/UserContext";

interface PageProps { params: { vendorId: string } }

interface Service { id: string; name: string; price: number; unit: string; desc: string }
interface ReviewUser { firstName: string; lastName: string; avatarUrl: string | null }
interface Review { id: string; rating: number; comment: string; createdAt: string; reviewer: ReviewUser }
interface VendorDetail {
  id: string; bio: string; category: string; skills: string[]; location: string;
  rating: number; reviewCount: number; available: boolean; verified: boolean;
  completedBookings: number;
  user: { firstName: string; lastName: string; avatarUrl: string | null; city: string | null; area: string | null };
  services: Service[];
  reviews: Review[];
}

export default function VendorProfilePage({ params }: PageProps) {
  const { vendorId } = params;
  const router = useRouter();
  const { user } = useUser();
  const [toast, showToast] = useToast();
  const [vendor, setVendor] = useState<VendorDetail | null>(null);
  const [loading, setLoading] = useState(true);

  // Review state
  const [myRating,  setMyRating]  = useState(0);
  const [myComment, setMyComment] = useState("");
  const [hovering,  setHovering]  = useState(0);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch(`/api/vendors/${vendorId}`)
      .then((r) => r.json())
      .then((d) => { setVendor(d.vendor ?? null); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [vendorId]);

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
      showToast("Review submitted ✓", "ok");
      setMyRating(0); setMyComment("");
      // Reload vendor to reflect new review + updated rating
      const v = await fetch(`/api/vendors/${vendorId}`).then((r) => r.json());
      setVendor(v.vendor ?? null);
    } catch { showToast("Network error", "err"); }
    finally { setSubmitting(false); }
  };

  if (loading) return <div style={{ paddingTop: 120, textAlign: "center", color: "var(--ink3)" }}>Loading…</div>;
  if (!vendor)  return <div style={{ paddingTop: 120, textAlign: "center", color: "var(--ink3)" }}>Vendor not found.</div>;

  const fullName = `${vendor.user.firstName} ${vendor.user.lastName}`;
  const myReview = vendor.reviews.find((r) => r.reviewer.firstName + r.reviewer.lastName === (user ? user.firstName + user.lastName : ""));

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", paddingBottom: 120 }}>
      {toast && <Toast msg={toast.msg} type={toast.type} />}

      {/* Hero */}
      <div style={{ height: 160, background: "linear-gradient(135deg,var(--acc) 0%,#92400e 100%)", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: -40, right: -40, width: 200, height: 200, borderRadius: "50%", background: "rgba(255,255,255,.07)" }} />
        <button onClick={() => router.back()} style={{ position: "absolute", top: 16, left: 16, background: "rgba(0,0,0,.3)", border: "none", borderRadius: "50%", width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
          <IconChevL style={{ width: 20, height: 20, color: "#fff" }} />
        </button>
        <div style={{ position: "absolute", top: 14, right: 16, display: "flex", gap: 8 }}>
          {vendor.verified && <span style={{ background: "rgba(0,0,0,.3)", color: "#fff", fontSize: 11, fontWeight: 700, padding: "4px 10px", borderRadius: 999 }}>✓ Verified</span>}
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
        <h2 style={{ fontSize: 24, fontWeight: 800, letterSpacing: "-.02em" }}>{fullName}</h2>
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
          { label: "Rating",    value: vendor.rating > 0 ? vendor.rating.toFixed(1) : "New", icon: "⭐", color: "#f59e0b" },
          { label: "Reviews",   value: String(vendor.reviewCount), icon: "💬", color: "var(--acc)" },
          { label: "Completed", value: String(vendor.completedBookings), icon: "✅", color: "var(--green)" },
        ].map((s) => (
          <div key={s.label} style={{ flex: 1, background: "var(--card)", border: "1px solid var(--border)", borderRadius: 14, padding: "12px 8px", textAlign: "center" }}>
            <span style={{ fontSize: 18 }}>{s.icon}</span>
            <p style={{ fontSize: 16, fontWeight: 800, color: s.color, marginTop: 4 }}>{s.value}</p>
            <p style={{ fontSize: 10, color: "var(--ink3)", fontWeight: 700, marginTop: 2, textTransform: "uppercase", letterSpacing: ".05em" }}>{s.label}</p>
          </div>
        ))}
      </div>

      <div style={{ padding: "16px 20px 0", display: "flex", flexDirection: "column", gap: 14 }}>

        {/* Bio */}
        {vendor.bio && (
          <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 18, padding: "18px 20px" }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: "var(--ink3)", textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 10 }}>About</p>
            <p style={{ fontSize: 14, color: "var(--ink)", lineHeight: 1.7 }}>{vendor.bio}</p>
          </div>
        )}

        {/* Skills */}
        {vendor.skills.length > 0 && (
          <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 18, padding: "18px 20px" }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: "var(--ink3)", textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 12 }}>Skills</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {vendor.skills.map((s) => (
                <span key={s} style={{ padding: "5px 12px", borderRadius: 999, background: "var(--acc-bg)", border: "1px solid var(--acc-bd)", fontSize: 12, fontWeight: 600, color: "var(--acc)" }}>{s}</span>
              ))}
            </div>
          </div>
        )}

        {/* Services */}
        {vendor.services.length > 0 && (
          <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 18, overflow: "hidden" }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: "var(--ink3)", textTransform: "uppercase", letterSpacing: ".06em", padding: "18px 20px 10px" }}>Services & Pricing</p>
            {vendor.services.map((svc, i) => (
              <div key={svc.id} style={{ padding: "12px 20px", borderTop: i > 0 ? "1px solid var(--border)" : undefined, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <p style={{ fontWeight: 700, fontSize: 14 }}>{svc.name}</p>
                  {svc.desc && <p style={{ fontSize: 12, color: "var(--ink3)", marginTop: 2 }}>{svc.desc}</p>}
                </div>
                <p style={{ fontWeight: 800, fontSize: 15, color: "var(--acc)", whiteSpace: "nowrap" }}>P{svc.price}/{svc.unit}</p>
              </div>
            ))}
          </div>
        )}

        {/* Reviews list */}
        <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 18, overflow: "hidden" }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: "var(--ink3)", textTransform: "uppercase", letterSpacing: ".06em", padding: "18px 20px 12px" }}>
            Reviews ({vendor.reviews.length})
          </p>
          {vendor.reviews.length === 0
            ? <p style={{ padding: "0 20px 18px", fontSize: 13, color: "var(--ink3)" }}>No reviews yet. Be the first!</p>
            : vendor.reviews.map((rv, i) => (
              <div key={rv.id} style={{ padding: "14px 20px", borderTop: i > 0 ? "1px solid var(--border)" : undefined }}>
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
        </div>

        {/* Leave a review (customer only) */}
        {user?.role === "customer" && (
          <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 18, padding: "18px 20px" }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: "var(--ink3)", textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 14 }}>
              {myReview ? "Update Your Review" : "Leave a Review"}
            </p>
            {/* Star picker */}
            <div style={{ display: "flex", gap: 6, marginBottom: 14 }}>
              {[1,2,3,4,5].map((n) => (
                <button
                  key={n}
                  onMouseEnter={() => setHovering(n)}
                  onMouseLeave={() => setHovering(0)}
                  onClick={() => setMyRating(n)}
                  style={{ background: "none", border: "none", cursor: "pointer", fontSize: 28, lineHeight: 1, color: n <= (hovering || myRating) ? "#f59e0b" : "var(--border2)", transition: "color .15s" }}
                >★</button>
              ))}
              {myRating > 0 && <span style={{ alignSelf: "center", fontSize: 13, color: "var(--ink3)", marginLeft: 4 }}>{["", "Poor", "Fair", "Good", "Great", "Excellent"][myRating]}</span>}
            </div>
            <textarea
              className="field"
              rows={3}
              placeholder="Share your experience (optional)…"
              value={myComment}
              onChange={(e) => setMyComment(e.target.value)}
              style={{ resize: "vertical" }}
            />
            <button
              onClick={submitReview}
              disabled={submitting || !myRating}
              className="btn-pri"
              style={{ width: "100%", marginTop: 12, padding: 14, fontSize: 14, opacity: (!myRating || submitting) ? 0.6 : 1 }}
            >
              {submitting ? "Submitting…" : "Submit Review"}
            </button>
          </div>
        )}
      </div>

      {/* Book Now sticky footer */}
      <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, padding: "12px 20px 28px", background: "var(--bg)", borderTop: "1px solid var(--border)" }}>
        <button
          className="btn-pri"
          style={{ width: "100%", padding: 16, fontSize: 16, fontWeight: 700, borderRadius: 14 }}
          onClick={() => router.push(`/customer/book/${vendorId}`)}
        >
          Book {fullName.split(" ")[0]}
        </button>
      </div>
    </div>
  );
}
