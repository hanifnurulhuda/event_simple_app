export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  const body = await readBody<Record<string, unknown>>(event)
  const allowed = ['attended', 'checked_in_at', 'survey_submitted', 'action_plan_submitted', 'certificate_status', 'certificate_viewed_at', 'judging_status']
  const entries = Object.entries(body).filter(([key]) => allowed.includes(key))

  if (!id || !entries.length) throw createError({ statusCode: 400, statusMessage: 'Payload update tidak valid.' })

  const publicCertificateView = entries.every(([key, value]) =>
    (key === 'certificate_status' && value === 'viewed') || key === 'certificate_viewed_at'
  )
  if (!publicCertificateView) requireAdmin(event)

  const participantCode = String(body.participant_code || '').trim().toUpperCase()
  if (publicCertificateView && !participantCode) {
    throw createError({ statusCode: 401, statusMessage: 'Kode peserta wajib diisi.' })
  }

  const sets = entries.map(([key], index) => `${key} = $${index + 2}`).join(', ')
  const values = entries.map(([, value]) => value)
  const db = useDb()
  const whereSql = publicCertificateView
    ? `where id = $1 and participant_code = $${values.length + 2} and attended = true and survey_submitted = true`
    : 'where id = $1'
  const params = publicCertificateView ? [id, ...values, participantCode] : [id, ...values]
  const result = await db.query(`update participants set ${sets} ${whereSql} returning *`, params)
  if (!result.rowCount) throw createError({ statusCode: 404, statusMessage: 'Data peserta tidak ditemukan.' })
  return result.rows[0]
})
