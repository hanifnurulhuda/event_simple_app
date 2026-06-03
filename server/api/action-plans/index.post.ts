export default defineEventHandler(async (event) => {
  assertRateLimit(event, 'public-action-plan', 300, 60_000)
  const body = await readBody(event)
  const actionUrl = String(body.action_url || body.drive_link || '').trim()
  const title = (String(body.title || '').trim() || 'Action Plan').slice(0, 180)
  const description = String(body.description || '').trim().slice(0, 2000)
  const participantCode = String(body.participant_code || '').trim().toUpperCase()

  if (!body.participant_id) {
    throw createError({ statusCode: 400, statusMessage: 'Participant wajib diisi.' })
  }

  const db = useDb()
  const result = await db.query(
    `with matched as (
       select id from participants where id = $1 and ($8 = '' or participant_code = $8)
     ), saved as (
       insert into action_plans (participant_id, title, description, location, drive_link, social_link, notes)
       select $1, $2, $3, $4, nullif($5, ''), $6, $7
       where exists (select 1 from matched)
       on conflict (participant_id) do update set
          title = excluded.title,
         description = excluded.description,
         location = excluded.location,
         drive_link = excluded.drive_link,
         social_link = excluded.social_link,
         notes = excluded.notes,
         updated_at = now()
       returning *
     ), updated as (
        update participants set action_plan_submitted = true where id = $1 and exists (select 1 from matched) returning id
      )
       select saved.* from saved`,
    [
      body.participant_id,
      title,
      description,
      body.location || null,
      actionUrl,
      body.social_link || null,
      body.notes || null,
      participantCode
    ]
  )
  if (!result.rowCount) throw createError({ statusCode: 404, statusMessage: 'Data peserta tidak ditemukan.' })
  return result.rows[0]
})
