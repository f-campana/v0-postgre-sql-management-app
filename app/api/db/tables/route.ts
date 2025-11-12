import { type NextRequest, NextResponse } from "next/server"
import { getConnection, isPreviewMode } from "@/lib/db"
import { mockSchemas } from "@/lib/mock-data"

export async function GET(request: NextRequest) {
  try {
    const schema = request.nextUrl.searchParams.get("schema") || "public"

    if (isPreviewMode()) {
      const mockSchema = mockSchemas.find((s) => s.schema_name === schema)
      const tables =
        mockSchema?.tables.map((t) => ({
          table_name: t.name,
          column_count: t.column_count,
          table_size: 0,
        })) || []
      return NextResponse.json({ tables })
    }

    const sql = getConnection()

    if (!sql) {
      return NextResponse.json({ error: "Database not connected" }, { status: 400 })
    }

    const result = await sql`
      SELECT 
        t.table_name,
        (SELECT COUNT(*) FROM information_schema.columns c WHERE c.table_schema = t.table_schema AND c.table_name = t.table_name) as column_count,
        pg_total_relation_size('"' || t.table_schema || '"."' || t.table_name || '"') as table_size
      FROM information_schema.tables t
      WHERE t.table_schema = ${schema} AND t.table_type = 'BASE TABLE'
      ORDER BY t.table_name
    `

    return NextResponse.json({ tables: result })
  } catch (error) {
    console.error("[v0] Error fetching tables:", error)
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unknown error" }, { status: 500 })
  }
}
