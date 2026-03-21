"use client";
import { FC, useState } from "react";
import { useRouter } from "next/navigation";
import { IconChevL } from "@/components/icons";
import { ProgressBar } from "@/components/ui";
import { StepService }  from "./StepService";
import { StepDateTime } from "./StepDateTime";
import { StepConfirm }  from "./StepConfirm";
import { StepSuccess }  from "./StepSuccess";
import type { Vendor, BookingSelection } from "@/lib/types";

interface BookingFlowProps { vendor: Vendor; }

const TOTAL_STEPS = 3;

export const BookingFlow: FC<BookingFlowProps> = ({ vendor }) => {
  const router = useRouter();
  const [step,      setStep]      = useState(0);
  const [sel,       setSel]       = useState<BookingSelection>({ service: null, date: null, time: null, note: "", issueDesc: "", photos: [] });
  const [busy,      setBusy]      = useState(false);
  const [bookingId, setBookingId] = useState<string | null>(null);
  const [error,     setError]     = useState("");

  const canContinue =
    (step === 0 && !!sel.service) ||
    (step === 1 && !!sel.date && !!sel.time) ||
    (step === 2 && sel.issueDesc.length >= 50);

  const confirm = async () => {
    if (busy) return;
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vendorId:    vendor.id,
          serviceName: sel.service!.name,
          date:        sel.date!.label,
          time:        sel.time!,
          location:    vendor.loc,
          note:        sel.note,
          issueDesc:   sel.issueDesc,
          amount:      sel.service!.price,
        }),
      });
      if (!res.ok) {
        const d = await res.json();
        setError(d.message ?? "Failed to create booking");
        return;
      }
      const data = await res.json();
      setBookingId(data.booking.id);
      setStep(3);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  if (step === 3) {
    return (
      <div data-theme="customer" style={{ maxWidth: 430, margin: "0 auto" }}>
        <StepSuccess vendor={vendor} selection={sel} bookingId={bookingId} onDone={() => router.push("/customer/explore")} />
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", flexDirection: "column" }}>
      <div style={{ background: "var(--bg)", borderBottom: "1px solid var(--border)", padding: "52px 22px 16px", display: "flex", alignItems: "center", gap: 14, position: "sticky", top: 0, zIndex: 50 }}>
        <button className="back-btn" onClick={step === 0 ? () => router.back() : () => setStep((s) => s - 1)}>
          <IconChevL style={{ width: 22, height: 22 }} />
        </button>
        <ProgressBar step={step + 1} total={TOTAL_STEPS} />
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "20px 22px 120px" }}>
        {step === 0 && <StepService  vendor={vendor} selected={sel.service} onSelect={(s) => setSel((p) => ({ ...p, service: s }))} />}
        {step === 1 && <StepDateTime selectedDate={sel.date} selectedTime={sel.time} onSelectDate={(d) => setSel((p) => ({ ...p, date: d }))} onSelectTime={(t) => setSel((p) => ({ ...p, time: t }))} />}
        {step === 2 && <StepConfirm  vendor={vendor} selection={sel} onNoteChange={(n) => setSel((p) => ({ ...p, note: n }))} onIssueDescChange={(d) => setSel((p) => ({ ...p, issueDesc: d }))} onPhotosChange={(f) => setSel((p) => ({ ...p, photos: f }))} />}
      </div>

      {error && (
        <div style={{ position: "fixed", top: 80, left: "50%", transform: "translateX(-50%)", width: "calc(100% - 44px)", maxWidth: 386, background: "var(--red-bg)", border: "1px solid rgba(239,68,68,.3)", borderRadius: 10, padding: "11px 14px", fontSize: 13, color: "var(--red)", fontWeight: 600, zIndex: 99 }}>
          {error}
        </div>
      )}

      <div style={{ position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: 430, padding: "14px 22px 28px", background: "rgba(250,247,242,.95)", backdropFilter: "blur(12px)", borderTop: "1px solid var(--border)" }}>
        <button className="btn-pri" disabled={!canContinue || busy} style={{ opacity: (canContinue && !busy) ? 1 : 0.5 }}
          onClick={() => {
            if (!canContinue || busy) return;
            if (step === 2) confirm();
            else setStep((s) => s + 1);
          }}>
          {step === 2 ? (busy ? "Booking…" : "Confirm Booking →") : "Continue →"}
        </button>
      </div>
    </div>
  );
};
