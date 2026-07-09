/**
 * UUID Plugin — Unit Tests (pure logic)
 */

import { describe, it, expect } from 'vitest'
import {
  generateUuidV4,
  generateUuids,
  validateUuid,
  getUuidVersion,
  normalizeUuid,
  getStats,
  formatSize,
  SAMPLE_UUID,
} from '../logic'

// ═══════════════════════════════════════════════════════════════════════════
// generateUuidV4
// ═══════════════════════════════════════════════════════════════════════════

describe('generateUuidV4', () => {
  it('returns a valid v4 UUID', () => {
    const uuid = generateUuidV4()
    expect(uuid).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/)
  })

  it('returns lowercase by default', () => {
    const uuid = generateUuidV4()
    expect(uuid).toBe(uuid.toLowerCase())
  })

  it('produces unique values on repeated calls', () => {
    const set = new Set(Array.from({ length: 50 }, () => generateUuidV4()))
    expect(set.size).toBe(50)
  })
})

// ═══════════════════════════════════════════════════════════════════════════
// generateUuids
// ═══════════════════════════════════════════════════════════════════════════

describe('generateUuids', () => {
  it('returns requested count', () => {
    const uuids = generateUuids(5)
    expect(uuids).toHaveLength(5)
    for (const u of uuids) {
      expect(u).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/)
    }
  })

  it('clamps count to minimum 1', () => {
    expect(generateUuids(0)).toHaveLength(1)
    expect(generateUuids(-5)).toHaveLength(1)
  })

  it('clamps count to maximum 100', () => {
    expect(generateUuids(200)).toHaveLength(100)
    expect(generateUuids(1000)).toHaveLength(100)
  })

  it('default count of 1 returns single UUID', () => {
    expect(generateUuids(1)).toHaveLength(1)
  })

  it('each generated UUID is unique', () => {
    const uuids = generateUuids(100)
    const unique = new Set(uuids)
    expect(unique.size).toBe(100)
  })
})

// ═══════════════════════════════════════════════════════════════════════════
// validateUuid
// ═══════════════════════════════════════════════════════════════════════════

describe('validateUuid', () => {
  it('accepts valid v4 UUID', () => {
    const result = validateUuid('550e8400-e29b-41d4-a716-446655440000')
    expect(result.valid).toBe(true)
    expect(result.version).toBe('v4')
    expect(result.message).toContain('Valid')
  })

  it('accepts uppercase UUID', () => {
    const result = validateUuid('550E8400-E29B-41D4-A716-446655440000')
    expect(result.valid).toBe(true)
    expect(result.version).toBe('v4')
    expect(result.normalized).toBe('550e8400-e29b-41d4-a716-446655440000')
  })

  it('accepts mixed case UUID', () => {
    const result = validateUuid('550E8400-e29b-41d4-A716-446655440000')
    expect(result.valid).toBe(true)
    expect(result.version).toBe('v4')
  })

  it('detects v1 UUID', () => {
    const result = validateUuid('550e8400-e29b-11d4-a716-446655440000')
    expect(result.valid).toBe(true)
    expect(result.version).toBe('v1')
  })

  it('detects v3 UUID', () => {
    const result = validateUuid('550e8400-e29b-31d4-a716-446655440000')
    expect(result.valid).toBe(true)
    expect(result.version).toBe('v3')
  })

  it('detects v5 UUID', () => {
    const result = validateUuid('550e8400-e29b-51d4-a716-446655440000')
    expect(result.valid).toBe(true)
    expect(result.version).toBe('v5')
  })

  it('rejects invalid UUID string', () => {
    const result = validateUuid('not-a-uuid')
    expect(result.valid).toBe(false)
    expect(result.message).toBeTruthy()
  })

  it('rejects UUID without hyphens', () => {
    const result = validateUuid('550e8400e29b41d4a716446655440000')
    expect(result.valid).toBe(false)
  })

  it('rejects UUID with wrong length', () => {
    const result = validateUuid('550e8400-e29b-41d4-a716-44665544')
    expect(result.valid).toBe(false)
  })

  it('trims whitespace before validation', () => {
    const result = validateUuid('  550e8400-e29b-41d4-a716-446655440000  ')
    expect(result.valid).toBe(true)
    expect(result.version).toBe('v4')
  })

  it('handles empty input', () => {
    const result = validateUuid('')
    expect(result.valid).toBe(false)
    expect(result.message).toBe('Input is empty')
  })

  it('rejects UUID with extra characters', () => {
    const result = validateUuid('550e8400-e29b-41d4-a716-446655440000-extra')
    expect(result.valid).toBe(false)
  })
})

