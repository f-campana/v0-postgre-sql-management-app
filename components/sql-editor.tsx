"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Play, History, Loader2, Clock } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import type { QueryResult } from "@/lib/types"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface SqlEditorProps {
  onQueryResult: (result: QueryResult | null) => void
}

const QUERY_HISTORY_KEY = "pg-studio-query-history"
const MAX_HISTORY = 20

export function SqlEditor({ onQueryResult }: SqlEditorProps) {
  const { toast } = useToast()
  const [query, setQuery] = useState("SELECT * FROM users LIMIT 10;")
  const [isExecuting, setIsExecuting] = useState(false)
  const [queryHistory, setQueryHistory] = useState<string[]>([])
  const [executionTime, setExecutionTime] = useState<number | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    // Load query history from localStorage
    const saved = localStorage.getItem(QUERY_HISTORY_KEY)
    if (saved) {
      try {
        setQueryHistory(JSON.parse(saved))
      } catch (e) {
        console.error("[v0] Failed to parse query history")
      }
    }
  }, [])

  const saveToHistory = (sql: string) => {
    const trimmed = sql.trim()
    if (!trimmed) return

    const newHistory = [trimmed, ...queryHistory.filter((q) => q !== trimmed)].slice(0, MAX_HISTORY)
    setQueryHistory(newHistory)
    localStorage.setItem(QUERY_HISTORY_KEY, JSON.stringify(newHistory))
  }

  const executeQuery = async () => {
    if (!query.trim()) {
      toast({
        title: "Empty query",
        description: "Please enter a SQL query to execute",
        variant: "destructive",
      })
      return
    }

    setIsExecuting(true)
    setExecutionTime(null)

    try {
      const response = await fetch("/api/db/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: query.trim() }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error)
      }

      saveToHistory(query.trim())
      setExecutionTime(data.executionTime)
      onQueryResult(data)

      toast({
        title: "Query executed",
        description: `${data.rowCount} rows returned in ${data.executionTime}ms`,
      })
    } catch (error) {
      toast({
        title: "Query failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      })
      onQueryResult(null)
    } finally {
      setIsExecuting(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      e.preventDefault()
      executeQuery()
    }
  }

  const loadFromHistory = (historicalQuery: string) => {
    setQuery(historicalQuery)
    if (textareaRef.current) {
      textareaRef.current.focus()
    }
  }

  return (
    <div className="flex flex-col border-b border-border bg-card">
      <div className="flex items-center justify-between px-4 py-2 border-b border-border">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-semibold">SQL Query</h2>
          {executionTime !== null && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              <span>{executionTime}ms</span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" disabled={queryHistory.length === 0}>
                <History className="h-4 w-4 mr-2" />
                History
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80 max-h-80 overflow-y-auto">
              {queryHistory.map((historicalQuery, index) => (
                <DropdownMenuItem
                  key={index}
                  onClick={() => loadFromHistory(historicalQuery)}
                  className="font-mono text-xs"
                >
                  <span className="truncate">{historicalQuery}</span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <Button onClick={executeQuery} disabled={isExecuting} size="sm" className="bg-primary hover:bg-primary/90">
            {isExecuting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Running...
              </>
            ) : (
              <>
                <Play className="h-4 w-4 mr-2" />
                Run Query
              </>
            )}
          </Button>
        </div>
      </div>
      <div className="relative">
        <textarea
          ref={textareaRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Enter your SQL query here... (Cmd/Ctrl+Enter to execute)"
          className="w-full h-48 p-4 bg-background font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring"
          spellCheck={false}
        />
        <div className="absolute bottom-2 right-2 text-xs text-muted-foreground bg-background/80 px-2 py-1 rounded">
          ⌘+Enter to execute
        </div>
      </div>
    </div>
  )
}
