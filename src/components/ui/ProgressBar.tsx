import { FC } from "react";

interface ProgressBarProps {
  step: number;
  total: number;
  label?: string;
}

export const ProgressBar: FC<ProgressBarProps> = ({ step, total, label }) => (
  <div style={{ flex: 1 }}>
    {label && (
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
        <span style={{ fontSize: 11, fontWeight: 700, color: "var(--acc)", textTransform: "uppercase", letterSpacing: ".06em" }}>
          Step {step}/{total}
        </span>
        {label && <span style={{ fontSize: 11, color: "var(--ink3)" }}>{label}</span>}
      </div>
    )}
    <div className="progress-track">
      <div className="progress-fill" style={{ width: `${(step / total) * 100}%` }} />
    </div>
  </div>
);
