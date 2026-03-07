import { FC, ChangeEvent } from "react";
import type { BookingSelection, Vendor } from "@/lib/types";

interface StepConfirmProps {
  vendor: Vendor;
  selection: BookingSelection;
  onNoteChange: (note: string) => void;
}

export const StepConfirm: FC<StepConfirmProps> = ({ vendor, selection, onNoteChange }) => (
  <div className="page-enter" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
    <h2 className="serif" style={{ fontSize: 24, letterSpacing: "-.02em" }}>Confirm booking</h2>

    <div className="card" style={{ padding: 18 }}>
      {([
        ["Vendor",    vendor.name],
        ["Service",   selection.service?.name ?? ""],
        ["Date",      selection.date?.label   ?? ""],
        ["Time",      selection.time           ?? ""],
        ["Location",  vendor.loc],
      ] as [string, string][]).map(([k, v]) => (
        <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid var(--border)", fontSize: 14 }}>
          <span style={{ color: "var(--ink2)" }}>{k}</span>
          <span style={{ fontWeight: 600 }}>{v}</span>
        </div>
      ))}
      <div style={{ display: "flex", justifyContent: "space-between", padding: "12px 0 0", fontSize: 16 }}>
        <span style={{ fontWeight: 700 }}>Estimated Total</span>
        <span style={{ fontWeight: 800, color: "var(--acc)" }}>P{selection.service?.price ?? 0}</span>
      </div>
    </div>

    <div>
      <label style={{ fontSize: 11, fontWeight: 700, color: "var(--ink2)", textTransform: "uppercase", letterSpacing: ".05em", display: "block", marginBottom: 6 }}>
        Notes for vendor (optional)
      </label>
      <textarea className="field" rows={3} placeholder="e.g. Gate code is 1234…"
        value={selection.note}
        onChange={(e: ChangeEvent<HTMLTextAreaElement>) => onNoteChange(e.target.value)} />
    </div>

    <div style={{ background: "var(--acc-bg)", border: "1px solid var(--acc-bd)", borderRadius: 10, padding: "12px 14px", fontSize: 13, color: "var(--acc)" }}>
      ℹ️ Payment is collected after the job is completed.
    </div>
  </div>
);
