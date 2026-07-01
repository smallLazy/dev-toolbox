/**
 * Hash Plugin — Unit Tests (pure logic)
 *
 * Covers: md5, sha256, hashText, validateHashInput, getStats, formatSize
 */

import { describe, it, expect } from 'vitest'
import { md5, sha256, hashText, validateHashInput, getStats, formatSize } from '../logic'

// ── MD5 (RFC 1321 test vectors) ─────────────────────────────────────

describe('md5', () => {
  it('RFC 1321: empty string', () => {
    expect(md5('')).toBe('d41d8cd98f00b204e9800998ecf8427e')
  })

  it('RFC 1321: "a"', () => {
    expect(md5('a')).toBe('0cc175b9c0f1b6a831c399e269772661')
  })

  it('RFC 1321: "abc"', () => {
    expect(md5('abc')).toBe('900150983cd24fb0d6963f7d28e17f72')
  })

  it('RFC 1321: "message digest"', () => {
    expect(md5('message digest')).toBe('f96b697d7cb7938d525a2f31aaf161d0')
  })

  it('RFC 1321: alphabet', () => {
    expect(md5('abcdefghijklmnopqrstuvwxyz')).toBe('c3fcd3d76192e4007dfb496cca67e13b')
  })

  it('returns 32-char hex string for any input', () => {
    const result = md5('Hello World')
    expect(result).toHaveLength(32)
    expect(/^[0-9a-f]{32}$/.test(result)).toBe(true)
  })

  it('handles Chinese characters', () => {
    const result = md5('你好世界')
    expect(result).toHaveLength(32)
    expect(/^[0-9a-f]{32}$/.test(result)).toBe(true)
  })

  it('handles emoji', () => {
    const result = md5('Hello 😀🚀')
    expect(result).toHaveLength(32)
    expect(/^[0-9a-f]{32}$/.test(result)).toBe(true)
  })

  it('is deterministic', () => {
    expect(md5('test')).toBe(md5('test'))
  })

  it('different inputs produce different hashes', () => {
    expect(md5('hello')).not.toBe(md5('Hello'))
  })
})

// ── SHA-256 (Web Crypto) ────────────────────────────────────────────

describe('sha256', () => {
  it('empty string', async () => {
    const result = await sha256('')
    expect(result).toBe('e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855')
  })

  it('"abc"', async () => {
    const result = await sha256('abc')
    expect(result).toBe('ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad')
  })

  it('returns 64-char hex string', async () => {
    const result = await sha256('Hello World')
    expect(result).toHaveLength(64)
    expect(/^[0-9a-f]{64}$/.test(result)).toBe(true)
  })

  it('handles Chinese characters', async () => {
    const result = await sha256('你好世界')
    expect(result).toHaveLength(64)
    expect(/^[0-9a-f]{64}$/.test(result)).toBe(true)
  })

  it('handles emoji', async () => {
    const result = await sha256('Hello 😀🚀')
    expect(result).toHaveLength(64)
    expect(/^[0-9a-f]{64}$/.test(result)).toBe(true)
  })

  it('is deterministic', async () => {
    const a = await sha256('test')
    const b = await sha256('test')
    expect(a).toBe(b)
  })

  it('different inputs produce different hashes', async () => {
    const a = await sha256('hello')
    const b = await sha256('Hello')
    expect(a).not.toBe(b)
  })
})

// ── hashText (dispatch) ─────────────────────────────────────────────

describe('hashText', () => {
  it('dispatches to md5', async () => {
    const result = await hashText('abc', { algorithm: 'md5' })
    expect(result.input).toBe('abc')
    expect(result.output).toBe('900150983cd24fb0d6963f7d28e17f72')
    expect(result.config.algorithm).toBe('md5')
  })

  it('dispatches to sha256', async () => {
    const result = await hashText('abc', { algorithm: 'sha256' })
    expect(result.input).toBe('abc')
    expect(result.output).toBe('ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad')
    expect(result.config.algorithm).toBe('sha256')
  })
})

// ── validateHashInput ────────────────────────────────────────────────

describe('validateHashInput', () => {
  it('rejects empty string', () => {
    const result = validateHashInput('')
    expect(result.valid).toBe(false)
    if (!result.valid) {
      expect(result.errors[0].code).toBe('EMPTY_INPUT')
      expect(result.errors[0].field).toBe('input')
    }
  })

  it('rejects whitespace-only input', () => {
    const result = validateHashInput('   ')
    expect(result.valid).toBe(false)
    if (!result.valid) {
      expect(result.errors[0].code).toBe('EMPTY_INPUT')
    }
  })

  it('accepts non-empty input', () => {
    expect(validateHashInput('hello').valid).toBe(true)
  })

  it('rejects input over 50MB', () => {
    const large = 'A'.repeat(51 * 1024 * 1024)
    const result = validateHashInput(large)
    expect(result.valid).toBe(false)
  })
})

// ── getStats ─────────────────────────────────────────────────────────

describe('getStats', () => {
  it('counts chars, lines, and bytes for ASCII', () => {
    const stats = getStats('hello')
    expect(stats.chars).toBe(5)
    expect(stats.lines).toBe(1)
    expect(stats.bytes).toBe(5)
  })

  it('counts multiple lines', () => {
    const stats = getStats('a\nb\nc')
    expect(stats.lines).toBe(3)
  })

  it('counts unicode bytes correctly', () => {
    const stats = getStats('你好')
    expect(stats.chars).toBe(2)
    expect(stats.bytes).toBe(6) // 3 bytes per CJK char
  })

  it('counts emoji bytes correctly', () => {
    const stats = getStats('😀')
    expect(stats.chars).toBe(2) // surrogate pair = 2 JS chars
    expect(stats.bytes).toBe(4) // 4 bytes in UTF-8
  })
})

// ── formatSize ───────────────────────────────────────────────────────

describe('formatSize', () => {
  it('formats bytes', () => { expect(formatSize(500)).toBe('500 B') })
  it('formats KB', () => { expect(formatSize(2048)).toBe('2.0 KB') })
  it('formats MB', () => { expect(formatSize(2 * 1024 * 1024)).toBe('2.0 MB') })
})
