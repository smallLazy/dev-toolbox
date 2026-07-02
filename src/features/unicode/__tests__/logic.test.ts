/**
 * Unicode Plugin — Pure Logic Tests
 *
 * Covers: encodeJsUnicode, decodeJsUnicode, encodeCodePoint, decodeCodePoint,
 * encodeUnicode, decodeUnicode, tryDecodeUnicode, transformUnicode,
 * validate, getStats, formatSize
 */

import { describe, it, expect } from 'vitest'
import {
  encodeJsUnicode,
  decodeJsUnicode,
  encodeCodePoint,
  decodeCodePoint,
  encodeUnicode,
  decodeUnicode,
  tryDecodeUnicode,
  transformUnicode,
  validate,
  getStats,
  formatSize,
} from '../logic'
import type { UnicodeConfig } from '../types'

// ═══════════════════════════════════════════════════════════════════════
// JavaScript Variant — Encode
// ═══════════════════════════════════════════════════════════════════════

describe('encodeJsUnicode', () => {
  it('keeps ASCII printable characters as-is', () => {
    expect(encodeJsUnicode('hello')).toBe('hello')
  })

  it('keeps ASCII with spaces and numbers', () => {
    expect(encodeJsUnicode('Hello World 123')).toBe('Hello World 123')
  })

  it('encodes Chinese characters to \\uXXXX (uppercase)', () => {
    expect(encodeJsUnicode('你好')).toBe('\\u4F60\\u597D')
  })

  it('encodes emoji to surrogate pair \\uDXXX\\uDXXX', () => {
    expect(encodeJsUnicode('😀')).toBe('\\uD83D\\uDE00')
  })

  it('handles mixed ASCII + Chinese + emoji', () => {
    expect(encodeJsUnicode('A你好😀')).toBe('A\\u4F60\\u597D\\uD83D\\uDE00')
  })

  it('encodes Japanese text', () => {
    expect(encodeJsUnicode('こんにちは')).toBe('\\u3053\\u3093\\u306B\\u3061\\u306F')
  })

  it('encodes Korean text', () => {
    expect(encodeJsUnicode('안녕하세요')).toBe('\\uC548\\uB155\\uD558\\uC138\\uC694')
  })

  it('encodes special symbols (non-ASCII)', () => {
    // Euro sign € is U+20AC (non-ASCII)
    expect(encodeJsUnicode('€')).toBe('\\u20AC')
  })

  it('handles empty input', () => {
    expect(encodeJsUnicode('')).toBe('')
  })

  it('encodes tab and newline as escape sequences', () => {
    expect(encodeJsUnicode('\t')).toBe('\\u0009')
    expect(encodeJsUnicode('\n')).toBe('\\u000A')
  })

  it('escapes backslash', () => {
    expect(encodeJsUnicode('\\')).toBe('\\\\')
  })

  it('handles very long strings', () => {
    const long = '中'.repeat(1000)
    const result = encodeJsUnicode(long)
    expect(result).toContain('\\u4E2D')
  })

  it('encodes XSS-like strings safely', () => {
    // < > & are ASCII printable so they pass through
    const result = encodeJsUnicode('<script>alert(1)</script>')
    expect(result).toBe('<script>alert(1)</script>')
  })

  it('encodes null byte', () => {
    expect(encodeJsUnicode('\x00')).toBe('\\u0000')
  })

  it('encodes another emoji (heart) to surrogate pair', () => {
    // ❤️ is complex, let's use a simpler test: 🎉 U+1F389
    expect(encodeJsUnicode('🎉')).toBe('\\uD83C\\uDF89')
  })
})

// ═══════════════════════════════════════════════════════════════════════
// JavaScript Variant — Decode
// ═══════════════════════════════════════════════════════════════════════

