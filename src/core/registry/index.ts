/**
 * RegistryManager — Unified access to all registries
 *
 * Manages the lifecycle of all 7 registries.
 * Plugins register through this manager, which delegates to the appropriate registry.
 */

import type { ToolPlugin } from '../plugin-types'
import { ToolRegistry } from './tool-registry'
import { CommandRegistry } from './command-registry'
import { ShortcutRegistry } from './shortcut-registry'
import { SearchRegistry } from './search-registry'
import { HistoryRegistry } from './history-registry'
import { RecentRegistry } from './recent-registry'
import { FavoriteRegistry, type FavoriteRegistryOptions } from './favorite-registry'

export interface RegistryManagerOptions {
  favorites?: FavoriteRegistryOptions
}

export class RegistryManager {
  readonly tool: ToolRegistry
  readonly command: CommandRegistry
  readonly shortcut: ShortcutRegistry
  readonly search: SearchRegistry
  readonly history: HistoryRegistry
  readonly recent: RecentRegistry
  readonly favorite: FavoriteRegistry

  constructor(options: RegistryManagerOptions = {}) {
    this.tool = new ToolRegistry()
    this.command = new CommandRegistry()
    this.shortcut = new ShortcutRegistry()
    this.search = new SearchRegistry()
    this.history = new HistoryRegistry()
    this.recent = new RecentRegistry()
    this.favorite = new FavoriteRegistry(options.favorites)
  }

  /** Register a plugin across all relevant registries. */
  registerPlugin(manifest: ToolPlugin): void {
    this.tool.register(manifest)
    this.command.register(manifest.id, manifest.commands)
    this.shortcut.register(manifest.id, manifest.shortcuts)
    this.search.register(manifest)

    if (manifest.history.enabled) {
      this.history.setMaxItems(manifest.id, manifest.history.maxItems)
    }
  }

  /** Unregister a plugin from all registries. */
  unregisterPlugin(pluginId: string): void {
    this.tool.unregister(pluginId)
    this.command.unregister(pluginId)
    this.shortcut.unregister(pluginId)
    this.search.unregister(pluginId)
    this.history.clear(pluginId)
    this.recent.remove(pluginId)
  }

  /** Initialize registries that need async setup (e.g., loading persisted data). */
  async initialize(): Promise<void> {
    await this.favorite.load()
  }

  /** Clear all registries. */
  clear(): void {
    this.tool.clear()
    this.command.clear()
    this.shortcut.clear()
    this.search.clear()
    this.history.clear()
    this.recent.clear()
    this.favorite.clear()
  }
}

// Re-export individual registries
export { ToolRegistry } from './tool-registry'
export { CommandRegistry } from './command-registry'
export type { RegisteredCommand } from './command-registry'
export { ShortcutRegistry } from './shortcut-registry'
export type { RegisteredShortcut } from './shortcut-registry'
export { SearchRegistry } from './search-registry'
export { HistoryRegistry } from './history-registry'
export { RecentRegistry } from './recent-registry'
export { FavoriteRegistry } from './favorite-registry'
