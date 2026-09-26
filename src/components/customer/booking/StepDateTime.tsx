import { FC } from "react";
import { TIME_SLOTS } from "@/lib/constants";
import type { SelectedDate } from "@/lib/types";

const MONTH_DAYS: SelectedDate[] = Array.from({ length: 14 }, (_, i) => {
  const d = new Date();
  d.setDate(d.getDate() + i + 1);
  return {
    label: d.toLocaleDateString("en", { weekday: "short", day: "numeric" }),
    short: d.toLocaleDateString("en", { day: "numeric", month: "short" }),
  };
});

interface StepDateTimeProps {
  selectedDate: SelectedDate | null;
  selectedTime: string | null;
  onSelectDate: (d: SelectedDate) => void;
  onSelectTime: (t: string) => void;
}

export const StepDateTime: FC<StepDateTimeProps> = ({ selectedDate, selectedTime, onSelectDate, onSelectTime }) => (
  <div className="page-enter" style={{ display: "flex", flexDirection: "column", gap: 20 }}>
    <h2 className="cust-heading" style={{ fontSize: 24 }}>Pick a date & time</h2>

    <div>
      <p className="cust-section-label" style={{ marginBottom: 10 }}>Available dates</p>
      <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 4, scrollbarWidth: "none" }}>
        {MONTH_DAYS.map((d, i) => {
          const sel = selectedDate?.label === d.label;
          return (
            <div key={i} onClick={() => onSelectDate(d)}
              style={{ flexShrink: 0, padding: "10px 14px", borderRadius: 14, border: `2px solid ${sel ? "var(--navy)" : "var(--border)"}`, background: sel ? "var(--navy-soft)" : "var(--card)", cursor: "pointer", textAlign: "center", minWidth: 64, transition: "all .2s", boxShadow: sel ? "0 0 0 3px rgba(39,67,95,.12)" : "none" }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: sel ? "var(--navy)" : "var(--ink3)", textTransform: "uppercase" }}>{d.label.split(" ")[0]}</p>
              <p style={{ fontSize: 18, fontWeight: 800, marginTop: 2, color: sel ? "var(--navy)" : "var(--ink)" }}>{d.label.split(" ")[1]}</p>
            </div>
          );
        })}
      </div>
    </div>

    <div>
      <p className="cust-section-label" style={{ marginBottom: 10 }}>Available times</p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
        {TIME_SLOTS.map((t) => {
          const sel = selectedTime === t;
          return (
            <div key={t} onClick={() => onSelectTime(t)}
              style={{ padding: "12px 8px", borderRadius: 12, border: `2px solid ${sel ? "var(--navy)" : "var(--border)"}`, background: sel ? "var(--navy-soft)" : "var(--card)", cursor: "pointer", textAlign: "center", transition: "all .2s", boxShadow: sel ? "0 0 0 3px rgba(39,67,95,.12)" : "none" }}>
              <p style={{ fontSize: 14, fontWeight: 700, color: sel ? "var(--navy)" : "var(--ink)" }}>{t}</p>
            </div>
          );
        })}
      </div>
    </div>
  </div>
);