describe('decodeJsUnicode', () => {
  it('decodes \\uXXXX (uppercase) to Chinese', () => {
    expect(decodeJsUnicode('\\u4F60\\u597D')).toBe('你好')
  })

  it('decodes \\uXXXX (lowercase) to Chinese', () => {
    expect(decodeJsUnicode('\\u4f60\\u597d')).toBe('你好')
  })

  it('decodes surrogate pair to emoji', () => {
    expect(decodeJsUnicode('\\uD83D\\uDE00')).toBe('😀')
  })

  it('decodes mixed ASCII + escapes + surrogate pair', () => {
    expect(decodeJsUnicode('A\\u4F60\\u597D\\uD83D\\uDE00')).toBe('A你好😀')
  })

  it('passes through plain text unchanged', () => {
    expect(decodeJsUnicode('hello')).toBe('hello')
  })

  it('decodes escaped backslash', () => {
    expect(decodeJsUnicode('\\\\')).toBe('\\')
  })

  it('handles empty input', () => {
    expect(decodeJsUnicode('')).toBe('')
  })

  it('decodes Japanese text roundtrip', () => {
    const encoded = '\\u3053\\u3093\\u306B\\u3061\\u306F'
    expect(decodeJsUnicode(encoded)).toBe('こんにちは')
  })

  it('decodes Korean text roundtrip', () => {
    const encoded = '\\uC548\\uB155\\uD558\\uC138\\uC694'
    expect(decodeJsUnicode(encoded)).toBe('안녕하세요')
  })

  it('handles roundtrip: encode then decode', () => {
    const original = 'Hello 你好 😀 World'
    const encoded = encodeJsUnicode(original)
    const decoded = decodeJsUnicode(encoded)
    expect(decoded).toBe(original)
  })
})

// ═══════════════════════════════════════════════════════════════════════
// JavaScript Variant — Invalid Decode Input
// ═══════════════════════════════════════════════════════════════════════

describe('decodeJsUnicode — invalid input', () => {
  it('rejects \\uZZZZ (invalid hex)', () => {
    expect(() => decodeJsUnicode('\\uZZZZ')).toThrow(/invalid hex/i)
  })

  it('rejects truncated \\u123 (too short)', () => {
    expect(() => decodeJsUnicode('\\u123')).toThrow(/truncated/i)
  })

  it('rejects standalone high surrogate \\uD83D', () => {
    expect(() => decodeJsUnicode('\\uD83D')).toThrow(/unpaired high surrogate/i)
  })

  it('rejects standalone low surrogate \\uDE00', () => {
    expect(() => decodeJsUnicode('\\uDE00')).toThrow(/unpaired low surrogate/i)
  })

  it('rejects malformed mixed input', () => {
    expect(() => decodeJsUnicode('hello\\uZZZZworld')).toThrow(/invalid hex/i)
  })

  it('rejects unexpected end after backslash', () => {
    expect(() => decodeJsUnicode('test\\')).toThrow(/unexpected end/i)
  })

  it('rejects high surrogate with non-surrogate follower', () => {
    expect(() => decodeJsUnicode('\\uD83D\\u0041')).toThrow(/high surrogate.*not followed/i)
  })

  it('rejects unknown escape sequence', () => {
    expect(() => decodeJsUnicode('\\x41')).toThrow(/unexpected escape character/i)
  })
})

// ═══════════════════════════════════════════════════════════════════════
// Code Point Variant — Encode
// ═══════════════════════════════════════════════════════════════════════

describe('encodeCodePoint', () => {
  it('encodes Chinese to U+XXXX', () => {
    expect(encodeCodePoint('你好')).toBe('U+4F60 U+597D')
  })

  it('encodes emoji to U+XXXXXX', () => {
    expect(encodeCodePoint('😀')).toBe('U+1F600')
  })

  it('encodes ASCII to U+XXXX', () => {
    expect(encodeCodePoint('A')).toBe('U+0041')
  })

  it('encodes mixed text', () => {
    expect(encodeCodePoint('A你')).toBe('U+0041 U+4F60')
  })

  it('handles empty input', () => {
    expect(encodeCodePoint('')).toBe('')
  })

  it('encodes Japanese text', () => {
    expect(encodeCodePoint('あ')).toBe('U+3042')
  })

  it('encodes another emoji (🎉)', () => {
    expect(encodeCodePoint('🎉')).toBe('U+1F389')
  })
})

// ═══════════════════════════════════════════════════════════════════════
// Code Point Variant — Decode
// ═══════════════════════════════════════════════════════════════════════

describe('decodeCodePoint', () => {
  it('decodes U+4F60 U+597D to Chinese', () => {
    expect(decodeCodePoint('U+4F60 U+597D')).toBe('你好')
  })

  it('decodes U+1F600 to emoji', () => {
    expect(decodeCodePoint('U+1F600')).toBe('😀')
  })

  it('decodes U+0041 to A', () => {
    expect(decodeCodePoint('U+0041')).toBe('A')
  })

  it('decodes lowercase u+ hex', () => {
    expect(decodeCodePoint('u+4f60 u+597d')).toBe('你好')
  })

  it('handles multiple spaces between code points', () => {
    expect(decodeCodePoint('U+4F60   U+597D')).toBe('你好')
  })

  it('handles empty input', () => {
    expect(decodeCodePoint('')).toBe('')
  })

  it('handles roundtrip: encode then decode', () => {
    const original = 'Hello 你好 😀'
    const encoded = encodeCodePoint(original)
    const decoded = decodeCodePoint(encoded)
    expect(decoded).toBe(original)
  })
})

