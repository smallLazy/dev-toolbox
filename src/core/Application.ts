/**
 * Application — Workspace Entry Point
 *
 * The Application class is the root of the entire Developer Workspace.
 * It owns the lifecycle, plugin system, registries, services, and event bus.
 *
 * Usage:
 *   const app = new Application({ plugins: [aesPlugin, jwtPlugin, ...] })
 *   await app.boot()
 *   // ... Vue app mounts ...
 *   await app.ready()
 */

import type { App } from 'vue'
import type { Router } from 'vue-router'
import type { ToolPlugin, PluginHooks } from './plugin-types'
import type { LifecycleHook } from './LifecycleManager'
import { EventBus } from './event-bus'
import { CommandBus } from './command-bus'
import { LifecycleManager } from './LifecycleManager'
import { RegistryManager } from './registry'
import { ServiceContainer } from './services/container'
import type { AllServices } from './services/types'
import { PluginManager } from './PluginManager'

export interface ApplicationOptions {
  /** Tool plugin manifests to register */
  plugins: ToolPlugin[]

  /** Plugin lifecycle hooks */
  pluginHooks?: PluginHooks

  /** Lifecycle hooks */
  onBoot?: LifecycleHook[]
  onReady?: LifecycleHook[]
  onActive?: LifecycleHook[]
  onSuspend?: LifecycleHook[]
  onShutdown?: LifecycleHook[]

  /** Service registrations — called before plugin registration */
  registerServices?: (container: ServiceContainer) => void
}

export class Application {
  // ── Core Systems ──
  readonly eventBus: EventBus
  readonly commandBus: CommandBus
  readonly lifecycle: LifecycleManager
  readonly registry: RegistryManager
  readonly services: ServiceContainer
  readonly plugins: PluginManager

  // ── External References (set during boot) ──
  private vueRouter: Router | null = null
  private vueApp: App | null = null

  constructor(private options: ApplicationOptions) {
    // 1. Create core systems
    this.eventBus = new EventBus()
    this.commandBus = new CommandBus()
    this.lifecycle = new LifecycleManager({
      onBoot: options.onBoot,
      onReady: options.onReady,
      onActive: options.onActive,
      onSuspend: options.onSuspend,
      onShutdown: options.onShutdown,
    })

    // 2. Create registries (with favorite persistence hook for later)
    this.registry = new RegistryManager()

    // 3. Create service container
    this.services = new ServiceContainer()

    // 4. Plugin Manager (router is injected during boot)
    this.plugins = new PluginManager({
      registryManager: this.registry,
      router: null as unknown as Router, // Will be set in boot()
      eventBus: this.eventBus,
      commandBus: this.commandBus,
      hooks: options.pluginHooks,
    })
  }

  // ── Boot Sequence ─────────────────────────────────────────────────────

  /**
   * Initialize the application.
   *
   * 1. Register services (user-provided)
   * 2. Set up lifecycle hooks
   * 3. Register all plugins
   * 4. Transition to BOOT phase
   */
  async boot(vueRouter: Router, vueApp?: App): Promise<void> {
    this.vueRouter = vueRouter
    this.vueApp = vueApp ?? null

    // Inject router into PluginManager
    ;(this.plugins as unknown as { router: Router }).router = vueRouter

    // 1. Register services
    this.options.registerServices?.(this.services)

    // 2. Register all plugins
    console.info(`[Application] Registering ${this.options.plugins.length} plugins...`)
    await this.plugins.registerAll(this.options.plugins)
    console.info(
      `[Application] ${this.plugins.count()} plugins registered successfully.`
    )

    // 3. Boot phase complete
    console.info('[Application] Boot complete.')
  }

  /**
   * Signal that the application is ready (UI mounted, plugins loaded).
   * Transitions from BOOT → READY.
   */
  async ready(): Promise<void> {
    await this.lifecycle.ready()
    this.eventBus.emit('workspace:ready', undefined)
    console.info('[Application] Workspace ready.')
  }

  /**
   * Signal that the workspace is active (user is interacting).
   * Transitions from READY → ACTIVE.
   */
  async activate(): Promise<void> {
    await this.lifecycle.activate()
  }

  // ── Plugin Activation (called by Router guard) ────────────────────────

  /**
   * Called when the user navigates to a tool page.
   * Should be invoked from a Vue Router beforeEach guard.
   */
  async onToolEnter(pluginId: string): Promise<void> {
    await this.plugins.activate(pluginId)
  }

  /**
   * Called when the user navigates away from a tool page.
   * Should be invoked from a Vue Router afterEach guard or
   * onBeforeRouteLeave in the tool component.
   */
  async onToolLeave(pluginId: string): Promise<void> {
    await this.plugins.deactivate(pluginId)
  }

  // ── Shutdown ──────────────────────────────────────────────────────────

  /**
   * Gracefully shutdown the application.
   * Saves state, unloads plugins, clears registries.
   */
  async shutdown(): Promise<void> {
    this.eventBus.emit('workspace:before-unload', undefined)

    await this.lifecycle.shutdown()

    // Clear all registries
    this.registry.clear()

    // Clear event bus
    this.eventBus.clear()

    console.info('[Application] Shutdown complete.')
  }

  // ── Accessors ─────────────────────────────────────────────────────────

  /** Get the Vue Router instance. */
  getRouter(): Router | null {
    return this.vueRouter
  }

  /** Get the Vue App instance. */
  getVueApp(): App | null {
    return this.vueApp
  }

  /** Convenience: get a typed service. */
  getService<K extends keyof AllServices>(name: K): AllServices[K] {
    return this.services.get(name)
  }
}
