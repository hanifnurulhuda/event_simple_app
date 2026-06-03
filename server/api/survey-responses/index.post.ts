export default defineEventHandler(async (event) => {
  assertRateLimit(event, 'public-survey', 300, 60_000)
  const body = await readBody(event)
  const db = useDb()
  const { participant_id, participant_code, event_code, ...answers } = body
  const participantCode = String(participant_code || '').trim().toUpperCase()

  await assertEventCode('survey', event_code)

  if (!participant_id) {
    throw createError({ statusCode: 400, statusMessage: 'Participant wajib diisi.' })
  }

  const result = await db.query(
    `with matched as (
       select id from participants where id = $1 and ($3 = '' or participant_code = $3)
     ), saved as (
       insert into survey_responses (participant_id, answers)
        select $1, $2::jsonb
        where exists (select 1 from matched)
        on conflict (participant_id) do update set
          answers = excluded.answers
        returning *
      ), updated as (
        update participants
        set survey_submitted = true,
            certificate_status = case when attended then 'eligible' else certificate_status end
        where id = $1 and exists (select 1 from matched)
        returning id
      )
      select saved.* from saved
      where exists (select 1 from updated)`,
    [participant_id, JSON.stringify(answers), participantCode]
  )
  if (!result.rowCount) throw createError({ statusCode: 404, statusMessage: 'Data peserta tidak ditemukan.' })
  return result.rows[0]
})
