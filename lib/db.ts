import postgres from "postgres"

let sql: ReturnType<typeof postgres> | null = null

export interface DatabaseConfig {
  host: string
  port: number
  database: string
  user: string
  password: string
}

// Check if we're in preview mode (browser environment)
export function isPreviewMode(): boolean {
  return typeof window !== "undefined" || process.env.NEXT_RUNTIME === "edge"
}

export function createConnection(config: DatabaseConfig) {
  try {
    if (sql) {
      sql.end()
    }

    sql = postgres({
      host: config.host,
      port: config.port,
      database: config.database,
      username: config.user,
      password: config.password,
      max: 10,
      idle_timeout: 30,
      connect_timeout: 5,
    })

    return sql
  } catch (error) {
    console.error("[v0] Failed to create connection:", error)
    throw error
  }
}

export function getConnection() {
  return sql
}

export async function testConnection(config: DatabaseConfig): Promise<boolean> {
  if (isPreviewMode()) {
    console.log("[v0] Preview mode: Simulating successful connection")
    return true
  }

  let testSql: ReturnType<typeof postgres> | null = null

  try {
    testSql = postgres({
      host: config.host,
      port: config.port,
      database: config.database,
      username: config.user,
      password: config.password,
      max: 1,
      connect_timeout: 5,
    })

    await testSql`SELECT NOW()`
    await testSql.end()
    return true
  } catch (error) {
    console.error("[v0] Connection test failed:", error)
    if (testSql) {
      await testSql.end()
    }
    return false
  }
}
