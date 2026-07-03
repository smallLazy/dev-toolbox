/**
 * SQL Plugin — Unit Tests (pure logic)
 */

import { describe, it, expect } from 'vitest'
import {
  parseSqlInItems,
  isValidNumber,
  formatSqlInItem,
  buildSqlInList,
  transformSql,
  validateSqlInput,
  formatSize,
  getStats,
} from '../logic'

// ── parseSqlInItems ──────────────────────────────────────────────────

describe('parseSqlInItems', () => {
  it('splits by newline (line-by-line)', () => {
    expect(parseSqlInItems('a\nb\nc', false)).toEqual(['a', 'b', 'c'])
  })

  it('splits by Windows line endings (\\r\\n)', () => {
    expect(parseSqlInItems('a\r\nb\r\nc', false)).toEqual(['a', 'b', 'c'])
  })

  it('trims whitespace from each line', () => {
    expect(parseSqlInItems('  a  \n b \n  c  ', false)).toEqual(['a', 'b', 'c'])
  })

  it('ignores empty lines', () => {
    expect(parseSqlInItems('a\n\nb\n\nc', false)).toEqual(['a', 'b', 'c'])
  })

  it('ignores blank lines (whitespace only)', () => {
    expect(parseSqlInItems('a\n   \nb\n\t\nc', false)).toEqual(['a', 'b', 'c'])
  })

  it('does NOT split on comma within a line (line-by-line only)', () => {
    expect(parseSqlInItems('a,b,c', false)).toEqual(['a,b,c'])
  })

  it('does NOT split on space within a line', () => {
    expect(parseSqlInItems('hello world\nfoo bar', false)).toEqual(['hello world', 'foo bar'])
  })

  it('does NOT split on semicolon within a line', () => {
    expect(parseSqlInItems('a;b;c', false)).toEqual(['a;b;c'])
  })

  it('preserves line content with mixed delimiters', () => {
    const items = parseSqlInItems('a b;c,d', false)
    expect(items).toEqual(['a b;c,d'])
  })

  it('dedupe preserves first occurrence order', () => {
    expect(parseSqlInItems('a\nb\na\nc\nb', true)).toEqual(['a', 'b', 'c'])
  })

  it('returns empty array for empty input', () => {
    expect(parseSqlInItems('', false)).toEqual([])
  })

  it('returns empty array for whitespace-only input', () => {
    expect(parseSqlInItems('   \n  \n  ', false)).toEqual([])
  })

  it('handles single line input', () => {
    expect(parseSqlInItems('hello', false)).toEqual(['hello'])
  })
})

// ── isValidNumber ────────────────────────────────────────────────────

describe('isValidNumber', () => {
  it('accepts positive integer', () => {
    expect(isValidNumber('1001')).toBe(true)
  })

  it('accepts negative integer', () => {
    expect(isValidNumber('-1')).toBe(true)
  })

  it('accepts decimal', () => {
    expect(isValidNumber('3.14')).toBe(true)
  })

  it('accepts zero', () => {
    expect(isValidNumber('0')).toBe(true)
  })

  it('accepts negative decimal', () => {
    expect(isValidNumber('-0.5')).toBe(true)
  })

  it('accepts integer with leading zeros', () => {
    expect(isValidNumber('007')).toBe(true)
  })

  it('rejects non-numeric string', () => {
    expect(isValidNumber('abc')).toBe(false)
  })

  it('rejects mixed alphanumeric', () => {
    expect(isValidNumber('12a')).toBe(false)
  })

  it('rejects number with trailing dot', () => {
    expect(isValidNumber('1.')).toBe(false)
  })

  it('rejects decimal without leading digit', () => {
    expect(isValidNumber('.5')).toBe(false)
  })

  it('rejects multiple dots', () => {
    expect(isValidNumber('1.2.3')).toBe(false)
  })

  it('rejects empty string', () => {
    expect(isValidNumber('')).toBe(false)
  })

  it('rejects whitespace', () => {
    expect(isValidNumber('  ')).toBe(false)
  })

  it('rejects string with spaces around number', () => {
    expect(isValidNumber(' 123 ')).toBe(false)
  })
})

// ── formatSqlInItem ──────────────────────────────────────────────────

