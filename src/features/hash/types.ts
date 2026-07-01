/** Hash Plugin — Type Definitions */

import type { FeatureConfig } from '@/sdk/feature'

export type HashAlgorithm = 'md5' | 'sha256'

export interface HashConfig extends FeatureConfig {
  algorithm: HashAlgorithm
}

export interface HashResult {
  input: string
  output: string
  config: HashConfig
}

export interface HashValidationError {
  field: string
  code: string
  message: string
}

export type HashValidationResult =
  | { valid: true }
  | { valid: false; errors: HashValidationError[] }

export interface TextStats {
  chars: number
  bytes: number
  lines: number
}

export interface HashState {
  input: string
  output: string | null
  inputSize: number
  outputSize: number | null
}
