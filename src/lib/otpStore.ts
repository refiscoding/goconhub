// In-memory OTP store — replace with Redis/DB for multi-instance production
export const otpStore = new Map<string, {
  code:     string;
  expires:  number;
  attempts: number;   // failed verification attempts
  sentAt:   number;   // timestamp of last send (for rate-limiting)
}>();

// Short-lived token issued after successful OTP verification.
// Must be presented to /api/otp/reset-password to actually change the password.
export const resetTokenStore = new Map<string, {
  contact: string;
  expires: number;
}>();
