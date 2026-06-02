export default defineEventHandler(async () => {
  const db = useDb()
  const result = await db.query(
    `select survey_responses.*, row_to_json(participants.*) as participants
     from survey_responses
     join participants on participants.id = survey_responses.participant_id
     order by survey_responses.submitted_at desc`
  )
  return result.rows
})
