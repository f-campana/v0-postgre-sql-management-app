"use client"

import { useState } from "react"
import { Header } from "@/components/header"
import { DatabaseSidebar } from "@/components/database-sidebar"
import { SqlEditor } from "@/components/sql-editor"
import { ResultsPanel } from "@/components/results-panel"
import { PreviewModeBanner } from "@/components/preview-mode-banner"
import type { QueryResult } from "@/lib/types"
import { Toaster } from "@/components/ui/toaster"

export default function Home() {
  const [queryResult, setQueryResult] = useState<QueryResult | null>(null)

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <Header />
      <PreviewModeBanner />

      <div className="flex-1 flex overflow-hidden">
        <DatabaseSidebar />

        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="h-[300px] flex flex-col border-b border-border">
            <SqlEditor onQueryResult={setQueryResult} />
          </div>

          <div className="flex-1 overflow-hidden">
            <ResultsPanel queryResult={queryResult} />
          </div>
        </div>
      </div>

      <Toaster />
    </div>
  )
}
