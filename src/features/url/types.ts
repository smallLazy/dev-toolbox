/** URL Plugin — Type Definitions */

import type { FeatureConfig } from '@/sdk/feature'

export type UrlMode = 'encode' | 'decode'
export type UrlVariant = 'component' | 'uri' | 'php'

export interface UrlConfig extends FeatureConfig {
  mode: UrlMode
  variant: UrlVariant
}

export interface UrlResult {
  input: string
  output: string
  config: UrlConfig
}

export interface UrlValidationError {
  field: string
  code: string
  message: string
  position?: number
}

export type UrlValidationResult =
  | { valid: true }
  | { valid: false; errors: UrlValidationError[] }

export interface TextStats {
  chars: number
  bytes: number
  lines: number
}

export interface UrlState {
  input: string
  output: string | null
  inputSize: number
  outputSize: number | null
}
