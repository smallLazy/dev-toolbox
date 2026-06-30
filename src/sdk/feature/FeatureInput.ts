/**
 * FeatureInput — Unified input model.
 *
 * Every Feature uses this model for its input.
 * Provides built-in validation, encoding awareness, and metadata.
 */

import type { FeatureInputModel, ValidationResult } from './types'

export function createFeatureInput(
  value: string,
  options?: {
    encoding?: string
    format?: string
    metadata?: Record<string, unknown>
  }
): FeatureInputModel {
  return {
    value,
    encoding: options?.encoding,
    format: options?.format,
    metadata: options?.metadata,

    validate(): ValidationResult {
      if (!value || value.trim().length === 0) {
        return {
          valid: false,
          errors: [{ field: 'input', message: 'Input is empty' }],
        }
      }
      return { valid: true }
    },

    isEmpty(): boolean {
      return !value || value.trim().length === 0
    },
  }
}

export function createFeatureInputWithCustomValidation(
  value: string,
  validateFn: (value: string) => ValidationResult,
  options?: {
    encoding?: string
    format?: string
    metadata?: Record<string, unknown>
  }
): FeatureInputModel {
  const base = createFeatureInput(value, options)
  return {
    ...base,
    validate(): ValidationResult {
      return validateFn(value)
    },
  }
}
