import pg from 'pg'

const { Pool } = pg

let pool: pg.Pool | undefined

export const useDb = () => {
  if (!pool) {
    const config = useRuntimeConfig()
    pool = new Pool({
      connectionString: config.databaseUrl,
      max: Number(process.env.DB_POOL_MAX || 1),
      connectionTimeoutMillis: 10000,
      idleTimeoutMillis: 5000,
      allowExitOnIdle: true,
      maxUses: 500,
      statement_timeout: 10000,
      query_timeout: 10000
    })
    pool.on('error', (err) => {
      console.error('Database pool error:', err.message)
    })
  }
  return pool
}

export const rows = <T>(result: pg.QueryResult<T>) => result.rows
