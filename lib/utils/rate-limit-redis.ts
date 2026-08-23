/**
 * Redis-backed rate limiter using Upstash.
 * Falls back to in-memory limiter when Redis is not configured.
 *
 * @see https://upstash.com/docs/redis/sdks/ts/ratelimit
 */

import { checkRateLimit as memoryCheckRateLimit, cleanupRateLimitStore } from './rate-limit';

// Lazy-load Upstash client
let upstashRatelimit: {
  limit: (key: string) => Promise<{ success: boolean; remaining: number; reset: number }>;
} | null = null;

async function getUpstashClient() {
  if (upstashRatelimit) return upstashRatelimit;

  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token || url.includes('your-upstash')) return null;

  try {
    const { Ratelimit } = await import('@upstash/ratelimit');
    const { Redis } = await import('@upstash/redis');

    const redis = new Redis({ url, token });
    upstashRatelimit = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(10, '1 m'), // 10 requests per minute
      analytics: true,
      prefix: '@upstash/ratelimit',
    });

    return upstashRatelimit;
  } catch {
    // Upstash packages not installed — fall back to memory
    return null;
  }
}

/**
 * Check if a request should be rate limited.
 * Uses Redis (Upstash) in production, falls back to in-memory.
 */
export async function checkRateLimit(
  key: string,
  maxRequests: number = 10,
  windowMs: number = 60_000
): Promise<{ allowed: boolean; remaining: number; retryAfterMs: number }> {
  const upstash = await getUpstashClient();

  if (upstash) {
    try {
      const result = await upstash.limit(key);
      return {
        allowed: result.success,
        remaining: result.remaining,
        retryAfterMs: result.success ? 0 : result.reset - Date.now(),
      };
    } catch {
      // Fall through to in-memory
    }
  }

  // Fallback to in-memory
  return memoryCheckRateLimit(key, maxRequests, windowMs);
}

/**
 * Periodic cleanup for the in-memory fallback store.
 */
export { cleanupRateLimitStore };
