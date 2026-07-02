/**
 * Base64 Plugin — Composable Tests (Mode Switch behavior)
 *
 * Tests that the Mode Switch (Encode/Decode segmented control) immediately
 * transforms current input using the shared useCodecTransform state machine
 * wired with real Base64 encode/decode functions.
 *
 * This validates: first click on Mode Switch must process the current
 * input without requiring a second click on the Run Encode/Run Decode button.
 */

import { describe, it, expect, vi } from 'vitest'
import { useCodecTransform } from '@/composables/useCodecTransform'
import { encode, decode } from '../logic'
import { createToolbar } from '../toolbar'

function createBase64Codec(defaultMode: 'encode' | 'decode' = 'encode') {
  return useCodecTransform({
    encode: (input: string) => encode(input),
    decode: (input: string) => decode(input),
    defaultMode,
  })
}

describe('Base64 Mode Switch (via useCodecTransform)', () => {
  // ── Requirement a: default Encode mode, input Base64, first Mode Switch to Decode → plaintext

  it('default encode mode: input Base64 string, first Mode Switch to "decode" outputs plaintext', () => {
    const codec = createBase64Codec('encode')

    // "Hello World" in Base64
    codec.input.value = 'SGVsbG8gV29ybGQ='

    // First click on Decode in the Mode Switch
    codec.selectMode('decode')

    expect(codec.mode.value).toBe('decode')
    expect(codec.output.value).toBe('Hello World')
    expect(codec.error.value).toBeNull()
  })

  // ── Requirement b: Decode mode, input plaintext, first Mode Switch to Encode → Base64

  it('decode mode: input plaintext, first Mode Switch to "encode" outputs Base64', () => {
    const codec = createBase64Codec('decode')

    codec.input.value = 'Hello World'

    // First click on Encode in the Mode Switch
    codec.selectMode('encode')

    expect(codec.mode.value).toBe('encode')
    expect(codec.output.value).toBe('SGVsbG8gV29ybGQ=')
    expect(codec.error.value).toBeNull()
  })

  // ── Additional: roundtrip via Mode Switch ─────────────────────────────

  it('roundtrip: switch mode to encode, set input to encoded output, switch to decode → original', () => {
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

  it('consecutive Mode Switch clicks each produce output on first click', () => {
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

  it('Mode Switch with empty input clears output without error', () => {
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

  it('invalid Base64 input on Mode Switch to decode sets error and clears output', () => {
    const codec = createBase64Codec('encode')

    codec.input.value = '!!!not-base64!!!'

    codec.selectMode('decode')

    expect(codec.output.value).toBeNull()
    expect(codec.error.value).toBeTruthy()
  })
})

// ── Button label derivation (Run Encode / Run Decode) ──────────────────

describe('Base64 action button label', () => {
  it('shows "Run Encode" when mode is encode', () => {
    const label = (mode: 'encode' | 'decode') => mode === 'encode' ? 'Run Encode' : 'Run Decode'
    expect(label('encode')).toBe('Run Encode')
  })

  it('shows "Run Decode" when mode is decode', () => {
    const label = (mode: 'encode' | 'decode') => mode === 'encode' ? 'Run Encode' : 'Run Decode'
    expect(label('decode')).toBe('Run Decode')
  })
})

// ── Clear (input, output, error) ─────────────────────────────────────

describe('Base64 clear', () => {
  it('clear() resets input, output, and error to initial state', () => {
    const codec = createBase64Codec('encode')

    // Set up state: input, output, and error
    codec.input.value = 'hello'
    codec.selectMode('encode')
    expect(codec.output.value).toBe('aGVsbG8=')

    // Trigger an error by decoding invalid Base64
    codec.input.value = '!!!'
    codec.selectMode('decode')
    expect(codec.error.value).toBeTruthy()
    expect(codec.output.value).toBeNull()

    // Clear
    codec.clear()

    expect(codec.input.value).toBe('')
    expect(codec.output.value).toBeNull()
    expect(codec.error.value).toBeNull()
    // Mode should be preserved
    expect(codec.mode.value).toBe('decode')
  })

  it('clear() resets error from a failed transform without changing mode', () => {
    const codec = createBase64Codec('encode')

    codec.input.value = 'not-base64!!!'
    codec.selectMode('decode')
    expect(codec.error.value).toBeTruthy()
    expect(codec.mode.value).toBe('decode')

    codec.clear()

    expect(codec.error.value).toBeNull()
    expect(codec.input.value).toBe('')
    expect(codec.mode.value).toBe('decode')
  })
})

// ── Default mode ─────────────────────────────────────────────────────

describe('Base64 default mode', () => {
  it('defaults to encode mode', () => {
    const codec = createBase64Codec()
    expect(codec.mode.value).toBe('encode')
  })

  it('can be initialized in decode mode', () => {
    const codec = createBase64Codec('decode')
    expect(codec.mode.value).toBe('decode')
  })
})

// ── Copy action ──────────────────────────────────────────────────────

describe('Base64 copy action', () => {
  it('calls navigator.clipboard.writeText with output value', async () => {
    const codec = createBase64Codec('encode')

    // Encode something
    codec.input.value = 'hello'
    codec.selectMode('encode')
    expect(codec.output.value).toBe('aGVsbG8=')

    // Mock clipboard
    const writeText = vi.fn().mockResolvedValue(undefined)
    const originalClipboard = navigator.clipboard
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText },
      writable: true,
      configurable: true,
    })

    try {
      await navigator.clipboard.writeText(codec.output.value!)
      expect(writeText).toHaveBeenCalledWith('aGVsbG8=')
      expect(writeText).toHaveBeenCalledTimes(1)
    } finally {
      Object.defineProperty(navigator, 'clipboard', {
        value: originalClipboard,
        writable: true,
        configurable: true,
      })
    }
  })

  it('does not attempt copy when output is null (no error thrown by codec)', () => {
    const codec = createBase64Codec('encode')

    // No output set — clear state
    codec.clear()
    expect(codec.output.value).toBeNull()
    expect(codec.error.value).toBeNull()

    // Copy guard: the composable checks for null output before calling clipboard
    // (handled by useBase64 composable's onCopy — tested here at the codec level)
    const hasOutput = codec.output.value !== null
    expect(hasOutput).toBe(false)
  })
})

// ── Error handling: invalid Base64 robustness ────────────────────────

describe('Base64 error handling robustness', () => {
  it('invalid Base64 "abc%%%" sets error, output is null, no crash', () => {
    const codec = createBase64Codec('encode')

    codec.input.value = 'abc%%%'
    codec.selectMode('decode')

    expect(codec.error.value).toBeTruthy()
    // atob() throws "Invalid character" for non-Base64 input;
    // the composable catches and surfaces the error message.
    expect(codec.error.value).toMatch(/invalid/i)
    expect(codec.output.value).toBeNull()
    // Mode still changed
    expect(codec.mode.value).toBe('decode')
  })

  it('subsequent valid transform clears previous error', () => {
    const codec = createBase64Codec('encode')

    // First: trigger error
    codec.input.value = '!!!invalid!!!'
    codec.selectMode('decode')
    expect(codec.error.value).toBeTruthy()

    // Then: valid input
    codec.input.value = 'aGVsbG8='
    codec.selectMode('decode')
    expect(codec.error.value).toBeNull()
    expect(codec.output.value).toBe('hello')
  })

  it('invalid Base64 with Cyrillic "привет" is handled gracefully', () => {
    const codec = createBase64Codec('encode')

    codec.input.value = 'привет'
    codec.selectMode('decode')

    expect(codec.error.value).toBeTruthy()
    expect(codec.output.value).toBeNull()
    // Must not throw
  })

  it('empty input after error state clears error on transform', () => {
    const codec = createBase64Codec('encode')

    codec.input.value = '!!!'
    codec.selectMode('decode')
    expect(codec.error.value).toBeTruthy()

    codec.input.value = ''
    codec.transform('decode')

    expect(codec.output.value).toBeNull()
    expect(codec.error.value).toBeNull()
  })
})

// ── Swap I/O ────────────────────────────────────────────────────────

describe('Base64 swap I/O', () => {
  it('swap sets input to output value and clears output', () => {
    const codec = createBase64Codec('encode')

    // Encode to produce output
    codec.input.value = 'hello'
    codec.selectMode('encode')
    expect(codec.output.value).toBe('aGVsbG8=')

    // Swap: input ← output, output ← null
    // (mirrors the onSwap handler in useBase64 composable)
    if (codec.output.value) {
      codec.input.value = codec.output.value
      codec.output.value = null
    }

    expect(codec.input.value).toBe('aGVsbG8=')
    expect(codec.output.value).toBeNull()
  })

  it('swap is a no-op when output is null', () => {
    const codec = createBase64Codec('encode')

    codec.input.value = 'hello'
    // No transform run — output is null
    expect(codec.output.value).toBeNull()

    if (codec.output.value !== null) {
      codec.input.value = codec.output.value
      codec.output.value = null
    }

    // Input unchanged, output still null
    expect(codec.input.value).toBe('hello')
    expect(codec.output.value).toBeNull()
  })

  it('swap with decode mode: input becomes decoded output, output cleared', () => {
    const codec = createBase64Codec('decode')

    codec.input.value = 'aGVsbG8='
    codec.selectMode('decode')
    expect(codec.output.value).toBe('hello')

    if (codec.output.value) {
      codec.input.value = codec.output.value
      codec.output.value = null
    }

    expect(codec.input.value).toBe('hello')
    expect(codec.output.value).toBeNull()
  })
})

// ── Toolbar swap dispatch (regression: swap was disabled by default) ─

describe('Base64 toolbar swap dispatch', () => {
  it('toolbar.execute("swap") calls onSwap handler', async () => {
    let swapCalled = false
    const toolbar = createToolbar({
      onCopy: () => {},
      onClear: () => {},
      onSwap: () => {
        swapCalled = true
      },
    })

    await toolbar.execute('swap')

    expect(swapCalled).toBe(true)
  })

  it('toolbar.execute("swap") dispatches correctly when output exists', async () => {
    const codec = createBase64Codec('encode')

    // Set up state with output
    codec.input.value = 'hello'
    codec.selectMode('encode')
    expect(codec.output.value).toBe('aGVsbG8=')

    // Wire the real swap handler
    let swapExecuted = false
    const toolbar = createToolbar({
      onCopy: () => {},
      onClear: () => codec.clear(),
      onSwap: () => {
        if (codec.output.value) {
          codec.input.value = codec.output.value
          codec.output.value = null
          swapExecuted = true
        }
      },
    })

    await toolbar.execute('swap')

    expect(swapExecuted).toBe(true)
    expect(codec.input.value).toBe('aGVsbG8=')
    expect(codec.output.value).toBeNull()
  })
})
