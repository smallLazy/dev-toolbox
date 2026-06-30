/** JSON Plugin — Type Definitions */

import type { FeatureConfig } from '@/sdk/feature'

export interface JsonConfig extends FeatureConfig {
  indentSize: 2 | 4
  sortKeys: boolean
  autoFormatOnPaste: boolean
  themeFollowWorkspace: boolean
}

export interface JsonState {
  input: string
  output: string | null
  inputLines: number
  outputLines: number
  inputSize: number
  outputSize: number | null
}

export type JsonMode = 'format' | 'minify' | 'validate'

export interface JsonFormatResult {
  formatted: string
  lines: number
  size: number
}

export interface JsonValidateResult {
  valid: boolean
  errors: Array<{
    line: number
    column: number
    message: string
  }>
}
