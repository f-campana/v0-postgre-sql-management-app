import { NextResponse } from "next/server"
import { getPool } from "@/lib/db"

export async function GET() {
  try {
    const pool = getPool()

    if (!pool) {
      return NextResponse.json({ error: "Database not connected" }, { status: 400 })
    }

    const result = await pool.query(`
      SELECT schema_name 
      FROM information_schema.schemata 
      WHERE schema_name NOT IN ('pg_catalog', 'information_schema', 'pg_toast')
      ORDER BY schema_name
    `)

    return NextResponse.json({ schemas: result.rows })
  } catch (error) {
    console.error("[v0] Error fetching schemas:", error)
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unknown error" }, { status: 500 })
  }
}
