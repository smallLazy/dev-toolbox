/**
 * Crypto (AES) Plugin — Logic Tests
 */

import { describe, it, expect } from 'vitest'
import {
  isIvRequired,
  buildAesCryptParams,
  validateCryptoInput,
  validateKeyLength,
  getStats,
  formatSize,
} from '../logic'
import { defaultInConfig } from '../settings'
import type { CryptoMode, AesAlgorithm, CryptoInConfig } from '../types'

const inConfig: CryptoInConfig = { ...defaultInConfig }

// ── isIvRequired ───────────────────────────────────────────────────

describe('isIvRequired', () => {
  it('returns true for aes-256-cbc', () => {
    expect(isIvRequired('aes-256-cbc')).toBe(true)
  })

  it('returns false for aes-256-ecb', () => {
    expect(isIvRequired('aes-256-ecb')).toBe(false)
  })
})

// ── buildAesCryptParams ────────────────────────────────────────────

describe('buildAesCryptParams', () => {
  it('builds params for CBC encrypt with utf8 encodings', () => {
    const params = buildAesCryptParams({
      mode: 'encrypt',
      algorithm: 'aes-256-cbc',
      key: 'abcdefghijklmnopqrstuvwxyz123456',
      iv: '1234567890abcdef',
      input: 'hello',
      inConfig,
    })
    expect(params.mode).toBe('encrypt')
    expect(params.algorithm).toBe('aes-256-cbc')
    expect(params.key).toBe('abcdefghijklmnopqrstuvwxyz123456')
    expect(params.iv).toBe('1234567890abcdef')
    expect(params.input).toBe('hello')
    expect(params.keyEncoding).toBe('utf8')
    expect(params.ivEncoding).toBe('utf8')
    expect(params.inputEncoding).toBe('utf8')
    expect(params.outputEncoding).toBe('base64')
  })

  it('builds params for CBC decrypt with base64 input', () => {
    const cfg: CryptoInConfig = { ...inConfig, inputEncoding: 'base64', outputEncoding: 'hex' }
    const params = buildAesCryptParams({
      mode: 'decrypt',
      algorithm: 'aes-256-cbc',
      key: 'key32',
      iv: 'iv16',
      input: 'SGVsbG8=',
      inConfig: cfg,
    })
    expect(params.mode).toBe('decrypt')
    expect(params.inputEncoding).toBe('base64')
    expect(params.outputEncoding).toBe('hex')
  })

  it('sets iv to empty string for ECB mode', () => {
    const params = buildAesCryptParams({
      mode: 'encrypt',
      algorithm: 'aes-256-ecb',
      key: 'key-material',
      iv: 'should-be-ignored',
      input: 'test',
      inConfig,
    })
    expect(params.iv).toBe('')
    expect(params.algorithm).toBe('aes-256-ecb')
  })

  it('sets ivEncoding to utf8 for ECB regardless of config', () => {
    const cfg: CryptoInConfig = { ...inConfig, ivEncoding: 'hex' }
    const params = buildAesCryptParams({
      mode: 'encrypt',
      algorithm: 'aes-256-ecb',
      key: 'key',
      iv: 'ignored',
      input: 'test',
      inConfig: cfg,
    })
    expect(params.ivEncoding).toBe('utf8')
  })

  it('passes keyEncoding from config', () => {
    const cfg: CryptoInConfig = { ...inConfig, keyEncoding: 'hex' }
    const params = buildAesCryptParams({
      mode: 'encrypt',
      algorithm: 'aes-256-cbc',
      key: 'deadbeef',
      iv: 'cafebabe',
      input: 'test',
      inConfig: cfg,
    })
    expect(params.keyEncoding).toBe('hex')
  })
})

// ── validateCryptoInput ────────────────────────────────────────────

