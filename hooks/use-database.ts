"use client"

import { create } from "zustand"
import type { DatabaseConnection } from "@/lib/types"

interface DatabaseStore {
  isConnected: boolean
  connection: DatabaseConnection | null
  setConnection: (connection: DatabaseConnection) => void
  disconnect: () => void
}

export const useDatabase = create<DatabaseStore>((set) => ({
  isConnected: false,
  connection: null,
  setConnection: (connection) => set({ connection, isConnected: true }),
  disconnect: () => set({ connection: null, isConnected: false }),
}))
