"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DataGrid } from "./data-grid"
import { EditableDataGrid } from "./editable-data-grid"
import { TableStructureViewer } from "./table-structure-viewer"
import { useSelectedTable } from "@/hooks/use-selected-table"
import { useToast } from "@/hooks/use-toast"
import type { QueryResult, TableColumn } from "@/lib/types"
import { Loader2 } from "lucide-react"

interface ResultsPanelProps {
  queryResult: QueryResult | null
}

export function ResultsPanel({ queryResult }: ResultsPanelProps) {
  const { schema, table } = useSelectedTable()
  const { toast } = useToast()
  const [tableData, setTableData] = useState<any[]>([])
  const [tableStructure, setTableStructure] = useState<TableColumn[]>([])
  const [isLoadingData, setIsLoadingData] = useState(false)
  const [isLoadingStructure, setIsLoadingStructure] = useState(false)
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(50)
  const [totalCount, setTotalCount] = useState(0)

  useEffect(() => {
    if (schema && table) {
      loadTableData()
      loadTableStructure()
    }
  }, [schema, table, page, limit])

  const loadTableData = async () => {
    if (!schema || !table) return

    setIsLoadingData(true)
    try {
      const response = await fetch(`/api/db/table-data?schema=${schema}&table=${table}&page=${page}&limit=${limit}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error)
      }

      setTableData(data.data)
      setTotalCount(data.totalCount)
    } catch (error) {
      toast({
        title: "Failed to load table data",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      })
    } finally {
      setIsLoadingData(false)
    }
  }

  const loadTableStructure = async () => {
    if (!schema || !table) return

    setIsLoadingStructure(true)
    try {
      const response = await fetch(`/api/db/table-structure?schema=${schema}&table=${table}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error)
      }

      setTableStructure(data.columns)
    } catch (error) {
      toast({
        title: "Failed to load table structure",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      })
    } finally {
      setIsLoadingStructure(false)
    }
  }

  const handlePageChange = (newPage: number) => {
    setPage(newPage)
  }

  const handleLimitChange = (newLimit: number) => {
    setLimit(newLimit)
    setPage(1)
  }

  const handleDataChange = () => {
    loadTableData()
  }

  return (
    <div className="flex flex-col h-full bg-card">
      <Tabs defaultValue="results" className="flex flex-col h-full">
        <TabsList className="w-full justify-start rounded-none border-b border-border">
          <TabsTrigger value="results">{queryResult ? "Query Results" : "Table Data"}</TabsTrigger>
          {schema && table && <TabsTrigger value="structure">Table Structure</TabsTrigger>}
        </TabsList>

        <TabsContent value="results" className="flex-1 m-0 overflow-hidden">
          {isLoadingData ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : queryResult ? (
            <DataGrid data={queryResult.rows} />
          ) : schema && table ? (
            <EditableDataGrid
              data={tableData}
              totalCount={totalCount}
              page={page}
              limit={limit}
              onPageChange={handlePageChange}
              onLimitChange={handleLimitChange}
              schema={schema}
              table={table}
              onDataChange={handleDataChange}
            />
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              Select a table or run a query to view results
            </div>
          )}
        </TabsContent>

        {schema && table && (
          <TabsContent value="structure" className="flex-1 m-0 overflow-hidden">
            {isLoadingStructure ? (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <TableStructureViewer columns={tableStructure} />
            )}
          </TabsContent>
        )}
      </Tabs>
    </div>
  )
}
