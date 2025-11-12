import { type NextRequest, NextResponse } from "next/server"
import { getConnection, isPreviewMode } from "@/lib/db"

export async function POST(request: NextRequest) {
  try {
    if (isPreviewMode()) {
      return NextResponse.json(
        {
          error: "Query execution is disabled in preview mode. Deploy to Vercel to use this feature.",
        },
        { status: 400 },
      )
    }

    const sql = getConnection()

    if (!sql) {
      return NextResponse.json({ error: "Database not connected" }, { status: 400 })
    }

    const { query } = await request.json()

    if (!query || typeof query !== "string") {
      return NextResponse.json({ error: "Query is required" }, { status: 400 })
    }

    const startTime = Date.now()
    const result = await sql.unsafe(query)
    const executionTime = Date.now() - startTime

    return NextResponse.json({
      rows: result,
      rowCount: result.length,
      fields: result.length > 0 ? Object.keys(result[0]).map((name) => ({ name })) : [],
      executionTime,
    })
  } catch (error) {
    console.error("[v0] Query execution error:", error)
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unknown error" }, { status: 500 })
  }
}
