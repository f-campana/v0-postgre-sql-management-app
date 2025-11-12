import { type NextRequest, NextResponse } from "next/server"
import { getPool } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const pool = getPool()

    if (!pool) {
      return NextResponse.json({ error: "Database not connected" }, { status: 400 })
    }

    const schema = request.nextUrl.searchParams.get("schema") || "public"

    const result = await pool.query(
      `
      SELECT 
        t.table_name,
        (SELECT COUNT(*) FROM information_schema.columns c WHERE c.table_schema = t.table_schema AND c.table_name = t.table_name) as column_count,
        pg_total_relation_size('"' || t.table_schema || '"."' || t.table_name || '"') as table_size
      FROM information_schema.tables t
      WHERE t.table_schema = $1 AND t.table_type = 'BASE TABLE'
      ORDER BY t.table_name
    `,
      [schema],
    )

    return NextResponse.json({ tables: result.rows })
  } catch (error) {
    console.error("[v0] Error fetching tables:", error)
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unknown error" }, { status: 500 })
  }
}