// ═══════════════════════════════════════════════════════════════════════
// Code Point Variant — Invalid Decode Input
// ═══════════════════════════════════════════════════════════════════════

describe('decodeCodePoint — invalid input', () => {
  it('rejects U+ZZZZ (invalid hex)', () => {
    expect(() => decodeCodePoint('U+ZZZZ')).toThrow(/invalid hex/i)
  })

  it('rejects U+110000 (exceeds max code point)', () => {
    expect(() => decodeCodePoint('U+110000')).toThrow(/exceeds maximum/i)
  })

  it('rejects U+-1 (negative)', () => {
    expect(() => decodeCodePoint('U+-1')).toThrow(/invalid hex/i)
  })

  it('rejects malformed code point (no U+ prefix)', () => {
    expect(() => decodeCodePoint('4F60 U+597D')).toThrow(/does not start with U\+/)
  })

  it('rejects hex string longer than 6 digits', () => {
    // 7 hex digits is invalid
    expect(() => decodeCodePoint('U+1234567')).toThrow(/invalid hex/i)
  })
})

// ═══════════════════════════════════════════════════════════════════════
// Variant Dispatch — encodeUnicode / decodeUnicode
// ═══════════════════════════════════════════════════════════════════════

describe('encodeUnicode', () => {
  it('dispatches to JavaScript variant correctly', () => {
    expect(encodeUnicode('你好', 'javascript')).toBe('\\u4F60\\u597D')
  })

  it('dispatches to Code Point variant correctly', () => {
    expect(encodeUnicode('你好', 'code-point')).toBe('U+4F60 U+597D')
  })

  it('handles empty input', () => {
    expect(encodeUnicode('', 'javascript')).toBe('')
    expect(encodeUnicode('', 'code-point')).toBe('')
  })
})

describe('decodeUnicode', () => {
  it('dispatches to JavaScript variant correctly', () => {
    expect(decodeUnicode('\\u4F60\\u597D', 'javascript')).toBe('你好')
  })

  it('dispatches to Code Point variant correctly', () => {
    expect(decodeUnicode('U+4F60 U+597D', 'code-point')).toBe('你好')
  })

  it('handles empty input', () => {
    expect(decodeUnicode('', 'javascript')).toBe('')
    expect(decodeUnicode('', 'code-point')).toBe('')
  })
})

// ═══════════════════════════════════════════════════════════════════════
// tryDecodeUnicode (safe decode)
// ═══════════════════════════════════════════════════════════════════════

describe('tryDecodeUnicode', () => {
  it('returns success for valid JavaScript decode', () => {
    const result = tryDecodeUnicode('\\u4F60\\u597D', 'javascript')
    expect(result.success).toBe(true)
    if (result.success) expect(result.value).toBe('你好')
  })

  it('returns success for valid Code Point decode', () => {
    const result = tryDecodeUnicode('U+4F60 U+597D', 'code-point')
    expect(result.success).toBe(true)
    if (result.success) expect(result.value).toBe('你好')
  })

  it('returns error for invalid JavaScript input (never throws)', () => {
    const result = tryDecodeUnicode('\\uZZZZ', 'javascript')
    expect(result.success).toBe(false)
    if (!result.success) expect(result.error).toBeTruthy()
  })

  it('returns error for invalid Code Point input (never throws)', () => {
    const result = tryDecodeUnicode('U+ZZZZ', 'code-point')
    expect(result.success).toBe(false)
    if (!result.success) expect(result.error).toBeTruthy()
  })

  it('returns success for empty input', () => {
    const result = tryDecodeUnicode('', 'javascript')
    expect(result.success).toBe(true)
    if (result.success) expect(result.value).toBe('')
  })

  it('returns error for unpaired surrogate', () => {
    const result = tryDecodeUnicode('\\uD83D', 'javascript')
    expect(result.success).toBe(false)
  })

  it('returns error for code point exceeding max', () => {
    const result = tryDecodeUnicode('U+110000', 'code-point')
    expect(result.success).toBe(false)
  })
})

