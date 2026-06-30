/** Curl Plugin — Type Definitions */

import type { FeatureConfig } from '@/sdk/feature'

export interface CurlConfig extends FeatureConfig {
  // Add your config fields here
  mode?: string
}

export interface CurlState {
  input: string
  output: string | null
  inputSize: number
  outputSize: number | null
}
