/** Zentao Plugin — Type Definitions */

import type { FeatureConfig } from '@/sdk/feature'

export interface ZentaoConfig extends FeatureConfig {
  // Add your config fields here
  mode?: string
}

export interface ZentaoState {
  input: string
  output: string | null
  inputSize: number
  outputSize: number | null
}
