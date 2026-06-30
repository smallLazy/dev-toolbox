/**
 * PluginManager — Plugin Lifecycle Orchestrator
 *
 * Responsible for:
 *   - Loading plugin manifests
 *   - Registering plugins into all Registries
 *   - Managing plugin lifecycle state (register → activate → deactivate → unload)
 *   - Providing plugin hooks for extensibility
 */

import type { ToolPlugin, PluginHooks, PluginState } from './plugin-types'
import type { RegistryManager } from './registry'
import type { Router } from 'vue-router'
import type { EventBus } from './event-bus'
import type { CommandBus } from './command-bus'

export interface PluginManagerOptions {
  registryManager: RegistryManager
  router: Router
  eventBus: EventBus
  commandBus: CommandBus
  hooks?: PluginHooks
}

export class PluginManager {
  private registryManager: RegistryManager
  private router: Router
  private eventBus: EventBus
  private commandBus: CommandBus
  private hooks: PluginHooks

  /** Set of all loaded plugin IDs */
  private loadedPlugins = new Set<string>()

  constructor(options: PluginManagerOptions) {
    this.registryManager = options.registryManager
    this.router = options.router
    this.eventBus = options.eventBus
    this.commandBus = options.commandBus
    this.hooks = options.hooks ?? {}
  }

  // ── Registration ──────────────────────────────────────────────────────

  /**
   * Register a single plugin.
   * This is the primary API — called once per plugin at app startup.
   */
  async register(manifest: ToolPlugin): Promise<void> {
    if (this.loadedPlugins.has(manifest.id)) {
      console.warn(`[PluginManager] Plugin "${manifest.id}" is already loaded. Skipping.`)
      return
    }

    try {
      // 1. Call onRegister hook (before registration)
      await this.hooks.onRegister?.(manifest)

      // 2. Register in all registries
      this.registryManager.registerPlugin(manifest)

      // 3. Add route to Vue Router
      if (manifest.route) {
        this.router.addRoute({
          path: manifest.route.path,
          name: manifest.id,
          component: manifest.route.component,
          meta: {
            pluginId: manifest.id,
            pluginName: manifest.name,
            ...manifest.route.meta,
          },
        })
      }

      // 4. Register command handlers for plugin commands
      for (const cmd of manifest.commands) {
        this.commandBus.register(
          cmd.id,
          () => {
            this.router.push(manifest.route.path)
          },
          manifest.id,
          cmd.description
        )
      }

      // 5. Mark as loaded
      this.loadedPlugins.add(manifest.id)

      // 6. Emit event
      this.eventBus.emit('plugin:registered', { pluginId: manifest.id })

      console.debug(`[PluginManager] Registered plugin: ${manifest.id} (${manifest.name})`)
    } catch (error) {
      console.error(`[PluginManager] Failed to register plugin "${manifest.id}":`, error)
      this.registryManager.tool.setState(manifest.id, 'error', String(error))
      this.eventBus.emit('plugin:error', {
        pluginId: manifest.id,
        error: error instanceof Error ? error : new Error(String(error)),
      })
      throw error
    }
  }

  /**
   * Register multiple plugins at once.
   */
  async registerAll(manifests: ToolPlugin[]): Promise<void> {
    // Fire-and-forget parallel registration
    const results = await Promise.allSettled(
      manifests.map((m) => this.register(m))
    )

    const failed = results.filter((r) => r.status === 'rejected')
    if (failed.length > 0) {
      console.error(
        `[PluginManager] ${failed.length}/${manifests.length} plugins failed to register.`
      )
    }
  }

  // ── Activation / Deactivation ─────────────────────────────────────────

  /**
   * Activate a plugin (user navigated to it).
   */
  async activate(pluginId: string): Promise<void> {
    const instance = this.registryManager.tool.get(pluginId)
    if (!instance) {
      console.warn(`[PluginManager] Cannot activate unknown plugin: ${pluginId}`)
      return
    }

    this.registryManager.tool.setState(pluginId, 'active')
    this.registryManager.recent.touch(pluginId)

    this.eventBus.emit('plugin:activated', { pluginId })
    this.eventBus.emit('recent:touched', { pluginId })

    await this.hooks.onActivate?.(instance.manifest)

    console.debug(`[PluginManager] Activated plugin: ${pluginId}`)
  }

  /**
   * Deactivate a plugin (user navigated away).
   */
  async deactivate(pluginId: string): Promise<void> {
    const instance = this.registryManager.tool.get(pluginId)
    if (!instance) return

    this.registryManager.tool.setState(pluginId, 'inactive')
    this.eventBus.emit('plugin:deactivated', { pluginId })

    await this.hooks.onDeactivate?.(instance.manifest)

    console.debug(`[PluginManager] Deactivated plugin: ${pluginId}`)
  }

  // ── Unloading ─────────────────────────────────────────────────────────

  /**
   * Unload a plugin completely. Removes it from all registries, routes, and command bus.
   */
  async unload(pluginId: string): Promise<void> {
    const instance = this.registryManager.tool.get(pluginId)
    if (!instance) return

    // Hook
    await this.hooks.onUnload?.(instance.manifest)

    // Remove route
    try {
      this.router.removeRoute(pluginId)
    } catch {
      // Route may not exist
    }

    // Remove from registries
    this.registryManager.unregisterPlugin(pluginId)

    // Remove command handlers
    this.commandBus.unregisterPlugin(pluginId)

    // Remove from loaded set
    this.loadedPlugins.delete(pluginId)

    this.eventBus.emit('plugin:unloaded', { pluginId })

    console.debug(`[PluginManager] Unloaded plugin: ${pluginId}`)
  }

  // ── State Queries ─────────────────────────────────────────────────────

  /** Get current state of a plugin. */
  getState(pluginId: string): PluginState | null {
    return this.registryManager.tool.get(pluginId)?.state ?? null
  }

  /** Check if a plugin is loaded. */
  isLoaded(pluginId: string): boolean {
    return this.loadedPlugins.has(pluginId)
  }

  /** Get all loaded plugin IDs. */
  getLoadedPluginIds(): string[] {
    return Array.from(this.loadedPlugins)
  }

  /** Get count of loaded plugins. */
  count(): number {
    return this.loadedPlugins.size
  }
}
