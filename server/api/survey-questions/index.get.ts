export default defineEventHandler(async () => {
  const db = useDb()
  const result = await db.query(
    `select * from survey_questions where is_active = true order by sort_order`
  )
  return result.rows
})
