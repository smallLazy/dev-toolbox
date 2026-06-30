/** Agent Plugin — Type Definitions */

import type { FeatureConfig } from '@/sdk/feature'

export interface AgentConfig extends FeatureConfig {
  // Add your config fields here
  mode?: string
}

export interface AgentState {
  input: string
  output: string | null
  inputSize: number
  outputSize: number | null
}
