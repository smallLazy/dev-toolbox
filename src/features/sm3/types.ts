/** Sm3 Plugin — Type Definitions */

import type { FeatureConfig } from '@/sdk/feature'

export interface Sm3Config extends FeatureConfig {
  // Add your config fields here
  mode?: string
}

export interface Sm3State {
  input: string
  output: string | null
  inputSize: number
  outputSize: number | null
}
