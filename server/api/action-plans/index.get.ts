export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const db = useDb()

  if (query.participant_id) {
    const result = await db.query('select * from action_plans where participant_id = $1 limit 1', [query.participant_id])
    return result.rows[0] || null
  }

  const result = await db.query(
    `select action_plans.*, row_to_json(participants.*) as participants
     from action_plans
     join participants on participants.id = action_plans.participant_id
     order by action_plans.submitted_at desc`
  )
  return result.rows
})
