/** Prompt Plugin — Type Definitions */

import type { FeatureConfig } from '@/sdk/feature'

export interface PromptConfig extends FeatureConfig {
  // Add your config fields here
  mode?: string
}

export interface PromptState {
  input: string
  output: string | null
  inputSize: number
  outputSize: number | null
}
