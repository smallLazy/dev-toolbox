/** HtmlEncode Plugin — Type Definitions */

import type { FeatureConfig } from '@/sdk/feature'

export interface HtmlEncodeConfig extends FeatureConfig {
  // Add your config fields here
  mode?: string
}

export interface HtmlEncodeState {
  input: string
  output: string | null
  inputSize: number
  outputSize: number | null
}
