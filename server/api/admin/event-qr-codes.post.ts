export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { checkin, survey } = body || {}

  if (!checkin && !survey) {
    throw createError({ statusCode: 400, statusMessage: 'checkin or survey code required' })
  }

  const db = useDb()
  const updates = []
  if (checkin) {
    const result = await db.query(
      `INSERT INTO event_qr_codes (type, code) VALUES ($1, $2)
       ON CONFLICT (type) DO UPDATE SET code = EXCLUDED.code, created_at = now()
       RETURNING type, code, created_at`,
      ['checkin', checkin]
    )
    updates.push(result.rows[0])
  }
  if (survey) {
    const result = await db.query(
      `INSERT INTO event_qr_codes (type, code) VALUES ($1, $2)
       ON CONFLICT (type) DO UPDATE SET code = EXCLUDED.code, created_at = now()
       RETURNING type, code, created_at`,
      ['survey', survey]
    )
    updates.push(result.rows[0])
  }

  return { ok: true, updates }
})
