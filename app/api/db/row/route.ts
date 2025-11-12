import { type NextRequest, NextResponse } from "next/server"
import { getPool } from "@/lib/db"

export async function POST(request: NextRequest) {
  try {
    const pool = getPool()

    if (!pool) {
      return NextResponse.json({ error: "Database not connected" }, { status: 400 })
    }

    const { schema, table, data } = await request.json()

    if (!schema || !table || !data) {
      return NextResponse.json({ error: "Missing required parameters" }, { status: 400 })
    }

    const columns = Object.keys(data)
    const values = Object.values(data)
    const placeholders = columns.map((_, i) => `$${i + 1}`).join(", ")

    const query = `
      INSERT INTO "${schema}"."${table}" (${columns.map((c) => `"${c}"`).join(", ")})
      VALUES (${placeholders})
      RETURNING *
    `

    const result = await pool.query(query, values)

    return NextResponse.json({ row: result.rows[0] })
  } catch (error) {
    console.error("[v0] Error inserting row:", error)
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unknown error" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const pool = getPool()

    if (!pool) {
      return NextResponse.json({ error: "Database not connected" }, { status: 400 })
    }

    const { schema, table, data, where } = await request.json()

    if (!schema || !table || !data || !where) {
      return NextResponse.json({ error: "Missing required parameters" }, { status: 400 })
    }

    const columns = Object.keys(data)
    const values = Object.values(data)
    const setClauses = columns.map((col, i) => `"${col}" = $${i + 1}`).join(", ")

    const whereColumns = Object.keys(where)
    const whereValues = Object.values(where)
    const whereClauses = whereColumns.map((col, i) => `"${col}" = $${columns.length + i + 1}`).join(" AND ")

    const query = `
      UPDATE "${schema}"."${table}"
      SET ${setClauses}
      WHERE ${whereClauses}
      RETURNING *
    `

    const result = await pool.query(query, [...values, ...whereValues])

    return NextResponse.json({ row: result.rows[0] })
  } catch (error) {
    console.error("[v0] Error updating row:", error)
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unknown error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const pool = getPool()

    if (!pool) {
      return NextResponse.json({ error: "Database not connected" }, { status: 400 })
    }

    const { schema, table, where } = await request.json()

    if (!schema || !table || !where) {
      return NextResponse.json({ error: "Missing required parameters" }, { status: 400 })
    }

    const whereColumns = Object.keys(where)
    const whereValues = Object.values(where)
    const whereClauses = whereColumns.map((col, i) => `"${col}" = $${i + 1}`).join(" AND ")

    const query = `
      DELETE FROM "${schema}"."${table}"
      WHERE ${whereClauses}
    `

    await pool.query(query, whereValues)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Error deleting row:", error)
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unknown error" }, { status: 500 })
  }
}
