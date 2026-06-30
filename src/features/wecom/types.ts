/** Wecom Plugin — Type Definitions */

import type { FeatureConfig } from '@/sdk/feature'

export interface WecomConfig extends FeatureConfig {
  // Add your config fields here
  mode?: string
}

export interface WecomState {
  input: string
  output: string | null
  inputSize: number
  outputSize: number | null
}
