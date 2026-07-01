/**
 * Timestamp Plugin — Unit Tests (pure logic)
 */

import { describe, it, expect } from 'vitest'
import {
  normalizeTimestampInput,
  timestampToDate,
  dateToTimestamp,
  transformTimestamp,
  formatTimestampToDateOutput,
  formatDateToTimestampOutput,
  formatOutput,
  validateTimestampInput,
  validateDateInput,
  getCurrentTimestamp,
} from '../logic'

// ── normalizeTimestampInput ──────────────────────────────────────────

describe('normalizeTimestampInput', () => {
  it('converts seconds (10 digits) to milliseconds', () => {
    expect(normalizeTimestampInput('0')).toBe(0)
    expect(normalizeTimestampInput('1700000000')).toBe(1700000000000)
  })

  it('keeps milliseconds (13 digits) unchanged', () => {
    expect(normalizeTimestampInput('1700000000000')).toBe(1700000000000)
  })

  it('handles small numbers as seconds', () => {
    // 9999999999 = max 10-digit → treated as seconds
    expect(normalizeTimestampInput('9999999999')).toBe(9999999999000)
  })

  it('throws on non-numeric input', () => {
    expect(() => normalizeTimestampInput('abc')).toThrow('Invalid timestamp')
    expect(() => normalizeTimestampInput('')).toThrow('Invalid timestamp')
  })
})

// ── timestampToDate ──────────────────────────────────────────────────

describe('timestampToDate', () => {
  it('converts epoch 0 to 1970-01-01', () => {
    const result = timestampToDate('0')
    expect(result.iso).toBe('1970-01-01T00:00:00.000Z')
    expect(result.utc).toContain('1970')
  })

  it('converts a known timestamp', () => {
    const result = timestampToDate('1700000000')
    expect(result.iso).toBe('2023-11-14T22:13:20.000Z')
  })

  it('handles milliseconds input', () => {
    const result = timestampToDate('1700000000000')
    expect(result.iso).toBe('2023-11-14T22:13:20.000Z')
  })

  it('handles negative timestamp', () => {
    const result = timestampToDate('-86400') // 1 day before epoch
    expect(result.iso).toBe('1969-12-31T00:00:00.000Z')
  })

  it('produces local, iso, and utc strings', () => {
    const result = timestampToDate('0')
    expect(result.local).toBeTruthy()
    expect(result.iso).toBeTruthy()
    expect(result.utc).toBeTruthy()
  })
})

// ── dateToTimestamp ──────────────────────────────────────────────────

describe('dateToTimestamp', () => {
  it('converts epoch ISO string', () => {
    const result = dateToTimestamp('1970-01-01T00:00:00.000Z')
    expect(result.seconds).toBe(0)
    expect(result.milliseconds).toBe(0)
  })

  it('converts a known date', () => {
    const result = dateToTimestamp('2023-11-14T22:13:20.000Z')
    expect(result.seconds).toBe(1700000000)
    expect(result.milliseconds).toBe(1700000000000)
  })

  it('throws on invalid date string', () => {
    expect(() => dateToTimestamp('not a date')).toThrow('Invalid date string')
  })

  it('throws on empty string', () => {
    expect(() => dateToTimestamp('')).toThrow('Invalid date string')
  })
})

// ── transformTimestamp ───────────────────────────────────────────────

describe('transformTimestamp', () => {
  it('dispatches to timestampToDate', () => {
    const result = transformTimestamp('0', { mode: 'timestamp-to-date' })
    expect('iso' in result).toBe(true)
    expect((result as ReturnType<typeof timestampToDate>).iso).toBe('1970-01-01T00:00:00.000Z')
  })

  it('dispatches to dateToTimestamp', () => {
    const result = transformTimestamp('1970-01-01T00:00:00.000Z', { mode: 'date-to-timestamp' })
    expect('seconds' in result).toBe(true)
    expect((result as ReturnType<typeof dateToTimestamp>).seconds).toBe(0)
  })
})

// ── format output ────────────────────────────────────────────────────

describe('formatTimestampToDateOutput', () => {
  it('formats output with Local, ISO, UTC labels', () => {
    const result = timestampToDate('0')
    const formatted = formatTimestampToDateOutput(result)
    expect(formatted).toContain('Local:')
    expect(formatted).toContain('ISO 8601:')
    expect(formatted).toContain('UTC:')
    expect(formatted).toContain('1970-01-01')
  })
})

describe('formatDateToTimestampOutput', () => {
  it('formats output with Seconds and Milliseconds labels', () => {
    const result = dateToTimestamp('1970-01-01T00:00:00.000Z')
    const formatted = formatDateToTimestampOutput(result)
    expect(formatted).toContain('Seconds:')
    expect(formatted).toContain('Milliseconds:')
    expect(formatted).toContain('0')
  })
})

describe('formatOutput', () => {
  it('formats timestamp-to-date mode', () => {
    const out = formatOutput('0', { mode: 'timestamp-to-date' })
    expect(out).toContain('ISO 8601:')
  })

  it('formats date-to-timestamp mode', () => {
    const out = formatOutput('1970-01-01T00:00:00.000Z', { mode: 'date-to-timestamp' })
    expect(out).toContain('Seconds:')
    expect(out).toContain('0')
  })
})

// ── validation ───────────────────────────────────────────────────────

describe('validateTimestampInput', () => {
  it('rejects empty string', () => {
    const r = validateTimestampInput('')
    expect(r.valid).toBe(false)
    if (!r.valid) expect(r.errors[0].code).toBe('EMPTY_INPUT')
  })

  it('rejects non-numeric string', () => {
    const r = validateTimestampInput('abc')
    expect(r.valid).toBe(false)
    if (!r.valid) expect(r.errors[0].code).toBe('INVALID_TIMESTAMP')
  })

  it('accepts numeric string', () => {
    expect(validateTimestampInput('0').valid).toBe(true)
    expect(validateTimestampInput('1700000000').valid).toBe(true)
  })

  it('accepts negative timestamp', () => {
    expect(validateTimestampInput('-86400').valid).toBe(true)
  })
})

describe('validateDateInput', () => {
  it('rejects empty string', () => {
    const r = validateDateInput('')
    expect(r.valid).toBe(false)
    if (!r.valid) expect(r.errors[0].code).toBe('EMPTY_INPUT')
  })

  it('rejects invalid date', () => {
    const r = validateDateInput('not a date')
    expect(r.valid).toBe(false)
    if (!r.valid) expect(r.errors[0].code).toBe('INVALID_DATE')
  })

  it('accepts ISO 8601 string', () => {
    expect(validateDateInput('1970-01-01T00:00:00.000Z').valid).toBe(true)
  })

  it('accepts various date formats', () => {
    expect(validateDateInput('2024-01-01').valid).toBe(true)
    expect(validateDateInput('Jan 1 2024').valid).toBe(true)
  })
})

// ── getCurrentTimestamp ──────────────────────────────────────────────

describe('getCurrentTimestamp', () => {
  it('returns current timestamp values', () => {
    const now = getCurrentTimestamp()
    expect(now.seconds).toBeGreaterThan(1700000000) // after Nov 2023
    expect(now.milliseconds).toBeGreaterThan(1700000000000)
    expect(now.iso).toBeTruthy()
    expect(now.local).toBeTruthy()
  })
})
