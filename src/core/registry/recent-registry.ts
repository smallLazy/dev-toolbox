/**
 * Recent Registry
 *
 * Tracks which tools the user has recently used.
 * Ordered by most recent first. Session-only (not persisted).
 */

export class RecentRegistry {
  private maxItems = 10
  private items: string[] = []

  /** Record that a plugin was used. Moves it to the top. */
  touch(pluginId: string): void {
    // Remove existing entry
    const idx = this.items.indexOf(pluginId)
    if (idx !== -1) {
      this.items.splice(idx, 1)
    }

    // Add to front
    this.items.unshift(pluginId)

    // Trim
    if (this.items.length > this.maxItems) {
      this.items.length = this.maxItems
    }
  }

  /** Get recent plugin IDs, newest first. */
  getAll(limit?: number): string[] {
    return this.items.slice(0, limit ?? this.maxItems)
  }

  /** Check if a plugin is in the recent list. */
  has(pluginId: string): boolean {
    return this.items.includes(pluginId)
  }

  /** Remove a plugin from recent list. */
  remove(pluginId: string): void {
    const idx = this.items.indexOf(pluginId)
    if (idx !== -1) {
      this.items.splice(idx, 1)
    }
  }

  count(): number {
    return this.items.length
  }

  clear(): void {
    this.items = []
  }
}
