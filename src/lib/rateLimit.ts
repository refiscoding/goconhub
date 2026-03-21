/**
 * In-memory rate limiter with configurable limits per route.
 *
 * Tracks failed/excessive attempts per key. After maxAttempts within
 * windowMs, further requests are blocked until the window expires.
 *
 * Note: Works within a single serverless instance. For multi-instance
 * production scale, replace with Upstash Redis (@upstash/ratelimit).
 */

import { NextRequest } from "next/server";

export interface RateLimitOpts {
  maxAttempts: number;
  windowMs: number;
}

/** Presets for different route categories. */
export const RATE_LIMITS = {
  auth:    { maxAttempts: 5,  windowMs: 15 * 60 * 1000 } as RateLimitOpts,  // 5 per 15 min
  support: { maxAttempts: 3,  windowMs: 60 * 60 * 1000 } as RateLimitOpts,  // 3 per hour
  dispute: { maxAttempts: 5,  windowMs: 60 * 60 * 1000 } as RateLimitOpts,  // 5 per hour
} as const;

const DEFAULT_OPTS: RateLimitOpts = RATE_LIMITS.auth;

interface Entry {
  count:     number;
  windowEnd: number;
}

const store = new Map<string, Entry>();

/** Extract client IP from request headers. */
export function getClientIp(req: NextRequest): string {
  return req.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "unknown";
}

/** Returns true if the key is currently rate-limited (too many attempts). */
export function isRateLimited(key: string, opts: RateLimitOpts = DEFAULT_OPTS): boolean {
  const now   = Date.now();
  const entry = store.get(key);
  if (!entry || now > entry.windowEnd) return false;
  return entry.count >= opts.maxAttempts;
}

/** Record a failed or counted attempt for the given key. */
export function recordFailure(key: string, opts: RateLimitOpts = DEFAULT_OPTS): void {
  const now   = Date.now();
  const entry = store.get(key);

  if (!entry || now > entry.windowEnd) {
    store.set(key, { count: 1, windowEnd: now + opts.windowMs });
  } else {
    entry.count += 1;
  }
}

/** Clear the failure record (e.g. on successful login). */
export function clearFailures(key: string): void {
  store.delete(key);
}
