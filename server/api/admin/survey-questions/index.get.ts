export default defineEventHandler(async (event) => {
  requireAdmin(event)
  const db = useDb()
  const result = await db.query(
    `select * from survey_questions order by sort_order`
  )
  return result.rows
})