describe('formatSqlInItem', () => {
  it('wraps string in single quotes', () => {
    expect(formatSqlInItem('hello', 'string')).toBe("'hello'")
  })

  it('escapes internal single quotes SQL-style', () => {
    expect(formatSqlInItem("O'Reilly", 'string')).toBe("'O''Reilly'")
  })

  it('escapes multiple single quotes', () => {
    expect(formatSqlInItem("it's a ''test''", 'string')).toBe("'it''s a ''''test'''''")
  })

  it('does not wrap numbers in quotes', () => {
    expect(formatSqlInItem('123', 'number')).toBe('123')
  })

  it('passes negative number through unchanged', () => {
    expect(formatSqlInItem('-42', 'number')).toBe('-42')
  })

  it('passes decimal number through unchanged', () => {
    expect(formatSqlInItem('3.14', 'number')).toBe('3.14')
  })
})

// ── buildSqlInList ───────────────────────────────────────────────────

describe('buildSqlInList', () => {
  const cfg = (overrides: Record<string, unknown> = {}) => ({
    valueType: 'string' as const,
    lineMode: 'single' as const,
    wrapWithParentheses: true,
    dedupe: false,
    ...overrides,
  })

  // ── String type ──────────────────────────────────────────────────

  it('builds string single-line with parentheses', () => {
    const r = buildSqlInList('1001\n1002\n1003', cfg())
    expect(r.success).toBe(true)
    if (r.success) {
      expect(r.output).toBe("('1001', '1002', '1003')")
      expect(r.itemCount).toBe(3)
    }
  })

  it('builds string single-line with space after comma', () => {
    const r = buildSqlInList('a\nb', cfg())
    expect(r.success).toBe(true)
    if (r.success) expect(r.output).toBe("('a', 'b')")
  })

  it('builds string single-line without parentheses', () => {
    const r = buildSqlInList('a\nb', cfg({ wrapWithParentheses: false }))
    expect(r.success).toBe(true)
    if (r.success) expect(r.output).toBe("'a', 'b'")
  })

  it('builds string multi-line with parentheses (indented)', () => {
    const r = buildSqlInList('1001\n1002\n1003', cfg({ lineMode: 'multi' }))
    expect(r.success).toBe(true)
    if (r.success) {
      expect(r.output).toBe("(\n  '1001',\n  '1002',\n  '1003'\n)")
    }
  })

  it('builds string multi-line without parentheses (no leading spaces)', () => {
    const r = buildSqlInList('1001\n1002\n1003', cfg({ lineMode: 'multi', wrapWithParentheses: false }))
    expect(r.success).toBe(true)
    if (r.success) {
      expect(r.output).toBe("'1001',\n'1002',\n'1003'")
    }
  })

  it('escapes single quotes in output', () => {
    const r = buildSqlInList("O'Reilly", cfg({ wrapWithParentheses: false }))
    expect(r.success).toBe(true)
    if (r.success) expect(r.output).toBe("'O''Reilly'")
  })

  // ── Number type ──────────────────────────────────────────────────

  it('builds number single-line with parentheses', () => {
    const r = buildSqlInList('1001\n1002\n1003', cfg({ valueType: 'number' }))
    expect(r.success).toBe(true)
    if (r.success) expect(r.output).toBe('(1001, 1002, 1003)')
  })

  it('builds number single-line without parentheses', () => {
    const r = buildSqlInList('1\n2\n3', cfg({ valueType: 'number', wrapWithParentheses: false }))
    expect(r.success).toBe(true)
    if (r.success) expect(r.output).toBe('1, 2, 3')
  })

  it('builds number multi-line with parentheses', () => {
    const r = buildSqlInList('1001\n1002\n1003', cfg({ valueType: 'number', lineMode: 'multi' }))
    expect(r.success).toBe(true)
    if (r.success) {
      expect(r.output).toBe('(\n  1001,\n  1002,\n  1003\n)')
    }
  })

  it('builds number multi-line without parentheses', () => {
    const r = buildSqlInList('1001\n1002\n1003', cfg({ valueType: 'number', lineMode: 'multi', wrapWithParentheses: false }))
    expect(r.success).toBe(true)
    if (r.success) {
      expect(r.output).toBe('1001,\n1002,\n1003')
    }
  })

  it('accepts negative numbers', () => {
    const r = buildSqlInList('-1\n0\n3', cfg({ valueType: 'number' }))
    expect(r.success).toBe(true)
    if (r.success) expect(r.output).toBe('(-1, 0, 3)')
  })

  it('accepts decimal numbers', () => {
    const r = buildSqlInList('1.5\n2.0\n3.14', cfg({ valueType: 'number' }))
    expect(r.success).toBe(true)
    if (r.success) expect(r.output).toBe('(1.5, 2.0, 3.14)')
  })

  // ── Invalid number ───────────────────────────────────────────────

  it('rejects invalid number with line number', () => {
    const r = buildSqlInList('1001\nabc\n1003', cfg({ valueType: 'number' }))
    expect(r.success).toBe(false)
    if (!r.success && 'error' in r) {
      expect(r.error).toBe('Invalid number at line 2: abc')
    }
  })

  it('reports correct line number for invalid number (skipping empty lines)', () => {
    const r = buildSqlInList('1001\n\nabc\n1003', cfg({ valueType: 'number' }))
    expect(r.success).toBe(false)
    if (!r.success && 'error' in r) {
      expect(r.error).toBe('Invalid number at line 3: abc')
    }
  })

  // ── Dedupe ───────────────────────────────────────────────────────

  it('dedupes when dedupe is true', () => {
    const r = buildSqlInList('a\nb\na', cfg({ dedupe: true }))
    expect(r.success).toBe(true)
    if (r.success) expect(r.output).toBe("('a', 'b')")
  })

  // ── Empty input ──────────────────────────────────────────────────

  it('returns empty outcome for empty string (safe no-op)', () => {
    const r = buildSqlInList('', cfg())
    expect(r.success).toBe(false)
    if (!r.success) expect('empty' in r && r.empty).toBe(true)
  })

  it('returns empty outcome for whitespace-only input', () => {
    const r = buildSqlInList('  \n  \n  ', cfg())
    expect(r.success).toBe(false)
    if (!r.success) expect('empty' in r && r.empty).toBe(true)
  })
})

