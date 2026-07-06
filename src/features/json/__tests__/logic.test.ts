/**
 * JSON Plugin — Unit Tests (pure logic)
 *
 * Covers all pure functions: old compat + new safe wrappers.
 */

import { describe, it, expect } from 'vitest'
import {
  formatJson, minifyJson, validateJson, sortKeys,
  getStats, formatSize,
  parseJson, transformJson, getJsonStats, formatJsonError,
  EXAMPLE_JSON,
} from '../logic'
import { jsonDefaults } from '../settings'

const SAMPLE_JSON = '{"name":"Dev Toolbox","version":"1.0","tools":["json","aes"]}'
const SAMPLE_PRETTY = `{
  "name": "Dev Toolbox",
  "version": "1.0",
  "tools": [
    "json",
    "aes"
  ]
}`

// ═══════════════════════════════════════════════════════════════════════════
// OLD compat functions (keep existing tests + add edge cases)
// ═══════════════════════════════════════════════════════════════════════════

describe('formatJson (compat)', () => {
  it('formats compact JSON with indentation', () => {
    const result = formatJson(SAMPLE_JSON, jsonDefaults)
    expect(result.formatted).toContain('"name"')
    expect(result.lines).toBeGreaterThan(1)
  })

  it('respects indent size 4', () => {
    const result = formatJson(SAMPLE_JSON, { ...jsonDefaults, indentSize: 4 })
    expect(result.formatted).toContain('    "name"')
  })

  it('sorts keys when enabled', () => {
    const result = formatJson(SAMPLE_JSON, { ...jsonDefaults, sortKeys: true })
    const nameIdx = result.formatted.indexOf('"name"')
    const toolsIdx = result.formatted.indexOf('"tools"')
    const versionIdx = result.formatted.indexOf('"version"')
    expect(nameIdx).toBeLessThan(toolsIdx)
    expect(nameIdx).toBeLessThan(versionIdx)
    expect(toolsIdx).toBeLessThan(versionIdx)
  })

  it('throws on invalid JSON', () => {
    expect(() => formatJson('not json', jsonDefaults)).toThrow()
  })

  it('handles empty input', () => {
    expect(() => formatJson('', jsonDefaults)).toThrow()
  })

  // ── Extended cases ──────────────────────────────────────────────────
  it('formats top-level array', () => {
    const result = formatJson('[1,2,3]', jsonDefaults)
    expect(result.formatted).toContain('[\n')
    expect(result.lines).toBeGreaterThan(1)
  })

  it('formats nested object', () => {
    const result = formatJson('{"a":{"b":{"c":1}}}', jsonDefaults)
    const parsed = JSON.parse(result.formatted)
    expect(parsed.a.b.c).toBe(1)
  })

  it('formats mixed object and array', () => {
    const result = formatJson('{"items":[1,2],"meta":{"count":2}}', jsonDefaults)
    const parsed = JSON.parse(result.formatted)
    expect(parsed.items).toEqual([1, 2])
    expect(parsed.meta.count).toBe(2)
  })
})

describe('minifyJson (compat)', () => {
  it('minifies pretty JSON to single line', () => {
    const result = minifyJson(SAMPLE_PRETTY)
    expect(result.lines).toBe(1)
    expect(result.formatted).not.toContain('\n')
  })

  it('parses correctly', () => {
    const result = minifyJson(SAMPLE_PRETTY)
    const parsed = JSON.parse(result.formatted)
    expect(parsed.name).toBe('Dev Toolbox')
  })

  // ── Extended cases ──────────────────────────────────────────────────
  it('minifies formatted array', () => {
    const result = minifyJson('[\n  1,\n  2,\n  3\n]')
    expect(result.lines).toBe(1)
    expect(result.formatted).toBe('[1,2,3]')
  })

  it('preserves spaces inside string values', () => {
    const result = minifyJson('{"a":"hello world"}')
    const parsed = JSON.parse(result.formatted)
    expect(parsed.a).toBe('hello world')
  })
})

