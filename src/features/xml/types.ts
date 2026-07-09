/** XML Plugin — Type Definitions */

import type { FeatureConfig } from '@/sdk/feature'

export interface XmlConfig extends FeatureConfig {
  indentSize: 2 | 4 | 'tab'
}

export interface XmlState {
  input: string
  output: string | null
  inputSize: number
  outputSize: number | null
}

export type XmlMode = 'format' | 'minify' | 'validate'

export interface XmlTransformResult {
  success: boolean
  output: string | null
  error: string | null
  stats: XmlStats | null
}

export interface XmlStats {
  chars: number
  lines: number
  bytes: number
}
