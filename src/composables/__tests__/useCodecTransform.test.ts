/**
 * useCodecTransform — Unit Tests
 *
 * Tests the shared encode/decode interaction state machine.
 * Uses mock encode/decode functions to verify the state machine
 * behavior independent of any specific algorithm.
 */

import { describe, it, expect } from 'vitest'
import { useCodecTransform } from '../useCodecTransform'

// ── Mock encode/decode functions ────────────────────────────────────────

function mockEncode(input: string): string {
  // Reverse the string (simple transformation for testing)
  if (input === 'ERROR_TRIGGER') {
    throw new Error('Encode error: invalid input')
  }
  return input.split('').reverse().join('')
}

function mockDecode(input: string): string {
  // Also reverse (so encode + decode = identity)
  if (input === 'ERROR_TRIGGER') {
    throw new Error('Decode error: invalid input')
  }
  return input.split('').reverse().join('')
}

// ── selectMode ─────────────────────────────────────────────────────────

describe('selectMode', () => {
  it('selectMode("decode") uses decode function to immediately transform current input', () => {
    const codec = useCodecTransform({
      encode: mockEncode,
      decode: mockDecode,
      defaultMode: 'encode',
    })

    // Input is reversed version of expected output (since decode = reverse)
    codec.input.value = 'dlroW olleH' // reversed "Hello World"
    codec.selectMode('decode')

    expect(codec.mode.value).toBe('decode')
    expect(codec.output.value).toBe('Hello World')
    expect(codec.error.value).toBeNull()
  })

  it('selectMode("encode") uses encode function to immediately transform current input', () => {
    const codec = useCodecTransform({
      encode: mockEncode,
      decode: mockDecode,
      defaultMode: 'decode',
    })

    codec.input.value = 'Hello World'
    codec.selectMode('encode')

    expect(codec.mode.value).toBe('encode')
    expect(codec.output.value).toBe('dlroW olleH') // reversed
    expect(codec.error.value).toBeNull()
  })

  it('switching mode back and forth does not require second click', () => {
    const codec = useCodecTransform({
      encode: mockEncode,
      decode: mockDecode,
      defaultMode: 'encode',
    })

    // Encode mode: input "abc", expect encoded "cba"
    codec.input.value = 'abc'
    codec.selectMode('encode')
    expect(codec.output.value).toBe('cba')

    // Switch to decode: current input "abc" → decode "cba"
    codec.selectMode('decode')
    expect(codec.output.value).toBe('cba')

    // Switch back to encode: current input "abc" → encode "cba"
    codec.selectMode('encode')
    expect(codec.output.value).toBe('cba')
  })
})

// ── transform ──────────────────────────────────────────────────────────

describe('transform', () => {
  it('transform(targetMode) does not depend on mode.value', () => {
    const codec = useCodecTransform({
      encode: mockEncode,
      decode: mockDecode,
      defaultMode: 'encode',
    })

    // Set input and call transform('decode') while mode is still 'encode'
    codec.input.value = 'dlroW olleH' // reversed "Hello World"

    // mode is still 'encode', but we transform with 'decode'
    expect(codec.mode.value).toBe('encode')
    codec.transform('decode')

    // Should still decode correctly despite mode.value being 'encode'
    expect(codec.output.value).toBe('Hello World')
    // mode.value should NOT have changed (transform doesn't change mode)
    expect(codec.mode.value).toBe('encode')
  })

  it('transform("encode") encodes correctly regardless of mode', () => {
    const codec = useCodecTransform({
      encode: mockEncode,
      decode: mockDecode,
      defaultMode: 'decode',
    })

    codec.input.value = 'abc'
    expect(codec.mode.value).toBe('decode')
    codec.transform('encode')

    expect(codec.output.value).toBe('cba')
    expect(codec.mode.value).toBe('decode') // unchanged
  })
})

// ── Empty input ────────────────────────────────────────────────────────

