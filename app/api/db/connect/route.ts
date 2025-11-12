import { type NextRequest, NextResponse } from "next/server"
import { testConnection, createPool } from "@/lib/db"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { host, port, database, user, password } = body

    if (!host || !port || !database || !user || !password) {
      return NextResponse.json({ error: "Missing required connection parameters" }, { status: 400 })
    }

    const config = {
      host,
      port: Number.parseInt(port),
      database,
      user,
      password,
    }

    const isValid = await testConnection(config)

    if (!isValid) {
      return NextResponse.json({ error: "Failed to connect to database" }, { status: 400 })
    }

    createPool(config)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Database connection error:", error)
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unknown error" }, { status: 500 })
  }
}
