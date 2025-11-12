import { Pool, type PoolClient, type QueryResult } from "pg"

let pool: Pool | null = null

export interface DatabaseConfig {
  host: string
  port: number
  database: string
  user: string
  password: string
}

export function createPool(config: DatabaseConfig): Pool {
  if (pool) {
    pool.end()
  }

  pool = new Pool({
    host: config.host,
    port: config.port,
    database: config.database,
    user: config.user,
    password: config.password,
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
  })

  return pool
}

export function getPool(): Pool | null {
  return pool
}

export async function testConnection(config: DatabaseConfig): Promise<boolean> {
  const testPool = new Pool({
    host: config.host,
    port: config.port,
    database: config.database,
    user: config.user,
    password: config.password,
    max: 1,
    connectionTimeoutMillis: 5000,
  })

  try {
    const client = await testPool.connect()
    await client.query("SELECT NOW()")
    client.release()
    await testPool.end()
    return true
  } catch (error) {
    await testPool.end()
    return false
  }
}

export async function query<T = any>(text: string, params?: any[]): Promise<QueryResult<T>> {
  if (!pool) {
    throw new Error("Database pool not initialized")
  }
  return pool.query(text, params)
}

export async function getClient(): Promise<PoolClient | null> {
  if (!pool) {
    return null
  }
  return pool.connect()
}
