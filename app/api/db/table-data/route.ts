import { type NextRequest, NextResponse } from "next/server"
import { getConnection, isPreviewMode } from "@/lib/db"
import { mockTableData } from "@/lib/mock-data"

export async function GET(request: NextRequest) {
  try {
    const schema = request.nextUrl.searchParams.get("schema") || "public"
    const table = request.nextUrl.searchParams.get("table")
    const page = Number.parseInt(request.nextUrl.searchParams.get("page") || "1")
    const limit = Number.parseInt(request.nextUrl.searchParams.get("limit") || "50")

    if (!table) {
      return NextResponse.json({ error: "Table name is required" }, { status: 400 })
    }

    if (isPreviewMode()) {
      const data = mockTableData[table as keyof typeof mockTableData] || []
      const offset = (page - 1) * limit
      const paginatedData = data.slice(offset, offset + limit)

      return NextResponse.json({
        data: paginatedData,
        totalCount: data.length,
        page,
        limit,
        totalPages: Math.ceil(data.length / limit),
      })
    }

    const sql = getConnection()

    if (!sql) {
      return NextResponse.json({ error: "Database not connected" }, { status: 400 })
    }

    const offset = (page - 1) * limit

    // Get total count
    const countResult = await sql.unsafe(`SELECT COUNT(*) as count FROM "${schema}"."${table}"`)
    const totalCount = Number.parseInt(countResult[0].count)

    // Get data
    const dataResult = await sql.unsafe(`SELECT * FROM "${schema}"."${table}" LIMIT $1 OFFSET $2`, [limit, offset])

    return NextResponse.json({
      data: dataResult,
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
