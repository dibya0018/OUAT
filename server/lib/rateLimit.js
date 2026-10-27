/**
 * Small in-memory fixed-window rate limiter (per process).
 * Good enough for one Node instance; resets on restart.
 */
export function createRateLimiter({ windowMs, max }) {
  const hits = new Map()

  // Drop expired windows now and then so the map can't grow forever.
  const sweep = setInterval(() => {
    const now = Date.now()
    for (const [key, entry] of hits) if (entry.resetAt <= now) hits.delete(key)
  }, windowMs)
  sweep.unref?.()

  /** Count one hit for `key`; returns { allowed, retryAfterSec }. */
  return function hit(key) {
    const now = Date.now()
    let entry = hits.get(key)
    if (!entry || entry.resetAt <= now) {
      entry = { count: 0, resetAt: now + windowMs }
      hits.set(key, entry)
    }
    entry.count += 1
    return {
      allowed: entry.count <= max,
      retryAfterSec: Math.ceil((entry.resetAt - now) / 1000),
    }
  }
}

export function clientIp(req) {
  return req.ip || req.socket?.remoteAddress || 'unknown'
}
