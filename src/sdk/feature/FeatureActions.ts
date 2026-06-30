/**
 * FeatureActions — Standardized tool action pipeline.
 *
 * Every Feature follows: validate → transform → run → result
 * This eliminates inconsistent action implementations across tools.
 */

import type { FeatureConfig, ValidationResult } from './types'
import type { FeatureResult } from './FeatureResult'
import { success, error, empty, loading } from './FeatureResult'

export interface FeatureActions<TConfig extends FeatureConfig, TInput = string, TOutput = string> {
  /** Execute the full pipeline: validate → transform → run. */
  execute(input: TInput, config: TConfig): Promise<FeatureResult<TOutput>>

  /** Validate input before execution. */
  validate(input: TInput): ValidationResult

  /** Transform/preprocess input before running. */
  transform(input: TInput, config: TConfig): TInput

  /** Execute the core logic. Must be a pure function (or async). */
  run(input: TInput, config: TConfig): Promise<TOutput>

  /** Cancel any ongoing async work. */
  cancel(): void

  /** Reset all state to defaults. */
  reset(): void
}

/**
 * Create a FeatureActions pipeline from individual functions.
 * This is the preferred way to implement FeatureActions.
 */
export function createFeatureActions<TConfig extends FeatureConfig, TInput = string, TOutput = string>(handlers: {
  run: (input: TInput, config: TConfig) => Promise<TOutput>
  validate?: (input: TInput) => ValidationResult
  transform?: (input: TInput, config: TConfig) => TInput
  onError?: (err: Error) => void
}): FeatureActions<TConfig, TInput, TOutput> {
  let abortController: AbortController | null = null

  return {
    async execute(input: TInput, config: TConfig): Promise<FeatureResult<TOutput>> {
      // 1. Validate
      const validation = handlers.validate
        ? handlers.validate(input)
        : defaultValidate(input)
      if (!validation.valid) {
        return error(validation.errors[0]?.message ?? 'Validation failed')
      }

      // 2. Transform
      const transformed = handlers.transform ? handlers.transform(input, config) : input

      // 3. Check empty
      if (typeof transformed === 'string' && !transformed.trim()) {
        return empty('Input is empty')
      }

      // 4. Run
      abortController = new AbortController()
      try {
        const result = await handlers.run(transformed, config)
        return result === null || result === undefined
          ? empty('No output produced')
          : success(result)
      } catch (err) {
        handlers.onError?.(err as Error)
        return error((err as Error).message)
      }
    },

    validate(input: TInput): ValidationResult {
      return handlers.validate ? handlers.validate(input) : defaultValidate(input)
    },

    transform(input: TInput, config: TConfig): TInput {
      return handlers.transform ? handlers.transform(input, config) : input
    },

    async run(input: TInput, config: TConfig): Promise<TOutput> {
      return handlers.run(input, config)
    },

    cancel(): void {
      abortController?.abort()
      abortController = null
    },

    reset(): void {
      this.cancel()
    },
  }
}

function defaultValidate(input: unknown): ValidationResult {
  if (typeof input === 'string' && !input.trim()) {
    return { valid: false, errors: [{ field: 'input', message: 'Input is empty' }] }
  }
  return { valid: true }
}

// Re-export for convenience
export { success, error, empty, loading }
