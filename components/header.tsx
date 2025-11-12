"use client"

import { Database, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useDatabase } from "@/hooks/use-database"
import { ConnectionDialog } from "./connection-dialog"
import { useState } from "react"

export function Header() {
  const { isConnected, connection } = useDatabase()
  const [showConnectionDialog, setShowConnectionDialog] = useState(false)

  return (
    <>
      <header className="border-b border-border bg-card">
        <div className="flex items-center justify-between px-4 h-14">
          <div className="flex items-center gap-3">
            <Database className="h-6 w-6 text-primary" />
            <h1 className="text-lg font-semibold">PG Studio</h1>
          </div>

          <div className="flex items-center gap-3">
            {isConnected && connection ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="h-2 w-2 rounded-full bg-success animate-pulse" />
                <span className="font-mono">{connection.database}</span>
                <span className="text-xs">@</span>
                <span className="font-mono">{connection.host}</span>
              </div>
            ) : (
              <span className="text-sm text-muted-foreground">Not connected</span>
            )}
            <Button variant="outline" size="sm" onClick={() => setShowConnectionDialog(true)}>
              <Settings className="h-4 w-4 mr-2" />
              {isConnected ? "Change Connection" : "Connect"}
            </Button>
          </div>
        </div>
      </header>

      <ConnectionDialog open={showConnectionDialog} onOpenChange={setShowConnectionDialog} />
    </>
  )
}
