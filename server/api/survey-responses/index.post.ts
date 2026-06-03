export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const db = useDb()
  const { participant_id, event_code, ...answers } = body

  await assertEventCode('survey', event_code)

  if (!participant_id) {
    throw createError({ statusCode: 400, statusMessage: 'Participant wajib diisi.' })
  }

  const result = await db.query(
    `with saved as (
       insert into survey_responses (participant_id, answers)
       values ($1, $2::jsonb)
       on conflict (participant_id) do update set
         answers = excluded.answers
       returning *
     ), updated as (
       update participants
       set survey_submitted = true,
           certificate_status = case when attended then 'eligible' else certificate_status end
       where id = $1
       returning id
     )
     select saved.* from saved`,
    [participant_id, JSON.stringify(answers)]
  )
  return result.rows[0]
})
