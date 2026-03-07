import { FC } from "react";

interface StarsProps { n?: number; size?: number; }

export const Stars: FC<StarsProps> = ({ n = 5, size = 12 }) => (
  <span>
    {Array.from({ length: 5 }, (_, i) => (
      <span key={i} style={{ color: i < n ? "#f59e0b" : "#555", fontSize: size }}>★</span>
    ))}
  </span>
);
