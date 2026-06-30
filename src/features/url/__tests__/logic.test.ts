/**
 * URL Plugin — Unit Tests (pure logic)
 *
 * Covers: encodeUrl, decodeUrl, transformUrl, validateUrlInput,
 *         validateDecodeInput, getStats, formatSize
 */

import { describe, it, expect } from 'vitest'
import {
  encodeUrl,
  decodeUrl,
  transformUrl,
  validateUrlInput,
  validateDecodeInput,
  getStats,
  formatSize,
} from '../logic'

// ── encodeUrl ────────────────────────────────────────────────────────

describe('encodeUrl', () => {
  describe('component variant', () => {
    it('encodes spaces as %20', () => {
      expect(encodeUrl('hello world', 'component')).toBe('hello%20world')
    })

    it('encodes special URL characters', () => {
      const result = encodeUrl('https://example.com/path?q=a&b=c', 'component')
      expect(result).toContain('%2F')
      expect(result).toContain('%3F')
      expect(result).toContain('%3D')
      expect(result).toContain('%26')
    })

    it('encodes Chinese characters', () => {
      const result = encodeUrl('你好世界', 'component')
      expect(result).toBeDefined()
      expect(result).not.toBe('你好世界')
      // Should be percent-encoded
      expect(/^%[0-9A-F]{2}/i.test(result)).toBe(true)
    })

    it('encodes emoji', () => {
      const result = encodeUrl('Hello 😀🚀', 'component')
      expect(result).toBeDefined()
      expect(result).not.toBe('Hello 😀🚀')
    })

    it('handles empty string', () => {
      expect(encodeUrl('', 'component')).toBe('')
    })
  })

  describe('uri variant', () => {
    it('preserves URI structural characters', () => {
      const result = encodeUrl('https://example.com/a b?x=1&y=你好', 'uri')
      // Should preserve : / ? & = #
      expect(result).toContain('https://')
      expect(result).toContain('example.com')
      expect(result).toContain('?')
      expect(result).toContain('&')
      expect(result).toContain('=')
      // Should encode space
      expect(result).toContain('%20')
      // Should encode Chinese
      expect(result).not.toContain('你好')
    })

    it('encodes spaces in URI path', () => {
      const result = encodeUrl('https://example.com/my file.html', 'uri')
      expect(result).toContain('my%20file.html')
    })

    it('handles empty string', () => {
      expect(encodeUrl('', 'uri')).toBe('')
    })
  })
})

// ── decodeUrl ────────────────────────────────────────────────────────

describe('decodeUrl', () => {
  describe('component variant', () => {
    it('decodes %20 to space', () => {
      expect(decodeUrl('hello%20world', 'component')).toBe('hello world')
    })

    it('decodes fully encoded URL', () => {
      expect(decodeUrl('https%3A%2F%2Fexample.com%2Fpath', 'component')).toBe(
        'https://example.com/path',
      )
    })

    it('handles empty string', () => {
      expect(decodeUrl('', 'component')).toBe('')
    })

    it('throws on malformed percent encoding (%ZZ)', () => {
      expect(() => decodeUrl('%ZZ', 'component')).toThrow()
    })

    it('throws on truncated percent encoding', () => {
      expect(() => decodeUrl('%E0%A4%A', 'component')).toThrow()
    })
  })

  describe('uri variant', () => {
    it('decodes percent-encoded spaces', () => {
      expect(decodeUrl('hello%20world', 'uri')).toBe('hello world')
    })

    it('preserves URI structure while decoding', () => {
      const result = decodeUrl(
        'https://example.com/my%20file.html?q=hello%20world',
        'uri',
      )
      expect(result).toBe('https://example.com/my file.html?q=hello world')
    })

    it('throws on malformed encoding', () => {
      expect(() => decodeUrl('%ZZ', 'uri')).toThrow()
    })
  })
})

// ── Roundtrip ────────────────────────────────────────────────────────

