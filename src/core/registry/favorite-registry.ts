/**
 * Favorite Registry
 *
 * Manages user's favorited tools. Data is persisted to StorageService.
 * Max 10 favorites.
 */

export interface FavoriteRegistryOptions {
  storageKey?: string
  maxItems?: number
  /** Optional persistence adapter. If not provided, favorites are in-memory only. */
  persist?: {
    load: () => Promise<string[]>
    save: (ids: string[]) => Promise<void>
  }
}

export class FavoriteRegistry {
  private maxItems: number
  private items: Set<string>
  private persist?: FavoriteRegistryOptions['persist']
  private loaded = false

  constructor(options: FavoriteRegistryOptions = {}) {
    this.maxItems = options.maxItems ?? 10
    this.persist = options.persist
    this.items = new Set()
  }

  /** Load persisted favorites. Call once on app startup. */
  async load(): Promise<void> {
    if (this.loaded) return
    if (this.persist) {
      try {
        const ids = await this.persist.load()
        this.items = new Set(ids.slice(0, this.maxItems))
      } catch {
        console.warn('[FavoriteRegistry] Failed to load persisted favorites.')
      }
    }
    this.loaded = true
  }

  private async save(): Promise<void> {
    if (this.persist) {
      try {
        await this.persist.save(this.getAll())
      } catch {
        console.warn('[FavoriteRegistry] Failed to persist favorites.')
      }
    }
  }

  /** Add a plugin to favorites. */
  async add(pluginId: string): Promise<void> {
    if (this.items.size >= this.maxItems) {
      // Remove the oldest (first added) to make room
      const first = this.items.values().next().value
      if (first) this.items.delete(first)
    }
    this.items.add(pluginId)
    await this.save()
  }

  /** Remove a plugin from favorites. */
  async remove(pluginId: string): Promise<void> {
    this.items.delete(pluginId)
    await this.save()
  }

  /** Toggle favorite status. */
  async toggle(pluginId: string): Promise<boolean> {
    if (this.items.has(pluginId)) {
      await this.remove(pluginId)
      return false
    } else {
      await this.add(pluginId)
      return true
    }
  }

  /** Check if a plugin is favorited. */
  isFavorite(pluginId: string): boolean {
    return this.items.has(pluginId)
  }

  /** Get all favorited plugin IDs. Order is preserved (oldest first). */
  getAll(): string[] {
    return Array.from(this.items)
  }

  count(): number {
    return this.items.size
  }

  clear(): void {
    this.items.clear()
  }
}
