/** Review Plugin — Type Definitions */

import type { FeatureConfig } from '@/sdk/feature'

export interface ReviewConfig extends FeatureConfig {
  // Add your config fields here
  mode?: string
}

export interface ReviewState {
  input: string
  output: string | null
  inputSize: number
  outputSize: number | null
}
