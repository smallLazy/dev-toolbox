/** Color Plugin — Type Definitions */

import type { FeatureConfig } from '@/sdk/feature'

export interface ColorConfig extends FeatureConfig {
  // Add your config fields here
  mode?: string
}

export interface ColorState {
  input: string
  output: string | null
  inputSize: number
  outputSize: number | null
}