describe('empty input handling', () => {
  it('output is cleared when input is empty (no error)', () => {
    const codec = useCodecTransform({
      encode: mockEncode,
      decode: mockDecode,
    })

    // Set up a prior output
    codec.input.value = 'abc'
    codec.transform('encode')
    expect(codec.output.value).toBe('cba')

    // Clear input and transform
    codec.input.value = ''
    codec.transform('encode')

    expect(codec.output.value).toBeNull()
    expect(codec.error.value).toBeNull()
  })

  it('selectMode with empty input clears output without error', () => {
    const codec = useCodecTransform({
      encode: mockEncode,
      decode: mockDecode,
    })

    // Set up a prior output
    codec.input.value = 'abc'
    codec.selectMode('encode')
    expect(codec.output.value).toBe('cba')

    // Clear input and switch mode
    codec.input.value = ''
    codec.selectMode('decode')

    expect(codec.output.value).toBeNull()
    expect(codec.error.value).toBeNull()
    expect(codec.mode.value).toBe('decode')
  })
})

// ── Error handling ────────────────────────────────────────────────────

describe('error handling', () => {
  it('decode error sets error message and clears output', () => {
    const codec = useCodecTransform({
      encode: mockEncode,
      decode: mockDecode,
    })

    // Set up a valid prior output
    codec.input.value = 'abc'
    codec.transform('encode')
    expect(codec.output.value).toBe('cba')

    // Now trigger an error
    codec.input.value = 'ERROR_TRIGGER'
    codec.transform('decode')

    expect(codec.output.value).toBeNull()
    expect(codec.error.value).toBe('Decode error: invalid input')
  })

  it('encode error sets error message and clears output', () => {
    const codec = useCodecTransform({
      encode: mockEncode,
      decode: mockDecode,
    })

    codec.input.value = 'ERROR_TRIGGER'
    codec.transform('encode')

    expect(codec.output.value).toBeNull()
    expect(codec.error.value).toBe('Encode error: invalid input')
  })

  it('transform clears previous error on success', () => {
    const codec = useCodecTransform({
      encode: mockEncode,
      decode: mockDecode,
    })

    // Trigger an error first
    codec.input.value = 'ERROR_TRIGGER'
    codec.transform('encode')
    expect(codec.error.value).toBe('Encode error: invalid input')

    // Now transform valid input — error should be cleared
    codec.input.value = 'abc'
    codec.transform('encode')
    expect(codec.error.value).toBeNull()
    expect(codec.output.value).toBe('cba')
  })

  it('selectMode with error-triggering input sets error on first click', () => {
    const codec = useCodecTransform({
      encode: mockEncode,
      decode: mockDecode,
      defaultMode: 'encode',
    })

    codec.input.value = 'ERROR_TRIGGER'
    codec.selectMode('decode')

    expect(codec.error.value).toBe('Decode error: invalid input')
    expect(codec.output.value).toBeNull()
  })
})

// ── clear ──────────────────────────────────────────────────────────────

describe('clear', () => {
  it('clears input, output, and error', () => {
    const codec = useCodecTransform({
      encode: mockEncode,
      decode: mockDecode,
    })

    codec.input.value = 'abc'
    codec.transform('encode')
    expect(codec.output.value).toBe('cba')

    codec.clear()

    expect(codec.input.value).toBe('')
    expect(codec.output.value).toBeNull()
    expect(codec.error.value).toBeNull()
  })

  it('clear does not change mode', () => {
    const codec = useCodecTransform({
      encode: mockEncode,
      decode: mockDecode,
      defaultMode: 'decode',
    })

    codec.clear()

    expect(codec.mode.value).toBe('decode')
  })

  it('clear resets error from previous failed transform', () => {
    const codec = useCodecTransform({
      encode: mockEncode,
      decode: mockDecode,
    })

    codec.input.value = 'ERROR_TRIGGER'
    codec.transform('encode')
    expect(codec.error.value).toBeTruthy()

    codec.clear()

    expect(codec.error.value).toBeNull()
  })
})

// ── Default mode ───────────────────────────────────────────────────────

describe('default mode', () => {
  it('defaults to encode', () => {
    const codec = useCodecTransform({
      encode: mockEncode,
      decode: mockDecode,
    })

    expect(codec.mode.value).toBe('encode')
  })

  it('accepts custom default mode', () => {
    const codec = useCodecTransform({
      encode: mockEncode,
      decode: mockDecode,
      defaultMode: 'decode',
    })

    expect(codec.mode.value).toBe('decode')
  })
})
