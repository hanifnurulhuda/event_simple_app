const cache: Record<string, { code: string; created_at: string; expires: number } | undefined> = {}
const inflight: Record<string, Promise<{ code: string; created_at: string }> | undefined> = {}

export default defineEventHandler(async (event) => {
  const type = getRouterParam(event, 'type')
  if (!type || !['checkin', 'survey'].includes(type)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid type' })
  }

  setHeader(event, 'Cache-Control', 'public, max-age=3, stale-while-revalidate=15')

  const cached = cache[type]
  if (cached && cached.expires > Date.now()) {
    return { code: cached.code, created_at: cached.created_at }
  }

  if (inflight[type]) return await inflight[type]

  inflight[type] = loadEventQrCode(type).finally(() => {
    inflight[type] = undefined
  })
  return await inflight[type]
})

const loadEventQrCode = async (type: string) => {
  const db = useDb()
  const { rows } = await db.query('SELECT code, created_at FROM event_qr_codes WHERE type = $1', [type])
  if (rows.length === 0) {
    throw createError({ statusCode: 404, statusMessage: 'Code not found' })
  }

  const value = {
    code: rows[0].code,
    created_at: rows[0].created_at
  }
  cache[type] = { ...value, expires: Date.now() + 3000 }
  return value
}
