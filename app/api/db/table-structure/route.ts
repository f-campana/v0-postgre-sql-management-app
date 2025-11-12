import { type NextRequest, NextResponse } from "next/server"
import { getConnection, isPreviewMode } from "@/lib/db"
import { mockTableStructure } from "@/lib/mock-data"

export async function GET(request: NextRequest) {
  try {
    const schema = request.nextUrl.searchParams.get("schema") || "public"
    const table = request.nextUrl.searchParams.get("table")

    if (!table) {
      return NextResponse.json({ error: "Table name is required" }, { status: 400 })
    }

    if (isPreviewMode()) {
      const columns = mockTableStructure[table as keyof typeof mockTableStructure] || []
      return NextResponse.json({ columns })
    }

    const sql = getConnection()

    if (!sql) {
      return NextResponse.json({ error: "Database not connected" }, { status: 400 })
    }

    const result = await sql`
      SELECT 
        c.column_name,
        c.data_type,
        c.is_nullable,
        c.column_default,
        CASE WHEN tc.constraint_type = 'PRIMARY KEY' THEN true ELSE false END as is_primary
      FROM information_schema.columns c
      LEFT JOIN information_schema.key_column_usage kcu 
        ON c.table_schema = kcu.table_schema 
        AND c.table_name = kcu.table_name 
        AND c.column_name = kcu.column_name
      LEFT JOIN information_schema.table_constraints tc 
        ON kcu.constraint_name = tc.constraint_name 
        AND kcu.table_schema = tc.table_schema
        AND tc.constraint_type = 'PRIMARY KEY'
      WHERE c.table_schema = ${schema} AND c.table_name = ${table}
      ORDER BY c.ordinal_position
    `

    return NextResponse.json({ columns: result })
  } catch (error) {
    console.error("[v0] Error fetching table structure:", error)
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unknown error" }, { status: 500 })
  }
}
