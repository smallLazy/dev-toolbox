/**
 * JSON Plugin — Unit Tests (pure logic)
 */

import { describe, it, expect } from 'vitest'
import {
  formatJson, minifyJson, validateJson, sortKeys,
  getStats, formatSize,
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

describe('formatJson', () => {
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
    // 'name' should come before 'tools' and 'version'
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
})

describe('minifyJson', () => {
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
})

describe('validateJson', () => {
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
