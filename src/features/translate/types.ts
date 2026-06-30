/** Translate Plugin — Type Definitions */

import type { FeatureConfig } from '@/sdk/feature'

export interface TranslateConfig extends FeatureConfig {
  // Add your config fields here
  mode?: string
}

export interface TranslateState {
  input: string
  output: string | null
  inputSize: number
  outputSize: number | null
}
