/** Timestamp Plugin — Type Definitions */

import type { FeatureConfig } from '@/sdk/feature'

export type TimestampMode = 'timestamp-to-date' | 'date-to-timestamp'

export interface TimestampConfig extends FeatureConfig {
  mode: TimestampMode
}

export interface TimestampToDateResult {
  local: string
  iso: string
  utc: string
}

export interface DateToTimestampResult {
  seconds: number
  milliseconds: number
}

export type TimestampResult = TimestampToDateResult | DateToTimestampResult

export interface TimestampValidationError {
  field: string
  code: string
  message: string
}

export type TimestampValidationResult =
  | { valid: true }
  | { valid: false; errors: TimestampValidationError[] }

export interface TimestampState {
  input: string
  output: string | null
}