// ═══════════════════════════════════════════════════════════════════════════
// getUuidVersion
// ═══════════════════════════════════════════════════════════════════════════

describe('getUuidVersion', () => {
  it('detects v1', () => {
    expect(getUuidVersion('550e8400-e29b-11d4-a716-446655440000')).toBe('v1')
  })

  it('detects v3', () => {
    expect(getUuidVersion('550e8400-e29b-31d4-a716-446655440000')).toBe('v3')
  })

  it('detects v4', () => {
    expect(getUuidVersion('550e8400-e29b-41d4-a716-446655440000')).toBe('v4')
  })

  it('detects v5', () => {
    expect(getUuidVersion('550e8400-e29b-51d4-a716-446655440000')).toBe('v5')
  })

  it('returns unknown for non-standard version', () => {
    expect(getUuidVersion('550e8400-e29b-61d4-a716-446655440000')).toBe('unknown')
  })
})

// ═══════════════════════════════════════════════════════════════════════════
// normalizeUuid
// ═══════════════════════════════════════════════════════════════════════════

describe('normalizeUuid', () => {
  it('trims and lowercases a valid UUID', () => {
    const result = normalizeUuid('  550E8400-E29B-41D4-A716-446655440000  ')
    expect(result).toBe('550e8400-e29b-41d4-a716-446655440000')
  })

  it('lowercases mixed-case UUID', () => {
    const result = normalizeUuid('550E8400-e29b-41d4-A716-446655440000')
    expect(result).toBe('550e8400-e29b-41d4-a716-446655440000')
  })

  it('returns null for invalid UUID', () => {
    const result = normalizeUuid('not-a-uuid')
    expect(result).toBeNull()
  })

  it('returns null for empty input', () => {
    const result = normalizeUuid('')
    expect(result).toBeNull()
  })

  it('preserves hyphens', () => {
    const result = normalizeUuid('550E8400-E29B-41D4-A716-446655440000')
    expect(result).toContain('-')
    expect(result).toBe('550e8400-e29b-41d4-a716-446655440000')
  })
})

// ═══════════════════════════════════════════════════════════════════════════
// SAMPLE_UUID
// ═══════════════════════════════════════════════════════════════════════════

describe('SAMPLE_UUID', () => {
  it('is a valid v4 UUID', () => {
    const result = validateUuid(SAMPLE_UUID)
    expect(result.valid).toBe(true)
    expect(result.version).toBe('v4')
  })
})

// ═══════════════════════════════════════════════════════════════════════════
// getStats
// ═══════════════════════════════════════════════════════════════════════════

describe('getStats', () => {
  it('counts lines', () => {
    expect(getStats('a\nb\nc').lines).toBe(3)
  })

  it('counts size in bytes', () => {
    expect(getStats('hello').size).toBe(5)
  })
})

// ═══════════════════════════════════════════════════════════════════════════
// formatSize
// ═══════════════════════════════════════════════════════════════════════════

describe('formatSize', () => {
  it('formats bytes', () => { expect(formatSize(500)).toBe('500 B') })
  it('formats KB', () => { expect(formatSize(2048)).toBe('2.0 KB') })
  it('formats MB', () => { expect(formatSize(2 * 1024 * 1024)).toBe('2.0 MB') })
})
