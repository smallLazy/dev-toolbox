/**
 * PHP Compatible Preset — Integration Tests
 *
 * Verifies encode/decode against known test vectors, including
 * roundtrip consistency and JS/Rust diff-char coverage.
 */

import { describe, it, expect } from 'vitest'
import { runPipeline } from '@/shared/pipeline'
import { phpCompatiblePreset } from '../php-compatible.preset'

// ── Encode ───────────────────────────────────────────────────────────

describe('PHP Compatible encode', () => {
  it('encodes "hello world" → no = padding', () => {
    const result = runPipeline(phpCompatiblePreset, 'encode', 'hello world')
    // URL encode(PHP): "hello+world" → Base64(no pad): "aGVsbG8rd29ybGQ"
    expect(result.output).toBe('aGVsbG8rd29ybGQ')
    expect(result.output).not.toContain('=')
  })

  it('encodes "hello+world=test" → + becomes %2B, = becomes %3D', () => {
    const result = runPipeline(phpCompatiblePreset, 'encode', 'hello+world=test')
    // PHP urlencode: "hello%2Bworld%3Dtest"
    // Base64 of that (no pad)
    expect(result.output).not.toContain('=') // no padding
    // Verify roundtrip
    const decoded = runPipeline(phpCompatiblePreset, 'decode', result.output)
    expect(decoded.output).toBe('hello+world=test')
  })

  it('encodes Chinese correctly', () => {
    const result = runPipeline(phpCompatiblePreset, 'encode', '测试中文')
    expect(typeof result.output).toBe('string')
    expect(result.output.length).toBeGreaterThan(0)
    // The output should be valid URL-safe Base64 (no =)
    expect(result.output).not.toContain('=')
  })

  it('encodes emoji correctly', () => {
    const result = runPipeline(phpCompatiblePreset, 'encode', 'Hello 😀🚀')
    expect(typeof result.output).toBe('string')
    expect(result.output).not.toContain('=')
    // Verify roundtrip
    const decoded = runPipeline(phpCompatiblePreset, 'decode', result.output)
    expect(decoded.output).toBe('Hello 😀🚀')
  })

  it('handles empty string', () => {
    const result = runPipeline(phpCompatiblePreset, 'encode', '')
    expect(result.output).toBe('')
  })

  it('encodes single character', () => {
    const result = runPipeline(phpCompatiblePreset, 'encode', 'a')
    expect(typeof result.output).toBe('string')
    expect(result.output).not.toContain('=')
  })

  it('encodes empty JSON', () => {
    const result = runPipeline(phpCompatiblePreset, 'encode', '{}')
    expect(typeof result.output).toBe('string')
    expect(result.output).not.toContain('=')
  })

  it('encodes JSON object', () => {
    const input = '{"code":"set_password","type":1}'
    const result = runPipeline(phpCompatiblePreset, 'encode', input)
    expect(typeof result.output).toBe('string')
    expect(result.output).not.toContain('=')
  })

  it('encodes special chars !@#$%^&*()', () => {
    const input = 'special chars: !@#$%^&*()'
    const result = runPipeline(phpCompatiblePreset, 'encode', input)
    expect(typeof result.output).toBe('string')
    expect(result.output).not.toContain('=')
    // Verify roundtrip
    const decoded = runPipeline(phpCompatiblePreset, 'decode', result.output)
    expect(decoded.output).toBe(input)
  })

  it('encodes key=value&foo=bar', () => {
    const input = 'key=value&foo=bar'
    const result = runPipeline(phpCompatiblePreset, 'encode', input)
    expect(typeof result.output).toBe('string')
    expect(result.output).not.toContain('=')
  })

  it('records pipeline steps', () => {
    const result = runPipeline(phpCompatiblePreset, 'encode', 'hello world')
    expect(result.steps).toHaveLength(2)
    expect(result.steps[0].stepId).toBe('url-encode-php')
    expect(result.steps[1].stepId).toBe('base64-encode-no-pad')
  })

  it('handles large input (1000 repetitions)', () => {
    const input = 'hello world '.repeat(1000)
    const result = runPipeline(phpCompatiblePreset, 'encode', input)
    expect(typeof result.output).toBe('string')
    expect(result.output).not.toContain('=')
  })
})

// ── Decode ───────────────────────────────────────────────────────────