// ── transformSql ─────────────────────────────────────────────────────

describe('transformSql', () => {
  const cfg = (): Parameters<typeof transformSql>[1] => ({
    mode: 'in-builder',
    inConfig: { valueType: 'string', lineMode: 'single', wrapWithParentheses: true, dedupe: false },
  })

  it('returns SqlResult with output on success', () => {
    const result = transformSql('a\nb', cfg())
    expect(result.input).toBe('a\nb')
    expect(result.output).toBe("('a', 'b')")
    expect(result.error).toBeUndefined()
    expect(result.itemCount).toBe(2)
  })

  it('returns output=null for empty input (no error)', () => {
    const result = transformSql('', cfg())
    expect(result.output).toBeNull()
    expect(result.error).toBeUndefined()
  })

  it('returns error for invalid number', () => {
    const result = transformSql('abc', {
      mode: 'in-builder',
      inConfig: { valueType: 'number', lineMode: 'single', wrapWithParentheses: true, dedupe: false },
    })
    expect(result.output).toBeNull()
    expect(result.error).toBe('Invalid number at line 1: abc')
  })
})

// ── validateSqlInput ─────────────────────────────────────────────────

describe('validateSqlInput', () => {
  const cfg = (): Parameters<typeof validateSqlInput>[1] => ({
    mode: 'in-builder',
    inConfig: { valueType: 'string', lineMode: 'single', wrapWithParentheses: true, dedupe: false },
  })

  it('returns valid for empty input (empty is not an error)', () => {
    const r = validateSqlInput('', cfg())
    expect(r.valid).toBe(true)
  })

  it('returns valid for whitespace-only input', () => {
    const r = validateSqlInput('   ', cfg())
    expect(r.valid).toBe(true)
  })

  it('returns valid for normal input', () => {
    expect(validateSqlInput('a\nb', cfg()).valid).toBe(true)
  })
})

// ── getStats / formatSize ────────────────────────────────────────────

describe('getStats', () => {
  it('counts lines', () => {
    expect(getStats('a\nb\nc').lines).toBe(3)
  })

  it('counts size in bytes', () => {
    expect(getStats('hello').size).toBe(5)
  })
})

describe('formatSize', () => {
  it('formats bytes', () => { expect(formatSize(500)).toBe('500 B') })
  it('formats KB', () => { expect(formatSize(2048)).toBe('2.0 KB') })
  it('formats MB', () => { expect(formatSize(2 * 1024 * 1024)).toBe('2.0 MB') })
})
