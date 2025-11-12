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
      ssl: "require", // Require SSL for cloud providers
      max: 10,
      idle_timeout: 30,
      connect_timeout: 10,
      connection: {
        application_name: "v0-postgres-manager",
      },
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
    console.log("[v0] Testing connection to:", config.host)

    testSql = postgres({
      host: config.host,
      port: config.port,
      database: config.database,
      username: config.user,
      password: config.password,
      ssl: "require", // Require SSL for cloud providers
      max: 1,
      connect_timeout: 10,
      connection: {
        application_name: "v0-postgres-manager-test",
      },
    })

    const result = await testSql`SELECT NOW()`
    console.log("[v0] Connection test successful:", result)
    await testSql.end({ timeout: 2 })
    return true
  } catch (error) {
    console.error("[v0] Connection test failed:", error)
    if (testSql) {
      try {
        await testSql.end({ timeout: 2 })
      } catch (e) {
        // Ignore cleanup errors
      }
    }
    return false
  }
}
