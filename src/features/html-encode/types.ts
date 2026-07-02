/** HtmlEncode Plugin — Type Definitions */

import type { FeatureConfig } from '@/sdk/feature'

export type HtmlMode = 'encode' | 'decode'

export interface HtmlEncodeConfig extends FeatureConfig {
  mode: HtmlMode
}

export interface HtmlEncodeState {
  input: string
  output: string | null
  inputSize: number
  outputSize: number | null
}

/** Result of a safe decode operation. Never throws. */
export type TryDecodeHtmlResult =
  | { success: true; value: string }
  | { success: false; error: string }
