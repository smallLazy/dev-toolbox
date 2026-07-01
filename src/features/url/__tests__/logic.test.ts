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
  encodeUrlPhp,
  decodeUrlPhp,
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

  describe('php variant (via encodeUrl dispatch)', () => {
    it('encodes hello world as hello+world', () => {
      expect(encodeUrl('hello world', 'php')).toBe('hello+world')
    })

    it('encodes special chars ! * \' ( )', () => {
      expect(encodeUrl('!', 'php')).toBe('%21')
      expect(encodeUrl('*', 'php')).toBe('%2A')
      expect(encodeUrl("'", 'php')).toBe('%27')
      expect(encodeUrl('(', 'php')).toBe('%28')
      expect(encodeUrl(')', 'php')).toBe('%29')
    })

    it('preserves - _ . ~', () => {
      expect(encodeUrl('-_.~', 'php')).toBe('-_.~')
    })

    it('encodes Chinese correctly', () => {
      const result = encodeUrl('你好', 'php')
      expect(result).toBe('%E4%BD%A0%E5%A5%BD')
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

  describe('php variant', () => {
    it('encodes space as +', () => {
      expect(decodeUrl('hello+world', 'php')).toBe('hello world')
    })

    it('decodes + to space', () => {
      expect(decodeUrl('hello+world', 'php')).toBe('hello world')
    })

    it('decodes %20 to space (robustness)', () => {
      expect(decodeUrl('hello%20world', 'php')).toBe('hello world')
    })

    it('decodes mixed + and %20 to spaces', () => {
      const result = decodeUrl('hello+world%20test', 'php')
      expect(result).toBe('hello world test')
    })

    it('decodes percent-encoded Chinese', () => {
      // 你好 in UTF-8: %E4%BD%A0%E5%A5%BD
      expect(decodeUrl('%E4%BD%A0%E5%A5%BD', 'php')).toBe('你好')
    })

    it('handles empty string', () => {
      expect(decodeUrl('', 'php')).toBe('')
    })

    it('handles invalid percent sequence gracefully', () => {
      // %ZZ is not valid hex — PHP urldecode keeps '%' and 'Z', 'Z'
      const result = decodeUrl('%ZZ', 'php')
      // The implementation keeps '%' on invalid hex, then processes 'Z','Z'
      expect(typeof result).toBe('string')
      expect(result.length).toBeGreaterThan(0)
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

  it('php: ASCII roundtrip', () => {
    const input = 'hello world'
    expect(decodeUrl(encodeUrl(input, 'php'), 'php')).toBe(input)
  })

  it('php: Chinese roundtrip', () => {
    const input = '你好世界'
    expect(decodeUrl(encodeUrl(input, 'php'), 'php')).toBe(input)
  })

  it('php: emoji roundtrip', () => {
    const input = 'Hello 😀🚀'
    expect(decodeUrl(encodeUrl(input, 'php'), 'php')).toBe(input)
  })

  it('php: mixed ASCII + CJK + emoji roundtrip', () => {
    const input = 'Hello 你好 😀 test'
    expect(decodeUrl(encodeUrl(input, 'php'), 'php')).toBe(input)
  })

  it('php: special chars roundtrip (!*\'())', () => {
    const input = "hello!world*test'foo(bar)baz"
    expect(decodeUrl(encodeUrl(input, 'php'), 'php')).toBe(input)
  })
})

// ── encodeUrlPhp (direct) ────────────────────────────────────────────

describe('encodeUrlPhp', () => {
  it('encodes space as +', () => {
    expect(encodeUrlPhp('hello world')).toBe('hello+world')
  })

  it('encodes + as %2B', () => {
    expect(encodeUrlPhp('a+b')).toBe('a%2Bb')
  })

  it('encodes ! as %21', () => {
    expect(encodeUrlPhp('hello!')).toBe('hello%21')
  })

  it('encodes * as %2A', () => {
    expect(encodeUrlPhp('a*b')).toBe('a%2Ab')
  })

  it("encodes ' as %27", () => {
    expect(encodeUrlPhp("it's")).toBe('it%27s')
  })

  it('encodes ( as %28', () => {
    expect(encodeUrlPhp('(')).toBe('%28')
  })

  it('encodes ) as %29', () => {
    expect(encodeUrlPhp(')')).toBe('%29')
  })

  it('preserves - _ . ~ unchanged', () => {
    expect(encodeUrlPhp('a-b_c.d~e')).toBe('a-b_c.d~e')
  })

  it('encodes Chinese characters as UTF-8 %XX', () => {
    const result = encodeUrlPhp('你好')
    // 你 = E4 BD A0, 好 = E5 A5 BD
    expect(result).toBe('%E4%BD%A0%E5%A5%BD')
  })

  it('encodes emoji as UTF-8 %XX', () => {
    const result = encodeUrlPhp('😀')
    // 😀 = F0 9F 98 80
    expect(result).toBe('%F0%9F%98%80')
  })

  it('handles empty string', () => {
    expect(encodeUrlPhp('')).toBe('')
  })

  it('encodes = as %3D', () => {
    expect(encodeUrlPhp('a=b')).toBe('a%3Db')
  })

  it('encodes # as %23', () => {
    expect(encodeUrlPhp('a#b')).toBe('a%23b')
  })

  it('uppercase hex in output', () => {
    // \n (0x0A) → %0A with uppercase 'A'
    const result = encodeUrlPhp('\n')
    expect(result).toBe('%0A')
    // Verify uppercase: %0a would be lowercase
    expect(result).not.toBe('%0a')
  })
})

// ── decodeUrlPhp (direct) ───────────────────────────────────────────

describe('decodeUrlPhp', () => {
  it('decodes + to space', () => {
    expect(decodeUrlPhp('hello+world')).toBe('hello world')
  })

  it('decodes %20 to space', () => {
    expect(decodeUrlPhp('hello%20world')).toBe('hello world')
  })

  it('decodes multiple + signs', () => {
    expect(decodeUrlPhp('a+b+c')).toBe('a b c')
  })

  it('decodes Chinese percent encoding', () => {
    expect(decodeUrlPhp('%E4%BD%A0%E5%A5%BD')).toBe('你好')
  })

  it('decodes emoji percent encoding', () => {
    expect(decodeUrlPhp('%F0%9F%98%80')).toBe('😀')
  })

  it('handles empty string', () => {
    expect(decodeUrlPhp('')).toBe('')
  })

  it('handles invalid hex gracefully', () => {
    const result = decodeUrlPhp('%ZZ')
    // '%' kept, then 'Z', 'Z' processed as literal characters
    expect(typeof result).toBe('string')
  })

  it('handles truncated percent sequence', () => {
    const result = decodeUrlPhp('%E0%A4%A')
    // Last %A is truncated (only 1 hex digit after %)
    expect(typeof result).toBe('string')
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
