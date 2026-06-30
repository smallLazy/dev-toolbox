/** Sql Plugin — Type Definitions */

import type { FeatureConfig } from '@/sdk/feature'

export interface SqlConfig extends FeatureConfig {
  // Add your config fields here
  mode?: string
}

export interface SqlState {
  input: string
  output: string | null
  inputSize: number
  outputSize: number | null
}
