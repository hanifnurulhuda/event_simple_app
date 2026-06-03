export default defineEventHandler(async (event) => {
  const body = await readBody<{ identifier?: string; whatsapp?: string }>(event)
  const identifier = String(body.identifier || '').trim()
  const whatsapp = String(body.whatsapp || '').trim()

  await assertEventCode('checkin', (body as { event_code?: unknown }).event_code)

  if (!identifier && !whatsapp) {
    throw createError({ statusCode: 400, statusMessage: 'Nomor WhatsApp atau kode peserta wajib diisi.' })
  }

  const db = useDb()
  const result = await db.query(
    `with matched as (
       select id, attended as was_already_attended
       from participants
       where whatsapp = $1 or participant_code = upper($2)
       limit 1
     )
     update participants p
     set attended = true,
         checked_in_at = coalesce(p.checked_in_at, now()),
         certificate_status = case when p.survey_submitted and p.certificate_status <> 'viewed' then 'eligible' else p.certificate_status end
     from matched
     where p.id = matched.id
     returning p.*, matched.was_already_attended`,
    [whatsapp, identifier]
  )

  if (!result.rowCount) {
    throw createError({ statusCode: 404, statusMessage: 'Data peserta tidak ditemukan.' })
  }

  return result.rows[0]
})
