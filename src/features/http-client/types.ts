/** HttpClient Plugin — Type Definitions */

import type { FeatureConfig } from '@/sdk/feature'

export interface HttpClientConfig extends FeatureConfig {
  // Add your config fields here
  mode?: string
}

export interface HttpClientState {
  input: string
  output: string | null
  inputSize: number
  outputSize: number | null
}
