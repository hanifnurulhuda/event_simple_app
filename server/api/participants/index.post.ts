export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const db = useDb()
  const existing = await db.query('select participant_code from participants where whatsapp = $1 limit 1', [body.whatsapp])

  if (existing.rowCount) return existing.rows[0]

  const result = await db.query(
    `insert into participants (participant_code, qr_token, name, school, class_name, whatsapp, event_day)
     values ($1, $2, $3, $4, $5, $6, $7)
     returning participant_code`,
    [body.participant_code, body.qr_token, body.name, body.school, body.class_name, body.whatsapp, body.event_day]
  )

  return result.rows[0]
})
