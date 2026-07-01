/**
 * SQL Plugin — Unit Tests (pure logic)
 */

import { describe, it, expect } from 'vitest'
import {
  parseSqlInItems,
  formatSqlInItem,
  buildSqlInList,
  transformSql,
  validateSqlInput,
  formatSize,
  getStats,
} from '../logic'

// ── parseSqlInItems ──────────────────────────────────────────────────

describe('parseSqlInItems', () => {
  it('splits by newline', () => {
    expect(parseSqlInItems('a\nb\nc', false)).toEqual(['a', 'b', 'c'])
  })

  it('splits by comma', () => {
    expect(parseSqlInItems('a,b,c', false)).toEqual(['a', 'b', 'c'])
  })

  it('splits by mixed delimiters (space, semicolon, comma)', () => {
    const items = parseSqlInItems('a b;c,d', false)
    expect(items).toEqual(['a', 'b', 'c', 'd'])
  })

  it('dedupe preserves first occurrence order', () => {
    expect(parseSqlInItems('a,b,a,c,b', true)).toEqual(['a', 'b', 'c'])
  })

  it('returns empty array for whitespace-only input', () => {
    expect(parseSqlInItems('   ', false)).toEqual([])
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

  it('does not wrap numbers in quotes', () => {
    expect(formatSqlInItem('123', 'number')).toBe('123')
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

  it('builds string single-line with parentheses', () => {
    expect(buildSqlInList('1\n2\n3', cfg())).toBe("('1','2','3')")
  })

  it('builds number single-line with parentheses', () => {
    expect(buildSqlInList('1\n2\n3', cfg({ valueType: 'number' }))).toBe('(1,2,3)')
  })

  it('builds multi-line with parentheses', () => {
    const result = buildSqlInList('1\n2\n3', cfg({ lineMode: 'multi' }))
    expect(result).toBe("('1',\n'2',\n'3')")
  })

  it('omits parentheses when wrapWithParentheses is false', () => {
    expect(buildSqlInList('a\nb', cfg({ wrapWithParentheses: false }))).toBe("'a','b'")
  })

  it('dedupes when dedupe is true', () => {
    expect(buildSqlInList('a\nb\na', cfg({ dedupe: true }))).toBe("('a','b')")
  })

  it('throws on empty input', () => {
    expect(() => buildSqlInList('', cfg())).toThrow('No valid items')
  })
})

// ── transformSql ─────────────────────────────────────────────────────

describe('transformSql', () => {
  it('returns SqlResult with in-builder mode', () => {
    const result = transformSql('a\nb', {
      mode: 'in-builder',
      inConfig: { valueType: 'string', lineMode: 'single', wrapWithParentheses: true, dedupe: false },
    })
    expect(result.input).toBe('a\nb')
    expect(result.output).toBe("('a','b')")
    expect(result.config.mode).toBe('in-builder')
  })
})

// ── validateSqlInput ─────────────────────────────────────────────────

describe('validateSqlInput', () => {
  const cfg = (): Parameters<typeof validateSqlInput>[1] => ({
    mode: 'in-builder',
    inConfig: { valueType: 'string', lineMode: 'single', wrapWithParentheses: true, dedupe: false },
  })

  it('rejects empty input', () => {
    const r = validateSqlInput('', cfg())
    expect(r.valid).toBe(false)
    if (!r.valid) expect(r.errors[0].code).toBe('EMPTY_INPUT')
  })

  it('rejects whitespace-only input', () => {
    const r = validateSqlInput('   ', cfg())
    expect(r.valid).toBe(false)
  })

  it('accepts valid input', () => {
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
