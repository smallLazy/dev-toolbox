/**
 * FeatureContext — The ONLY way Features access capabilities.
 *
 * Features MUST NOT:
 *   - Import from '@/core' directly
 *   - Access Registry directly
 *   - Access Service directly
 *   - new Service()
 *
 * Features MUST use this.context for ALL external capabilities.
 */

import type { PluginMetadata } from './types'
import type { FeatureClipboard } from './FeatureClipboard'
import type { FeatureHistory } from './FeatureHistory'
import type { FeatureSettings } from './FeatureSettings'
import type { FeatureEventBus } from './types'
import type { FeatureConfig } from './types'

// ── Lightweight Service Interfaces (SDK-level, not Core-level) ─────────

export interface SdkLogger {
  debug(message: string, data?: unknown): void
  info(message: string, data?: unknown): void
  warn(message: string, data?: unknown): void
  error(message: string, error?: Error): void
}

export interface SdkNotification {
  toast(variant: string, title: string, description?: string): void
  success(title: string, description?: string): void
  error(title: string, description?: string): void
  info(title: string, description?: string): void
}

export interface SdkTheme {
  readonly mode: 'dark' | 'light' | 'system'
  readonly accentColor: string
}

// ── FeatureContext ─────────────────────────────────────────────────────

export interface FeatureContext<TConfig extends FeatureConfig = FeatureConfig> {
  /** Plugin identifier */
  readonly id: string

  /** Plugin metadata */
  readonly plugin: PluginMetadata

  /** Clipboard operations (scoped to this feature) */
  readonly clipboard: FeatureClipboard

  /** History operations (scoped to this feature, automatic isolation) */
  readonly history: FeatureHistory

  /** Settings operations (scoped to this feature, automatic isolation) */
  readonly settings: FeatureSettings<TConfig>

  /** Logger (prefixed with plugin ID) */
  readonly logger: SdkLogger

  /** In-app notification toasts */
  readonly notification: SdkNotification

  /** Theme information */
  readonly theme: SdkTheme

  /** Event bus for feature-scoped events */
  readonly events: FeatureEventBus
}

// ── Factory ────────────────────────────────────────────────────────────

export interface FeatureContextFactory {
  createContext<TConfig extends FeatureConfig = FeatureConfig>(
    plugin: PluginMetadata,
    options?: {
      clipboard?: Partial<FeatureClipboard>
      history?: Partial<FeatureHistory>
      settings?: Partial<FeatureSettings<TConfig>>
      logger?: Partial<SdkLogger>
      notification?: Partial<SdkNotification>
      theme?: Partial<SdkTheme>
      events?: FeatureEventBus
    }
  ): FeatureContext<TConfig>
}

/**
 * Create a minimal FeatureContext for testing.
 * No Core dependency required — all services are mockable.
 */
export function createFeatureContext<TConfig extends FeatureConfig = FeatureConfig>(
  plugin: PluginMetadata,
  overrides: Partial<FeatureContext<TConfig>> = {}
): FeatureContext<TConfig> {
  // In-memory storage for mock services
  const store = new Map<string, unknown>()
  const historyEntries: Array<{ id: string; timestamp: number; data: Record<string, unknown> }> = []
  let inputCache = ''
  let outputCache = ''
  let favoriteStatus = false

  const defaults: FeatureContext<TConfig> = {
    id: plugin.id,
    plugin,

    clipboard: {
      async copy(text: string): Promise<void> {
        outputCache = text
      },
      async paste(): Promise<string> {
        return inputCache
      },
      async copyInput(): Promise<void> {
        outputCache = inputCache
      },
      async copyOutput(): Promise<void> {
        // no-op in mock
      },
      async pasteInput(): Promise<void> {
        // no-op in mock
      },
    },

    history: {
      add(data: Record<string, unknown>) {
        const entry = {
          id: `${plugin.id}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
          timestamp: Date.now(),
          data,
        }
        historyEntries.unshift(entry)
        if (historyEntries.length > 20) historyEntries.length = 20
        return entry
      },
      remove(id: string) {
        const idx = historyEntries.findIndex((e) => e.id === id)
        if (idx !== -1) historyEntries.splice(idx, 1)
      },
      clear() {
        historyEntries.length = 0
      },
      restore(id: string) {
        return historyEntries.find((e) => e.id === id)?.data
      },
      getAll() {
        return [...historyEntries]
      },
      search(query: string) {
        const q = query.toLowerCase()
        return historyEntries.filter(
          (e) => JSON.stringify(e.data).toLowerCase().includes(q)
        )
      },
      get capacity() {
        return 20
      },
      get count() {
        return historyEntries.length
      },
    },

    settings: {
      async load(): Promise<TConfig> {
        const saved = store.get(`${plugin.id}:settings`) as TConfig | undefined
        return saved ?? ({} as TConfig)
      },
      async save(partial: Partial<TConfig>): Promise<void> {
        const current = (store.get(`${plugin.id}:settings`) ?? {}) as TConfig
        store.set(`${plugin.id}:settings`, { ...current, ...partial })
      },
      async reset(): Promise<void> {
        store.delete(`${plugin.id}:settings`)
      },
      async get<K extends keyof TConfig>(key: K): Promise<TConfig[K]> {
        const config = (store.get(`${plugin.id}:settings`) ?? {}) as TConfig
        return config[key]
      },
      async set<K extends keyof TConfig>(key: K, value: TConfig[K]): Promise<void> {
        const config = (store.get(`${plugin.id}:settings`) ?? {}) as TConfig
        store.set(`${plugin.id}:settings`, { ...config, [key]: value })
      },
      get schema() {
        return []
      },
      get defaults() {
        return {} as TConfig
      },
    },

    logger: {
      debug(message, data) {
        console.debug(`[${plugin.id}] ${message}`, data)
      },
      info(message, data) {
        console.info(`[${plugin.id}] ${message}`, data)
      },
      warn(message, data) {
        console.warn(`[${plugin.id}] ${message}`, data)
      },
      error(message, err) {
        console.error(`[${plugin.id}] ${message}`, err)
      },
    },

    notification: {
      toast(variant, title, description) {
        console.log(`[Toast:${variant}] ${title}: ${description}`)
      },
      success(title, description) {
        console.log(`[Toast:success] ${title}: ${description}`)
      },
      error(title, description) {
        console.error(`[Toast:error] ${title}: ${description}`)
      },
      info(title, description) {
        console.info(`[Toast:info] ${title}: ${description}`)
      },
    },

    theme: {
      mode: 'dark',
      accentColor: '#0078D4',
    },

    events: {
      emit(event: string, payload?: unknown): void {
        console.debug(`[Event:${plugin.id}:${event}]`, payload)
      },
      on(_event: string, _handler: (payload?: unknown) => void) {
        return () => {}
      },
      once(_event: string, _handler: (payload?: unknown) => void) {
        return () => {}
      },
    },
  }

  return { ...defaults, ...overrides }
}
