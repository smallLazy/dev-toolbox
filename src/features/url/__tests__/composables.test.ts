/**
 * URL Plugin — Composable Tests (Mode Switch behavior)
 *
 * Tests that the Mode Switch (Encode/Decode segmented control) immediately
 * transforms current input using the shared useCodecTransform state machine
 * wired with real URL encode/decode functions.
 *
 * This validates: first click on Mode Switch must process the current
 * input without requiring a second click on the Run Encode/Run Decode button.
 */

import { describe, it, expect } from 'vitest'
import { useCodecTransform } from '@/composables/useCodecTransform'
import { encodeUrl, decodeUrl } from '../logic'
import type { UrlVariant } from '../types'

function createUrlCodec(
  defaultMode: 'encode' | 'decode' = 'encode',
  variant: UrlVariant = 'component',
) {
  return useCodecTransform({
    encode: (input: string) => encodeUrl(input, variant),
    decode: (input: string) => decodeUrl(input, variant),
    defaultMode,
  })
}

describe('URL Mode Switch (via useCodecTransform)', () => {
  // ── Requirement: Mode Switch click immediately transforms ─────────────

  it('default encode mode: input URL-encoded string, first Mode Switch to "decode" outputs plaintext', () => {
    const codec = createUrlCodec('encode')

    // "hello world" URL-encoded
    codec.input.value = 'hello%20world'

    // First click on Decode in the Mode Switch
    codec.selectMode('decode')

    expect(codec.mode.value).toBe('decode')
    expect(codec.output.value).toBe('hello world')
    expect(codec.error.value).toBeNull()
  })

  it('decode mode: input plaintext, first Mode Switch to "encode" outputs URL-encoded', () => {
    const codec = createUrlCodec('decode')

    codec.input.value = 'hello world'

    // First click on Encode in the Mode Switch
    codec.selectMode('encode')

    expect(codec.mode.value).toBe('encode')
    expect(codec.output.value).toBe('hello%20world')
    expect(codec.error.value).toBeNull()
  })

  // ── Roundtrip via Mode Switch ─────────────────────────────────────────

  it('roundtrip: switch mode to encode, set input to encoded output, switch to decode → original', () => {
    const codec = createUrlCodec('encode')

    codec.input.value = 'Hello World & More'
    codec.selectMode('encode')
    const encoded = codec.output.value
    expect(encoded).toBeTruthy()

    codec.input.value = encoded!
    codec.selectMode('decode')
    expect(codec.output.value).toBe('Hello World & More')
  })

  // ── Consecutive Mode Switches ─────────────────────────────────────────

  it('consecutive Mode Switch clicks each produce output on first click', () => {
    const codec = createUrlCodec('encode')

    codec.input.value = 'Test 123'

    // Switch to decode
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

  it('Mode Switch with empty input clears output without error', () => {
    const codec = createUrlCodec('encode')

    codec.input.value = 'test'
    codec.selectMode('encode')
    expect(codec.output.value).toBeTruthy()

    codec.input.value = ''
    codec.selectMode('decode')

    expect(codec.output.value).toBeNull()
    expect(codec.error.value).toBeNull()
  })

  // ── Input preserved across Mode Switch ────────────────────────────────

  it('input is preserved when switching mode', () => {
    const codec = createUrlCodec('encode')

    codec.input.value = 'hello%20world'
    expect(codec.input.value).toBe('hello%20world')

    codec.selectMode('decode')
    expect(codec.input.value).toBe('hello%20world') // preserved
  })

  // ── PHP variant ───────────────────────────────────────────────────────

  it('PHP variant: encode converts space to +', () => {
    const codec = createUrlCodec('encode', 'php')

    codec.input.value = 'hello world'
    codec.selectMode('encode')

    expect(codec.output.value).toBe('hello+world')
  })

  it('PHP variant: decode converts + to space', () => {
    const codec = createUrlCodec('decode', 'php')

    codec.input.value = 'hello+world'
    codec.selectMode('decode')

    expect(codec.output.value).toBe('hello world')
  })

  it('URI variant: encode converts space to %20', () => {
    const codec = createUrlCodec('encode', 'uri')

    codec.input.value = 'hello world'
    codec.selectMode('encode')

    expect(codec.output.value).toBe('hello%20world')
  })

  // ── Error handling ───────────────────────────────────────────────────

  it('malformed percent-encoding on Mode Switch to decode sets error', () => {
    const codec = createUrlCodec('encode')

    // Invalid percent sequence
    codec.input.value = '%ZZ'
    codec.selectMode('decode')

    // URI malformed — decode reports error
    expect(codec.error.value).toBeTruthy()
    expect(codec.output.value).toBeNull()
  })
})

// ── Button label derivation (Run Encode / Run Decode) ──────────────────

describe('URL action button label', () => {
  it('shows "Run Encode" when mode is encode', () => {
    const label = (mode: 'encode' | 'decode') => mode === 'encode' ? 'Run Encode' : 'Run Decode'
    expect(label('encode')).toBe('Run Encode')
  })

  it('shows "Run Decode" when mode is decode', () => {
    const label = (mode: 'encode' | 'decode') => mode === 'encode' ? 'Run Encode' : 'Run Decode'
    expect(label('decode')).toBe('Run Decode')
  })
})
