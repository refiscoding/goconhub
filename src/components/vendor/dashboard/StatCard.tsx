import { FC, ReactNode } from "react";

interface StatCardProps {
  icon: string;
  value: string | number;
  label: string;
  sub: string;
}

export const StatCard: FC<StatCardProps> = ({ icon, value, label, sub }) => (
  <div className="card" style={{ padding: 16 }}>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
      <span style={{ fontSize: 20 }}>{icon}</span>
      <span style={{ fontSize: 22, fontWeight: 800, color: "var(--acc)" }}>{value}</span>
    </div>
    <p style={{ fontSize: 13, fontWeight: 600, marginTop: 10 }}>{label}</p>
    <p style={{ fontSize: 11, color: "var(--ink3)", marginTop: 2 }}>{sub}</p>
  </div>
);
