/** Sm4 Plugin — Type Definitions */

import type { FeatureConfig } from '@/sdk/feature'

export interface Sm4Config extends FeatureConfig {
  // Add your config fields here
  mode?: string
}

export interface Sm4State {
  input: string
  output: string | null
  inputSize: number
  outputSize: number | null
}
