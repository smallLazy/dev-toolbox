/**
 * Base64 Plugin — Unit Tests (pure logic)
 *
 * T1 scaffold: API shape tests with Spec-aligned test vectors.
 * T2 will expand with full test coverage.
 */

import { describe, it, expect } from 'vitest'
import { encode, decode, validate, validateBase64, getStats, formatSize } from '../logic'

describe('encode', () => {
  it('encodes ASCII text to Base64', () => {
    expect(encode('Hello World')).toBe('SGVsbG8gV29ybGQ=')
  })

  it('handles empty string (correctness property)', () => {
    expect(encode('')).toBe('')
  })

  it('encodes unicode CJK', () => {
    const result = encode('你好世界')
    expect(result).toBeDefined()
    expect(typeof result).toBe('string')
    // Verify roundtrip
    expect(decode(result)).toBe('你好世界')
  })

  it('encodes emoji (surrogate pairs)', () => {
    const input = 'Hello 😀🚀'
    const result = encode(input)
    expect(decode(result)).toBe(input)
  })
})

describe('decode', () => {
  it('decodes valid Base64 to text', () => {
    expect(decode('SGVsbG8gV29ybGQ=')).toBe('Hello World')
  })

  it('handles empty string', () => {
    expect(decode('')).toBe('')
  })

  it('roundtrip preserves unicode', () => {
    const input = 'Hello 😀🚀 你好世界'
    expect(decode(encode(input))).toBe(input)
  })

  it('throws on invalid Base64 input', () => {
    expect(() => decode('!!!')).toThrow()
    expect(() => decode('not-base64!!!')).toThrow()
    expect(() => decode('привет')).toThrow()
  })
})

describe('validate', () => {
  it('rejects empty input', () => {
    const result = validate('')
    expect(result.valid).toBe(false)
    if (!result.valid) {
      expect(result.errors[0].message).toBe('Input is empty')
    }
  })

  it('accepts non-empty input', () => {
    expect(validate('hello').valid).toBe(true)
  })

  it('rejects input over 50MB', () => {
    const large = 'A'.repeat(51 * 1024 * 1024)
    const result = validate(large)
    expect(result.valid).toBe(false)
  })
})

describe('validateBase64', () => {
  it('accepts valid Base64', () => {
    expect(validateBase64('SGVsbG8=').valid).toBe(true)
  })

  it('rejects invalid characters', () => {
    const result = validateBase64('!!!not-base64!!!')
    expect(result.valid).toBe(false)
    expect(result.error!.type).toBe('invalid_character')
    expect(result.error!.position).toBe(0)
  })

  it('rejects invalid length', () => {
    const result = validateBase64('SGVsbG8') // 7 chars
    expect(result.valid).toBe(false)
    expect(result.error!.type).toBe('invalid_length')
  })

  it('accepts empty string', () => {
    expect(validateBase64('').valid).toBe(true)
  })

  describe('padding', () => {
    it('accepts correct single-pad Base64', () => {
      expect(validateBase64('SGVsbG8=').valid).toBe(true)
      expect(validateBase64('TWE=').valid).toBe(true)
    })

    it('accepts correct double-pad Base64', () => {
      expect(validateBase64('TQ==').valid).toBe(true)
    })

    it('rejects over-padded Base64 (unnecessary second =)', () => {
      // SGVsbG8== has 9 chars (fails length check first before padding)
      expect(validateBase64('SGVsbG8==').valid).toBe(false)
      expect(validateBase64('SGVsbG8==').error!.type).toBe('invalid_length')
    })

    it('rejects single-pad on input needing two', () => {
      expect(validateBase64('TQ=').valid).toBe(false)
    })

    it('rejects triple-pad', () => {
      expect(validateBase64('T===').valid).toBe(false)
      expect(validateBase64('T===').error!.type).toBe('invalid_padding')
    })
  })

  describe('whitespace', () => {
    it('rejects Base64 with embedded space', () => {
      const result = validateBase64('SGVs bG8=')
      expect(result.valid).toBe(false)
      expect(result.error!.type).toBe('invalid_character')
      expect(result.error!.position).toBe(4)
    })

    it('rejects Base64 with newline', () => {
      const result = validateBase64('SGVs\nbG8=')
      expect(result.valid).toBe(false)
      expect(result.error!.type).toBe('invalid_character')
    })

    it('rejects Base64 with tab', () => {
      const result = validateBase64('SGVs\tbG8=')
      expect(result.valid).toBe(false)
      expect(result.error!.type).toBe('invalid_character')
    })
  })

  describe('URL-safe characters (out of scope for v1)', () => {
    it('rejects Base64URL dash character', () => {
      const result = validateBase64('SGVsbG8-')
      expect(result.valid).toBe(false)
      expect(result.error!.type).toBe('invalid_character')
    })

    it('rejects Base64URL underscore character', () => {
      const result = validateBase64('SGVsbG8_')
      expect(result.valid).toBe(false)
      expect(result.error!.type).toBe('invalid_character')
    })
  })
})

describe('getStats', () => {
  it('counts chars, lines, and bytes', () => {
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
    expect(stats.bytes).toBe(6) // 3 bytes per CJK char
  })
})

describe('formatSize', () => {
  it('formats bytes', () => { expect(formatSize(500)).toBe('500 B') })
  it('formats KB', () => { expect(formatSize(2048)).toBe('2.0 KB') })
  it('formats MB', () => { expect(formatSize(2 * 1024 * 1024)).toBe('2.0 MB') })
})
