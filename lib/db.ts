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
      ssl: config.host.includes("supabase.com") ? "prefer" : "require",
      max: 10,
      idle_timeout: 30,
      connect_timeout: 30,
      prepare: false, // Disable prepared statements for poolers
      connection: {
        application_name: "v0-postgres-manager",
      },
      onnotice: () => {}, // Suppress notices
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
    console.log("[v0] Connection details:", {
      host: config.host,
      port: config.port,
      database: config.database,
      user: config.user,
    })

    testSql = postgres({
      host: config.host,
      port: config.port,
      database: config.database,
      username: config.user,
      password: config.password,
      ssl: config.host.includes("supabase.com") ? "prefer" : "require",
      max: 1,
      connect_timeout: 30,
      prepare: false, // Disable prepared statements for connection poolers
      connection: {
        application_name: "v0-postgres-manager-test",
      },
      onnotice: () => {}, // Suppress notices
      debug: (connection, query, params) => {
        console.log("[v0] Debug:", { query, params })
      },
    })

    console.log("[v0] Executing test query...")
    const result = await testSql`SELECT NOW() as current_time, version() as pg_version`
    console.log("[v0] Connection test successful:", result)
    await testSql.end({ timeout: 5 })
    return true
  } catch (error) {
    console.error("[v0] Connection test failed:", error)
    if (error && typeof error === "object") {
      console.error("[v0] Error details:", {
        message: (error as any).message,
        code: (error as any).code,
        severity: (error as any).severity,
      })
    }
    if (testSql) {
      try {
        await testSql.end({ timeout: 5 })
      } catch (e) {
        // Ignore cleanup errors
      }
    }
    return false
  }
}