describe('validateCryptoInput', () => {
  it('returns invalid for empty input', () => {
    const result = validateCryptoInput('', 'key', 'aes-256-cbc', 'iv')
    expect(result.valid).toBe(false)
    if (!result.valid) {
      expect(result.errors.some((e) => e.code === 'EMPTY_INPUT')).toBe(true)
    }
  })

  it('returns invalid for empty key', () => {
    const result = validateCryptoInput('input', '', 'aes-256-cbc', 'iv')
    expect(result.valid).toBe(false)
    if (!result.valid) {
      expect(result.errors.some((e) => e.code === 'EMPTY_KEY')).toBe(true)
    }
  })

  it('returns invalid for CBC with empty IV', () => {
    const result = validateCryptoInput('input', 'key', 'aes-256-cbc', '')
    expect(result.valid).toBe(false)
    if (!result.valid) {
      expect(result.errors.some((e) => e.code === 'EMPTY_IV')).toBe(true)
    }
  })

  it('returns valid for ECB without IV', () => {
    const result = validateCryptoInput('input', 'key', 'aes-256-ecb', '')
    expect(result.valid).toBe(true)
  })

  it('returns valid for CBC with all fields', () => {
    const result = validateCryptoInput('input', 'key', 'aes-256-cbc', 'iv')
    expect(result.valid).toBe(true)
  })

  it('returns valid for whitespace input (trim yields empty)', () => {
    const result = validateCryptoInput('   ', 'key', 'aes-256-cbc', 'iv')
    expect(result.valid).toBe(false)
    if (!result.valid) {
      expect(result.errors.some((e) => e.code === 'EMPTY_INPUT')).toBe(true)
    }
  })
})

// ── validateKeyLength ──────────────────────────────────────────────

describe('validateKeyLength', () => {
  it('returns valid for exactly 32-byte utf8 key', () => {
    const key32 = 'abcdefghijklmnopqrstuvwxyz123456' // 32 bytes
    const result = validateKeyLength(key32, 'utf8')
    expect(result.valid).toBe(true)
  })

  it('returns invalid for short utf8 key', () => {
    const result = validateKeyLength('short', 'utf8')
    expect(result.valid).toBe(false)
  })

  it('returns valid for 64-char hex key (32 bytes)', () => {
    const keyHex = '00'.repeat(32) // 64 hex chars = 32 bytes
    const result = validateKeyLength(keyHex, 'hex')
    expect(result.valid).toBe(true)
  })

  it('returns invalid for hex key with wrong length', () => {
    const result = validateKeyLength('deadbeef', 'hex')
    expect(result.valid).toBe(false)
  })

  it('returns invalid for hex key with invalid characters', () => {
    const result = validateKeyLength('zzzz', 'hex')
    expect(result.valid).toBe(false)
    if (!result.valid) {
      expect(result.errors.some((e) => e.code === 'INVALID_HEX')).toBe(true)
    }
  })
})

// ── getStats ───────────────────────────────────────────────────────

describe('getStats', () => {
  it('returns correct stats for single-line input', () => {
    const stats = getStats('hello')
    expect(stats.chars).toBe(5)
    expect(stats.bytes).toBe(5)
    expect(stats.lines).toBe(1)
  })

  it('returns correct stats for multi-line input', () => {
    const stats = getStats('a\nb\nc')
    expect(stats.lines).toBe(3)
  })

  it('returns correct stats for empty input', () => {
    const stats = getStats('')
    expect(stats.chars).toBe(0)
    expect(stats.bytes).toBe(0)
    expect(stats.lines).toBe(1) // ''.split('\n') → ['']
  })
})

// ── formatSize ─────────────────────────────────────────────────────

describe('formatSize', () => {
  it('formats bytes < 1024', () => {
    expect(formatSize(500)).toBe('500 B')
  })

  it('formats KB', () => {
    expect(formatSize(2048)).toBe('2.0 KB')
  })

  it('formats MB', () => {
    expect(formatSize(2 * 1024 * 1024)).toBe('2.0 MB')
  })
})

// ── defaultInConfig ────────────────────────────────────────────────

describe('defaultInConfig', () => {
  it('has expected default values', () => {
    expect(defaultInConfig.algorithm).toBe('aes-256-cbc')
    expect(defaultInConfig.keyEncoding).toBe('utf8')
    expect(defaultInConfig.ivEncoding).toBe('utf8')
    expect(defaultInConfig.inputEncoding).toBe('utf8')
    expect(defaultInConfig.outputEncoding).toBe('base64')
  })
})
