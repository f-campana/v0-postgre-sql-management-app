import { type NextRequest, NextResponse } from "next/server"
import { getPool } from "@/lib/db"

export async function POST(request: NextRequest) {
  try {
    const pool = getPool()

    if (!pool) {
      return NextResponse.json({ error: "Database not connected" }, { status: 400 })
    }

    const { query } = await request.json()

    if (!query || typeof query !== "string") {
      return NextResponse.json({ error: "Query is required" }, { status: 400 })
    }

    const startTime = Date.now()
    const result = await pool.query(query)
    const executionTime = Date.now() - startTime

    return NextResponse.json({
      rows: result.rows,
      rowCount: result.rowCount,
      fields: result.fields?.map((f) => ({ name: f.name, dataTypeID: f.dataTypeID })),
      executionTime,
    })
  } catch (error) {
    console.error("[v0] Query execution error:", error)
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unknown error" }, { status: 500 })
  }
}
