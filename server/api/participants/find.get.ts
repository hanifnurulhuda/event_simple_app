export default defineEventHandler(async (event) => {
  assertRateLimit(event, 'public-find-participant', 120, 60_000)
  const query = getQuery(event)
  const identifier = String(query.identifier || '').trim()
  const whatsapp = String(query.whatsapp || '').trim()
  if (!identifier && !whatsapp) return null

  const db = useDb()
  const result = await db.query(
    `select id, participant_code, name, school, class_name, event_day, attended, survey_submitted,
            action_plan_submitted, certificate_status, certificate_viewed_at, judging_status
     from participants
     where whatsapp = $1 or participant_code = upper($2)
     limit 1`,
    [whatsapp, identifier]
  )

  return result.rows[0] || null
})
