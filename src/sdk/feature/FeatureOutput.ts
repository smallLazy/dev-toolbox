/**
 * FeatureOutput — Unified output model.
 *
 * Every Feature uses this model for its output.
 */

import type { FeatureOutputModel } from './types'

export function createFeatureOutput<T = string>(
  value: T | null,
  options?: {
    encoding?: string
    format?: string
    metadata?: Record<string, unknown>
  }
): FeatureOutputModel<T> {
  return {
    value,
    encoding: options?.encoding,
    format: options?.format,
    metadata: options?.metadata,

    get isEmpty(): boolean {
      return value === null || value === undefined || value === ''
    },

    get isSuccess(): boolean {
      return value !== null && value !== undefined
    },
  }
}
