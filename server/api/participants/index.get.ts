export default defineEventHandler(async (event) => {
  requireAdmin(event)
  const query = getQuery(event)
  const db = useDb()
  const where: string[] = []
  const params: unknown[] = []

  if (query.search) {
    params.push(`%${String(query.search).toLowerCase()}%`)
    where.push(`lower(name || ' ' || school || ' ' || coalesce(class_name, '') || ' ' || whatsapp || ' ' || participant_code) like $${params.length}`)
  }
  if (query.day && query.day !== 'all') {
    params.push(String(query.day))
    where.push(`event_day = $${params.length}`)
  }
  if (query.status && query.status !== 'all') {
    const status = String(query.status)
    if (status === 'attended') where.push('attended = true')
    if (status === 'not_attended') where.push('attended = false')
    if (status === 'survey') where.push('survey_submitted = true')
    if (status === 'action') where.push('action_plan_submitted = true')
    if (status === 'certificate') where.push('attended = true and survey_submitted = true')
    if (status === 'eligible') where.push("attended = true and survey_submitted = true and certificate_status <> 'viewed'")
    if (status === 'not_eligible') where.push('not (attended = true and survey_submitted = true)')
    if (status === 'viewed') where.push('certificate_viewed_at is not null')
  }

  const whereSql = where.length ? `where ${where.join(' and ')}` : ''
  if (query.all === '1') {
    const result = await db.query(`select * from participants ${whereSql} order by created_at desc`, params)
    return result.rows
  }

  const { limit, page, offset } = getPagination(query)
  const countResult = await db.query(`select count(*)::int as total from participants ${whereSql}`, params)
  const result = await db.query(`select * from participants ${whereSql} order by created_at desc limit $${params.length + 1} offset $${params.length + 2}`, [...params, limit, offset])
  return paginatedResponse(result.rows, countResult.rows[0]?.total || 0, page, limit)
})
