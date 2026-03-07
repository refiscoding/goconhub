import { FC, ChangeEvent } from "react";
import type { ServiceDraft } from "@/lib/types";

interface ServiceFormProps {
  draft: ServiceDraft;
  onChange: (k: keyof ServiceDraft, v: string) => void;
  onSave: () => void;
  onCancel: () => void;
}

export const ServiceForm: FC<ServiceFormProps> = ({ draft, onChange, onSave, onCancel }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
    <input className="field" placeholder="Service name" value={draft.name}
      onChange={(e: ChangeEvent<HTMLInputElement>) => onChange("name", e.target.value)} />
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
      <div className="pfx">
        <span className="sym">P</span>
        <input className="field" type="number" placeholder="250" value={draft.price}
          onChange={(e: ChangeEvent<HTMLInputElement>) => onChange("price", e.target.value)} />
      </div>
      <select className="field" value={draft.unit}
        onChange={(e: ChangeEvent<HTMLSelectElement>) => onChange("unit", e.target.value)}>
        <option value="hr">Per Hour</option>
        <option value="job">Per Job</option>
        <option value="day">Per Day</option>
      </select>
    </div>
    <textarea className="field" rows={2} placeholder="Description…" value={draft.desc}
      onChange={(e: ChangeEvent<HTMLTextAreaElement>) => onChange("desc", e.target.value)} />
    <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
      <button className="btn-pri" style={{ flex: 1, padding: 11 }} onClick={onSave}>Save</button>
      <button className="btn-ghost" onClick={onCancel}>Cancel</button>
    </div>
  </div>
);
