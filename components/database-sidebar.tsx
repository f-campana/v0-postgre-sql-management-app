"use client"

import { useState, useEffect } from "react"
import { ChevronDown, ChevronRight, Database, Table2, Search, Loader2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { useDatabase } from "@/hooks/use-database"
import { useSelectedTable } from "@/hooks/use-selected-table"
import { useToast } from "@/hooks/use-toast"
import type { Schema, Table } from "@/lib/types"
import { cn } from "@/lib/utils"

export function DatabaseSidebar() {
  const { isConnected } = useDatabase()
  const { setSelectedTable, schema: selectedSchema, table: selectedTable } = useSelectedTable()
  const { toast } = useToast()
  const [schemas, setSchemas] = useState<Schema[]>([])
  const [tables, setTables] = useState<Record<string, Table[]>>({})
  const [expandedSchemas, setExpandedSchemas] = useState<Set<string>>(new Set(["public"]))
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (isConnected) {
      loadSchemas()
    }
  }, [isConnected])

  const loadSchemas = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/db/schemas")
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error)
      }

      setSchemas(data.schemas)

      // Auto-load tables for public schema
      if (data.schemas.some((s: Schema) => s.schema_name === "public")) {
        loadTablesForSchema("public")
      }
    } catch (error) {
      toast({
        title: "Failed to load schemas",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const loadTablesForSchema = async (schemaName: string) => {
    try {
      const response = await fetch(`/api/db/tables?schema=${schemaName}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error)
      }

      setTables((prev) => ({ ...prev, [schemaName]: data.tables }))
    } catch (error) {
      toast({
        title: "Failed to load tables",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      })
    }
  }

  const toggleSchema = (schemaName: string) => {
    const newExpanded = new Set(expandedSchemas)
    if (newExpanded.has(schemaName)) {
      newExpanded.delete(schemaName)
    } else {
      newExpanded.add(schemaName)
      if (!tables[schemaName]) {
        loadTablesForSchema(schemaName)
      }
    }
    setExpandedSchemas(newExpanded)
  }

  const handleTableClick = (schema: string, table: string) => {
    setSelectedTable(schema, table)
  }

  const filteredSchemas = schemas.filter((schema) => {
    if (!searchQuery) return true
    const schemaMatch = schema.schema_name.toLowerCase().includes(searchQuery.toLowerCase())
    const tableMatch = tables[schema.schema_name]?.some((table) =>
      table.table_name.toLowerCase().includes(searchQuery.toLowerCase()),
    )
    return schemaMatch || tableMatch
  })

  if (!isConnected) {
    return (
      <div className="w-64 border-r border-border bg-card flex items-center justify-center p-4 text-center">
        <p className="text-sm text-muted-foreground">Connect to a database to view schemas and tables</p>
      </div>
    )
  }

  return (
    <div className="w-64 border-r border-border bg-card flex flex-col">
      <div className="p-3 border-b border-border">
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search tables..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 h-9"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="space-y-1">
            {filteredSchemas.map((schema) => (
              <div key={schema.schema_name}>
                <button
                  onClick={() => toggleSchema(schema.schema_name)}
                  className="flex items-center gap-2 w-full px-2 py-1.5 rounded-md hover:bg-accent text-sm transition-colors"
                >
                  {expandedSchemas.has(schema.schema_name) ? (
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  )}
                  <Database className="h-4 w-4 text-primary" />
                  <span className="font-medium">{schema.schema_name}</span>
                </button>

                {expandedSchemas.has(schema.schema_name) && (
                  <div className="ml-6 mt-1 space-y-0.5">
                    {tables[schema.schema_name]?.map((table) => (
                      <button
                        key={table.table_name}
                        onClick={() => handleTableClick(schema.schema_name, table.table_name)}
                        className={cn(
                          "flex items-center gap-2 w-full px-2 py-1.5 rounded-md hover:bg-accent text-sm transition-colors",
                          selectedSchema === schema.schema_name && selectedTable === table.table_name && "bg-accent",
                        )}
                      >
                        <Table2 className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="flex-1 text-left truncate">{table.table_name}</span>
                        <span className="text-xs text-muted-foreground">{table.column_count}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
