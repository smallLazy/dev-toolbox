/**
 * Hello Plugin — Unit Tests (pure logic)
 *
 * These tests run without Vue, Tauri, or any Framework.
 * Pure TypeScript + vitest.
 */

import { describe, it, expect } from 'vitest'
import {
  getHelloVersion,
  getGreeting,
  formatTimestamp,
  generateSessionId,
  buildValidationChecklist,
  getValidationSummary,
} from '../logic'

describe('getHelloVersion', () => {
  it('returns the correct version', () => {
    expect(getHelloVersion()).toBe('1.0.0')
  })
})

describe('getGreeting', () => {
  it('returns default greeting when no name provided', () => {
    expect(getGreeting()).toBe('Hello, Developer!')
  })

  it('returns personalized greeting when name provided', () => {
    expect(getGreeting('World')).toBe('Hello, World!')
  })

  it('returns default greeting for empty string (falsy)', () => {
    expect(getGreeting('')).toBe('Hello, Developer!')
  })
})

describe('formatTimestamp', () => {
  it('returns dash for null', () => {
    expect(formatTimestamp(null)).toBe('—')
  })

  it('formats a valid timestamp', () => {
    const ts = new Date('2026-06-30T12:00:00').getTime()
    const result = formatTimestamp(ts)
    expect(result).not.toBe('—')
    expect(result).toContain('2026')
  })
})

describe('generateSessionId', () => {
  it('generates unique IDs', () => {
    const id1 = generateSessionId()
    const id2 = generateSessionId()
    expect(id1).not.toBe(id2)
  })

  it('starts with hello_ prefix', () => {
    expect(generateSessionId()).toMatch(/^hello_\d+_[a-z0-9]+$/)
  })
})

describe('buildValidationChecklist', () => {
  it('returns 11 checks', () => {
    const state = {
      registered: true,
      activated: true,
      registryCount: 1,
      commandCount: 2,
      shortcutCount: 2,
      historyEntries: 1,
    }
    expect(buildValidationChecklist(state)).toHaveLength(11)
  })

  it('all checks pass when all states are green', () => {
    const state = {
      registered: true,
      activated: true,
      registryCount: 1,
      commandCount: 2,
      shortcutCount: 2,
      historyEntries: 1,
    }
    const results = buildValidationChecklist(state)
    const allPassed = results.every((r) => r.passed)
    expect(allPassed).toBe(true)
  })

  it('some checks fail when not registered', () => {
    const state = {
      registered: false,
      activated: false,
      registryCount: 0,
      commandCount: 0,
      shortcutCount: 0,
      historyEntries: 0,
    }
    const results = buildValidationChecklist(state)
    const anyFailed = results.some((r) => !r.passed)
    expect(anyFailed).toBe(true)
  })
})

describe('getValidationSummary', () => {
  it('calculates all passed correctly', () => {
    const results = buildValidationChecklist({
      registered: true,
      activated: true,
      registryCount: 1,
      commandCount: 2,
      shortcutCount: 2,
      historyEntries: 1,
    })
    const summary = getValidationSummary(results)
    expect(summary.total).toBe(11)
    expect(summary.passed).toBe(11)
    expect(summary.failed).toBe(0)
    expect(summary.allPassed).toBe(true)
  })

  it('calculates partial failure correctly', () => {
    const results = [
      { check: 'A', passed: true, detail: '' },
      { check: 'B', passed: false, detail: '' },
      { check: 'C', passed: true, detail: '' },
    ]
    const summary = getValidationSummary(results)
    expect(summary.total).toBe(3)
    expect(summary.passed).toBe(2)
    expect(summary.failed).toBe(1)
    expect(summary.allPassed).toBe(false)
  })
})
