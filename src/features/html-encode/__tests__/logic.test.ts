/**
 * HtmlEncode Plugin — Pure Logic Tests (Layer 1)
 *
 * Covers: encodeHtml, decodeHtml, tryDecodeHtml, transformHtml, getStats, formatSize, validate
 *
 * Test coverage:
 *   - Encode: basic tags, & symbol, quotes, CJK, emoji, empty input, XSS-like, double-encode
 *   - Decode: named entities, numeric entities, hex entities, mixed, CJK, emoji, empty input
 *   - Safety: unknown entities, incomplete entities, &&&&, very long strings
 *   - tryDecodeHtml: always returns success
 *   - transformHtml: mode dispatch
 *   - getStats: chars, lines, bytes
 *   - formatSize: B, KB, MB
 *   - validate: empty, non-empty
 */

import { describe, it, expect } from 'vitest'
import {
  encodeHtml,
  decodeHtml,
  tryDecodeHtml,
  transformHtml,
  getStats,
  formatSize,
  validate,
} from '../logic'

// ═══════════════════════════════════════════════════════════════════════
// encodeHtml
// ═══════════════════════════════════════════════════════════════════════

describe('encodeHtml', () => {
  // ── Basic tags ──────────────────────────────────────────────────────

  it('encodes <div>Hello</div>', () => {
    expect(encodeHtml('<div>Hello</div>')).toBe(
      '&lt;div&gt;Hello&lt;/div&gt;'
    )
  })

  it('encodes Tom & Jerry', () => {
    expect(encodeHtml('Tom & Jerry')).toBe('Tom &amp; Jerry')
  })

  it('encodes double quotes in "hello"', () => {
    expect(encodeHtml('"hello"')).toBe('&quot;hello&quot;')
  })

  it("encodes single quote in It's OK", () => {
    expect(encodeHtml("It's OK")).toBe('It&#39;s OK')
  })

  // ── CJK and emoji ──────────────────────────────────────────────────

  it('encodes Chinese with HTML tags: 你好 <b>世界</b>', () => {
    expect(encodeHtml('你好 <b>世界</b>')).toBe(
      '你好 &lt;b&gt;世界&lt;/b&gt;'
    )
  })

  it('encodes emoji with HTML: 😀 <span>ok</span>', () => {
    expect(encodeHtml('😀 <span>ok</span>')).toBe(
      '😀 &lt;span&gt;ok&lt;/span&gt;'
    )
  })

  // ── Empty input ─────────────────────────────────────────────────────

  it('handles empty input', () => {
    expect(encodeHtml('')).toBe('')
  })

  // ── & encoding order: & must be first ───────────────────────────────

  it('encodes & first to avoid corrupting entity-like sequences', () => {
    // "&amp;" should not appear mid-input — instead & is always encoded
    expect(encodeHtml('&')).toBe('&amp;')
  })

  // ── Already-encoded content (double-encoding) ───────────────────────

  it('double-encodes already-encoded &lt; to &amp;lt;', () => {
    // This is expected behavior: encode treats input as raw text
    expect(encodeHtml('&lt;')).toBe('&amp;lt;')
  })

  it('double-encodes already-encoded &amp; to &amp;amp;', () => {
    expect(encodeHtml('&amp;')).toBe('&amp;amp;')
  })

  // ── XSS-like strings ────────────────────────────────────────────────

  it('encodes XSS-like <script>alert("x")</script>', () => {
    const result = encodeHtml('<script>alert("x")</script>')
    expect(result).toBe(
      '&lt;script&gt;alert(&quot;x&quot;)&lt;/script&gt;'
    )
    // Must not contain any raw < or >
    expect(result).not.toContain('<')
    expect(result).not.toContain('>')
  })

  it('encodes onerror handler in HTML', () => {
    const result = encodeHtml('<img src=x onerror="alert(1)">')
    expect(result).toBe(
      '&lt;img src=x onerror=&quot;alert(1)&quot;&gt;'
    )
    expect(result).not.toContain('<')
    expect(result).not.toContain('>')
  })

  // ── No-encode characters ────────────────────────────────────────────

  it('leaves normal text unchanged', () => {
    expect(encodeHtml('Hello World')).toBe('Hello World')
  })

  it('leaves numbers and punctuation unchanged', () => {
    expect(encodeHtml('12345!@#$%^*()_+-=[]{}|;:,./?')).toBe(
      '12345!@#$%^*()_+-=[]{}|;:,./?'
    )
  })

  // ── Very long input ─────────────────────────────────────────────────

  it('handles very long input without crash', () => {
    const long = '<div>' + 'A'.repeat(100000) + '</div>'
    const result = encodeHtml(long)
    expect(result).toContain('&lt;div&gt;')
    expect(result).toContain('&lt;/div&gt;')
    expect(result.length).toBeGreaterThan(100000)
  })

  // ── Roundtrip property ──────────────────────────────────────────────

  it('roundtrip: encode then decode returns original', () => {
    const inputs = [
      '<div>Hello</div>',
      'Tom & Jerry',
      '"hello"',
      "It's OK",
      '你好 <b>世界</b>',
      '😀 <span>ok</span>',
      'a < b && c > d',
    ]
    for (const input of inputs) {
      expect(decodeHtml(encodeHtml(input))).toBe(input)
    }
  })
})