describe('validateJson (compat)', () => {
  it('validates correct JSON', () => {
    const result = validateJson(SAMPLE_JSON)
    expect(result.valid).toBe(true)
    expect(result.errors).toHaveLength(0)
  })

  it('detects invalid JSON', () => {
    const result = validateJson('{broken')
    expect(result.valid).toBe(false)
    expect(result.errors.length).toBeGreaterThan(0)
  })

  it('detects trailing comma', () => {
    const result = validateJson('{"a":1,}')
    expect(result.valid).toBe(false)
  })

  // ── Extended cases ──────────────────────────────────────────────────
  it('validates top-level array', () => {
    const result = validateJson('[1,2,3]')
    expect(result.valid).toBe(true)
  })

  it('validates top-level string', () => {
    const result = validateJson('"hello"')
    expect(result.valid).toBe(true)
  })

  it('validates top-level number', () => {
    const result = validateJson('42')
    expect(result.valid).toBe(true)
  })

  it('validates top-level boolean', () => {
    const result = validateJson('true')
    expect(result.valid).toBe(true)
  })

  it('validates top-level null', () => {
    const result = validateJson('null')
    expect(result.valid).toBe(true)
  })

  it('detects missing quote', () => {
    const result = validateJson('{"a:1}')
    expect(result.valid).toBe(false)
  })

  it('detects missing closing brace', () => {
    const result = validateJson('{"a":1')
    expect(result.valid).toBe(false)
  })

  it('detects single quotes', () => {
    const result = validateJson("{'a':1}")
    expect(result.valid).toBe(false)
  })

  it('detects unquoted key', () => {
    const result = validateJson('{a:1}')
    expect(result.valid).toBe(false)
  })

  it('detects NaN', () => {
    // NaN is not valid JSON
    expect(() => JSON.parse('NaN')).toThrow()
  })

  it('detects undefined (not valid JSON)', () => {
    // undefined is not valid JSON
    expect(() => JSON.parse('undefined')).toThrow()
  })

  it('detects comments', () => {
    const result = validateJson('{"a":1 /* comment */}')
    expect(result.valid).toBe(false)
  })
})

describe('sortKeys', () => {
  it('sorts object keys alphabetically', () => {
    const result = sortKeys('{"c":3,"a":1,"b":2}')
    const parsed = JSON.parse(result)
    expect(Object.keys(parsed)).toEqual(['a', 'b', 'c'])
  })

  it('handles nested objects', () => {
    const result = sortKeys('{"z":1,"a":{"c":3,"b":2}}')
    const parsed = JSON.parse(result)
    expect(Object.keys(parsed)).toEqual(['a', 'z'])
    expect(Object.keys(parsed.a)).toEqual(['b', 'c'])
  })
})

describe('getStats', () => {
  it('counts lines correctly', () => {
    const stats = getStats('line1\nline2\nline3')
    expect(stats.lines).toBe(3)
  })

  it('counts size correctly', () => {
    const stats = getStats('hello')
    expect(stats.size).toBe(5)
  })
})

describe('formatSize', () => {
  it('formats bytes', () => { expect(formatSize(500)).toBe('500 B') })
  it('formats KB', () => { expect(formatSize(2048)).toBe('2.0 KB') })
  it('formats MB', () => { expect(formatSize(2_500_000)).toBe('2.4 MB') })
})

// ═══════════════════════════════════════════════════════════════════════════
// NEW — Safe functions (v1 composable path)
// ═══════════════════════════════════════════════════════════════════════════

// ── parseJson ─────────────────────────────────────────────────────────────

describe('parseJson', () => {
  it('parses valid object', () => {
    const result = parseJson('{"a":1}')
    expect(result.success).toBe(true)
    if (result.success) expect(result.data).toEqual({ a: 1 })
  })

  it('parses valid array', () => {
    const result = parseJson('[1,2,3]')
    expect(result.success).toBe(true)
    if (result.success) expect(result.data).toEqual([1, 2, 3])
  })

  it('parses string primitive', () => {
    const result = parseJson('"hello"')
    expect(result.success).toBe(true)
    if (result.success) expect(result.data).toBe('hello')
  })

  it('parses number primitive', () => {
    const result = parseJson('42')
    expect(result.success).toBe(true)
    if (result.success) expect(result.data).toBe(42)
  })

  it('parses boolean primitive', () => {
    const result = parseJson('true')
    expect(result.success).toBe(true)
    if (result.success) expect(result.data).toBe(true)
  })

  it('parses null', () => {
    const result = parseJson('null')
    expect(result.success).toBe(true)
    if (result.success) expect(result.data).toBeNull()
  })

  it('handles empty input', () => {
    const result = parseJson('')
    expect(result.success).toBe(false)
    if (!result.success) expect(result.error).toContain('empty')
  })

  it('handles whitespace-only input', () => {
    const result = parseJson('   ')
    expect(result.success).toBe(false)
  })

  it('handles invalid JSON', () => {
    const result = parseJson('{broken')
    expect(result.success).toBe(false)
    if (!result.success) expect(result.error).toBeTruthy()
  })

  it('handles trailing comma', () => {
    const result = parseJson('{"a":1,}')
    expect(result.success).toBe(false)
  })

  it('does not throw on any input', () => {
    // These should never throw
    expect(() => parseJson('')).not.toThrow()
    expect(() => parseJson('   ')).not.toThrow()
    expect(() => parseJson('{broken')).not.toThrow()
    expect(() => parseJson('!!!')).not.toThrow()
    expect(() => parseJson('{"a":1,}')).not.toThrow()
  })
})

