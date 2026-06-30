/**
 * PluginManifest — Type definitions for plugin declarations.
 */

import type { Component } from 'vue'

// ── Plugin Category ────────────────────────────────────────────────────

export type PluginCategory =
  | 'crypto' | 'encoder' | 'formatter' | 'converter'
  | 'analyzer' | 'generator' | 'network' | 'utility'

// ── Command ─────────────────────────────────────────────────────────────

export interface CommandDef {
  id: string
  label: string
  description?: string
  shortcut?: string
  palette?: boolean
}

// ── Shortcut ────────────────────────────────────────────────────────────

export interface ShortcutDef {
  commandId: string
  default: string
  mac?: string
  win?: string
  linux?: string
}

// ── Permission ──────────────────────────────────────────────────────────

export interface PermissionDef {
  id: string
  description?: string
}

// ── Settings ────────────────────────────────────────────────────────────

export interface SettingFieldDef {
  key: string
  type: 'select' | 'toggle' | 'input' | 'number'
  label: string
  description?: string
  options?: string[]
  default: unknown
}

// ── History ─────────────────────────────────────────────────────────────

export interface HistoryConfig {
  enabled: boolean
  maxItems: number
  fields?: string[]
}

// ── Plugin Definition ──────────────────────────────────────────────────

export interface PluginDefinition<
  TFeature = unknown,
  TConfig = Record<string, unknown>,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _TInput = string,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _TOutput = string,
> {
  // ── Required ──
  id: string
  name: string
  icon: string

  /** Route path (e.g. '/json') or full route config */
  route: string | { path: string; component: () => Promise<Component> }

  /** Lazy-loaded Vue component (if route is just a string) */
  component?: () => Promise<Component>

  // ── Optional Metadata ──
  version?: string
  description?: string
  category?: PluginCategory

  // ── Declarative Registrations ──
  commands?: CommandDef[]
  shortcuts?: ShortcutDef[]
  keywords?: string[]
  permissions?: string[]
  settings?: Record<string, SettingFieldDef>
  history?: HistoryConfig | false

  // ── Dependencies ──
  dependencies?: string[]
  minimumVersion?: string

  // ── Feature ──
  feature?: new (ctx: unknown) => TFeature

  // ── Lifecycle Hooks ──
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onInstall?: (ctx: any) => void | Promise<void>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onRegister?: (ctx: any) => void | Promise<void>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onActivate?: (ctx: any) => void | Promise<void>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onDeactivate?: (ctx: any) => void | Promise<void>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onDispose?: (ctx: any) => void | Promise<void>
}

// ── Plugin Instance ────────────────────────────────────────────────────

export interface PluginInstance<
  TFeature = unknown,
  TConfig = Record<string, unknown>,
  TInput = string,
  TOutput = string,
> {
  readonly id: string
  readonly definition: PluginDefinition<TFeature, TConfig, TInput, TOutput>
  readonly context: unknown // PluginContext<TConfig>

  install(): Promise<void>
  register(): Promise<void>
  activate(): Promise<void>
  deactivate(): Promise<void>
  dispose(): Promise<void>

  readonly isActive: boolean
  readonly isInstalled: boolean
}
