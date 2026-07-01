/**
 * Timestamp Plugin — Pure Logic
 */

import type {
  TimestampConfig,
  TimestampResult,
  TimestampToDateResult,
  DateToTimestampResult,
  TimestampValidationResult,
} from './types'

// ── Helpers ──────────────────────────────────────────────────────────

/** Convert timestamp string (seconds or milliseconds) to milliseconds */
export function normalizeTimestampInput(input: string): number {
  const trimmed = input.trim()
  const ts = parseInt(trimmed, 10)
  if (isNaN(ts)) {
    throw new Error('Invalid timestamp: not a number')
  }
  // Auto-detect seconds vs milliseconds: ≤ 10-digit = seconds
  return ts <= 9999999999 ? ts * 1000 : ts
}

// ── Timestamp → Date ─────────────────────────────────────────────────

export function timestampToDate(input: string): TimestampToDateResult {
  const ms = normalizeTimestampInput(input)
  const d = new Date(ms)
  return {
    local: d.toLocaleString('en-US'),
    iso: d.toISOString(),
    utc: d.toUTCString(),
  }
}

// ── Date → Timestamp ─────────────────────────────────────────────────

export function dateToTimestamp(input: string): DateToTimestampResult {
  const d = new Date(input.trim())
  if (isNaN(d.getTime())) {
    throw new Error('Invalid date string')
  }
  return {
    seconds: Math.floor(d.getTime() / 1000),
    milliseconds: d.getTime(),
  }
}

// ── Dispatch ─────────────────────────────────────────────────────────

export function transformTimestamp(
  input: string,
  config: TimestampConfig,
): TimestampResult {
  return config.mode === 'date-to-timestamp'
    ? dateToTimestamp(input)
    : timestampToDate(input)
}

// ── Format for display / copy ────────────────────────────────────────

export function formatTimestampToDateOutput(result: TimestampToDateResult): string {
  return `Local:    ${result.local}\nISO 8601: ${result.iso}\nUTC:      ${result.utc}`
}

export function formatDateToTimestampOutput(result: DateToTimestampResult): string {
  return `Seconds:      ${result.seconds}\nMilliseconds: ${result.milliseconds}`
}

export function formatOutput(input: string, config: TimestampConfig): string {
  const result = transformTimestamp(input, config)
  if (config.mode === 'date-to-timestamp') {
    return formatDateToTimestampOutput(result as DateToTimestampResult)
  }
  return formatTimestampToDateOutput(result as TimestampToDateResult)
}

// ── Validation ──────────────────────────────────────────────────────

export function validateTimestampInput(input: string): TimestampValidationResult {
  const trimmed = input.trim()
  if (trimmed.length === 0) {
    return {
      valid: false,
      errors: [{ field: 'input', code: 'EMPTY_INPUT', message: 'Timestamp is empty' }],
    }
  }
  const ts = parseInt(trimmed, 10)
  if (isNaN(ts) || !/^-?\d+$/.test(trimmed)) {
    return {
      valid: false,
      errors: [{ field: 'input', code: 'INVALID_TIMESTAMP', message: 'Invalid timestamp: must be a number' }],
    }
  }
  return { valid: true }
}

export function validateDateInput(input: string): TimestampValidationResult {
  const trimmed = input.trim()
  if (trimmed.length === 0) {
    return {
      valid: false,
      errors: [{ field: 'input', code: 'EMPTY_INPUT', message: 'Date string is empty' }],
    }
  }
  const d = new Date(trimmed)
  if (isNaN(d.getTime())) {
    return {
      valid: false,
      errors: [{ field: 'input', code: 'INVALID_DATE', message: 'Invalid date string' }],
    }
  }
  return { valid: true }
}

export function validateInput(
  input: string,
  config: TimestampConfig,
): TimestampValidationResult {
  return config.mode === 'date-to-timestamp'
    ? validateDateInput(input)
    : validateTimestampInput(input)
}

// ── Current time helpers ─────────────────────────────────────────────

export function getCurrentTimestamp(): {
  seconds: number
  milliseconds: number
  iso: string
  local: string
} {
  const now = Date.now()
  return {
    seconds: Math.floor(now / 1000),
    milliseconds: now,
    iso: new Date(now).toISOString(),
    local: new Date(now).toLocaleString('en-US'),
  }
}