describe('roundtrip', () => {
  it('component: ASCII roundtrip', () => {
    const input = 'hello world'
    expect(decodeUrl(encodeUrl(input, 'component'), 'component')).toBe(input)
  })

  it('component: Chinese roundtrip', () => {
    const input = '你好世界'
    expect(decodeUrl(encodeUrl(input, 'component'), 'component')).toBe(input)
  })

  it('component: emoji roundtrip', () => {
    const input = 'Hello 😀🚀'
    expect(decodeUrl(encodeUrl(input, 'component'), 'component')).toBe(input)
  })

  it('component: mixed ASCII + CJK + emoji roundtrip', () => {
    const input = 'Hello 你好 😀 test'
    expect(decodeUrl(encodeUrl(input, 'component'), 'component')).toBe(input)
  })

  it('uri: preserves structural chars through roundtrip', () => {
    const input = 'https://example.com/my file.html?q=hello world'
    const encoded = encodeUrl(input, 'uri')
    const decoded = decodeUrl(encoded, 'uri')
    expect(decoded).toBe(input)
  })
})

// ── transformUrl ─────────────────────────────────────────────────────

describe('transformUrl', () => {
  it('transforms with encode + component', () => {
    const result = transformUrl('hello world', {
      mode: 'encode',
      variant: 'component',
    })
    expect(result.input).toBe('hello world')
    expect(result.output).toBe('hello%20world')
    expect(result.config.mode).toBe('encode')
  })

  it('transforms with decode + component', () => {
    const result = transformUrl('hello%20world', {
      mode: 'decode',
      variant: 'component',
    })
    expect(result.input).toBe('hello%20world')
    expect(result.output).toBe('hello world')
    expect(result.config.mode).toBe('decode')
  })

  it('transforms with encode + uri', () => {
    const result = transformUrl('https://a.com/a b', {
      mode: 'encode',
      variant: 'uri',
    })
    expect(result.output).toContain('https://a.com/')
    expect(result.output).toContain('%20')
  })
})

// ── validateUrlInput ─────────────────────────────────────────────────

describe('validateUrlInput', () => {
  it('rejects empty input (empty string)', () => {
    const result = validateUrlInput('')
    expect(result.valid).toBe(false)
    if (!result.valid) {
      expect(result.errors[0].code).toBe('EMPTY_INPUT')
      expect(result.errors[0].field).toBe('input')
    }
  })

  it('rejects whitespace-only input', () => {
    const result = validateUrlInput('   ')
    expect(result.valid).toBe(false)
    if (!result.valid) {
      expect(result.errors[0].code).toBe('EMPTY_INPUT')
    }
  })

  it('accepts non-empty input', () => {
    expect(validateUrlInput('hello').valid).toBe(true)
  })

  it('rejects input over 50MB', () => {
    const large = 'A'.repeat(51 * 1024 * 1024)
    const result = validateUrlInput(large)
    expect(result.valid).toBe(false)
  })
})

// ── validateDecodeInput ──────────────────────────────────────────────

describe('validateDecodeInput', () => {
  it('accepts valid percent-encoded input', () => {
    const result = validateDecodeInput('hello%20world', 'component')
    expect(result.valid).toBe(true)
  })

  it('rejects malformed percent encoding (%ZZ)', () => {
    const result = validateDecodeInput('%ZZ', 'component')
    expect(result.valid).toBe(false)
    if (!result.valid) {
      expect(result.errors[0].code).toBe('MALFORMED_PERCENT_ENCODING')
    }
  })

  it('rejects truncated percent encoding', () => {
    const result = validateDecodeInput('%E0%A4%A', 'component')
    expect(result.valid).toBe(false)
    if (!result.valid) {
      expect(result.errors[0].code).toBe('MALFORMED_PERCENT_ENCODING')
    }
  })

  it('accepts plain text (no percent encoding)', () => {
    const result = validateDecodeInput('hello world', 'component')
    expect(result.valid).toBe(true)
  })

  it('accepts empty string', () => {
    const result = validateDecodeInput('', 'component')
    expect(result.valid).toBe(true)
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
  it('formats bytes', () => {
    expect(formatSize(500)).toBe('500 B')
  })

  it('formats KB', () => {
    expect(formatSize(2048)).toBe('2.0 KB')
  })

  it('formats MB', () => {
    expect(formatSize(2 * 1024 * 1024)).toBe('2.0 MB')
  })
})
