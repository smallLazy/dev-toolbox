/** Sm2 Plugin — Type Definitions */

import type { FeatureConfig } from '@/sdk/feature'

export interface Sm2Config extends FeatureConfig {
  // Add your config fields here
  mode?: string
}

export interface Sm2State {
  input: string
  output: string | null
  inputSize: number
  outputSize: number | null
}
