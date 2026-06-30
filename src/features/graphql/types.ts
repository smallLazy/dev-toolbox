/** Graphql Plugin — Type Definitions */

import type { FeatureConfig } from '@/sdk/feature'

export interface GraphqlConfig extends FeatureConfig {
  // Add your config fields here
  mode?: string
}

export interface GraphqlState {
  input: string
  output: string | null
  inputSize: number
  outputSize: number | null
}
