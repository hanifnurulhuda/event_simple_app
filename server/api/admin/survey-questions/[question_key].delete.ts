export default defineEventHandler(async (event) => {
  const { question_key } = getRouterParams(event)
  const db = useDb()
  await db.query('delete from survey_questions where question_key = $1', [question_key])
  return { success: true }
})
