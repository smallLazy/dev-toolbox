/** Uuid Plugin — Type Definitions */

import type { FeatureConfig } from '@/sdk/feature'

export interface UuidConfig extends FeatureConfig {
  // Add your config fields here
  mode?: string
}

export interface UuidState {
  input: string
  output: string | null
  inputSize: number
  outputSize: number | null
}
