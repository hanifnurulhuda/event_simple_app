export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const identifier = String(query.identifier || '').trim()
  const whatsapp = String(query.whatsapp || '').trim()
  const db = useDb()
  const result = await db.query(
    `select * from participants
     where whatsapp = $1 or participant_code = upper($2)
     limit 1`,
    [whatsapp, identifier]
  )

  return result.rows[0] || null
})
