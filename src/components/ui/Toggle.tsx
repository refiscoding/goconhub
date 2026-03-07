"use client";
import { FC } from "react";

interface ToggleProps {
  on: boolean;
  onChange: (value: boolean) => void;
}

export const Toggle: FC<ToggleProps> = ({ on, onChange }) => (
  <div
    className={`toggle-sw ${on ? "on" : ""}`}
    onClick={() => onChange(!on)}
    role="switch"
    aria-checked={on}
  />
);
