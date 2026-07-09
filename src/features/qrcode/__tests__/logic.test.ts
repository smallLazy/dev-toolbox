/**
 * QR Code Plugin — Unit Tests (pure logic)
 */

import { describe, it, expect } from 'vitest'
import {
  validateQrInput,
  normalizeQrOptions,
  getQrStats,
  getStats,
  formatSize,
  SAMPLE_INPUT,
} from '../logic'
import type { QrCodeOptions } from '../types'

// ═══════════════════════════════════════════════════════════════════════════
// validateQrInput
// ═══════════════════════════════════════════════════════════════════════════

describe('validateQrInput', () => {
  it('accepts normal text', () => {
    const result = validateQrInput('Hello')
    expect(result.valid).toBe(true)
  })

  it('accepts URL', () => {
    const result = validateQrInput('https://github.com/')
    expect(result.valid).toBe(true)
  })

  it('accepts Chinese text', () => {
    const result = validateQrInput('你好世界')
    expect(result.valid).toBe(true)
  })

  it('accepts multiline text', () => {
    const result = validateQrInput('line1\nline2\nline3')
    expect(result.valid).toBe(true)
  })

  it('rejects empty input', () => {
    const result = validateQrInput('')
    expect(result.valid).toBe(false)
    expect(result.message).toBe('Enter content to generate a QR code.')
  })

  it('rejects whitespace-only input', () => {
    const result = validateQrInput('   \n  ')
    expect(result.valid).toBe(false)
  })
})

// ═══════════════════════════════════════════════════════════════════════════
// normalizeQrOptions
// ═══════════════════════════════════════════════════════════════════════════

describe('normalizeQrOptions', () => {
  it('uses default size 256 when none provided', () => {
    const opts = normalizeQrOptions({})
    expect(opts.size).toBe(256)
  })

  it('uses default margin 4 when none provided', () => {
    const opts = normalizeQrOptions({})
    expect(opts.margin).toBe(4)
  })

  it('uses default error correction M when none provided', () => {
    const opts = normalizeQrOptions({})
    expect(opts.errorCorrectionLevel).toBe('M')
  })

  it('accepts valid size options', () => {
    for (const size of [128, 256, 512, 1024]) {
      const opts = normalizeQrOptions({ size })
      expect(opts.size).toBe(size)
    }
  })

  it('falls back to default for invalid size', () => {
    const opts = normalizeQrOptions({ size: 999 })
    expect(opts.size).toBe(256)
  })

  it('clamps margin to 0 minimum', () => {
    const opts = normalizeQrOptions({ margin: -5 })
    expect(opts.margin).toBe(0)
  })

  it('clamps margin to 8 maximum', () => {
    const opts = normalizeQrOptions({ margin: 20 })
    expect(opts.margin).toBe(8)
  })

  it('accepts all error correction levels', () => {
    for (const level of ['L', 'M', 'Q', 'H'] as const) {
      const opts = normalizeQrOptions({ errorCorrectionLevel: level })
      expect(opts.errorCorrectionLevel).toBe(level)
    }
  })

  it('falls back to M for invalid error correction', () => {
    const opts = normalizeQrOptions({ errorCorrectionLevel: 'X' as never })
    expect(opts.errorCorrectionLevel).toBe('M')
  })
})

// ═══════════════════════════════════════════════════════════════════════════
// getQrStats
// ═══════════════════════════════════════════════════════════════════════════

describe('getQrStats', () => {
  const defaultOptions: QrCodeOptions = { size: 256, margin: 4, errorCorrectionLevel: 'M' }

  it('returns character count', () => {
    const stats = getQrStats('hello', defaultOptions)
    expect(stats.characters).toBe(5)
  })

  it('returns UTF-8 byte count', () => {
    const stats = getQrStats('hello', defaultOptions)
    expect(stats.bytes).toBe(5)
  })

  it('counts multi-byte characters correctly', () => {
    const stats = getQrStats('你好', defaultOptions)
    expect(stats.characters).toBe(2)
    expect(stats.bytes).toBe(6)
  })

  it('returns size option', () => {
    const stats = getQrStats('test', { size: 512, margin: 4, errorCorrectionLevel: 'H' })
    expect(stats.size).toBe(512)
  })

  it('returns margin option', () => {
    const stats = getQrStats('test', defaultOptions)
    expect(stats.margin).toBe(4)
  })

  it('returns error correction level', () => {
    const stats = getQrStats('test', defaultOptions)
    expect(stats.errorCorrectionLevel).toBe('M')
  })
})

// ═══════════════════════════════════════════════════════════════════════════
// generateQrCode (async)
// ═══════════════════════════════════════════════════════════════════════════

describe('generateQrCode', () => {
  it('returns error for empty input', async () => {
    const { generateQrCode } = await import('../logic')
    const result = await generateQrCode('', { size: 256, margin: 4, errorCorrectionLevel: 'M' })
    expect(result.success).toBe(false)
    expect(result.error).toBeTruthy()
  })

  it('returns error for whitespace-only input', async () => {
    const { generateQrCode } = await import('../logic')
    const result = await generateQrCode('   ', { size: 256, margin: 4, errorCorrectionLevel: 'M' })
    expect(result.success).toBe(false)
  })

  it('returns data URL for valid input', async () => {
    const { generateQrCode } = await import('../logic')
    const result = await generateQrCode('hello', { size: 256, margin: 4, errorCorrectionLevel: 'M' })
    expect(result.success).toBe(true)
    expect(result.dataUrl).toMatch(/^data:image\/png;base64,/)
  })

  it('generates with different sizes', async () => {
    const { generateQrCode } = await import('../logic')
    const result = await generateQrCode('test', { size: 128, margin: 4, errorCorrectionLevel: 'M' })
    expect(result.success).toBe(true)
  })

  it('generates with different error correction levels', async () => {
    const { generateQrCode } = await import('../logic')
    for (const level of ['L', 'M', 'Q', 'H'] as const) {
      const result = await generateQrCode('test', { size: 256, margin: 4, errorCorrectionLevel: level })
      expect(result.success).toBe(true)
    }
  })

  it('generates with different margins', async () => {
    const { generateQrCode } = await import('../logic')
    const result = await generateQrCode('test', { size: 256, margin: 8, errorCorrectionLevel: 'M' })
    expect(result.success).toBe(true)
  })

  it('handles Chinese text', async () => {
    const { generateQrCode } = await import('../logic')
    const result = await generateQrCode('你好世界', { size: 256, margin: 4, errorCorrectionLevel: 'M' })
    expect(result.success).toBe(true)
  })

  it('handles URL input', async () => {
    const { generateQrCode } = await import('../logic')
    const result = await generateQrCode('https://example.com/path?q=1', { size: 256, margin: 4, errorCorrectionLevel: 'M' })
    expect(result.success).toBe(true)
  })
})

// ═══════════════════════════════════════════════════════════════════════════
// SAMPLE_INPUT
// ═══════════════════════════════════════════════════════════════════════════

describe('SAMPLE_INPUT', () => {
  it('is a valid URL', () => {
    expect(SAMPLE_INPUT).toBe('https://github.com/')
  })

  it('passes validation', () => {
    const result = validateQrInput(SAMPLE_INPUT)
    expect(result.valid).toBe(true)
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
