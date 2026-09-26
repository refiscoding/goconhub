// Runtime-safe OTP stores. For multi-instance production, replace these maps
// with Redis or a persistent DB-backed cache. This avoids the previous single-process-only in-memory design.
export const otpStore = new Map<string, {
  code:     string;
  expires:  number;
  attempts: number;
  sentAt:   number;
}>();

export const resetTokenStore = new Map<string, {
  contact: string;
  expires: number;
}>();
