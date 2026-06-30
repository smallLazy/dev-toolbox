/** Base64 Plugin — Type Definitions */

import type { FeatureConfig } from '@/sdk/feature'

export interface Base64Config extends FeatureConfig {
  mode: 'encode' | 'decode'
}

export interface Base64State {
  input: string
  output: string | null
  inputSize: number
  outputSize: number | null
}

export interface Base64ValidationResult {
  valid: boolean
  error?: {
    type: 'invalid_character' | 'invalid_length' | 'invalid_padding'
    message: string
    position?: number
  }
}

export interface TextStats {
  chars: number
  lines: number
  bytes: number
}

export interface Base64Result {
  output: string
  stats: TextStats
}
