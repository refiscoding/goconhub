"use client";
import { FC, useState, useEffect, useRef, ChangeEvent } from "react";
import { Toast, PageSpinner } from "@/components/ui";
import { useToast } from "@/hooks/useToast";
import { IconPlus, IconTrash, IconEdit, IconCheck, IconX, IconPackage, IconCamera } from "@/components/icons";
import { fmtPrice } from "@/lib/fmt";

const MAX_PHOTOS = 4;

interface ApiListing {
  id: string;
  title: string;
  desc: string;
  price: number;
  condition: string;
  photos: string[];
  status: string;
  createdAt: string;
}

interface FormState {
  title: string;
  desc: string;
  price: string;
  condition: string;
}

const EMPTY_FORM: FormState = { title: "", desc: "", price: "", condition: "used" };

// Compress + resize to base64 JPEG (max 700px, 72% quality ≈ ~80–150KB per image)
function compressImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      const MAX = 700;
      let { width, height } = img;
      if (width > MAX || height > MAX) {
        if (width > height) { height = Math.round((height * MAX) / width); width = MAX; }
        else                { width  = Math.round((width  * MAX) / height); height = MAX; }
      }
      const canvas = document.createElement("canvas");
      canvas.width = width; canvas.height = height;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL("image/jpeg", 0.72));
    };
    img.onerror = reject;
    img.src = url;
  });
}

