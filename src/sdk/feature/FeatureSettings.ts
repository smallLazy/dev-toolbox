/**
 * FeatureSettings — Per-feature settings management.
 *
 * Each Feature has its own settings scope, isolated from other Features.
 * Settings schema drives auto-generated settings UI.
 */

import type { FeatureConfig } from './types'

export interface SettingField {
  key: string
  type: 'select' | 'toggle' | 'input' | 'number'
  label: string
  description?: string
  options?: string[]
  default: unknown
}

export interface FeatureSettings<TConfig extends FeatureConfig = FeatureConfig> {
  /** Load settings from persistent storage. */
  load(): Promise<TConfig>

  /** Save partial settings (merged with existing). */
  save(partial: Partial<TConfig>): Promise<void>

  /** Reset to defaults. */
  reset(): Promise<void>

  /** Get a single setting value. */
  get<K extends keyof TConfig>(key: K): Promise<TConfig[K]>

  /** Set a single setting value. */
  set<K extends keyof TConfig>(key: K, value: TConfig[K]): Promise<void>

  /** Settings schema for auto-generated settings UI. */
  readonly schema: readonly SettingField[]

  /** Default values. */
  readonly defaults: TConfig
}

/**
 * Create in-memory FeatureSettings (for testing or simple features).
 */
export function createMemorySettings<TConfig extends FeatureConfig>(
  pluginId: string,
  defaults: TConfig
): FeatureSettings<TConfig> {
  const store = new Map<string, TConfig>()

  return {
    async load(): Promise<TConfig> {
      return store.get(`${pluginId}:settings`) ?? { ...defaults }
    },

    async save(partial: Partial<TConfig>): Promise<void> {
      const current = store.get(`${pluginId}:settings`) ?? { ...defaults }
      store.set(`${pluginId}:settings`, { ...current, ...partial } as TConfig)
    },

    async reset(): Promise<void> {
      store.set(`${pluginId}:settings`, { ...defaults })
    },

    async get<K extends keyof TConfig>(key: K): Promise<TConfig[K]> {
      const config = store.get(`${pluginId}:settings`) ?? { ...defaults }
      return config[key]
    },

    async set<K extends keyof TConfig>(key: K, value: TConfig[K]): Promise<void> {
      const config = store.get(`${pluginId}:settings`) ?? { ...defaults }
      store.set(`${pluginId}:settings`, { ...config, [key]: value })
    },

    get schema() {
      return []
    },

    get defaults() {
      return { ...defaults }
    },
  }
}
