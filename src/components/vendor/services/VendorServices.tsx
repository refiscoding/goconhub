"use client";
import { FC, useState, useEffect } from "react";
import { IconPlus } from "@/components/icons";
import { Toast, PageSpinner } from "@/components/ui";
import { useToast } from "@/hooks/useToast";
import { ServiceCard } from "./ServiceCard";
import { ServiceForm } from "./ServiceForm";
import type { VendorService, ServiceDraft } from "@/lib/types";

interface ApiService {
  id: string;
  name: string;
  price: number;
  unit: "hr" | "job" | "day";
  desc: string;
  active: boolean;
}

// We need a way to map string IDs back; store a parallel map
const EMPTY_DRAFT: ServiceDraft = { id: 0, name: "", price: "", unit: "hr", desc: "", active: true };

export const VendorServices: FC = () => {
  const [apiServices, setApiServices] = useState<ApiService[]>([]);
  const [services,    setServices]    = useState<VendorService[]>([]);
  const [editing,     setEditing]     = useState<number | null>(null);
  const [editDraft,   setEditDraft]   = useState<ServiceDraft>(EMPTY_DRAFT);
  const [adding,      setAdding]      = useState(false);
  const [newDraft,    setNewDraft]    = useState<ServiceDraft>(EMPTY_DRAFT);
  const [loading,     setLoading]     = useState(true);
  const [toast, showToast] = useToast();

  const loadServices = () => {
    setLoading(true);
    fetch("/api/services")
      .then((r) => r.json())
      .then((data) => {
        const api: ApiService[] = data.services ?? [];
        setApiServices(api);
        setServices(api.map((s, i) => ({ id: i, name: s.name, price: s.price, unit: s.unit, desc: s.desc, active: s.active })));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadServices(); }, []);

  const getApiId = (localId: number) => apiServices[localId]?.id;

  const toggle = async (localId: number) => {
    const apiId = getApiId(localId);
    const svc   = services.find((s) => s.id === localId);
    if (!apiId || !svc) return;
    await fetch(`/api/services/${apiId}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ active: !svc.active }) });
    setApiServices((prev) => prev.map((s, i) => i === localId ? { ...s, active: !s.active } : s));
    setServices((prev) => prev.map((s) => s.id === localId ? { ...s, active: !s.active } : s));
  };

  const del = async (localId: number) => {
    const apiId = getApiId(localId);
    if (!apiId) return;
    await fetch(`/api/services/${apiId}`, { method: "DELETE" });
    setApiServices((prev) => prev.filter((_, i) => i !== localId));
    setServices((prev) => prev.filter((s) => s.id !== localId));
    showToast("Service deleted", "ok");
  };

  const addSave = async () => {
    if (!newDraft.name.trim()) { showToast("Service name is required", "err"); return; }
    if (!newDraft.price || Number(newDraft.price) <= 0) { showToast("Enter a valid price", "err"); return; }
    try {
      const res  = await fetch("/api/services", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newDraft.name.trim(), price: Number(newDraft.price), unit: newDraft.unit, desc: newDraft.desc, active: true }),
      });
      const data = await res.json();
      if (res.ok) {
        setAdding(false);
        setNewDraft(EMPTY_DRAFT);
        showToast("Service added ✓", "ok");
        loadServices();
      } else {
        showToast(data.message ?? "Failed to add service", "err");
      }
    } catch {
      showToast("Network error. Please try again.", "err");
    }
  };

  const startEdit = (localId: number) => {
    const svc = services.find((s) => s.id === localId);
    if (!svc) return;
    setEditDraft({ id: svc.id, name: svc.name, price: String(svc.price), unit: svc.unit, desc: svc.desc, active: svc.active });
    setEditing(localId);
  };

  const editSave = async () => {
    const apiId = getApiId(editDraft.id);
    if (!apiId) return;
    await fetch(`/api/services/${apiId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: editDraft.name, price: Number(editDraft.price), unit: editDraft.unit, desc: editDraft.desc }),
    });
    setEditing(null);
    showToast("Saved ✓", "ok");
    loadServices();
  };

  return (
    <div style={{ paddingBottom: 88 }}>
      {toast && <Toast msg={toast.msg} type={toast.type} />}

      <div style={{ background: "var(--bg2)", borderBottom: "1px solid var(--border)", padding: "52px 22px 18px", display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
        <div>
          <h1 className="serif" style={{ fontSize: 26, letterSpacing: "-.02em" }}>My Services</h1>
          <p style={{ fontSize: 13, color: "var(--ink2)", marginTop: 4 }}>
            {loading ? <PageSpinner inline /> : `${services.filter((s) => s.active).length}/${services.length} active`}
          </p>
        </div>
        <button onClick={() => setAdding(true)}
          style={{ display: "flex", alignItems: "center", gap: 6, background: "var(--acc)", color: "var(--bg)", border: "none", borderRadius: 10, padding: "10px 16px", fontSize: 13, fontWeight: 700 }}>
          <IconPlus style={{ width: 15, height: 15 }} /> Add
        </button>
      </div>

      <div style={{ padding: "16px 22px", display: "flex", flexDirection: "column", gap: 12 }}>
        {adding && (
          <div className="card pop-enter" style={{ padding: 18 }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: "var(--acc)", textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 12 }}>New Service</p>
            <ServiceForm
              draft={newDraft}
              onChange={(k, v) => setNewDraft((d) => ({ ...d, [k]: v }))}
              onSave={addSave}
              onCancel={() => setAdding(false)}
            />
          </div>
        )}

        {services.map((svc) =>
          editing === svc.id ? (
            <div key={svc.id} className="card" style={{ padding: 16 }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: "var(--acc)", textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 12 }}>Editing</p>
              <ServiceForm
                draft={editDraft}
                onChange={(k, v) => setEditDraft((d) => ({ ...d, [k]: v }))}
                onSave={editSave}
                onCancel={() => setEditing(null)}
              />
            </div>
          ) : (
            <ServiceCard key={svc.id} service={svc} onToggle={toggle} onEdit={startEdit} onDelete={del} />
          )
        )}

        {!loading && services.length === 0 && !adding && (
          <div style={{ textAlign: "center", padding: "48px 0", color: "var(--ink3)" }}>
            <p style={{ fontSize: 32, marginBottom: 8 }}>🛠️</p>
            <p style={{ fontWeight: 600 }}>No services yet</p>
            <p style={{ fontSize: 13, marginTop: 4 }}>Tap Add to list your first service</p>
          </div>
        )}
      </div>
    </div>
  );
};
