/** UUID Plugin — Type Definitions */

import type { FeatureConfig } from '@/sdk/feature'

export interface UuidConfig extends FeatureConfig {
  count: number
}

export interface UuidState {
  input: string
  output: string | null
  inputSize: number
  outputSize: number | null
}

export type UuidMode = 'generate' | 'validate' | 'normalize'

export type UuidVersion = 'v1' | 'v3' | 'v4' | 'v5' | 'unknown'

export interface UuidValidationResult {
  valid: boolean
  version: UuidVersion
  normalized: string | null
  message: string
}
