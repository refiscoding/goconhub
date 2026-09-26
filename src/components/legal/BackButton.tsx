"use client";
import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";

export function BackButton() {
  const router = useRouter();
  return (
    <button
      onClick={() => router.back()}
      style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 13, color: "var(--navy)", fontWeight: 700, background: "none", border: "none", cursor: "pointer", padding: 0 }}
    >
      <ChevronLeft size={15} />
      Back
    </button>
  );
}
