/**
 * XML Plugin — Unit Tests (pure logic)
 *
 * Tests for formatXmlSafe, minifyXml, validateXml, transformXml,
 * getXmlStats, getStats, formatSize, process, and validate.
 */

import { describe, it, expect } from 'vitest'
import {
  process,
  validate,
  getStats,
  formatSize,
  validateXml,
  transformXml,
  getXmlStats,
  EXAMPLE_XML,
} from '../logic'
import type { XmlConfig } from '../types'
import { defaults } from '../settings'

const defaultConfig: XmlConfig = { indentSize: 2 }

// ═══════════════════════════════════════════════════════════════════════════
// validateXml
// ═══════════════════════════════════════════════════════════════════════════

describe('validateXml', () => {
  it('returns null for valid XML', () => {
    const err = validateXml('<root><item>hello</item></root>')
    expect(err).toBeNull()
  })

  it('returns null for valid XML with declaration', () => {
    const err = validateXml('<?xml version="1.0"?><root><a>1</a></root>')
    expect(err).toBeNull()
  })

  it('returns null for empty string (not an error)', () => {
    const err = validateXml('')
    expect(err).toBeNull()
  })

  it('returns null for whitespace-only string', () => {
    const err = validateXml('   ')
    expect(err).toBeNull()
  })

  it('returns error for mismatched closing tag', () => {
    const err = validateXml('<root><item>hello</item><<bad')
    expect(err).toBeTruthy()
    expect(typeof err).toBe('string')
  })

  it('returns error for unclosed tag', () => {
    const err = validateXml('<root><item>hello</item>')
    expect(err).toBeTruthy()
  })

  it('returns error for gibberish input', () => {
    const err = validateXml('not xml at all')
    expect(err).toBeTruthy()
  })
})

// ═══════════════════════════════════════════════════════════════════════════
// transformXml — Format
// ═══════════════════════════════════════════════════════════════════════════

describe('transformXml — Format', () => {
  it('formats valid XML with 2-space indent', () => {
    const input = '<root><item>hello</item></root>'
    const result = transformXml(input, 'format', { indentSize: 2 })

    expect(result.success).toBe(true)
    expect(result.output).toBe('<root>\n  <item>hello</item>\n</root>')
    expect(result.error).toBeNull()
    expect(result.stats).toBeTruthy()
  })

  it('formats valid XML with 4-space indent', () => {
    const input = '<root><item>hello</item></root>'
    const result = transformXml(input, 'format', { indentSize: 4 })

    expect(result.success).toBe(true)
    expect(result.output).toBe('<root>\n    <item>hello</item>\n</root>')
  })

  it('formats XML with attributes', () => {
    const input = '<root><person id="1"><name>Alice</name></person></root>'
    const result = transformXml(input, 'format', { indentSize: 2 })

    expect(result.success).toBe(true)
    expect(result.output).toContain('<person id="1">')
    expect(result.output).toContain('<name>Alice</name>')
  })

  it('formats XML with nested elements', () => {
    const input = '<a><b><c>deep</c></b></a>'
    const result = transformXml(input, 'format', { indentSize: 2 })

    expect(result.success).toBe(true)
    expect(result.output).toBe('<a>\n  <b>\n    <c>deep</c>\n  </b>\n</a>')
  })

  it('returns error for invalid XML', () => {
    const input = '<root><item>hello</item><<bad'
    const result = transformXml(input, 'format', { indentSize: 2 })

    expect(result.success).toBe(false)
    expect(result.error).toBeTruthy()
    expect(result.output).toBeNull()
  })

  it('handles empty input gracefully', () => {
    const result = transformXml('', 'format', { indentSize: 2 })

    expect(result.success).toBe(false)
    expect(result.output).toBeNull()
    expect(result.error).toBeNull()
    expect(result.stats).toBeNull()
  })
})

// ═══════════════════════════════════════════════════════════════════════════
// transformXml — Minify
// ═══════════════════════════════════════════════════════════════════════════

