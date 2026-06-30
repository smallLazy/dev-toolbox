/**
 * Feature SDK — Unified Export
 *
 * This is the ONLY import Features need:
 *   import { BaseFeature, createFeatureContext, success, error } from '@/sdk/feature'
 */

// ── Base Class ────────────────────────────────────────────────────────
export { BaseFeature } from './BaseFeature'

// ── Context ───────────────────────────────────────────────────────────
export { createFeatureContext } from './FeatureContext'
export type { FeatureContext, FeatureContextFactory, SdkLogger, SdkNotification, SdkTheme } from './FeatureContext'

// ── Lifecycle ─────────────────────────────────────────────────────────
export { createFeatureLifecycle } from './FeatureLifecycle'
export type { FeatureLifecycle } from './FeatureLifecycle'

// ── Result ────────────────────────────────────────────────────────────
export {
  success,
  error,
  empty,
  loading,
  isSuccess,
  isError,
  isEmpty,
  isLoading,
  unwrap,
  unwrapOr,
  map,
} from './FeatureResult'
export type { FeatureResult } from './FeatureResult'

// ── Actions ───────────────────────────────────────────────────────────
export { createFeatureActions } from './FeatureActions'
export type { FeatureActions } from './FeatureActions'

// ── Clipboard ─────────────────────────────────────────────────────────
export { createWebClipboard } from './FeatureClipboard'
export type { FeatureClipboard } from './FeatureClipboard'

// ── History ───────────────────────────────────────────────────────────
export { createMemoryHistory } from './FeatureHistory'
export type { FeatureHistory } from './FeatureHistory'

// ── Settings ──────────────────────────────────────────────────────────
export { createMemorySettings } from './FeatureSettings'
export type { FeatureSettings, SettingField } from './FeatureSettings'

// ── Toolbar ───────────────────────────────────────────────────────────
export { createFeatureToolbar } from './FeatureToolbar'
export type { FeatureToolbar, ToolbarAction, ToolbarActionConfig } from './FeatureToolbar'

// ── Input / Output ────────────────────────────────────────────────────
export { createFeatureInput, createFeatureInputWithCustomValidation } from './FeatureInput'
export { createFeatureOutput } from './FeatureOutput'
export type { FeatureInputModel, FeatureOutputModel } from './types'

// ── Types ─────────────────────────────────────────────────────────────
export type {
  PluginMetadata,
  FeatureConfig,
  FeatureState,
  FeaturePhase,
  ValidationError,
  ValidationResult,
  FeatureLifecyclePhase,
  FeatureToolbarActions,
  FeatureEventBus,
  HistoryEntry,
} from './types'
