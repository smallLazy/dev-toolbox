/**
 * Plugin SDK — Unified Export
 *
 * The ONLY import plugin developers need:
 *   import { definePlugin, createCommand, Permissions } from '@/sdk/plugin'
 */

// ── Core ───────────────────────────────────────────────────────────────
export { definePlugin } from './definePlugin'
export { createPlugin, PluginBuilder } from './PluginBuilder'

// ── Context ────────────────────────────────────────────────────────────
export { createPluginContext } from './PluginContext'
export type {
  PluginContext,
  ClipboardAPI,
  StorageAPI,
  LoggerAPI,
  NotificationAPI,
  ThemeAPI,
  WindowAPI,
  HistoryAPI,
  FavoritesAPI,
  RecentAPI,
  SearchAPI,
  AIAPI,
  WorkspaceAPI,
} from './PluginContext'

// ── Manifest Types ─────────────────────────────────────────────────────
export type {
  PluginDefinition,
  PluginInstance,
  PluginCategory,
  CommandDef,
  ShortcutDef,
  PermissionDef,
  SettingFieldDef,
  HistoryConfig,
} from './PluginManifest'

// ── Builders ───────────────────────────────────────────────────────────
export { createCommand, createShortcut, createCommands, createShortcuts } from './PluginCommands'
export { createPermission, createPermissions, Permissions } from './PluginPermissions'
export { createSetting, createSettings } from './PluginSettings'

// ── Lifecycle ──────────────────────────────────────────────────────────
export { createPluginLifecycle } from './PluginLifecycle'
export type { PluginLifecycle, PluginLifecyclePhase } from './PluginLifecycle'

// ── Installer (internal) ───────────────────────────────────────────────
export { installPlugin } from './PluginInstaller'
