"use client"

import type { TableColumn } from "@/lib/types"
import { Key, Check, X } from "lucide-react"

interface TableStructureViewerProps {
  columns: TableColumn[]
}

export function TableStructureViewer({ columns }: TableStructureViewerProps) {
  if (columns.length === 0) {
    return <div className="flex items-center justify-center h-full text-muted-foreground">No structure to display</div>
  }

  return (
    <div className="overflow-auto h-full">
      <table className="w-full border-collapse">
        <thead className="sticky top-0 bg-muted">
          <tr>
            <th className="px-4 py-2 text-left text-sm font-semibold border-b border-border">Column</th>
            <th className="px-4 py-2 text-left text-sm font-semibold border-b border-border">Type</th>
            <th className="px-4 py-2 text-left text-sm font-semibold border-b border-border">Nullable</th>
            <th className="px-4 py-2 text-left text-sm font-semibold border-b border-border">Default</th>
            <th className="px-4 py-2 text-left text-sm font-semibold border-b border-border">Constraint</th>
          </tr>
        </thead>
        <tbody>
          {columns.map((column, index) => (
            <tr key={index} className="hover:bg-accent/50 border-b border-border">
              <td className="px-4 py-2 text-sm font-mono">
                <div className="flex items-center gap-2">
                  {column.constraint_type === "PRIMARY KEY" && <Key className="h-3 w-3 text-primary" />}
                  {column.column_name}
                </div>
              </td>
              <td className="px-4 py-2 text-sm font-mono text-muted-foreground">{column.data_type}</td>
              <td className="px-4 py-2 text-sm">
                {column.is_nullable === "YES" ? (
                  <Check className="h-4 w-4 text-success" />
                ) : (
                  <X className="h-4 w-4 text-destructive" />
                )}
              </td>
              <td className="px-4 py-2 text-sm font-mono text-muted-foreground">{column.column_default || "-"}</td>
              <td className="px-4 py-2 text-sm">
                {column.constraint_type ? (
                  <span className="px-2 py-0.5 rounded bg-primary/10 text-primary text-xs">
                    {column.constraint_type}
                  </span>
                ) : (
                  "-"
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
