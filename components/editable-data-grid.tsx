"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight, Download, Copy, Check, Plus, Trash2, Edit2, X, Save } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"

interface EditableDataGridProps {
  data: any[]
  totalCount?: number
  page?: number
  limit?: number
  onPageChange?: (page: number) => void
  onLimitChange?: (limit: number) => void
  schema?: string
  table?: string
  onDataChange?: () => void
}

export function EditableDataGrid({
  data,
  totalCount = data.length,
  page = 1,
  limit = 50,
  onPageChange,
  onLimitChange,
  schema,
  table,
  onDataChange,
}: EditableDataGridProps) {
  const { toast } = useToast()
  const [copiedCell, setCopiedCell] = useState<string | null>(null)
  const [editingCell, setEditingCell] = useState<{ row: number; col: string } | null>(null)
  const [editValue, setEditValue] = useState("")
  const [deleteRow, setDeleteRow] = useState<any | null>(null)
  const [isAddingRow, setIsAddingRow] = useState(false)

  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4">
        <p className="text-muted-foreground">No data to display</p>
        {schema && table && (
          <Button onClick={() => setIsAddingRow(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add First Row
          </Button>
        )}
      </div>
    )
  }

  const columns = Object.keys(data[0])
  const totalPages = Math.ceil(totalCount / limit)
  const canEdit = schema && table

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

  const startEdit = (rowIndex: number, column: string, currentValue: any) => {
    setEditingCell({ row: rowIndex, col: column })
    setEditValue(currentValue === null ? "" : String(currentValue))
  }

  const saveEdit = async (rowIndex: number, column: string) => {
    if (!canEdit) return

    const row = data[rowIndex]
    const newValue = editValue === "" ? null : editValue

    try {
      const response = await fetch("/api/db/row", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          schema,
          table,
          data: { [column]: newValue },
          where: row,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error)
      }

      toast({
        title: "Row updated",
        description: "Changes saved successfully",
      })

      setEditingCell(null)
      onDataChange?.()
    } catch (error) {
      toast({
        title: "Update failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      })
    }
  }

  const cancelEdit = () => {
    setEditingCell(null)
    setEditValue("")
  }

  const handleDeleteRow = async () => {
    if (!canEdit || !deleteRow) return

    try {
      const response = await fetch("/api/db/row", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          schema,
          table,
          where: deleteRow,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error)
      }

      toast({
        title: "Row deleted",
        description: "Row removed successfully",
      })

      setDeleteRow(null)
      onDataChange?.()
    } catch (error) {
      toast({
        title: "Delete failed",
        description: error instanceof Error ? error.message : "Unknown error",
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
    <>
      <div className="flex flex-col h-full">
        <div className="flex-1 overflow-auto">
          <table className="w-full border-collapse">
            <thead className="sticky top-0 bg-muted z-10">
              <tr>
                {canEdit && (
                  <th className="px-4 py-2 w-20 text-left text-sm font-semibold border-b border-border">Actions</th>
                )}
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
                  {canEdit && (
                    <td className="px-4 py-2">
                      <Button variant="ghost" size="sm" onClick={() => setDeleteRow(row)} className="h-7 w-7 p-0">
                        <Trash2 className="h-3.5 w-3.5 text-destructive" />
                      </Button>
                    </td>
                  )}
                  {columns.map((column) => {
                    const value = row[column]
                    const cellKey = `${rowIndex}-${column}`
                    const isNull = value === null
                    const isEditing = editingCell?.row === rowIndex && editingCell?.col === column

                    if (isEditing) {
                      return (
                        <td key={column} className="px-4 py-2">
                          <div className="flex items-center gap-2">
                            <Input
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") saveEdit(rowIndex, column)
                                if (e.key === "Escape") cancelEdit()
                              }}
                              className="h-7 font-mono text-sm"
                              autoFocus
                            />
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => saveEdit(rowIndex, column)}
                              className="h-7 w-7 p-0"
                            >
                              <Save className="h-3.5 w-3.5 text-success" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={cancelEdit} className="h-7 w-7 p-0">
                              <X className="h-3.5 w-3.5 text-muted-foreground" />
                            </Button>
                          </div>
                        </td>
                      )
                    }

                    return (
                      <td
                        key={column}
                        className="px-4 py-2 text-sm font-mono cursor-pointer group relative"
                        onClick={() => copyToClipboard(value, cellKey)}
                        onDoubleClick={() => canEdit && startEdit(rowIndex, column, value)}
                      >
                        <div className="flex items-center gap-2">
                          <span className={isNull ? "italic text-muted-foreground" : ""}>
                            {isNull ? "NULL" : String(value)}
                          </span>
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                            {copiedCell === cellKey ? (
                              <Check className="h-3 w-3 text-success" />
                            ) : (
                              <>
                                <Copy className="h-3 w-3 text-muted-foreground" />
                                {canEdit && <Edit2 className="h-3 w-3 text-muted-foreground" />}
                              </>
                            )}
                          </div>
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
            {canEdit && (
              <Button variant="outline" size="sm" onClick={() => setIsAddingRow(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Row
              </Button>
            )}
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

      <AlertDialog open={deleteRow !== null} onOpenChange={() => setDeleteRow(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Row</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this row? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteRow} className="bg-destructive">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
