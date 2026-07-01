/**
 * Base64 Plugin — Composable Tests (mode switching behavior)
 *
 * Tests that selectMode immediately transforms current input
 * using the shared useCodecTransform state machine wired with
 * real Base64 encode/decode functions.
 *
 * This validates the fix: first click on Encode/Decode tab
 * must process the current input without requiring a second click.
 */

import { describe, it, expect } from 'vitest'
import { useCodecTransform } from '@/composables/useCodecTransform'
import { encode, decode } from '../logic'

function createBase64Codec(defaultMode: 'encode' | 'decode' = 'encode') {
  return useCodecTransform({
    encode: (input: string) => encode(input),
    decode: (input: string) => decode(input),
    defaultMode,
  })
}

describe('Base64 mode switching (via useCodecTransform)', () => {
  // ── Requirement a: default Encode mode, input Base64, first Decode click → plaintext

  it('default encode mode: input Base64 string, first selectMode("decode") outputs plaintext', () => {
    const codec = createBase64Codec('encode')

    // "Hello World" in Base64
    codec.input.value = 'SGVsbG8gV29ybGQ='

    // First click on Decode tab
    codec.selectMode('decode')

    expect(codec.mode.value).toBe('decode')
    expect(codec.output.value).toBe('Hello World')
    expect(codec.error.value).toBeNull()
  })

  // ── Requirement b: Decode mode, input plaintext, first Encode click → Base64

  it('decode mode: input plaintext, first selectMode("encode") outputs Base64', () => {
    const codec = createBase64Codec('decode')

    codec.input.value = 'Hello World'

    // First click on Encode tab
    codec.selectMode('encode')

    expect(codec.mode.value).toBe('encode')
    expect(codec.output.value).toBe('SGVsbG8gV29ybGQ=')
    expect(codec.error.value).toBeNull()
  })

  // ── Additional: roundtrip via mode switching ─────────────────────────

  it('roundtrip: encode → set input to encoded output → decode → get original', () => {
    const codec = createBase64Codec('encode')

    // Encode: "Hello World" → Base64
    codec.input.value = 'Hello World'
    codec.selectMode('encode')
    const encoded = codec.output.value
    expect(encoded).toBe('SGVsbG8gV29ybGQ=')

    // Set input to the encoded output, then switch to decode
    codec.input.value = encoded!
    codec.selectMode('decode')
    expect(codec.output.value).toBe('Hello World')
  })

  it('consecutive mode switches do not require second click', () => {
    const codec = createBase64Codec('encode')

    codec.input.value = 'Test 123'

    // Switch to decode (first time)
    codec.selectMode('decode')
    const firstOutput = codec.output.value
    expect(firstOutput).toBeTruthy()
    expect(codec.error.value).toBeNull()

    // Switch back to encode
    codec.selectMode('encode')
    expect(codec.output.value).toBeTruthy()
    expect(codec.error.value).toBeNull()

    // Switch to decode again
    codec.selectMode('decode')
    expect(codec.output.value).toBeTruthy()
    expect(codec.error.value).toBeNull()
  })

  // ── Empty input ──────────────────────────────────────────────────────

  it('switching mode with empty input clears output without error', () => {
    const codec = createBase64Codec('encode')

    // Set up prior output
    codec.input.value = 'Hello'
    codec.selectMode('encode')
    expect(codec.output.value).toBeTruthy()

    // Clear input and switch mode
    codec.input.value = ''
    codec.selectMode('decode')

    expect(codec.output.value).toBeNull()
    expect(codec.error.value).toBeNull()
  })

  // ── Error handling ───────────────────────────────────────────────────

  it('invalid Base64 input on decode sets error and clears output', () => {
    const codec = createBase64Codec('encode')

    codec.input.value = '!!!not-base64!!!'

    codec.selectMode('decode')

    expect(codec.output.value).toBeNull()
    expect(codec.error.value).toBeTruthy()
  })
})
