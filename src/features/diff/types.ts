/** Diff Plugin — Type Definitions */

import type { FeatureConfig } from '@/sdk/feature'

export interface DiffConfig extends FeatureConfig {
  // Add your config fields here
  mode?: string
}

export interface DiffState {
  input: string
  output: string | null
  inputSize: number
  outputSize: number | null
}
