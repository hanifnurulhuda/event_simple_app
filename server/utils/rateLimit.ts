const buckets = new Map<string, { count: number; resetAt: number }>()

export const assertRateLimit = (event: Parameters<typeof getHeader>[0], key: string, limit: number, windowMs: number) => {
  const forwardedFor = String(getHeader(event, 'x-forwarded-for') || '').split(',')[0].trim()
  const ip = forwardedFor || String(getHeader(event, 'x-real-ip') || 'unknown')
  const bucketKey = `${key}:${ip}`
  const now = Date.now()
  const bucket = buckets.get(bucketKey)

  if (!bucket || bucket.resetAt <= now) {
    buckets.set(bucketKey, { count: 1, resetAt: now + windowMs })
    return
  }

  bucket.count += 1
  if (bucket.count > limit) {
    throw createError({ statusCode: 429, statusMessage: 'Terlalu banyak percobaan. Coba lagi sebentar.' })
  }
}
