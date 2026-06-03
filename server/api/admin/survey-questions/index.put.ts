export default defineEventHandler(async (event) => {
  requireAdmin(event)
  const body = await readBody<{ questions: { question_key: string; label: string; type: string; options: string[]; sort_order: number; is_active: boolean }[] }>(event)
  const db = useDb()
  const results = []
  for (const q of body.questions) {
    const result = await db.query(
      `insert into survey_questions (question_key, label, type, options, sort_order, is_active)
       values ($1, $2, $3, $4::jsonb, $5, $6)
       on conflict (question_key) do update set
         label = excluded.label,
         type = excluded.type,
         options = excluded.options,
         sort_order = excluded.sort_order,
         is_active = excluded.is_active
       returning *`,
      [q.question_key, q.label, q.type, JSON.stringify(q.options || []), q.sort_order, q.is_active]
    )
    results.push(result.rows[0])
  }
  return results
})
