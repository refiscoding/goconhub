/**
 * In-memory rate limiter for login endpoint.
 *
 * Tracks failed attempts per IP. After MAX_ATTEMPTS failures within
 * WINDOW_MS, further requests are blocked until the window expires.
 *
 * Note: Works within a single serverless instance. For multi-instance
 * production scale, replace with Upstash Redis (@upstash/ratelimit).
 */

const MAX_ATTEMPTS = 5;
const WINDOW_MS    = 15 * 60 * 1000; // 15 minutes

interface Entry {
  count:     number;
  windowEnd: number;
}

const store = new Map<string, Entry>();

/** Returns true if the IP is currently rate-limited (too many failures). */
export function isRateLimited(ip: string): boolean {
  const now   = Date.now();
  const entry = store.get(ip);
  if (!entry || now > entry.windowEnd) return false;
  return entry.count >= MAX_ATTEMPTS;
}

/** Record a failed login attempt for the given IP. */
export function recordFailure(ip: string): void {
  const now   = Date.now();
  const entry = store.get(ip);

  if (!entry || now > entry.windowEnd) {
    store.set(ip, { count: 1, windowEnd: now + WINDOW_MS });
  } else {
    entry.count += 1;
  }
}

/** Clear the failure record on successful login. */
export function clearFailures(ip: string): void {
  store.delete(ip);
}
