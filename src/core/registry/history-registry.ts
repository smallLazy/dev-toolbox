import type { HistoryEntry } from '../plugin-types'

/**
 * History Registry
 *
 * Stores execution history per plugin. Each entry records the input,
 * output, and configuration at the time of execution.
 * Capacity is controlled per plugin via its manifest's history.maxItems.
 */

export class HistoryRegistry {
  /** pluginId → entries (newest first) */
  private store = new Map<string, HistoryEntry[]>()

  /** Max items per plugin (default). Overridden by manifest. */
  private defaultMaxItems = 20

  private maxItems = new Map<string, number>()

  /** Set the max items for a plugin. Called during plugin registration. */
  setMaxItems(pluginId: string, max: number): void {
    this.maxItems.set(pluginId, max)
  }

  /** Record a history entry for a plugin. */
  record(pluginId: string, data: Record<string, unknown>): HistoryEntry {
    if (!this.store.has(pluginId)) {
      this.store.set(pluginId, [])
    }

    const entry: HistoryEntry = {
      id: `${pluginId}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      pluginId,
      timestamp: Date.now(),
      data,
    }

    const entries = this.store.get(pluginId)!
    entries.unshift(entry)

    // Trim to max
    const max = this.maxItems.get(pluginId) ?? this.defaultMaxItems
    if (entries.length > max) {
      entries.length = max
    }

    return entry
  }

  /** Get recent history entries, optionally filtered by plugin. */
  getRecent(pluginId?: string, limit = 50): HistoryEntry[] {
    if (pluginId) {
      return (this.store.get(pluginId) ?? []).slice(0, limit)
    }

    // All plugins, sorted by timestamp, newest first
    const all: HistoryEntry[] = []
    for (const entries of this.store.values()) {
      all.push(...entries)
    }
    return all.sort((a, b) => b.timestamp - a.timestamp).slice(0, limit)
  }

  /** Get history entries for a specific plugin. */
  getToolHistory(pluginId: string, limit?: number): HistoryEntry[] {
    const entries = this.store.get(pluginId) ?? []
    return limit ? entries.slice(0, limit) : entries
  }

  /** Clear history for a plugin or all plugins. */
  clear(pluginId?: string): void {
    if (pluginId) {
      this.store.delete(pluginId)
    } else {
      this.store.clear()
    }
  }

  /** Get history entry by ID. */
  getById(id: string): HistoryEntry | undefined {
    for (const entries of this.store.values()) {
      const found = entries.find((e) => e.id === id)
      if (found) return found
    }
    return undefined
  }

  count(pluginId?: string): number {
    if (pluginId) {
      return this.store.get(pluginId)?.length ?? 0
    }
    let total = 0
    for (const entries of this.store.values()) {
      total += entries.length
    }
    return total
  }
}
