/**
 * PluginContext — The ONLY capability surface for plugins.
 *
 * Plugins receive this context in lifecycle hooks.
 * They MUST NOT access Core/Registry/Service directly.
 */

import type { PluginDefinition } from './PluginManifest'

// ── Capability APIs ─────────────────────────────────────────────────────

export interface ClipboardAPI {
  read(): Promise<string>
  write(text: string): Promise<void>
}

export interface StorageAPI {
  get<T>(key: string): Promise<T | null>
  set<T>(key: string, value: T): Promise<void>
  delete(key: string): Promise<void>
  keys(): Promise<string[]>
}

export interface LoggerAPI {
  debug(msg: string, data?: unknown): void
  info(msg: string, data?: unknown): void
  warn(msg: string, data?: unknown): void
  logError(msg: string, err?: Error): void  // renamed: avoids clash with NotificationAPI.error
}

export interface NotificationAPI {
  toast(variant: string, title: string, description?: string): void
  success(title: string, description?: string): void
  notifyError(title: string, description?: string): void  // renamed: avoids clash with LoggerAPI
}

export interface ThemeAPI {
  readonly mode: 'dark' | 'light' | 'system'
}

export interface WindowAPI {
  setTitle(title: string): Promise<void>
}

export interface HistoryAPI {
  add(data: Record<string, unknown>): { id: string; timestamp: number }
  remove(id: string): void
  clear(): void
  getAll(): Array<{ id: string; timestamp: number; data: Record<string, unknown> }>
  readonly count: number
}

export interface FavoritesAPI {
  add(): Promise<void>
  remove(): Promise<void>
  toggle(): Promise<boolean>
  isFavorite(): boolean
}

export interface RecentAPI {
  touch(): void
}

export interface SearchAPI {
  register(keywords: string[]): void
}

export interface AIAPI {
  chat(messages: Array<{ role: string; content: string }>): Promise<string>
}

export interface WorkspaceAPI {
  openTool(pluginId: string): void
  closeTool(): void
  getActiveTool(): string | null
}

// ── Plugin Context ─────────────────────────────────────────────────────

export interface PluginContext<
  TConfig = Record<string, unknown>,
  TFeature = unknown,
  TInput = string,
  TOutput = string,
> {
  readonly id: string
  readonly name: string
  readonly version: string
  readonly definition: PluginDefinition<TFeature, TConfig, TInput, TOutput>

  readonly clipboard: ClipboardAPI
  readonly storage: StorageAPI
  readonly logger: LoggerAPI
  readonly notification: NotificationAPI
  readonly theme: ThemeAPI
  readonly window: WindowAPI
  readonly history: HistoryAPI
  readonly favorites: FavoritesAPI
  readonly recent: RecentAPI
  readonly search: SearchAPI
  readonly ai: AIAPI
  readonly workspace: WorkspaceAPI
}

// ── Factory ────────────────────────────────────────────────────────────

export function createPluginContext<
  TConfig = Record<string, unknown>,
  TFeature = unknown,
  TInput = string,
  TOutput = string,
>(
  definition: PluginDefinition<TFeature, TConfig, TInput, TOutput>
): PluginContext<TConfig, TFeature, TInput, TOutput> {
  const historyEntries: Array<{ id: string; timestamp: number; data: Record<string, unknown> }> = []
  let favoriteStatus = false

  return {
    id: definition.id,
    name: definition.name,
    version: definition.version ?? '1.0.0',
    definition,

    clipboard: {
      async read() { try { return await navigator.clipboard.readText() } catch { return '' } },
      async write(text: string) { await navigator.clipboard.writeText(text) },
    },

    storage: {
      async get<T>(key: string) { const v = localStorage.getItem(`${definition.id}:${key}`); return v ? JSON.parse(v) as T : null },
      async set<T>(key: string, value: T) { localStorage.setItem(`${definition.id}:${key}`, JSON.stringify(value)) },
      async delete(key: string) { localStorage.removeItem(`${definition.id}:${key}`) },
      async keys() { const ks: string[] = []; for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); if (k?.startsWith(`${definition.id}:`)) ks.push(k.slice(definition.id.length + 1)) } return ks },
    },

    logger: {
      debug(msg, data) { console.debug(`[${definition.id}] ${msg}`, data) },
      info(msg, data) { console.info(`[${definition.id}] ${msg}`, data) },
      warn(msg, data) { console.warn(`[${definition.id}] ${msg}`, data) },
      logError(msg, err) { console.error(`[${definition.id}] ${msg}`, err) },
    },

    notification: {
      toast(v, t, d) { console.log(`[Toast:${v}] ${t}: ${d}`) },
      success(t, d) { console.log(`[Toast:✓] ${t}: ${d}`) },
      notifyError(t, d) { console.error(`[Toast:✗] ${t}: ${d}`) },
    },

    theme: { mode: 'dark' },

    window: {
      async setTitle(title: string) { document.title = title },
    },

    history: {
      add(data) { const e = { id: `h_${Date.now()}`, timestamp: Date.now(), data }; historyEntries.unshift(e); if (historyEntries.length > 20) historyEntries.length = 20; return e },
      remove(id) { const i = historyEntries.findIndex(e => e.id === id); if (i !== -1) historyEntries.splice(i, 1) },
      clear() { historyEntries.length = 0 },
      getAll() { return [...historyEntries] },
      get count() { return historyEntries.length },
    },

    favorites: {
      async add() { favoriteStatus = true },
      async remove() { favoriteStatus = false },
      async toggle() { favoriteStatus = !favoriteStatus; return favoriteStatus },
      isFavorite() { return favoriteStatus },
    },

    recent: { touch() {} },

    search: { register(_keywords: string[]) {} },

    ai: {
      async chat(_messages) { return 'AI service not connected' },
    },

    workspace: {
      openTool(_pluginId: string) {},
      closeTool() {},
      getActiveTool() { return null },
    },
  }
}