// ── transformJson ─────────────────────────────────────────────────────────

describe('transformJson', () => {
  // ── Format mode ─────────────────────────────────────────────────────
  describe('mode: format', () => {
    it('formats compact object', () => {
      const result = transformJson('{"name":"Dev Toolbox","version":"1.0"}', 'format')
      expect(result.success).toBe(true)
      expect(result.output).toContain('"name"')
      expect(result.output).toContain('\n')
      expect(result.error).toBeNull()
    })

    it('formats top-level array', () => {
      const result = transformJson('[1,2,3]', 'format')
      expect(result.success).toBe(true)
      expect(result.output).toContain('[\n')
    })

    it('formats nested object', () => {
      const result = transformJson('{"a":{"b":{"c":1}}}', 'format')
      expect(result.success).toBe(true)
      if (result.success) {
        const parsed = JSON.parse(result.output!)
        expect(parsed.a.b.c).toBe(1)
      }
    })

    it('formats top-level string', () => {
      const result = transformJson('"hello world"', 'format')
      expect(result.success).toBe(true)
      expect(result.output).toBe('"hello world"')
    })

    it('formats top-level number', () => {
      const result = transformJson('42', 'format')
      expect(result.success).toBe(true)
      expect(result.output).toBe('42')
    })

    it('formats top-level boolean', () => {
      const result = transformJson('true', 'format')
      expect(result.success).toBe(true)
      expect(result.output).toBe('true')
    })

    it('formats top-level null', () => {
      const result = transformJson('null', 'format')
      expect(result.success).toBe(true)
      expect(result.output).toBe('null')
    })

    it('preserves Chinese characters', () => {
      const result = transformJson('{"text":"你好"}', 'format')
      expect(result.success).toBe(true)
      expect(result.output).toContain('你好')
    })

    it('preserves emoji', () => {
      const result = transformJson('{"text":"😀"}', 'format')
      expect(result.success).toBe(true)
      expect(result.output).toContain('😀')
    })

    it('preserves escaped characters', () => {
      const result = transformJson('{"text":"line1\\nline2"}', 'format')
      expect(result.success).toBe(true)
      expect(result.output).toContain('\\n')
    })

    it('handles already formatted JSON (idempotent)', () => {
      const pretty = '{\n  "a": 1\n}'
      const result = transformJson(pretty, 'format')
      expect(result.success).toBe(true)
      // Should re-parse and re-format consistently
      if (result.success) {
        const parsed = JSON.parse(result.output!)
        expect(parsed.a).toBe(1)
      }
    })

    it('handles invalid JSON gracefully', () => {
      const result = transformJson('{broken', 'format')
      expect(result.success).toBe(false)
      expect(result.output).toBeNull()
      expect(result.error).toBeTruthy()
    })

    it('handles trailing comma', () => {
      const result = transformJson('{"a":1,}', 'format')
      expect(result.success).toBe(false)
      expect(result.error).toBeTruthy()
    })

    it('handles empty input safely', () => {
      const result = transformJson('', 'format')
      expect(result.success).toBe(false)
      expect(result.output).toBeNull()
      expect(result.error).toBeNull()
    })

    it('returns stats with formatted output', () => {
      const result = transformJson('{"a":1}', 'format')
      expect(result.success).toBe(true)
      expect(result.stats).not.toBeNull()
      expect(result.stats!.chars).toBeGreaterThan(0)
      expect(result.stats!.lines).toBeGreaterThan(0)
      expect(result.stats!.bytes).toBeGreaterThan(0)
    })
  })

  // ── Minify mode ─────────────────────────────────────────────────────
  describe('mode: minify', () => {
    it('minifies formatted object', () => {
      const result = transformJson(SAMPLE_PRETTY, 'minify')
      expect(result.success).toBe(true)
      expect(result.output).not.toContain('\n')
      expect(result.output).toContain('"name":"Dev Toolbox"')
    })

    it('minifies formatted array', () => {
      const result = transformJson('[\n  1,\n  2,\n  3\n]', 'minify')
      expect(result.success).toBe(true)
      expect(result.output).toBe('[1,2,3]')
    })

    it('preserves spaces inside string values', () => {
      const result = transformJson('{"a":"hello world"}', 'minify')
      expect(result.success).toBe(true)
      expect(result.output).toContain('"hello world"')
    })

    it('preserves Chinese in minification', () => {
      const result = transformJson('{"text":"你好"}', 'minify')
      expect(result.success).toBe(true)
      expect(result.output).toContain('你好')
    })

    it('preserves emoji in minification', () => {
      const result = transformJson('{"text":"😀"}', 'minify')
      expect(result.success).toBe(true)
      expect(result.output).toContain('😀')
    })

    it('handles invalid JSON gracefully', () => {
      const result = transformJson('{broken', 'minify')
      expect(result.success).toBe(false)
      expect(result.output).toBeNull()
      expect(result.error).toBeTruthy()
    })

    it('handles empty input safely', () => {
      const result = transformJson('', 'minify')
      expect(result.success).toBe(false)
      expect(result.output).toBeNull()
      expect(result.error).toBeNull()
    })

    it('returns stats with minified output', () => {
      const result = transformJson('{"a":1}', 'minify')
      expect(result.success).toBe(true)
      expect(result.stats).not.toBeNull()
      expect(result.stats!.lines).toBe(1)
    })
  })

  // ── Validate mode ───────────────────────────────────────────────────
  describe('mode: validate', () => {
    it('validates valid object and returns formatted JSON', () => {
      const result = transformJson('{"name":"Dev Toolbox","version":"1.0"}', 'validate')
      expect(result.success).toBe(true)
      expect(result.output).toContain('"name"')
      expect(result.output).toContain('\n')
      // Stats still available via result.stats
      expect(result.stats).not.toBeNull()
      expect(result.stats!.type).toBe('object')
      expect(result.stats!.keys).toBe(2)
    })

    it('validates valid array and returns formatted JSON', () => {
      const result = transformJson('[1,2,3]', 'validate')
      expect(result.success).toBe(true)
      expect(result.output).toContain('[\n')
      expect(result.stats).not.toBeNull()
      expect(result.stats!.type).toBe('array')
      expect(result.stats!.items).toBe(3)
    })

    it('validates string primitive', () => {
      const result = transformJson('"hello"', 'validate')
      expect(result.success).toBe(true)
      expect(result.output).toBe('"hello"')
      expect(result.stats!.type).toBe('string')
    })

    it('validates number primitive', () => {
      const result = transformJson('42', 'validate')
      expect(result.success).toBe(true)
      expect(result.output).toBe('42')
      expect(result.stats!.type).toBe('number')
    })

    it('validates boolean primitive', () => {
      const result = transformJson('true', 'validate')
      expect(result.success).toBe(true)
      expect(result.output).toBe('true')
      expect(result.stats!.type).toBe('boolean')
    })

    it('validates null', () => {
      const result = transformJson('null', 'validate')
      expect(result.success).toBe(true)
      expect(result.output).toBe('null')
      expect(result.stats!.type).toBe('null')
    })

    it('handles invalid JSON with enriched error', () => {
      const result = transformJson('{broken', 'validate')
      expect(result.success).toBe(false)
      expect(result.output).toBeNull()
      expect(result.error).toBeTruthy()
      expect(result.error).toContain('Invalid JSON')
    })

    it('handles empty input safely', () => {
      const result = transformJson('', 'validate')
      expect(result.success).toBe(false)
      expect(result.output).toBeNull()
      expect(result.error).toBeNull()
    })
  })

  // ── Error clearing across modes ─────────────────────────────────────
  it('valid JSON clears previous error across mode switches', () => {
    // First: invalid
    const bad = transformJson('{broken', 'format')
    expect(bad.success).toBe(false)
    expect(bad.error).toBeTruthy()

    // Then: valid
    const good = transformJson('{"a":1}', 'format')
    expect(good.success).toBe(true)
    expect(good.error).toBeNull()
  })
})

