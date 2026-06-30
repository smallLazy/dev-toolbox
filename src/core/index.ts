/**
 * Developer Workspace — Core Framework
 *
 * This module exports the entire Core layer.
 * All other layers (Components, Patterns, Features, Plugins) depend on this.
 *
 * Usage:
 *   import { Application, eventBus, commandBus } from '@/core'
 */

// ── Application ────────────────────────────────────────────────────────
export { Application } from './Application'
export type { ApplicationOptions } from './Application'

// ── Managers ───────────────────────────────────────────────────────────
export { PluginManager } from './PluginManager'
export type { PluginManagerOptions } from './PluginManager'
export { LifecycleManager } from './LifecycleManager'
export type { LifecyclePhase, LifecycleHook, LifecycleOptions } from './LifecycleManager'

// ── Registries ─────────────────────────────────────────────────────────
export { RegistryManager } from './registry'
export type { RegistryManagerOptions } from './registry'
export {
  ToolRegistry,
  CommandRegistry,
  ShortcutRegistry,
  SearchRegistry,
  HistoryRegistry,
  RecentRegistry,
  FavoriteRegistry,
} from './registry'
export type { RegisteredCommand } from './registry'
export type { RegisteredShortcut } from './registry'

// ── Services ───────────────────────────────────────────────────────────
export { ServiceContainer, createServiceContainer } from './services/container'
export type {
  ClipboardService,
  StorageService,
  ConfigService,
  ThemeService,
  ThemeMode,
  WindowService,
  NotificationService,
  ToastOptions,
  LoggerService,
  LogLevel,
  UpdaterService,
  UpdateInfo,
  AllServices,
} from './services/types'

// ── Infrastructure ─────────────────────────────────────────────────────
export { EventBus, eventBus } from './event-bus'
export type { EventHandler, Unsubscribe, WorkspaceEvents } from './event-bus'
export { CommandBus, commandBus } from './command-bus'
export type { CommandHandler, CommandRegistration } from './command-bus'
export { ServiceContainer as DIContainer, createServiceContainer as createDIContainer } from './di'
export type { ServiceFactory, ServiceDefinition } from './di'

// ── Plugin Types ───────────────────────────────────────────────────────
export type {
  ToolPlugin,
  PluginCategory,
  PluginCommand,
  ShortcutDef,
  SettingField,
  HistoryEntry,
  SearchResult,
  PluginState,
  PluginInstance,
  PluginHooks,
} from './plugin-types'
