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

    const isSupabase = config.host.includes("supabase.com")
    const isNeon = config.host.includes("neon.tech")

    sql = postgres({
      host: config.host,
      port: config.port,
      database: config.database,
      username: config.user,
      password: config.password,
      ssl: isSupabase || isNeon ? "prefer" : "require",
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

export async function testConnection(config: DatabaseConfig): Promise<{ success: boolean; error?: string }> {
  if (isPreviewMode()) {
    console.log("[v0] Preview mode: Simulating successful connection")
    return { success: true }
  }

  let testSql: ReturnType<typeof postgres> | null = null

  try {
    console.log("[v0] Testing connection to:", config.host)

    const isSupabasePooler = config.host.includes("pooler.supabase.com")
    if (isSupabasePooler) {
      console.warn(
        "[v0] Warning: Supabase pooler detected. If connection fails, try using the direct connection string instead (port 5432 without pooler subdomain).",
      )
    }

    testSql = postgres({
      host: config.host,
      port: config.port,
      database: config.database,
      username: config.user,
      password: config.password,
      ssl: "prefer",
      max: 1,
      connect_timeout: 30,
      prepare: false,
      connection: {
        application_name: "v0-postgres-manager-test",
      },
      onnotice: () => {},
    })

    console.log("[v0] Executing test query...")
    const result = await testSql`SELECT 1 as test`
    console.log("[v0] Connection test successful:", result)
    await testSql.end({ timeout: 5 })
    return { success: true }
  } catch (error) {
    console.error("[v0] Connection test failed:", error)

    let errorMessage = "Failed to connect to database"

    if (error && typeof error === "object") {
      const err = error as any
      console.error("[v0] Error details:", {
        message: err.message,
        code: err.code,
        severity: err.severity,
      })

      if (err.message?.includes("db_termination") || err.code === "XX000") {
        errorMessage =
          "Connection rejected by database. If using Supabase, try the direct connection string (not pooler). Check that your password is correct and database allows connections."
      } else if (err.code === "28P01") {
        errorMessage = "Authentication failed. Please check your username and password."
      } else if (err.code === "3D000") {
        errorMessage = "Database does not exist. Please check the database name."
      } else if (err.message) {
        errorMessage = err.message
      }
    }

    if (testSql) {
      try {
        await testSql.end({ timeout: 5 })
      } catch (e) {
        // Ignore cleanup errors
      }
    }
    return { success: false, error: errorMessage }
  }
}
