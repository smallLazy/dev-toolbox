/** Rsa Plugin — Type Definitions */

import type { FeatureConfig } from '@/sdk/feature'

export interface RsaConfig extends FeatureConfig {
  // Add your config fields here
  mode?: string
}

export interface RsaState {
  input: string
  output: string | null
  inputSize: number
  outputSize: number | null
}
