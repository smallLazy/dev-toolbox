/** Yaml Plugin — Type Definitions */

import type { FeatureConfig } from '@/sdk/feature'

export interface YamlConfig extends FeatureConfig {
  // Add your config fields here
  mode?: string
}

export interface YamlState {
  input: string
  output: string | null
  inputSize: number
  outputSize: number | null
}