describe('transformXml — Minify', () => {
  it('minifies formatted XML', () => {
    const input = '<root>\n  <item>hello</item>\n</root>'
    const result = transformXml(input, 'minify', { indentSize: 2 })

    expect(result.success).toBe(true)
    expect(result.output).toBe('<root><item>hello</item></root>')
  })

  it('minifies XML with attributes', () => {
    const input = '<root>\n  <person id="1">\n    <name>Alice</name>\n  </person>\n</root>'
    const result = transformXml(input, 'minify', { indentSize: 2 })

    expect(result.success).toBe(true)
    expect(result.output).toBe('<root><person id="1"><name>Alice</name></person></root>')
  })

  it('returns error for invalid XML in minify mode', () => {
    const input = '<root><item>hello</item><<bad'
    const result = transformXml(input, 'minify', { indentSize: 2 })

    expect(result.success).toBe(false)
    expect(result.error).toBeTruthy()
  })

  it('handles empty input gracefully in minify mode', () => {
    const result = transformXml('', 'minify', { indentSize: 2 })
    expect(result.success).toBe(false)
    expect(result.output).toBeNull()
    expect(result.error).toBeNull()
  })
})

// ═══════════════════════════════════════════════════════════════════════════
// transformXml — Validate
// ═══════════════════════════════════════════════════════════════════════════

describe('transformXml — Validate', () => {
  it('returns success with formatted output for valid XML', () => {
    const input = '<root><item>hello</item></root>'
    const result = transformXml(input, 'validate', { indentSize: 2 })

    expect(result.success).toBe(true)
    expect(result.output).toContain('<root>')
    expect(result.error).toBeNull()
  })

  it('returns error for invalid XML', () => {
    const input = '<root><item>hello</item><<bad'
    const result = transformXml(input, 'validate', { indentSize: 2 })

    expect(result.success).toBe(false)
    expect(result.error).toBeTruthy()
  })

  it('handles empty input in validate mode', () => {
    const result = transformXml('', 'validate', { indentSize: 2 })
    expect(result.success).toBe(false)
    expect(result.output).toBeNull()
    expect(result.error).toBeNull()
  })
})

// ═══════════════════════════════════════════════════════════════════════════
// getXmlStats
// ═══════════════════════════════════════════════════════════════════════════

describe('getXmlStats', () => {
  it('counts chars, lines, and bytes', () => {
    const stats = getXmlStats('<root>\n  <item>hello</item>\n</root>')
    expect(stats.chars).toBeGreaterThan(0)
    expect(stats.lines).toBe(3)
    expect(stats.bytes).toBeGreaterThan(0)
  })

  it('returns correct stats for empty string', () => {
    const stats = getXmlStats('')
    expect(stats.chars).toBe(0)
    expect(stats.lines).toBe(1)
    expect(stats.bytes).toBe(0)
  })
})

// ═══════════════════════════════════════════════════════════════════════════
// process (legacy compat)
// ═══════════════════════════════════════════════════════════════════════════

describe('process', () => {
  it('formats valid XML', () => {
    const result = process('<root><item>hello</item></root>', defaultConfig)
    expect(result).toContain('<root>')
    expect(result).toContain('  <item>')
  })

  it('returns empty string for empty input', () => {
    const result = process('', defaultConfig)
    expect(result).toBe('')
  })

  it('throws on invalid XML', () => {
    expect(() => process('<root><item>hello</item><<bad', defaultConfig)).toThrow()
  })
})

// ═══════════════════════════════════════════════════════════════════════════
// validate (legacy compat)
// ═══════════════════════════════════════════════════════════════════════════

describe('validate', () => {
  it('rejects empty input', () => {
    const result = validate('')
    expect(result.valid).toBe(false)
    expect(result.message).toBe('Input is empty')
  })

  it('accepts valid XML', () => {
    const result = validate('<root><item>hello</item></root>')
    expect(result.valid).toBe(true)
  })

  it('rejects invalid XML', () => {
    const result = validate('<root><item>hello</item><<bad')
    expect(result.valid).toBe(false)
    expect(result.message).toBeTruthy()
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

  it('counts unicode size correctly', () => {
    const stats = getStats('你好')
    expect(stats.size).toBeGreaterThan(0)
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

// ═══════════════════════════════════════════════════════════════════════════
// EXAMPLE_XML
// ═══════════════════════════════════════════════════════════════════════════

describe('EXAMPLE_XML', () => {
  it('is valid XML', () => {
    const err = validateXml(EXAMPLE_XML)
    expect(err).toBeNull()
  })

  it('can be formatted', () => {
    const result = transformXml(EXAMPLE_XML, 'format', defaults)
    expect(result.success).toBe(true)
    expect(result.output).toBeTruthy()
  })
})
