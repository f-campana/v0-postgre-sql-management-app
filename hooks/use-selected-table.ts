"use client"

import { create } from "zustand"

interface SelectedTableStore {
  schema: string | null
  table: string | null
  setSelectedTable: (schema: string, table: string) => void
  clearSelection: () => void
}

export const useSelectedTable = create<SelectedTableStore>((set) => ({
  schema: null,
  table: null,
  setSelectedTable: (schema, table) => set({ schema, table }),
  clearSelection: () => set({ schema: null, table: null }),
}))
