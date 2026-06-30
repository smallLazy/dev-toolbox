/**
 * Feature SDK — Core Type Definitions
 *
 * All Features depend on these types.
 * Features MUST NOT import from '@/core' directly.
 */

// ── Plugin Metadata ────────────────────────────────────────────────────

export interface PluginMetadata {
  readonly id: string
  readonly name: string
  readonly description: string
  readonly icon: string
  readonly version: string
  readonly category: string
}

// ── Feature Config ─────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface FeatureConfig {
  // Extended by each Feature
}

// ── Feature State ──────────────────────────────────────────────────────

export type FeaturePhase = 'idle' | 'loading' | 'success' | 'error' | 'empty'

export interface FeatureState<TOutput = string> {
  phase: FeaturePhase
  input: string
  output: TOutput | null
  error: string | null
  progress: number | null
}

// ── Validation ─────────────────────────────────────────────────────────

export interface ValidationError {
  field: string
  message: string
  code?: string
}

export type ValidationResult =
  | { valid: true }
  | { valid: false; errors: ValidationError[] }

// ── Feature Result ─────────────────────────────────────────────────────

export type FeatureResult<T> =
  | { kind: 'success'; data: T }
  | { kind: 'error'; message: string; code?: string }
  | { kind: 'empty'; message?: string }
  | { kind: 'loading'; progress?: number }

// ── History ────────────────────────────────────────────────────────────

export interface HistoryEntry<T = Record<string, unknown>> {
  id: string
  timestamp: number
  data: T
}

// ── Event Bus (SDK-scoped) ─────────────────────────────────────────────

export interface FeatureEventBus {
  emit(event: string, payload?: unknown): void
  on(event: string, handler: (payload?: unknown) => void): () => void
  once(event: string, handler: (payload?: unknown) => void): () => void
}

// ── Lifecycle ──────────────────────────────────────────────────────────

export type FeatureLifecyclePhase =
  | 'uninitialized'
  | 'initialized'
  | 'active'
  | 'inactive'
  | 'disposed'

// ── Toolbar Actions ────────────────────────────────────────────────────

export interface FeatureToolbarActions {
  copy: boolean
  paste: boolean
  clear: boolean
  swap: boolean
  favorite: boolean
  history: boolean
  settings: boolean
  refresh: boolean
  export: boolean
  import: boolean
}

// ── Input / Output Models ──────────────────────────────────────────────

export interface FeatureInputModel<T = string> {
  value: T
  encoding?: string
  format?: string
  metadata?: Record<string, unknown>
  validate(): ValidationResult
  isEmpty(): boolean
}

export interface FeatureOutputModel<T = string> {
  value: T | null
  encoding?: string
  format?: string
  metadata?: Record<string, unknown>
  readonly isEmpty: boolean
  readonly isSuccess: boolean
}