// ═══════════════════════════════════════════════════════════════════════
// decodeHtml
// ═══════════════════════════════════════════════════════════════════════

describe('decodeHtml', () => {
  // ── Named entities ──────────────────────────────────────────────────

  it('decodes &lt;div&gt;Hello&lt;/div&gt;', () => {
    expect(decodeHtml('&lt;div&gt;Hello&lt;/div&gt;')).toBe(
      '<div>Hello</div>'
    )
  })

  it('decodes Tom &amp; Jerry', () => {
    expect(decodeHtml('Tom &amp; Jerry')).toBe('Tom & Jerry')
  })

  it('decodes &quot;hello&quot;', () => {
    expect(decodeHtml('&quot;hello&quot;')).toBe('"hello"')
  })

  // ── Numeric entities ────────────────────────────────────────────────

  it('decodes &#39; to single quote', () => {
    expect(decodeHtml('It&#39;s OK')).toBe("It's OK")
  })

  it('decodes &#x27; to single quote (hex)', () => {
    expect(decodeHtml('&#x27;')).toBe("'")
  })

  it('decodes &#47; to / (decimal)', () => {
    expect(decodeHtml('&#47;')).toBe('/')
  })

  it('decodes &#x2F; to / (hex)', () => {
    expect(decodeHtml('&#x2F;')).toBe('/')
  })

  // ── Mixed entities ──────────────────────────────────────────────────

  it('decodes CJK with HTML tags: 你好 &lt;b&gt;世界&lt;/b&gt;', () => {
    expect(decodeHtml('你好 &lt;b&gt;世界&lt;/b&gt;')).toBe(
      '你好 <b>世界</b>'
    )
  })

  it('decodes emoji with HTML: 😀 &lt;span&gt;ok&lt;/span&gt;', () => {
    expect(decodeHtml('😀 &lt;span&gt;ok&lt;/span&gt;')).toBe(
      '😀 <span>ok</span>'
    )
  })

  // ── Empty input ─────────────────────────────────────────────────────

  it('handles empty input', () => {
    expect(decodeHtml('')).toBe('')
  })

  // ── Unknown entities (lenient) ──────────────────────────────────────

  it('leaves &unknown; as-is (lenient)', () => {
    expect(decodeHtml('&unknown;')).toBe('&unknown;')
  })

  it('leaves &incomplete as-is (no trailing semicolon)', () => {
    expect(decodeHtml('&incomplete')).toBe('&incomplete')
  })

  it('leaves &lt without semicolon as-is', () => {
    expect(decodeHtml('&lt')).toBe('&lt')
  })

  it('handles mixed known and unknown entities', () => {
    expect(decodeHtml('&lt;div&gt;&unknown;&amp;end')).toBe(
      '<div>&unknown;&end'
    )
  })

  // ── Edge cases ──────────────────────────────────────────────────────

  it('handles &&&& safely', () => {
    expect(decodeHtml('&&&&')).toBe('&&&&')
  })

  it('handles bare & at end of string', () => {
    expect(decodeHtml('hello&')).toBe('hello&')
  })

  it('handles & followed by number', () => {
    expect(decodeHtml('&123')).toBe('&123')
  })

  it('handles unicode numeric entity &#128512; (😀)', () => {
    expect(decodeHtml('&#128512;')).toBe('😀')
  })

  it('handles hex unicode numeric entity &#x1F600; (😀)', () => {
    expect(decodeHtml('&#x1F600;')).toBe('😀')
  })

  // ── Very long input ─────────────────────────────────────────────────

  it('handles very long input without crash', () => {
    const long = '&lt;div&gt;' + 'A'.repeat(100000) + '&lt;/div&gt;'
    const result = decodeHtml(long)
    expect(result).toContain('<div>')
    expect(result).toContain('</div>')
    expect(result.length).toBeGreaterThan(100000)
  })

  // ── XSS-like strings ────────────────────────────────────────────────

  it('decodes XSS-like entities safely (just returns decoded text)', () => {
    const result = decodeHtml(
      '&lt;script&gt;alert(&quot;x&quot;)&lt;/script&gt;'
    )
    expect(result).toBe('<script>alert("x")</script>')
    // This is decoded TEXT — not executed HTML
    expect(typeof result).toBe('string')
  })

  // ── Roundtrip property ──────────────────────────────────────────────

  it('roundtrip: decode then encode returns original', () => {
    const inputs = [
      '&lt;div&gt;Hello&lt;/div&gt;',
      'Tom &amp; Jerry',
      '&quot;hello&quot;',
      'It&#39;s OK',
      '你好 &lt;b&gt;世界&lt;/b&gt;',
      '😀 &lt;span&gt;ok&lt;/span&gt;',
    ]
    for (const input of inputs) {
      expect(encodeHtml(decodeHtml(input))).toBe(input)
    }
  })
})