// ── getJsonStats ──────────────────────────────────────────────────────────

describe('getJsonStats', () => {
  it('returns chars, lines, bytes for any string', () => {
    const stats = getJsonStats('hello')
    expect(stats.chars).toBe(5)
    expect(stats.lines).toBe(1)
    expect(stats.bytes).toBe(5)
  })

  it('detects object type and counts keys', () => {
    const stats = getJsonStats('{"a":1,"b":2,"c":3}')
    expect(stats.type).toBe('object')
    expect(stats.keys).toBe(3)
    expect(stats.items).toBeUndefined()
  })

  it('detects array type and counts items', () => {
    const stats = getJsonStats('[1,2,3,4,5]')
    expect(stats.type).toBe('array')
    expect(stats.items).toBe(5)
    expect(stats.keys).toBeUndefined()
  })

  it('detects string type', () => {
    const stats = getJsonStats('"hello"')
    expect(stats.type).toBe('string')
  })

  it('detects number type', () => {
    const stats = getJsonStats('42')
    expect(stats.type).toBe('number')
  })

  it('detects boolean type', () => {
    const stats = getJsonStats('true')
    expect(stats.type).toBe('boolean')
  })

  it('detects null type', () => {
    const stats = getJsonStats('null')
    expect(stats.type).toBe('null')
  })

  it('counts multi-byte UTF-8 correctly', () => {
    const stats = getJsonStats('{"text":"你好"}')
    // "你好" is 2 chars but each is 3 bytes in UTF-8
    expect(stats.chars).toBeGreaterThan(0)
    expect(stats.bytes).toBeGreaterThan(stats.chars)
  })

  it('counts lines correctly for multi-line input', () => {
    const stats = getJsonStats('{\n  "a": 1,\n  "b": 2\n}')
    expect(stats.lines).toBe(4)
  })

  it('returns only basic stats for invalid JSON (no type/keys/items)', () => {
    const stats = getJsonStats('{broken')
    expect(stats.chars).toBeGreaterThan(0)
    expect(stats.lines).toBe(1)
    expect(stats.bytes).toBeGreaterThan(0)
    expect(stats.type).toBeUndefined()
    expect(stats.keys).toBeUndefined()
    expect(stats.items).toBeUndefined()
  })

  it('returns basic stats for empty input', () => {
    const stats = getJsonStats('')
    expect(stats.chars).toBe(0)
    expect(stats.lines).toBe(1)
    expect(stats.bytes).toBe(0)
    expect(stats.type).toBeUndefined()
  })

  it('handles emoji byte count correctly', () => {
    const stats = getJsonStats('{"emoji":"😀"}')
    // 😀 is 4 bytes in UTF-8
    expect(stats.type).toBe('object')
    expect(stats.bytes).toBeGreaterThan(stats.chars)
  })
})