// ═══════════════════════════════════════════════════════════════════════
// transformUnicode
// ═══════════════════════════════════════════════════════════════════════

describe('transformUnicode', () => {
  it('encodes with JavaScript variant', () => {
    const config: UnicodeConfig = { mode: 'encode', variant: 'javascript' }
    const result = transformUnicode('你好', config)
    expect(result.output).toBe('\\u4F60\\u597D')
  })

  it('decodes with JavaScript variant', () => {
    const config: UnicodeConfig = { mode: 'decode', variant: 'javascript' }
    const result = transformUnicode('\\u4F60\\u597D', config)
    expect(result.output).toBe('你好')
  })

  it('encodes with Code Point variant', () => {
    const config: UnicodeConfig = { mode: 'encode', variant: 'code-point' }
    const result = transformUnicode('你好', config)
    expect(result.output).toBe('U+4F60 U+597D')
  })

  it('decodes with Code Point variant', () => {
    const config: UnicodeConfig = { mode: 'decode', variant: 'code-point' }
    const result = transformUnicode('U+4F60 U+597D', config)
    expect(result.output).toBe('你好')
  })

  it('includes stats in result', () => {
    const config: UnicodeConfig = { mode: 'encode', variant: 'javascript' }
    const result = transformUnicode('你好', config)
    expect(result.stats).toBeDefined()
    expect(result.stats.chars).toBeGreaterThan(0)
  })
})

// ═══════════════════════════════════════════════════════════════════════
// validate
// ═══════════════════════════════════════════════════════════════════════

describe('validate', () => {
  it('accepts non-empty input', () => {
    const result = validate('hello')
    expect(result.valid).toBe(true)
  })

  it('rejects empty string', () => {
    const result = validate('')
    expect(result.valid).toBe(false)
    if (!result.valid) {
      expect(result.errors[0].message).toBe('Input is empty')
    }
  })

  it('rejects whitespace-only input', () => {
    const result = validate('   ')
    expect(result.valid).toBe(false)
  })
})

// ═══════════════════════════════════════════════════════════════════════
// getStats
// ═══════════════════════════════════════════════════════════════════════

describe('getStats', () => {
  it('counts chars correctly', () => {
    expect(getStats('hello').chars).toBe(5)
  })

  it('counts lines correctly', () => {
    expect(getStats('a\nb\nc').lines).toBe(3)
  })

  it('counts bytes correctly', () => {
    const stats = getStats('hello')
    expect(stats.bytes).toBe(5)
  })

  it('counts multi-byte character bytes', () => {
    // 你好 = 6 bytes in UTF-8 (3 bytes each)
    const stats = getStats('你好')
    expect(stats.bytes).toBe(6)
  })
})

// ═══════════════════════════════════════════════════════════════════════
// formatSize
// ═══════════════════════════════════════════════════════════════════════

describe('formatSize', () => {
  it('formats bytes', () => { expect(formatSize(500)).toBe('500 B') })
  it('formats KB', () => { expect(formatSize(2048)).toBe('2.0 KB') })
  it('formats MB', () => {
    expect(formatSize(2 * 1024 * 1024)).toBe('2.0 MB')
  })
})

// ═══════════════════════════════════════════════════════════════════════
// Edge Cases
// ═══════════════════════════════════════════════════════════════════════

describe('edge cases', () => {
  it('handles CJK + emoji + ASCII mix roundtrip (JavaScript)', () => {
    const original = 'Test 测试 🎉 end'
    const encoded = encodeJsUnicode(original)
    const decoded = decodeJsUnicode(encoded)
    expect(decoded).toBe(original)
  })

  it('handles CJK + emoji + ASCII mix roundtrip (Code Point)', () => {
    const original = 'Test 测试 🎉 end'
    const encoded = encodeCodePoint(original)
    const decoded = decodeCodePoint(encoded)
    expect(decoded).toBe(original)
  })

  it('handles string with only spaces', () => {
    expect(encodeJsUnicode('   ')).toBe('   ')
  })

  it('handles all ASCII printable characters', () => {
    const ascii = '!"#$%&\'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`abcdefghijklmnopqrstuvwxyz{|}~'
    // All these are printable ASCII in range 0x20-0x7E
    // Backslash gets escaped to \\
    const result = encodeJsUnicode(ascii)
    expect(result).not.toContain('\\u00') // no unnecessary encoding of ASCII
  })
})
