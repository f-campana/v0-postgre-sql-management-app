import { type NextRequest, NextResponse } from "next/server"
import { getPool } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const pool = getPool()

    if (!pool) {
      return NextResponse.json({ error: "Database not connected" }, { status: 400 })
    }

    const schema = request.nextUrl.searchParams.get("schema") || "public"
    const table = request.nextUrl.searchParams.get("table")

    if (!table) {
      return NextResponse.json({ error: "Table name is required" }, { status: 400 })
    }

    const result = await pool.query(
      `
      SELECT 
        c.column_name,
        c.data_type,
        c.is_nullable,
        c.column_default,
        tc.constraint_type
      FROM information_schema.columns c
      LEFT JOIN information_schema.key_column_usage kcu 
        ON c.table_schema = kcu.table_schema 
        AND c.table_name = kcu.table_name 
        AND c.column_name = kcu.column_name
      LEFT JOIN information_schema.table_constraints tc 
        ON kcu.constraint_name = tc.constraint_name 
        AND kcu.table_schema = tc.table_schema
      WHERE c.table_schema = $1 AND c.table_name = $2
      ORDER BY c.ordinal_position
    `,
      [schema, table],
    )

    return NextResponse.json({ columns: result.rows })
  } catch (error) {
    console.error("[v0] Error fetching table structure:", error)
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unknown error" }, { status: 500 })
  }
}
