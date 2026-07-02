/** Unicode Plugin — Type Definitions */

import type { FeatureConfig } from '@/sdk/feature'

export type UnicodeMode = 'encode' | 'decode'
export type UnicodeVariant = 'javascript' | 'code-point'

export interface UnicodeConfig extends FeatureConfig {
  mode: UnicodeMode
  variant: UnicodeVariant
}

export interface UnicodeState {
  input: string
  output: string | null
  inputSize: number
  outputSize: number | null
}

export interface TextStats {
  chars: number
  lines: number
  bytes: number
}

export interface UnicodeResult {
  output: string
  stats: TextStats
}

/** Result type for safe decode operations that must never throw. */
export type TryDecodeUnicodeResult =
  | { success: true; value: string }
  | { success: false; error: string }