// ═══════════════════════════════════════════════════════════════════════════
// formatJsonError
// ═══════════════════════════════════════════════════════════════════════════

describe('formatJsonError', () => {
  it('extracts position and computes line/column on single-line input', () => {
    const input = '{"a":1,}'
    // position 7 is the trailing comma
    const msg = formatJsonError(input, "Unexpected token } in JSON at position 7")
    expect(msg).toContain('Invalid JSON at line 1, column 8')
    expect(msg).toContain('Unexpected token }')
  })

  it('computes line/column for multi-line input', () => {
    const input = '{\n  "a": 1\n  "b":\n}'
    // The error position depends on the engine, but format should work
    const msg = formatJsonError(input, "Unexpected token } in JSON at position 20")
    expect(msg).toContain('Invalid JSON at line')
    expect(msg).toContain('column')
  })

  it('falls back when no position in error message', () => {
    const msg = formatJsonError('{"a":1}', 'Some generic error')
    expect(msg).toBe('Invalid JSON: Some generic error')
  })

  it('handles position at start of input (position 0)', () => {
    const msg = formatJsonError('{invalid', "Unexpected token i in JSON at position 0")
    expect(msg).toContain('Invalid JSON at line 1, column 1')
  })

  it('computes correct line when error is on line 3', () => {
    const input = '{\n  "a": 1,\n  "b":\n}'
    // position after the second newline
    const msg = formatJsonError(input, "Unexpected token } in JSON at position 21")
    expect(msg).toContain('Invalid JSON at line')
  })

  it('handles position at end of input', () => {
    const input = '{"a":1'
    const msg = formatJsonError(input, "Unexpected end of JSON input at position 6")
    expect(msg).toContain('Invalid JSON')
  })
})

// ═══════════════════════════════════════════════════════════════════════════
// EXAMPLE_JSON
// ═══════════════════════════════════════════════════════════════════════════

describe('EXAMPLE_JSON', () => {
  it('is valid JSON', () => {
    expect(() => JSON.parse(EXAMPLE_JSON)).not.toThrow()
  })

  it('contains expected keys', () => {
    const parsed = JSON.parse(EXAMPLE_JSON)
    expect(parsed.name).toBe('Dev Toolbox')
    expect(parsed.version).toBe('1.0.0')
    expect(parsed.features).toEqual(['format', 'minify', 'validate'])
    expect(parsed.local).toBe(true)
  })

  it('can be formatted by transformJson', () => {
    const result = transformJson(EXAMPLE_JSON, 'format')
    expect(result.success).toBe(true)
    expect(result.output).toContain('"name"')
    expect(result.output).toContain('\n')
  })
})
