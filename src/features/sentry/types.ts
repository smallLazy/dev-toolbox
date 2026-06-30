/** Sentry Plugin — Type Definitions */

import type { FeatureConfig } from '@/sdk/feature'

export interface SentryConfig extends FeatureConfig {
  // Add your config fields here
  mode?: string
}

export interface SentryState {
  input: string
  output: string | null
  inputSize: number
  outputSize: number | null
}
