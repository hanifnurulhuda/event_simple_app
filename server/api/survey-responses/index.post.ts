export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const db = useDb()
  const { participant_id, ...answers } = body
  const result = await db.query(
    `insert into survey_responses (participant_id, answers)
     values ($1, $2::jsonb)
     on conflict (participant_id) do update set
       answers = excluded.answers
     returning *`,
    [participant_id, JSON.stringify(answers)]
  )
  return result.rows[0]
})
