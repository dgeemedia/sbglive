// src/lib/rateLimit.ts
// A small in-memory limiter for public endpoints (checkout start, order lookup).
// Honest limits: on serverless hosting each instance keeps its own counter, so this stops
// casual abuse and accidental loops, not a determined attacker with many IPs. For that,
// use the host's firewall / a shared store like Upstash Redis.

const buckets = new Map<string, { count: number; reset: number }>()

export function rateLimit(key: string, limit: number, windowMs: number): { ok: boolean; retryAfter: number } {
  const now = Date.now()
  if (buckets.size > 5000) {
    for (const [k, v] of buckets) if (v.reset <= now) buckets.delete(k)
  }
  const b = buckets.get(key)
  if (!b || b.reset <= now) {
    buckets.set(key, { count: 1, reset: now + windowMs })
    return { ok: true, retryAfter: 0 }
  }
  b.count++
  if (b.count > limit) return { ok: false, retryAfter: Math.max(1, Math.ceil((b.reset - now) / 1000)) }
  return { ok: true, retryAfter: 0 }
}

/** Best-effort caller IP. Returns '' when unknown, and callers skip limiting rather than lump everyone together. */
export function clientIp(req: Request): string {
  const forwarded = req.headers.get('x-forwarded-for')
  return forwarded?.split(',')[0]?.trim() || req.headers.get('x-real-ip') || ''
}
