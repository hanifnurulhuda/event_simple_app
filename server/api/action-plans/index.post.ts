export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const title = String(body.title || '').trim()
  const description = String(body.description || '').trim()
  const actionUrl = String(body.action_url || body.drive_link || '').trim()

  if (!body.participant_id || !title || !actionUrl) {
    throw createError({ statusCode: 400, statusMessage: 'Participant, judul, dan URL Action Plan wajib diisi.' })
  }

  const db = useDb()
  const result = await db.query(
    `with saved as (
       insert into action_plans (participant_id, title, description, location, drive_link, social_link, notes)
       values ($1, $2, $3, $4, $5, $6, $7)
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
       update participants set action_plan_submitted = true where id = $1 returning id
     )
      select saved.* from saved`,
    [
      body.participant_id,
      title,
      description,
      body.location || null,
      actionUrl,
      body.social_link || null,
      body.notes || null
    ]
  )
  return result.rows[0]
})
