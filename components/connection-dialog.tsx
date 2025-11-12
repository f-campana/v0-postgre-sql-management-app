"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { useDatabase } from "@/hooks/use-database"
import { Loader2, Database } from "lucide-react"

interface ConnectionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ConnectionDialog({ open, onOpenChange }: ConnectionDialogProps) {
  const { toast } = useToast()
  const { setConnection } = useDatabase()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    host: "localhost",
    port: "5432",
    database: "",
    user: "postgres",
    password: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch("/api/db/connect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          port: Number.parseInt(formData.port),
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to connect")
      }

      setConnection({
        ...formData,
        port: Number.parseInt(formData.port),
      })

      toast({
        title: "Connected successfully",
        description: `Connected to ${formData.database}`,
      })

      onOpenChange(false)
    } catch (error) {
      toast({
        title: "Connection failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <Database className="h-5 w-5 text-primary" />
            <DialogTitle>Connect to PostgreSQL</DialogTitle>
          </div>
          <DialogDescription>Enter your database connection details to get started</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="host">Host</Label>
            <Input
              id="host"
              placeholder="localhost"
              value={formData.host}
              onChange={(e) => setFormData({ ...formData, host: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="port">Port</Label>
            <Input
              id="port"
              type="number"
              placeholder="5432"
              value={formData.port}
              onChange={(e) => setFormData({ ...formData, port: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="database">Database</Label>
            <Input
              id="database"
              placeholder="mydb"
              value={formData.database}
              onChange={(e) => setFormData({ ...formData, database: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="user">User</Label>
            <Input
              id="user"
              placeholder="postgres"
              value={formData.user}
              onChange={(e) => setFormData({ ...formData, user: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
            />
          </div>
          <div className="flex gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1 bg-transparent"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" className="flex-1" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Connecting...
                </>
              ) : (
                "Connect"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
