export default defineEventHandler(async (event) => {
  requireAdmin(event)
  const query = getQuery(event)
  const db = useDb()
  const where: string[] = []
  const params: unknown[] = []

  if (query.search) {
    params.push(`%${String(query.search).toLowerCase()}%`)
    where.push(`lower(participants.name || ' ' || participants.school || ' ' || coalesce(participants.class_name, '') || ' ' || participants.participant_code) like $${params.length}`)
  }
  if (query.day && query.day !== 'all') {
    params.push(String(query.day))
    where.push(`participants.event_day = $${params.length}`)
  }

  const whereSql = where.length ? `where ${where.join(' and ')}` : ''
  if (query.all === '1') {
    const result = await db.query(
      `select survey_responses.*, row_to_json(participants.*) as participants
       from survey_responses
       join participants on participants.id = survey_responses.participant_id
       ${whereSql}
       order by survey_responses.submitted_at desc`,
      params
    )
    return result.rows
  }

  const { limit, page, offset } = getPagination(query)
  const countResult = await db.query(
    `select count(*)::int as total
     from survey_responses
     join participants on participants.id = survey_responses.participant_id
     ${whereSql}`,
    params
  )
  const result = await db.query(
    `select survey_responses.*, row_to_json(participants.*) as participants
     from survey_responses
     join participants on participants.id = survey_responses.participant_id
     ${whereSql}
     order by survey_responses.submitted_at desc
     limit $${params.length + 1} offset $${params.length + 2}`,
    [...params, limit, offset]
  )
  return paginatedResponse(result.rows, countResult.rows[0]?.total || 0, page, limit)
})
