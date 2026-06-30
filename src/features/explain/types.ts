/** Explain Plugin — Type Definitions */

import type { FeatureConfig } from '@/sdk/feature'

export interface ExplainConfig extends FeatureConfig {
  // Add your config fields here
  mode?: string
}

export interface ExplainState {
  input: string
  output: string | null
  inputSize: number
  outputSize: number | null
}
