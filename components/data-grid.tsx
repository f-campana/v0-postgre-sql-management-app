"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight, Download, Copy, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"

interface DataGridProps {
  data: any[]
  totalCount?: number
  page?: number
  limit?: number
  onPageChange?: (page: number) => void
  onLimitChange?: (limit: number) => void
}

export function DataGrid({
  data,
  totalCount = data.length,
  page = 1,
  limit = 50,
  onPageChange,
  onLimitChange,
}: DataGridProps) {
  const { toast } = useToast()
  const [copiedCell, setCopiedCell] = useState<string | null>(null)

  if (data.length === 0) {
    return <div className="flex items-center justify-center h-full text-muted-foreground">No data to display</div>
  }

  const columns = Object.keys(data[0])
  const totalPages = Math.ceil(totalCount / limit)

  const copyToClipboard = async (value: any, cellKey: string) => {
    try {
      await navigator.clipboard.writeText(String(value ?? ""))
      setCopiedCell(cellKey)
      setTimeout(() => setCopiedCell(null), 2000)
    } catch (error) {
      toast({
        title: "Failed to copy",
        variant: "destructive",
      })
    }
  }

  const exportToCSV = () => {
    const csv = [
      columns.join(","),
      ...data.map((row) =>
        columns
          .map((col) => {
            const value = row[col]
            if (value === null) return "NULL"
            if (typeof value === "string" && value.includes(",")) {
              return `"${value.replace(/"/g, '""')}"`
            }
            return value
          })
          .join(","),
      ),
    ].join("\n")

    const blob = new Blob([csv], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `export-${Date.now()}.csv`
    a.click()
    URL.revokeObjectURL(url)

    toast({
      title: "Export successful",
      description: `Exported ${data.length} rows to CSV`,
    })
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-auto">
        <table className="w-full border-collapse">
          <thead className="sticky top-0 bg-muted z-10">
            <tr>
              {columns.map((column) => (
                <th key={column} className="px-4 py-2 text-left text-sm font-semibold border-b border-border">
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, rowIndex) => (
              <tr key={rowIndex} className="hover:bg-accent/50 transition-colors border-b border-border">
                {columns.map((column) => {
                  const value = row[column]
                  const cellKey = `${rowIndex}-${column}`
                  const isNull = value === null

                  return (
                    <td
                      key={column}
                      className="px-4 py-2 text-sm font-mono cursor-pointer group relative"
                      onClick={() => copyToClipboard(value, cellKey)}
                    >
                      <div className="flex items-center gap-2">
                        <span className={isNull ? "italic text-muted-foreground" : ""}>
                          {isNull ? "NULL" : String(value)}
                        </span>
                        {copiedCell === cellKey ? (
                          <Check className="h-3 w-3 text-success opacity-0 group-hover:opacity-100 transition-opacity" />
                        ) : (
                          <Copy className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                        )}
                      </div>
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between px-4 py-3 border-t border-border bg-card">
        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground">
            Showing {(page - 1) * limit + 1} to {Math.min(page * limit, totalCount)} of {totalCount} rows
          </span>
          <Select value={String(limit)} onValueChange={(value) => onLimitChange?.(Number.parseInt(value))}>
            <SelectTrigger className="w-24">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="25">25</SelectItem>
              <SelectItem value="50">50</SelectItem>
              <SelectItem value="100">100</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={exportToCSV}>
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
          <Button variant="outline" size="sm" disabled={page === 1} onClick={() => onPageChange?.(page - 1)}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm">
            Page {page} of {totalPages}
          </span>
          <Button variant="outline" size="sm" disabled={page === totalPages} onClick={() => onPageChange?.(page + 1)}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
