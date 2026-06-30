/** Regex Plugin — Type Definitions */

import type { FeatureConfig } from '@/sdk/feature'

export interface RegexConfig extends FeatureConfig {
  // Add your config fields here
  mode?: string
}

export interface RegexState {
  input: string
  output: string | null
  inputSize: number
  outputSize: number | null
}
