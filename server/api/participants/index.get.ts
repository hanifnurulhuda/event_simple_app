export default defineEventHandler(async () => {
  const db = useDb()
  const result = await db.query('select * from participants order by created_at desc')
  return result.rows
})
