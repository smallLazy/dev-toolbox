/**
 * Plugin System — Core Type Definitions
 *
 * Every tool in Developer Workspace is a Plugin.
 * A Plugin is a declarative manifest that registers a Feature
 * into the Workspace without modifying any existing code.
 */

import type { Component } from 'vue'
import type { RouteRecordRaw } from 'vue-router'

// ── Plugin Manifest ────────────────────────────────────────────────────

export type PluginCategory =
  | 'encoding'
  | 'crypto'
  | 'formatter'
  | 'converter'
  | 'analyzer'
  | 'ai'
  | 'network'
  | 'enterprise'
  | 'utility'
  | 'developer'

export interface ToolPlugin {
  /** Unique identifier, e.g. 'aes', 'jwt', 'json' */
  id: string

  /** Display name shown in Sidebar, Command Palette, Search */
  name: string

  /** Short description shown in tooltip and search results */
  description: string

  /** Emoji icon (SF Symbol name in future) */
  icon: string

  /** Semantic version */
  version: string

  /** Category for grouping in Sidebar */
  category: PluginCategory

  /** Vue Router route — component is lazy-loaded */
  route: {
    path: string
    component: () => Promise<Component>
    meta?: Record<string, unknown>
  }

  /** Commands exposed to Command Palette (⌘K) */
  commands: PluginCommand[]

  /** Keyboard shortcuts */
  shortcuts: Record<string, ShortcutDef>

  /** Search keywords for fuzzy matching (include Chinese + English) */
  searchKeywords: string[]

  /** Future: granular permissions */
  permissions: string[]

  /** Settings schema — rendered in Settings page automatically */
  settings: Record<string, SettingField>

  /** History tracking configuration */
  history: {
    enabled: boolean
    maxItems: number
    /** Fields to store in history entries */
    fields: string[]
  }
}

// ── Command ────────────────────────────────────────────────────────────

export interface PluginCommand {
  /** Unique command ID, scoped to plugin, e.g. 'aes:encrypt' */
  id: string

  /** Label shown in Command Palette */
  label: string

  /** Optional description */
  description?: string

  /** Keyboard shortcut hint */
  shortcut?: string

  /** If true, this command can be invoked from Command Palette directly */
  palette?: boolean
}

// ── Shortcut ───────────────────────────────────────────────────────────

export interface ShortcutDef {
  default: string
  mac?: string
  windows?: string
  linux?: string
}

// ── Setting ────────────────────────────────────────────────────────────

export interface SettingField {
  type: 'select' | 'toggle' | 'input' | 'number'
  options?: string[]
  default: unknown
  label?: string
  description?: string
}

// ── History ────────────────────────────────────────────────────────────

export interface HistoryEntry {
  id: string
  pluginId: string
  timestamp: number
  data: Record<string, unknown>
}

// ── Search ─────────────────────────────────────────────────────────────

export interface SearchResult {
  pluginId: string
  name: string
  icon: string
  description: string
  category: PluginCategory
  path: string
  /** Relevance score (higher = better match) */
  score: number
}

// ── Plugin Lifecycle State ─────────────────────────────────────────────

export type PluginState =
  | 'registered'    // Plugin manifest loaded, not yet activated
  | 'active'        // Plugin is currently in use (user navigated to it)
  | 'inactive'      // Plugin was active, user navigated away
  | 'error'         // Plugin failed to load or activate
  | 'unloaded'      // Plugin was explicitly unloaded

export interface PluginInstance {
  manifest: ToolPlugin
  state: PluginState
  registeredAt: number
  activatedAt: number | null
  errorMessage: string | null
}

// ── Lifecycle Hooks ────────────────────────────────────────────────────

export interface PluginHooks {
  onRegister?: (plugin: ToolPlugin) => void | Promise<void>
  onActivate?: (plugin: ToolPlugin) => void | Promise<void>
  onDeactivate?: (plugin: ToolPlugin) => void | Promise<void>
  onUnload?: (plugin: ToolPlugin) => void | Promise<void>
  onError?: (plugin: ToolPlugin, error: Error) => void
}
