type DashboardData = {
  summary: Record<string, number>
  dayStats: Record<string, unknown>[]
  classStats: Record<string, unknown>[]
  schoolStats: Record<string, unknown>[]
  latest: Record<string, unknown>[]
}

const cache: Record<string, { data: DashboardData; expires: number } | undefined> = {}
const inflight: Record<string, Promise<DashboardData> | undefined> = {}

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const cacheKey = String(query.day || 'all')
  const cached = cache[cacheKey]
  if (cached && cached.expires > Date.now()) return cached.data

  if (inflight[cacheKey]) return await inflight[cacheKey]

  inflight[cacheKey] = loadDashboard(query).finally(() => {
    inflight[cacheKey] = undefined
  })

  const data = await inflight[cacheKey]
  cache[cacheKey] = { data, expires: Date.now() + 3000 }
  return data
})

const loadDashboard = async (query: Record<string, unknown>): Promise<DashboardData> => {
  const db = useDb()
  const params: unknown[] = []
  const where: string[] = []

  if (query.day && query.day !== 'all') {
    params.push(String(query.day))
    where.push(`event_day = $${params.length}`)
  }

  const whereSql = where.length ? `where ${where.join(' and ')}` : ''
  const [summary, days, classes, schools, latest] = await Promise.all([
    db.query(
      `select
        count(*)::int as total,
        count(*) filter (where attended)::int as attended,
        count(*) filter (where survey_submitted)::int as survey,
        count(*) filter (where action_plan_submitted)::int as action,
        count(*) filter (where attended and survey_submitted)::int as certificate
       from participants ${whereSql}`,
      params
    ),
    db.query(
      `select event_day as day,
        count(*)::int as total,
        count(*) filter (where attended)::int as hadir,
        count(*) filter (where survey_submitted)::int as survey,
        count(*) filter (where action_plan_submitted)::int as action
       from participants ${whereSql}
       group by event_day
       order by event_day`,
      params
    ),
    db.query(
      `with grouped as (
         select coalesce(class_name, '-') as class_name,
           count(*)::int as total,
           count(*) filter (where attended)::int as hadir,
           count(*) filter (where survey_submitted)::int as survey,
           count(*) filter (where action_plan_submitted)::int as action,
           row_number() over (order by count(*) desc, coalesce(class_name, '-')) as rank
         from participants ${whereSql}
         group by coalesce(class_name, '-')
       ), limited as (
         select class_name, total, hadir, survey, action, rank from grouped where rank <= 6
         union all
         select 'Lainnya' as class_name,
           sum(total)::int as total,
           sum(hadir)::int as hadir,
           sum(survey)::int as survey,
           sum(action)::int as action,
           999 as rank
         from grouped where rank > 6
         having count(*) > 0
       )
       select class_name, total, hadir, survey, action from limited order by rank`,
      params
    ),
    db.query(
      `with grouped as (
         select coalesce(school, '-') as school,
           count(*)::int as total,
           count(*) filter (where attended)::int as hadir,
           count(*) filter (where survey_submitted)::int as survey,
           count(*) filter (where action_plan_submitted)::int as action,
           row_number() over (order by count(*) desc, coalesce(school, '-')) as rank
         from participants ${whereSql}
         group by coalesce(school, '-')
       ), limited as (
         select school, total, hadir, survey, action, rank from grouped where rank <= 3
         union all
         select 'Lainnya' as school,
           sum(total)::int as total,
           sum(hadir)::int as hadir,
           sum(survey)::int as survey,
           sum(action)::int as action,
           999 as rank
         from grouped where rank > 3
         having count(*) > 0
       )
       select school, total, hadir, survey, action from limited order by rank`,
      params
    ),
    db.query(`select * from participants ${whereSql} order by created_at desc limit 20`, params)
  ])

  return {
    summary: summary.rows[0] || { total: 0, attended: 0, survey: 0, action: 0, certificate: 0 },
    dayStats: days.rows,
    classStats: classes.rows,
    schoolStats: schools.rows,
    latest: latest.rows
  }
}
