"use client";
import { FC, useState, useEffect, useCallback, ChangeEvent } from "react";
import { Toast, PageSpinner } from "@/components/ui";
import { useToast } from "@/hooks/useToast";
import { IconSearch, IconShop, IconPackage } from "@/components/icons";
import { fmtPrice } from "@/lib/fmt";

interface ApiListing {
  id: string;
  title: string;
  desc: string;
  price: number;
  condition: string;
  photos: string[];
  status: string;
  createdAt: string;
  vendor: { user: { firstName: string; lastName: string; avatarUrl: string | null } };
}

interface BuyModalProps {
  listing: ApiListing;
  onClose: () => void;
  onDone: () => void;
}

// ── Image lightbox ────────────────────────────────────────────────────────────
const ImageLightbox: FC<{ photos: string[]; startIndex: number; onClose: () => void }> = ({
  photos, startIndex, onClose,
}) => {
  const [idx, setIdx] = useState(startIndex);

  const prev = useCallback(() => setIdx((i) => (i - 1 + photos.length) % photos.length), [photos.length]);
  const next = useCallback(() => setIdx((i) => (i + 1) % photos.length), [photos.length]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft")  prev();
      if (e.key === "ArrowRight") next();
      if (e.key === "Escape")     onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [prev, next, onClose]);

  return (
    <div
      onClick={onClose}
      style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.88)", zIndex: 2000,
        display: "flex", alignItems: "center", justifyContent: "center" }}>

      {/* Main image */}
      <img
        src={photos[idx]}
        alt={`Photo ${idx + 1}`}
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: "90vw", maxHeight: "80vh", objectFit: "contain", borderRadius: 10,
          boxShadow: "0 8px 48px rgba(0,0,0,.6)", userSelect: "none" }}
      />

      {/* Close */}
      <button onClick={onClose}
        style={{ position: "absolute", top: 16, right: 16, background: "rgba(255,255,255,.12)",
          border: "none", borderRadius: 999, width: 36, height: 36, color: "#fff", fontSize: 18,
          cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
        ✕
      </button>

      {/* Prev / Next */}
      {photos.length > 1 && (
        <>
          <button onClick={(e) => { e.stopPropagation(); prev(); }}
            style={{ position: "absolute", left: 16, background: "rgba(255,255,255,.12)",
              border: "none", borderRadius: 999, width: 40, height: 40, color: "#fff", fontSize: 20,
              cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
            ‹
          </button>
          <button onClick={(e) => { e.stopPropagation(); next(); }}
            style={{ position: "absolute", right: 16, background: "rgba(255,255,255,.12)",
              border: "none", borderRadius: 999, width: 40, height: 40, color: "#fff", fontSize: 20,
              cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
            ›
          </button>
        </>
      )}

      {/* Dot indicators */}
      {photos.length > 1 && (
        <div style={{ position: "absolute", bottom: 20, display: "flex", gap: 6 }}>
          {photos.map((_, i) => (
            <div key={i} onClick={(e) => { e.stopPropagation(); setIdx(i); }}
              style={{ width: i === idx ? 20 : 7, height: 7, borderRadius: 999,
                background: i === idx ? "#fff" : "rgba(255,255,255,.35)",
                cursor: "pointer", transition: "all .2s" }} />
          ))}
        </div>
      )}

      {/* Counter */}
      {photos.length > 1 && (
        <div style={{ position: "absolute", top: 20, left: "50%", transform: "translateX(-50%)",
          background: "rgba(0,0,0,.45)", color: "#fff", fontSize: 12, fontWeight: 600,
          padding: "4px 10px", borderRadius: 999 }}>
          {idx + 1} / {photos.length}
        </div>
      )}
    </div>
  );
};

// ── Buy modal ─────────────────────────────────────────────────────────────────
const BuyModal: FC<BuyModalProps> = ({ listing, onClose, onDone }) => {
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [err,  setErr]  = useState("");
  const [done, setDone] = useState(false);

  const submit = async () => {
    setBusy(true);
    setErr("");
    try {
      const res = await fetch(`/api/listings/${listing.id}/buy`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ note }),
      });
      const data = await res.json();
      if (!res.ok) { setErr(data.message ?? "Failed to submit request."); return; }
      setDone(true);
      setTimeout(() => { onDone(); onClose(); }, 2000);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.45)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
      <div className="card" style={{ width: "100%", maxWidth: 420, padding: 24, display: "flex", flexDirection: "column", gap: 16 }}>
        {done ? (
          <div style={{ textAlign: "center", padding: "16px 0" }}>
            <div style={{ fontSize: 36, marginBottom: 10 }}>✅</div>
            <p style={{ fontWeight: 700, fontSize: 16, color: "var(--ink)" }}>Request submitted!</p>
            <p style={{ fontSize: 13, color: "var(--ink2)", marginTop: 4 }}>The admin will review and contact you.</p>
          </div>
        ) : (
          <>
            <div>
              <h3 style={{ fontWeight: 800, fontSize: 17, color: "var(--ink)" }}>Buy Request</h3>
              <p style={{ fontSize: 13, color: "var(--ink2)", marginTop: 2 }}>{listing.title}</p>
            </div>

            <div style={{ background: "var(--bg2)", borderRadius: 10, padding: "12px 14px", display: "flex", justifyContent: "space-between" }}>
              <span style={{ fontSize: 13, color: "var(--ink2)" }}>Price</span>
              <span style={{ fontWeight: 800, fontSize: 15, color: "var(--acc)" }}>{fmtPrice(listing.price)}</span>
            </div>

            <div style={{ background: "#fef3c7", borderRadius: 10, padding: "10px 14px", fontSize: 13, color: "#92400e" }}>
              🛡️ Payment will be arranged through HandyHub admin. Do not pay the vendor directly.
            </div>

            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: "var(--ink2)", display: "block", marginBottom: 6 }}>
                Message to admin (optional)
              </label>
              <textarea className="field" placeholder="Any questions or notes about this item…"
                value={note} onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setNote(e.target.value)}
                rows={3} style={{ resize: "none" }} />
            </div>

            {err && <p style={{ fontSize: 13, color: "#dc2626", background: "#fef2f2", borderRadius: 8, padding: "8px 12px" }}>{err}</p>}

            <div style={{ display: "flex", gap: 10 }}>
              <button className="btn-pri" onClick={submit} disabled={busy} style={{ flex: 1, opacity: busy ? 0.7 : 1 }}>
                {busy ? "Submitting…" : "Submit Request →"}
              </button>
              <button className="btn-ghost" onClick={onClose} style={{ flex: 1 }}>Cancel</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

// ── Main page ─────────────────────────────────────────────────────────────────
export const MarketplacePage: FC = () => {
  const [listings, setListings] = useState<ApiListing[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [q,        setQ]        = useState("");
  const [buyItem,  setBuyItem]  = useState<ApiListing | null>(null);
  const [lightbox, setLightbox] = useState<{ photos: string[]; index: number } | null>(null);
  const [toast, showToast] = useToast();

  const load = (search = "") => {
    setLoading(true);
    fetch(`/api/listings${search ? `?q=${encodeURIComponent(search)}` : ""}`)
      .then((r) => r.json())
      .then((d) => setListings(d.listings ?? []))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleSearch = (e: ChangeEvent<HTMLInputElement>) => {
    setQ(e.target.value);
    load(e.target.value);
  };

  const conditionLabel: Record<string, string> = { new: "New", used: "Used — Good", fair: "Used — Fair" };

  return (
    <div>
      {toast && <Toast msg={toast.msg} type={toast.type} />}
      {buyItem && <BuyModal listing={buyItem} onClose={() => setBuyItem(null)} onDone={() => showToast("Request sent", "ok")} />}
      {lightbox && <ImageLightbox photos={lightbox.photos} startIndex={lightbox.index} onClose={() => setLightbox(null)} />}

      {/* Header */}
      <div style={{ marginBottom: 18, padding: "20px 20px 0" }}>
        <h1 style={{ fontSize: 20, fontWeight: 800, color: "var(--ink)", letterSpacing: "-.02em" }}>Marketplace</h1>
        <p style={{ fontSize: 12.5, color: "var(--ink2)", marginTop: 2 }}>Equipment &amp; tools for sale by local handymen</p>
      </div>

      {/* Search */}
      <div style={{ position: "relative", margin: "0 20px 18px" }}>
        <IconSearch style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", width: 14, height: 14, color: "var(--ink3)" }} />
        <input className="field" placeholder="Search listings…" value={q} onChange={handleSearch}
          style={{ paddingLeft: 36 }} />
      </div>

      <div style={{ padding: "0 16px" }}>
        {loading ? (
          <PageSpinner paddingY="50px" />
        ) : listings.length === 0 ? (
          <div style={{ textAlign: "center", padding: "50px 0", color: "var(--ink2)" }}>
            <IconShop style={{ width: 36, height: 36, margin: "0 auto 10px", opacity: 0.3 }} />
            <p style={{ fontWeight: 600, fontSize: 14 }}>No listings available</p>
            <p style={{ fontSize: 12.5, marginTop: 3 }}>Check back later — handymen post equipment here.</p>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 12, paddingBottom: 24 }}>
            {listings.map((l) => (
              <div key={l.id} className="card" style={{ overflow: "hidden", display: "flex", flexDirection: "column" }}>

                {/* Photo strip — clickable to open lightbox */}
                {l.photos.length > 0 ? (
                  <div style={{ position: "relative" }}>
                    <img
                      src={l.photos[0]}
                      alt={l.title}
                      onClick={() => setLightbox({ photos: l.photos, index: 0 })}
                      style={{ width: "100%", height: 130, objectFit: "cover", cursor: "zoom-in", display: "block" }}
                    />
                    {l.photos.length > 1 && (
                      <span style={{ position: "absolute", bottom: 6, right: 7, background: "rgba(0,0,0,.55)",
                        color: "#fff", fontSize: 10, fontWeight: 700, padding: "2px 7px", borderRadius: 999 }}>
                        +{l.photos.length - 1} more
                      </span>
                    )}
                  </div>
                ) : (
                  <div style={{ width: "100%", height: 130, background: "var(--bg2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <IconPackage style={{ width: 30, height: 30, color: "var(--ink3)" }} />
                  </div>
                )}

                <div style={{ padding: "11px 12px", display: "flex", flexDirection: "column", gap: 6, flex: 1 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 6 }}>
                    <p style={{ fontWeight: 700, fontSize: 13.5, color: "var(--ink)", lineHeight: 1.3 }}>{l.title}</p>
                    <span style={{ fontSize: 10, background: "#f0fdf4", color: "#166534", fontWeight: 700, padding: "2px 6px", borderRadius: 999, flexShrink: 0 }}>
                      {conditionLabel[l.condition] ?? l.condition}
                    </span>
                  </div>

                  {l.desc && (
                    <p style={{ fontSize: 12, color: "var(--ink2)", lineHeight: 1.5, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                      {l.desc}
                    </p>
                  )}

                  <div style={{ fontSize: 11.5, color: "var(--ink3)" }}>
                    By {l.vendor.user.firstName} {l.vendor.user.lastName}
                  </div>

                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "auto", paddingTop: 8 }}>
                    <span style={{ fontWeight: 800, fontSize: 13, color: "var(--acc)" }}>{fmtPrice(l.price)}</span>
                    <button className="btn-pri"
                      style={{ padding: "8px 0", fontSize: 12.5, width: 120, maxWidth: "none", flexShrink: 0 }}
                      onClick={() => setBuyItem(l)}>
                      Buy
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
