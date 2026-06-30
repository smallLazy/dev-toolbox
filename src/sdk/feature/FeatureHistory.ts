/**
 * FeatureHistory — Per-feature execution history.
 *
 * Each Feature gets an isolated history. No cross-feature access.
 */

import type { HistoryEntry } from './types'

export interface FeatureHistory<T = Record<string, unknown>> {
  /** Add a new history entry. Returns the created entry. */
  add(data: T): HistoryEntry<T>

  /** Remove an entry by ID. */
  remove(id: string): void

  /** Clear all history for this feature. */
  clear(): void

  /** Restore (load) a specific history entry's data. */
  restore(id: string): T | undefined

  /** Get all history entries, newest first. */
  getAll(): HistoryEntry<T>[]

  /** Search history entries by data content. */
  search(query: string): HistoryEntry<T>[]

  /** Maximum number of history entries. */
  readonly capacity: number

  /** Current number of history entries. */
  readonly count: number
}

/**
 * Create an in-memory FeatureHistory (for testing or simple features).
 */
export function createMemoryHistory<T = Record<string, unknown>>(
  capacity = 20
): FeatureHistory<T> {
  const entries: HistoryEntry<T>[] = []

  return {
    add(data: T) {
      const entry: HistoryEntry<T> = {
        id: `h_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        timestamp: Date.now(),
        data,
      }
      entries.unshift(entry)
      if (entries.length > capacity) entries.length = capacity
      return entry
    },

    remove(id: string) {
      const idx = entries.findIndex((e) => e.id === id)
      if (idx !== -1) entries.splice(idx, 1)
    },

    clear() {
      entries.length = 0
    },

    restore(id: string) {
      return entries.find((e) => e.id === id)?.data
    },

    getAll() {
      return [...entries]
    },

    search(query: string) {
      const q = query.toLowerCase()
      return entries.filter((e) =>
        JSON.stringify(e.data).toLowerCase().includes(q)
      )
    },

    get capacity() {
      return capacity
    },

    get count() {
      return entries.length
    },
  }
}
