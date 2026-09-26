"use client";
import { FC, ChangeEvent, useRef } from "react";
import type { BookingSelection, Vendor } from "@/lib/types";
import { fmtPrice } from "@/lib/fmt";

const MIN_CHARS = 50;
const MAX_CHARS = 500;

interface StepConfirmProps {
  vendor: Vendor;
  selection: BookingSelection;
  onNoteChange: (note: string) => void;
  onIssueDescChange: (desc: string) => void;
  onPhotosChange: (files: File[]) => void;
}

export const StepConfirm: FC<StepConfirmProps> = ({ vendor, selection, onNoteChange, onIssueDescChange, onPhotosChange }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const charCount = selection.issueDesc.length;
  const belowMin = charCount < MIN_CHARS;

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    onPhotosChange(files);
  };

  return (
    <div className="page-enter" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <h2 className="cust-heading" style={{ fontSize: 24 }}>Confirm booking</h2>

      <div className="cust-card" style={{ padding: 18 }}>
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
        <div style={{ display: "flex", justifyContent: "space-between", padding: "12px 0 4px", fontSize: 16 }}>
          <span style={{ fontWeight: 700 }}>Estimated Total</span>
          <span style={{ fontWeight: 800, color: "var(--navy)" }}>{fmtPrice(selection.service?.price ?? 0)}</span>
        </div>
        <p style={{ fontSize: 12, color: "var(--ink3)", marginBottom: 6 }}>Final price may vary depending on inspection and work required.</p>
        <div style={{ background: "var(--navy-soft)", border: "1px solid var(--navy-border)", borderRadius: 12, padding: "10px 14px", fontSize: 13, color: "var(--navy)" }}>
          Payment is securely held by GoCon and released to the contractor only after the job is completed.
        </div>
      </div>

      {/* Structured job prep section */}
      <div className="cust-card" style={{ padding: 18, display: "flex", flexDirection: "column", gap: 14 }}>
        <div>
          <p style={{ fontWeight: 700, fontSize: 15, marginBottom: 2 }}>
            Help the contractor prepare for your job <span style={{ color: "var(--red, #ef4444)", marginLeft: 2 }}>*</span>
          </p>
          <p style={{ fontSize: 12, color: "var(--ink2)" }}>This information is required so your contractor arrives ready.</p>
        </div>

        {/* Describe the issue — required */}
        <div>
          <label style={{ fontSize: 11, fontWeight: 700, color: "var(--ink2)", textTransform: "uppercase", letterSpacing: ".05em", display: "block", marginBottom: 6 }}>
            Describe the issue <span style={{ color: "var(--red, #ef4444)" }}>*</span>
          </label>
          <textarea
            className="field"
            rows={5}
            maxLength={MAX_CHARS}
            placeholder={`Describe what needs to be done, the current condition, and any relevant details. (min ${MIN_CHARS} characters)`}
            value={selection.issueDesc}
            onChange={(e: ChangeEvent<HTMLTextAreaElement>) => onIssueDescChange(e.target.value)}
            style={{ resize: "vertical", borderColor: belowMin && charCount > 0 ? "var(--red, #ef4444)" : undefined }}
          />
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 5, fontSize: 12 }}>
            <span style={{ color: belowMin && charCount > 0 ? "var(--red, #ef4444)" : "var(--ink3)" }}>
              {belowMin && charCount > 0 ? `${MIN_CHARS - charCount} more characters needed` : belowMin ? `Minimum ${MIN_CHARS} characters required` : "Good description"}
            </span>
            <span style={{ color: charCount > MAX_CHARS * 0.9 ? "var(--red, #ef4444)" : "var(--ink3)" }}>
              {charCount}/{MAX_CHARS}
            </span>
          </div>
        </div>

        {/* Upload photos — optional */}
        <div>
          <label style={{ fontSize: 11, fontWeight: 700, color: "var(--ink2)", textTransform: "uppercase", letterSpacing: ".05em", display: "block", marginBottom: 6 }}>
            Upload photos <span style={{ color: "var(--ink3)", fontWeight: 400, textTransform: "none", fontSize: 11 }}>(optional)</span>
          </label>
          <div
            role="button"
            tabIndex={0}
            onClick={() => fileInputRef.current?.click()}
            onKeyDown={(e) => e.key === "Enter" && fileInputRef.current?.click()}
            style={{ background: "var(--bg3)", border: "2px dashed var(--border2, var(--border))", borderRadius: 10, padding: "18px 14px", textAlign: "center", cursor: "pointer", color: "var(--ink2)" }}
          >
            {selection.photos.length > 0 ? (
              <div>
                <p style={{ fontSize: 20, marginBottom: 4 }}>📷</p>
                <p style={{ fontSize: 13, fontWeight: 700, color: "var(--navy)" }}>{selection.photos.length} photo{selection.photos.length > 1 ? "s" : ""} selected</p>
                <p style={{ fontSize: 12, marginTop: 2 }}>Tap to change</p>
              </div>
            ) : (
              <div>
                <p style={{ fontSize: 20, marginBottom: 4 }}>📷</p>
                <p style={{ fontSize: 13, fontWeight: 700 }}>Add photos of the issue</p>
                <p style={{ fontSize: 12, marginTop: 2 }}>Helps the contractor bring the right tools and parts</p>
              </div>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            style={{ display: "none" }}
            onChange={handleFileChange}
          />
        </div>

        {/* Optional extra notes */}
        <div>
          <label style={{ fontSize: 11, fontWeight: 700, color: "var(--ink2)", textTransform: "uppercase", letterSpacing: ".05em", display: "block", marginBottom: 6 }}>
            Additional notes <span style={{ color: "var(--ink3)", fontWeight: 400, textTransform: "none", fontSize: 11 }}>(optional)</span>
          </label>
          <textarea className="field" rows={2} placeholder="e.g. Gate code is 1234, use side entrance…"
            value={selection.note}
            onChange={(e: ChangeEvent<HTMLTextAreaElement>) => onNoteChange(e.target.value)} />
        </div>
      </div>

      <div style={{ background: "#fef3c7", border: "1px solid #fcd34d", borderRadius: 10, padding: "11px 14px", fontSize: 13, color: "#92400e", display: "flex", gap: 8, alignItems: "flex-start" }}>
        <span style={{ flexShrink: 0 }}>🛡️</span>
        <span>For your safety, all payments must be made through GoCon. Payments made outside the platform are not protected.</span>
      </div>
    </div>
  );
};