// ═══════════════════════════════════════════════════════════════════════
// tryDecodeHtml
// ═══════════════════════════════════════════════════════════════════════

describe('tryDecodeHtml', () => {
  it('always returns success: true', () => {
    const inputs = [
      '&lt;div&gt;Hello&lt;/div&gt;',
      '&unknown;',
      '&&&&',
      '',
      '<script>alert(1)</script>',
    ]
    for (const input of inputs) {
      const result = tryDecodeHtml(input)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(typeof result.value).toBe('string')
      }
    }
  })

  it('properly decodes valid HTML entities', () => {
    const result = tryDecodeHtml('&lt;br&gt;')
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.value).toBe('<br>')
    }
  })

  it('never throws for any input', () => {
    const maliciousInputs = [
      '',
      '\x00\x00\x00',
      '\n\t\r',
      '<script>alert(1)</script>',
      '&'.repeat(10000),
      '&unknown;' + 'A'.repeat(5000),
    ]
    for (const input of maliciousInputs) {
      expect(() => tryDecodeHtml(input)).not.toThrow()
      const result = tryDecodeHtml(input)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(typeof result.value).toBe('string')
      }
    }
  })
})

// ═══════════════════════════════════════════════════════════════════════
// transformHtml
// ═══════════════════════════════════════════════════════════════════════

describe('transformHtml', () => {
  it('encode mode encodes HTML', () => {
    expect(transformHtml('<div>Test</div>', 'encode')).toBe(
      '&lt;div&gt;Test&lt;/div&gt;'
    )
  })

  it('decode mode decodes HTML entities', () => {
    expect(transformHtml('&lt;div&gt;Test&lt;/div&gt;', 'decode')).toBe(
      '<div>Test</div>'
    )
  })

  it('encode mode with empty string returns empty', () => {
    expect(transformHtml('', 'encode')).toBe('')
  })

  it('decode mode with empty string returns empty', () => {
    expect(transformHtml('', 'decode')).toBe('')
  })
})

// ═══════════════════════════════════════════════════════════════════════
// getStats
// ═══════════════════════════════════════════════════════════════════════

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
    expect(stats.chars).toBe(2)
    expect(stats.bytes).toBe(6) // 3 bytes per CJK char in UTF-8
  })

  it('empty string has 0 lines', () => {
    const stats = getStats('')
    expect(stats.chars).toBe(0)
    expect(stats.lines).toBe(0)
    expect(stats.bytes).toBe(0)
  })

  it('emoji has correct char and byte counts', () => {
    const stats = getStats('😀')
    expect(stats.chars).toBe(2) // surrogate pair = 2 JS chars
    expect(stats.bytes).toBe(4) // emoji = 4 bytes in UTF-8
  })
})

// ═══════════════════════════════════════════════════════════════════════
// formatSize
// ═══════════════════════════════════════════════════════════════════════

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

// ═══════════════════════════════════════════════════════════════════════
// validate
// ═══════════════════════════════════════════════════════════════════════

describe('validate', () => {
  it('rejects empty input', () => {
    const result = validate('')
    expect(result.valid).toBe(false)
    if (!result.valid) {
      expect(result.message).toBe('Input is empty')
    }
  })

  it('rejects whitespace-only input', () => {
    const result = validate('   ')
    expect(result.valid).toBe(false)
  })

  it('accepts non-empty input', () => {
    expect(validate('hello').valid).toBe(true)
  })

  it('accepts single character', () => {
    expect(validate('a').valid).toBe(true)
  })
})
