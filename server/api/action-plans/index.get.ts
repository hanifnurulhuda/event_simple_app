export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const db = useDb()

  if (query.participant_id) {
    const participantCode = String(query.participant_code || '').trim().toUpperCase()
    if (!participantCode) throw createError({ statusCode: 401, statusMessage: 'Kode peserta wajib diisi.' })
    const result = await db.query(
      `select action_plans.*
       from action_plans
       join participants on participants.id = action_plans.participant_id
       where action_plans.participant_id = $1 and participants.participant_code = $2
       limit 1`,
      [query.participant_id, participantCode]
    )
    return result.rows[0] || null
  }

  requireAdmin(event)

  const where: string[] = []
  const params: unknown[] = []
  if (query.search) {
    params.push(`%${String(query.search).toLowerCase()}%`)
    where.push(`(lower(action_plans.title || ' ' || action_plans.description || ' ' || coalesce(action_plans.drive_link, '')) like $${params.length} or lower(participants.name || ' ' || participants.school || ' ' || coalesce(participants.class_name, '') || ' ' || participants.participant_code) like $${params.length})`)
  }
  if (query.day && query.day !== 'all') {
    params.push(String(query.day))
    where.push(`participants.event_day = $${params.length}`)
  }
  if (query.judging_status && query.judging_status !== 'all') {
    params.push(String(query.judging_status))
    where.push(`participants.judging_status = $${params.length}`)
  }
  const whereSql = where.length ? `where ${where.join(' and ')}` : ''

  if (query.all === '1') {
    const result = await db.query(
      `select action_plans.*, row_to_json(participants.*) as participants
       from action_plans
       join participants on participants.id = action_plans.participant_id
       ${whereSql}
       order by action_plans.submitted_at desc`,
      params
    )
    return result.rows
  }

  const { limit, page, offset } = getPagination(query)
  const countResult = await db.query(
    `select count(*)::int as total
     from action_plans
     join participants on participants.id = action_plans.participant_id
     ${whereSql}`,
    params
  )
  const result = await db.query(
    `select action_plans.*, row_to_json(participants.*) as participants
     from action_plans
     join participants on participants.id = action_plans.participant_id
     ${whereSql}
     order by action_plans.submitted_at desc
     limit $${params.length + 1} offset $${params.length + 2}`,
    [...params, limit, offset]
  )
  return paginatedResponse(result.rows, countResult.rows[0]?.total || 0, page, limit)
})
