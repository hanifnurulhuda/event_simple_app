import pg from 'pg'

const { Pool } = pg

let pool: pg.Pool | undefined

export const useDb = () => {
  if (!pool) {
    const config = useRuntimeConfig()
    pool = new Pool({
      connectionString: config.databaseUrl,
      max: 1,
      connectionTimeoutMillis: 5000,
      idleTimeoutMillis: 30000
    })
    pool.on('error', (err) => {
      console.error('Database pool error:', err.message)
    })
  }
  return pool
}

export const rows = <T>(result: pg.QueryResult<T>) => result.rows