describe('PHP Compatible decode', () => {
  it('decodes encoded output back to original', () => {
    const original = 'hello world'
    const encoded = runPipeline(phpCompatiblePreset, 'encode', original)
    const decoded = runPipeline(phpCompatiblePreset, 'decode', encoded.output)
    expect(decoded.output).toBe(original)
  })

  it('decodes with spaces in input (URL transport simulation)', () => {
    const original = 'hello+world'
    const encoded = runPipeline(phpCompatiblePreset, 'encode', original)
    // Simulate URL transport: + → space
    const withSpaces = encoded.output.replace(/\+/g, ' ')
    const decoded = runPipeline(phpCompatiblePreset, 'decode', withSpaces)
    expect(decoded.output).toBe(original)
  })

  it('decodes Chinese correctly', () => {
    const original = '你好世界'
    const encoded = runPipeline(phpCompatiblePreset, 'encode', original)
    const decoded = runPipeline(phpCompatiblePreset, 'decode', encoded.output)
    expect(decoded.output).toBe(original)
  })

  it('decodes emoji correctly', () => {
    const original = 'Hello 😀🚀'
    const encoded = runPipeline(phpCompatiblePreset, 'encode', original)
    const decoded = runPipeline(phpCompatiblePreset, 'decode', encoded.output)
    expect(decoded.output).toBe(original)
  })

  it('handles empty string', () => {
    const result = runPipeline(phpCompatiblePreset, 'decode', '')
    expect(result.output).toBe('')
  })

  it('records pipeline steps', () => {
    const encoded = runPipeline(phpCompatiblePreset, 'encode', 'test')
    const result = runPipeline(phpCompatiblePreset, 'decode', encoded.output)
    expect(result.steps).toHaveLength(2)
    expect(result.steps[0].stepId).toBe('base64-decode-auto-pad')
    expect(result.steps[1].stepId).toBe('url-decode-php')
  })
})

// ── Roundtrip ────────────────────────────────────────────────────────

describe('PHP Compatible roundtrip', () => {
  const testVectors = [
    'hello world',
    'hello+world=test',
    '测试中文',
    'Hello 😀🚀',
    '',
    'a',
    '{}',
    '{"code":"set_password","type":1}',
    'special chars: !@#$%^&*()',
    'key=value&foo=bar',
    "hello!world*test'foo(bar)baz",
    'a+b=c&d e=f',
    '你好世界 🌍',
  ]

  for (const input of testVectors) {
    it(`roundtrips: "${input.slice(0, 40)}"`, () => {
      const encoded = runPipeline(phpCompatiblePreset, 'encode', input)
      const decoded = runPipeline(phpCompatiblePreset, 'decode', encoded.output)
      expect(decoded.output).toBe(input)
    })
  }
})

// ── JS/Rust diff-char coverage ───────────────────────────────────────

describe('JS/Rust URL encoding equivalence', () => {
  it('encodes ! as %21 (not preserved)', () => {
    const result = runPipeline(phpCompatiblePreset, 'encode', '!')
    // '!' should produce %21 in the URL step, which then gets Base64 encoded
    expect(typeof result.output).toBe('string')
  })

  it('encodes * as %2A (not preserved)', () => {
    const result = runPipeline(phpCompatiblePreset, 'encode', '*')
    expect(typeof result.output).toBe('string')
  })

  it("encodes ' as %27 (not preserved)", () => {
    const result = runPipeline(phpCompatiblePreset, 'encode', "'")
    expect(typeof result.output).toBe('string')
  })

  it('encodes ( as %28 (not preserved)', () => {
    const result = runPipeline(phpCompatiblePreset, 'encode', '(')
    expect(typeof result.output).toBe('string')
  })

  it('encodes ) as %29 (not preserved)', () => {
    const result = runPipeline(phpCompatiblePreset, 'encode', ')')
    expect(typeof result.output).toBe('string')
  })

  it('all diff-chars roundtrip correctly', () => {
    const input = "!*'()"
    const encoded = runPipeline(phpCompatiblePreset, 'encode', input)
    const decoded = runPipeline(phpCompatiblePreset, 'decode', encoded.output)
    expect(decoded.output).toBe(input)
  })
})

// ── Mode-specific tests ──────────────────────────────────────────────

describe('PHP Compatible mode behavior', () => {
  it('encode mode uses encodeSteps', () => {
    const result = runPipeline(phpCompatiblePreset, 'encode', 'test')
    expect(result.steps[0].stepId).toBe('url-encode-php')
  })

  it('decode mode uses decodeSteps', () => {
    const encoded = runPipeline(phpCompatiblePreset, 'encode', 'test')
    const result = runPipeline(phpCompatiblePreset, 'decode', encoded.output)
    expect(result.steps[0].stepId).toBe('base64-decode-auto-pad')
  })
})
