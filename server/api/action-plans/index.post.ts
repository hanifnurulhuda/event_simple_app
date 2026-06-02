export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const actionUrl = String(body.action_url || body.drive_link || '').trim()

  if (!body.participant_id || !actionUrl) {
    throw createError({ statusCode: 400, statusMessage: 'Participant dan URL Action Plan wajib diisi.' })
  }

  const db = useDb()
  const result = await db.query(
    `insert into action_plans (participant_id, title, description, location, drive_link, social_link, notes)
     values ($1, $2, $3, $4, $5, $6, $7)
     on conflict (participant_id) do update set
       title = excluded.title,
       description = excluded.description,
       location = excluded.location,
       drive_link = excluded.drive_link,
       social_link = excluded.social_link,
       notes = excluded.notes,
       updated_at = now()
     returning *`,
    [
      body.participant_id,
      body.title || 'Action Plan Gen Z Merawat Indonesia',
      body.description || 'Submission Action Plan berupa URL laporan/foto/video/media sosial.',
      body.location || null,
      actionUrl,
      body.social_link || null,
      body.notes || null
    ]
  )
  return result.rows[0]
})
