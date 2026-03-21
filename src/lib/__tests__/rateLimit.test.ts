import { describe, it, expect, vi, beforeEach } from "vitest";
import { isRateLimited, recordFailure, clearFailures } from "@/lib/rateLimit";
import type { RateLimitOpts } from "@/lib/rateLimit";

const FAST: RateLimitOpts = { maxAttempts: 3, windowMs: 1000 };

beforeEach(() => {
  // Clear all rate limit entries between tests by clearing failures for our test keys
  clearFailures("test:ip1");
  clearFailures("test:ip2");
  clearFailures("other:ip1");
});

describe("Rate limiter", () => {
  it("allows requests under the limit", () => {
    recordFailure("test:ip1", FAST);
    recordFailure("test:ip1", FAST);
    expect(isRateLimited("test:ip1", FAST)).toBe(false);
  });

  it("blocks requests at the limit", () => {
    recordFailure("test:ip1", FAST);
    recordFailure("test:ip1", FAST);
    recordFailure("test:ip1", FAST);
    expect(isRateLimited("test:ip1", FAST)).toBe(true);
  });

  it("clears failures for a key", () => {
    recordFailure("test:ip1", FAST);
    recordFailure("test:ip1", FAST);
    recordFailure("test:ip1", FAST);
    expect(isRateLimited("test:ip1", FAST)).toBe(true);

    clearFailures("test:ip1");
    expect(isRateLimited("test:ip1", FAST)).toBe(false);
  });

  it("isolates different keys", () => {
    recordFailure("test:ip1", FAST);
    recordFailure("test:ip1", FAST);
    recordFailure("test:ip1", FAST);

    expect(isRateLimited("test:ip1", FAST)).toBe(true);
    expect(isRateLimited("test:ip2", FAST)).toBe(false);
  });

  it("isolates different prefixes for the same IP", () => {
    recordFailure("test:ip1", FAST);
    recordFailure("test:ip1", FAST);
    recordFailure("test:ip1", FAST);

    expect(isRateLimited("test:ip1", FAST)).toBe(true);
    expect(isRateLimited("other:ip1", FAST)).toBe(false);
  });

  it("resets after window expires", () => {
    vi.useFakeTimers();

    recordFailure("test:ip1", FAST);
    recordFailure("test:ip1", FAST);
    recordFailure("test:ip1", FAST);
    expect(isRateLimited("test:ip1", FAST)).toBe(true);

    vi.advanceTimersByTime(1001);
    expect(isRateLimited("test:ip1", FAST)).toBe(false);

    vi.useRealTimers();
  });

  it("respects different opts per call", () => {
    const strict: RateLimitOpts = { maxAttempts: 1, windowMs: 5000 };

    recordFailure("test:ip1", strict);
    expect(isRateLimited("test:ip1", strict)).toBe(true);

    // Same key but with a more lenient limit — still blocked because count is stored
    expect(isRateLimited("test:ip1", FAST)).toBe(false); // 1 < 3
  });
});
