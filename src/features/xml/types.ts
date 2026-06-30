/** Xml Plugin — Type Definitions */

import type { FeatureConfig } from '@/sdk/feature'

export interface XmlConfig extends FeatureConfig {
  // Add your config fields here
  mode?: string
}

export interface XmlState {
  input: string
  output: string | null
  inputSize: number
  outputSize: number | null
}
