"use client";
import { useState, useCallback } from "react";
import type { ToastState, ToastType } from "@/lib/types";

export function useToast(): [ToastState | null, (msg: string, type?: ToastType) => void] {
  const [toast, setToast] = useState<ToastState | null>(null);

  const show = useCallback((msg: string, type: ToastType = "ok"): void => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 2500);
  }, []);

  return [toast, show];
}