// ── Multi-photo picker ────────────────────────────────────────────────────────
const PhotoPicker: FC<{
  photos: string[];
  compressing: boolean;
  onAdd: (files: FileList) => void;
  onRemove: (index: number) => void;
}> = ({ photos, compressing, onAdd, onRemove }) => {
  const ref = useRef<HTMLInputElement>(null);
  const remaining = MAX_PHOTOS - photos.length;

  return (
    <div>
      {/* Thumbnails row */}
      {photos.length > 0 && (
        <div style={{ display: "flex", gap: 10, marginBottom: 12, flexWrap: "wrap" }}>
          {photos.map((src, i) => (
            <div key={i} style={{ position: "relative", width: 80, height: 80, borderRadius: 10, overflow: "hidden", flexShrink: 0 }}>
              <img src={src} alt={`photo ${i + 1}`} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              <button
                onClick={() => onRemove(i)}
                style={{ position: "absolute", top: 4, right: 4, background: "rgba(0,0,0,.6)", border: "none", borderRadius: 999, width: 22, height: 22, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#fff" }}>
                <IconX style={{ width: 11, height: 11 }} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Add button — hidden when at max */}
      {remaining > 0 && (
        <button type="button" onClick={() => ref.current?.click()}
          disabled={compressing}
          style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", padding: "14px 16px", borderRadius: 12, border: "1.5px dashed var(--border)", background: "var(--bg2)", cursor: compressing ? "wait" : "pointer", color: "var(--ink2)", fontSize: 13, fontWeight: 600, opacity: compressing ? 0.6 : 1 }}>
          <IconCamera style={{ width: 18, height: 18 }} />
          {compressing ? "Processing…" : photos.length === 0 ? `Add up to ${MAX_PHOTOS} photos` : `Add more (${remaining} remaining)`}
        </button>
      )}

      <input
        ref={ref}
        type="file"
        accept="image/*"
        multiple
        style={{ display: "none" }}
        onChange={(e) => { if (e.target.files?.length) onAdd(e.target.files); e.target.value = ""; }}
      />
    </div>
  );
};

// ── Main component ────────────────────────────────────────────────────────────
export const VendorListings: FC = () => {
  const [listings, setListings] = useState<ApiListing[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [adding,   setAdding]   = useState(false);
  const [editId,   setEditId]   = useState<string | null>(null);
  const [form,     setForm]     = useState<FormState>(EMPTY_FORM);
  const [photos,   setPhotos]   = useState<string[]>([]);
  const [compressing, setCompressing] = useState(false);
  const [busy,     setBusy]     = useState(false);
  const [toast, showToast] = useToast();

  useEffect(() => { reload(); }, []);

  const reload = () => {
    setLoading(true);
    fetch("/api/listings?mine=1")
      .then((r) => r.json())
      .then((d) => setListings(d.listings ?? []))
      .finally(() => setLoading(false));
  };

  const field = (k: keyof FormState) => (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const addPhotos = async (files: FileList) => {
    const slots = MAX_PHOTOS - photos.length;
    if (slots <= 0) return;
    const picked = Array.from(files).slice(0, slots);
    setCompressing(true);
    try {
      const compressed = await Promise.all(picked.map(compressImage));
      setPhotos((prev) => [...prev, ...compressed].slice(0, MAX_PHOTOS));
    } catch {
      showToast("Failed to process one or more images", "err");
    } finally {
      setCompressing(false);
    }
  };

  const removePhoto = (index: number) =>
    setPhotos((prev) => prev.filter((_, i) => i !== index));

  const resetForm = () => {
    setForm(EMPTY_FORM);
    setPhotos([]);
    setAdding(false);
    setEditId(null);
  };

  const save = async () => {
    if (!form.title.trim() || !form.price || Number(form.price) <= 0) {
      showToast("Title and valid price are required.", "err"); return;
    }
    setBusy(true);
    try {
      const photoList = photos;
      const body = {
        title:     form.title.trim(),
        desc:      form.desc.trim(),
        price:     Number(form.price),
        condition: form.condition,
        photos:    photoList,
      };

      if (editId) {
        const res  = await fetch(`/api/listings/${editId}`, {
          method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) { showToast(data.message ?? "Failed to update", "err"); return; }
        showToast("Listing updated ✓", "ok");
      } else {
        const res  = await fetch("/api/listings", {
          method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) { showToast(data.message ?? "Failed to create", "err"); return; }
        showToast("Listing posted ✓", "ok");
      }
      resetForm();
      reload();
    } finally {
      setBusy(false);
    }
  };

  const startEdit = (l: ApiListing) => {
    setEditId(l.id);
    setAdding(false);
    setForm({ title: l.title, desc: l.desc, price: String(l.price), condition: l.condition });
    setPhotos(l.photos.slice(0, MAX_PHOTOS));
  };

  const remove = async (id: string) => {
    await fetch(`/api/listings/${id}`, { method: "DELETE" });
    showToast("Listing removed", "ok");
    reload();
  };

  const markSold = async (id: string) => {
    await fetch(`/api/listings/${id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: "sold" }),
    });
    showToast("Marked as sold ✓", "ok");
    reload();
  };

  const statusBadge = (s: string) => {
    const map: Record<string, { bg: string; color: string; label: string }> = {
      active:  { bg: "#dcfce7", color: "#166534", label: "Active"  },
      sold:    { bg: "#fef3c7", color: "#92400e", label: "Sold"    },
      removed: { bg: "#fee2e2", color: "#991b1b", label: "Removed" },
    };
    const c = map[s] ?? map.active;
    return (
      <span style={{ fontSize: 11, fontWeight: 700, background: c.bg, color: c.color, padding: "2px 8px", borderRadius: 999 }}>
        {c.label}
      </span>
    );
  };

  return (
    <div style={{ padding: "18px 20px 28px" }}>
      {toast && <Toast msg={toast.msg} type={toast.type} />}

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
        <div>
          <h1 style={{ fontSize: 18, fontWeight: 800, color: "var(--ink)", letterSpacing: "-.02em" }}>My Listings</h1>
          <p style={{ fontSize: 12, color: "var(--ink2)", marginTop: 2 }}>Equipment &amp; items for sale</p>
        </div>
        {!adding && !editId && (
          <button className="btn-pri" style={{ display: "flex", alignItems: "center", gap: 6, padding: "9px 14px", fontSize: 12.5, maxWidth: "none", width: "auto" }}
            onClick={() => { setAdding(true); resetForm(); setAdding(true); }}>
            <IconPlus style={{ width: 14, height: 14 }} /> New Listing
          </button>
        )}
      </div>

      {/* Add / Edit form */}
      {(adding || editId) && (
        <div className="card" style={{ marginBottom: 18, padding: 16, display: "flex", flexDirection: "column", gap: 12 }}>
          <p style={{ fontWeight: 700, fontSize: 13.5, color: "var(--ink)" }}>{editId ? "Edit Listing" : "New Listing"}</p>

          <input className="field" placeholder="Title (e.g. DeWalt drill, ladder, tile saw)"
            value={form.title} onChange={field("title")} />

          <textarea className="field" placeholder="Description — condition details, specs, reason for selling…"
            value={form.desc} onChange={field("desc")} rows={3} style={{ resize: "vertical" }} />

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <input className="field" type="number" placeholder="Price (BWP)" min={1}
              value={form.price} onChange={field("price")} />
            <select className="field" value={form.condition} onChange={field("condition")}>
              <option value="new">New</option>
              <option value="used">Used — Good</option>
              <option value="fair">Used — Fair</option>
            </select>
          </div>

          {/* Photo upload — multi-select, max 4 */}
          <div>
            <p style={{ fontSize: 11.5, fontWeight: 600, color: "var(--ink2)", marginBottom: 7 }}>
              Photos <span style={{ fontWeight: 400, color: "var(--ink3)" }}>(up to {MAX_PHOTOS})</span>
            </p>
            <PhotoPicker photos={photos} compressing={compressing} onAdd={addPhotos} onRemove={removePhoto} />
          </div>

          <div style={{ display: "flex", gap: 10 }}>
            <button className="btn-pri" onClick={save} disabled={busy || compressing}
              style={{ flex: 1, opacity: (busy || compressing) ? 0.7 : 1 }}>
              {busy ? "Saving…" : editId ? "Save Changes" : "Post Listing"}
            </button>
            <button className="btn-ghost" onClick={resetForm} style={{ flex: 1 }}>Cancel</button>
          </div>
        </div>
      )}

      {loading ? (
        <PageSpinner paddingY="50px" />
      ) : listings.length === 0 ? (
        <div style={{ textAlign: "center", padding: "50px 0", color: "var(--ink2)" }}>
          <IconPackage style={{ width: 36, height: 36, margin: "0 auto 10px", opacity: 0.3 }} />
          <p style={{ fontWeight: 600, fontSize: 13 }}>No listings yet</p>
          <p style={{ fontSize: 12, marginTop: 4 }}>Post equipment or items you want to sell.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {listings.map((l) => (
            <div key={l.id} className="card" style={{ padding: "12px 14px", display: "flex", alignItems: "flex-start", gap: 12 }}>
              {/* Photo thumbnail */}
              {l.photos[0] ? (
                <img src={l.photos[0]} alt={l.title} style={{ width: 52, height: 52, borderRadius: 8, objectFit: "cover", flexShrink: 0 }} />
              ) : (
                <div style={{ width: 52, height: 52, borderRadius: 8, background: "var(--bg2)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <IconPackage style={{ width: 20, height: 20, color: "var(--ink3)" }} />
                </div>
              )}

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 7, flexWrap: "wrap" }}>
                  <span style={{ fontWeight: 700, fontSize: 13, color: "var(--ink)" }}>{l.title}</span>
                  {statusBadge(l.status)}
                  {l.photos.length > 0 && (
                    <span style={{ fontSize: 10, color: "var(--ink3)" }}>📷 {l.photos.length}</span>
                  )}
                </div>
                {l.desc && (
                  <p style={{ fontSize: 11.5, color: "var(--ink2)", marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{l.desc}</p>
                )}
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 5, flexWrap: "wrap" }}>
                  <span style={{ fontWeight: 800, fontSize: 13, color: "var(--acc)" }}>{fmtPrice(l.price)}</span>
                  <span style={{ fontSize: 11, color: "var(--ink3)", textTransform: "capitalize" }}>{l.condition.replace("-", " ")}</span>
                  <span style={{ fontSize: 10.5, color: "var(--ink3)" }}>{new Date(l.createdAt).toLocaleDateString("en-GB")}</span>
                </div>
              </div>

              {/* Actions */}
              <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                {l.status === "active" && (
                  <>
                    <button onClick={() => startEdit(l)} title="Edit"
                      style={{ background: "var(--bg2)", border: "none", borderRadius: 7, padding: "6px 8px", cursor: "pointer", color: "var(--ink2)" }}>
                      <IconEdit style={{ width: 13, height: 13 }} />
                    </button>
                    <button onClick={() => markSold(l.id)} title="Mark as sold"
                      style={{ background: "#fef3c7", border: "none", borderRadius: 7, padding: "6px 8px", cursor: "pointer", color: "#92400e" }}>
                      <IconCheck style={{ width: 13, height: 13 }} />
                    </button>
                    <button onClick={() => remove(l.id)} title="Remove"
                      style={{ background: "#fee2e2", border: "none", borderRadius: 7, padding: "6px 8px", cursor: "pointer", color: "#991b1b" }}>
                      <IconTrash style={{ width: 13, height: 13 }} />
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
