import { type NextRequest, NextResponse } from "next/server"
import { testConnection, createConnection, isPreviewMode } from "@/lib/db"

export async function POST(request: NextRequest) {
  try {
    if (isPreviewMode()) {
      console.log("[v0] Preview mode: Simulating successful connection")
      return NextResponse.json({ success: true, previewMode: true })
    }

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

    console.log("[v0] Testing database connection...")
    const result = await testConnection(config)

    if (!result.success) {
      return NextResponse.json({ error: result.error || "Failed to connect to database" }, { status: 400 })
    }

    createConnection(config)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Database connection error:", error)
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unknown error" }, { status: 500 })
  }
}
