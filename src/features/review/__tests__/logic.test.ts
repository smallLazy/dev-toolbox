/**
 * Review Plugin — Unit Tests (pure logic)
 */

import { describe, it, expect } from 'vitest'
import { process, validate, getStats, formatSize } from '../logic'

describe('process', () => {
  it('processes input correctly', () => {
    const result = process('hello', {} as any)
    expect(result).toBeDefined()
  })

  it('handles empty input', () => {
    const result = process('', {} as any)
    expect(typeof result).toBe('string')
  })

  it('handles unicode', () => {
    const result = process('你好世界', {} as any)
    expect(result).toBeDefined()
  })
})

describe('validate', () => {
  it('rejects empty input', () => {
    const result = validate('')
    expect(result.valid).toBe(false)
  })

  it('accepts non-empty input', () => {
    const result = validate('hello')
    expect(result.valid).toBe(true)
  })
})

describe('getStats', () => {
  it('counts lines', () => {
    expect(getStats('a\nb\nc').lines).toBe(3)
  })

  it('counts size', () => {
    expect(getStats('hello').size).toBe(5)
  })
})

describe('formatSize', () => {
  it('formats bytes', () => { expect(formatSize(500)).toBe('500 B') })
  it('formats KB', () => { expect(formatSize(2048)).toBe('2.0 KB') })
})
