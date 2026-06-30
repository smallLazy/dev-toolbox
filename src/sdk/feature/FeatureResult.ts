/**
 * FeatureResult — Unified result model for all Features.
 *
 * Every Feature's run() returns a FeatureResult<T>.
 * This eliminates inconsistent error handling across tools.
 */

export type FeatureResult<T> =
  | { kind: 'success'; data: T }
  | { kind: 'error'; message: string; code?: string }
  | { kind: 'empty'; message?: string }
  | { kind: 'loading'; progress?: number }

// ── Constructors ────────────────────────────────────────────────────────

export function success<T>(data: T): FeatureResult<T> {
  return { kind: 'success', data }
}

export function error<T = never>(message: string, code?: string): FeatureResult<T> {
  return { kind: 'error', message, code }
}

export function empty<T = never>(message?: string): FeatureResult<T> {
  return { kind: 'empty', message }
}

export function loading<T = never>(progress?: number): FeatureResult<T> {
  return { kind: 'loading', progress }
}

// ── Guards ──────────────────────────────────────────────────────────────

export function isSuccess<T>(result: FeatureResult<T>): result is { kind: 'success'; data: T } {
  return result.kind === 'success'
}

export function isError<T>(result: FeatureResult<T>): result is { kind: 'error'; message: string; code?: string } {
  return result.kind === 'error'
}

export function isEmpty<T>(result: FeatureResult<T>): result is { kind: 'empty'; message?: string } {
  return result.kind === 'empty'
}

export function isLoading<T>(result: FeatureResult<T>): result is { kind: 'loading'; progress?: number } {
  return result.kind === 'loading'
}

// ── Unwrap ──────────────────────────────────────────────────────────────

/** Extract data from a success result, or throw for non-success. */
export function unwrap<T>(result: FeatureResult<T>): T {
  if (result.kind === 'success') return result.data
  if (result.kind === 'error') throw new Error(result.message)
  if (result.kind === 'empty') throw new Error(result.message ?? 'Result is empty')
  throw new Error('Result is still loading')
}

/** Extract data from a success result, or return a default value. */
export function unwrapOr<T>(result: FeatureResult<T>, fallback: T): T {
  return result.kind === 'success' ? result.data : fallback
}

// ── Map ─────────────────────────────────────────────────────────────────

/** Transform the data inside a success result. */
export function map<T, U>(result: FeatureResult<T>, fn: (data: T) => U): FeatureResult<U> {
  if (result.kind === 'success') return success(fn(result.data))
  return result as unknown as FeatureResult<U>
}
