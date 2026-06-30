/** Unicode Plugin — Type Definitions */

import type { FeatureConfig } from '@/sdk/feature'

export interface UnicodeConfig extends FeatureConfig {
  // Add your config fields here
  mode?: string
}

export interface UnicodeState {
  input: string
  output: string | null
  inputSize: number
  outputSize: number | null
}
