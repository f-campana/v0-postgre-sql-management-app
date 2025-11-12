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
    const page = Number.parseInt(request.nextUrl.searchParams.get("page") || "1")
    const limit = Number.parseInt(request.nextUrl.searchParams.get("limit") || "50")

    if (!table) {
      return NextResponse.json({ error: "Table name is required" }, { status: 400 })
    }

    const offset = (page - 1) * limit

    // Get total count
    const countResult = await pool.query(`SELECT COUNT(*) as count FROM "${schema}"."${table}"`)
    const totalCount = Number.parseInt(countResult.rows[0].count)

    // Get data
    const dataResult = await pool.query(`SELECT * FROM "${schema}"."${table}" LIMIT $1 OFFSET $2`, [limit, offset])

    return NextResponse.json({
      data: dataResult.rows,
      totalCount,
      page,
      limit,
      totalPages: Math.ceil(totalCount / limit),
    })
  } catch (error) {
    console.error("[v0] Error fetching table data:", error)
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unknown error" }, { status: 500 })
  }
}
