let cache: { rows: unknown[]; expires: number } | undefined

export default defineEventHandler(async (event) => {
  setHeader(event, 'Cache-Control', 'public, max-age=300, stale-while-revalidate=600')

  if (cache && cache.expires > Date.now()) return cache.rows


  const db = useDb()
  const result = await db.query(
    `select * from survey_questions where is_active = true order by sort_order`
  )
  cache = { rows: result.rows, expires: Date.now() + 300000 }
  return result.rows
})
