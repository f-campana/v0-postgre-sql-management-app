import { NextResponse } from "next/server"
import { getConnection, isPreviewMode } from "@/lib/db"
import { mockSchemas } from "@/lib/mock-data"

export async function GET() {
  try {
    if (isPreviewMode()) {
      return NextResponse.json({
        schemas: mockSchemas.map((s) => ({ schema_name: s.schema_name })),
      })
    }

    const sql = getConnection()

    if (!sql) {
      return NextResponse.json({ error: "Database not connected" }, { status: 400 })
    }

    const result = await sql`
      SELECT schema_name 
      FROM information_schema.schemata 
      WHERE schema_name NOT IN ('pg_catalog', 'information_schema', 'pg_toast')
      ORDER BY schema_name
    `

    return NextResponse.json({ schemas: result })
  } catch (error) {
    console.error("[v0] Error fetching schemas:", error)
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unknown error" }, { status: 500 })
  }
}
