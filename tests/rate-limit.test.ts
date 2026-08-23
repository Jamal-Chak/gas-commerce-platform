import { describe, it, expect, beforeEach } from 'vitest';
import { checkRateLimit, cleanupRateLimitStore } from '@/lib/utils/rate-limit';

describe('Rate Limiter', () => {
  it('allows requests within the limit', () => {
    const result = checkRateLimit('test:allow', 3, 60_000);
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(2);
  });

  it('blocks requests after limit is exceeded', () => {
    const key = 'test:block';
    checkRateLimit(key, 2, 60_000);
    checkRateLimit(key, 2, 60_000);
    const result = checkRateLimit(key, 2, 60_000);
    expect(result.allowed).toBe(false);
    expect(result.remaining).toBe(0);
    expect(result.retryAfterMs).toBeGreaterThan(0);
  });

  it('tracks separate keys independently', () => {
    checkRateLimit('key-a', 1, 60_000);
    const resultA = checkRateLimit('key-a', 1, 60_000);
    const resultB = checkRateLimit('key-b', 1, 60_000);
    expect(resultA.allowed).toBe(false);
    expect(resultB.allowed).toBe(true);
  });

  it('returns correct remaining count', () => {
    const key = 'test:remaining';
    const r1 = checkRateLimit(key, 3, 60_000);
    const r2 = checkRateLimit(key, 3, 60_000);
    const r3 = checkRateLimit(key, 3, 60_000);
    const r4 = checkRateLimit(key, 3, 60_000);
    expect(r1.remaining).toBe(2);
    expect(r2.remaining).toBe(1);
    expect(r3.remaining).toBe(0);
    expect(r4.allowed).toBe(false);
  });

  it('cleanup removes expired entries', () => {
    // Use a very short window
    checkRateLimit('cleanup-test', 1, 1);
    // Wait for window to expire
    const start = Date.now();
    while (Date.now() - start < 5) { /* busy wait 5ms */ }
    cleanupRateLimitStore();
    // After cleanup, the expired entry is deleted, so a new request starts fresh
    const result = checkRateLimit('cleanup-test', 1, 60_000);
    expect(result.allowed).toBe(true);
  });
});
