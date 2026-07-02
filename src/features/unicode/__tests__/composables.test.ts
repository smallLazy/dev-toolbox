/**
 * Unicode Plugin — Composable & Wiring Tests
 *
 * Covers:
 * - Layer 2: Composable / State transitions
 * - Layer 3: Wiring / Action Dispatch
 *
 * No DOM required — tests import and call composable + toolbar directly.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { ref } from 'vue'

// ── Mock clipboard ───────────────────────────────────────────────────
const clipboardSpy = vi.fn()

vi.mock('@/shared/clipboard', () => ({
  copyText: (text: string) => {
    clipboardSpy(text)
    return Promise.resolve()
  },
}))

// ── Mock useCodecTransform (we test the shared composable pattern, not its internals) ──
// We import the real useCodecTransform, but we test through useUnicode.
// The useUnicode composable depends on createFeatureContext which needs a full Vue app context.
// Instead, we test the toolbar wiring directly and the useCodecTransform integration indirectly.

// Since createFeatureContext requires app-level injection, we test at the wiring layer
// by creating the toolbar directly and testing its action dispatch.

import { createToolbar } from '../toolbar'
import { useCodecTransform } from '@/composables/useCodecTransform'
import { encodeUnicode, decodeUnicode } from '../logic'

// ═══════════════════════════════════════════════════════════════════════
// Helper: create a useCodecTransform-based test harness
// ═══════════════════════════════════════════════════════════════════════

function createTestHarness() {
  const codec = useCodecTransform({
    encode: (input: string) => encodeUnicode(input, 'javascript'),
    decode: (input: string) => decodeUnicode(input, 'javascript'),
    defaultMode: 'encode',
  })

  const loading = ref(false)
  const outputStats = ref<{ chars: number; lines: number; bytes: number } | null>(null)

  const toolbar = createToolbar({
    async onCopy() {
      codec.error.value = null
      if (!codec.output.value) {
        codec.error.value = 'No output to copy'
        return
      }
      await import('@/shared/clipboard').then(m => m.copyText(codec.output.value!))
    },
    onClear() {
      codec.clear()
      outputStats.value = null
    },
    onSwap() {
      if (codec.output.value) {
        codec.input.value = codec.output.value
        codec.output.value = null
        outputStats.value = null
      }
    },
  })

  return { codec, toolbar, loading, outputStats }
}

// ═══════════════════════════════════════════════════════════════════════
// Layer 2: Composable / State Tests
// ═══════════════════════════════════════════════════════════════════════

describe('useCodecTransform — Unicode state transitions', () => {
  let harness: ReturnType<typeof createTestHarness>

  beforeEach(() => {
    harness = createTestHarness()
  })

  describe('default state', () => {
    it('default mode is encode', () => {
      expect(harness.codec.mode.value).toBe('encode')
    })

    it('input is empty by default', () => {
      expect(harness.codec.input.value).toBe('')
    })

    it('output is null by default', () => {
      expect(harness.codec.output.value).toBeNull()
    })

    it('error is null by default', () => {
      expect(harness.codec.error.value).toBeNull()
    })
  })

  describe('encode transform', () => {
    it('produces correct JavaScript encode output', () => {
      harness.codec.input.value = '你好'
      harness.codec.transform('encode')
      expect(harness.codec.output.value).toBe('\\u4F60\\u597D')
      expect(harness.codec.error.value).toBeNull()
    })

    it('produces correct encode for emoji', () => {
      harness.codec.input.value = '😀'
      harness.codec.transform('encode')
      expect(harness.codec.output.value).toBe('\\uD83D\\uDE00')
    })

    it('produces correct encode for mixed content', () => {
      harness.codec.input.value = 'A你好😀'
      harness.codec.transform('encode')
      expect(harness.codec.output.value).toBe('A\\u4F60\\u597D\\uD83D\\uDE00')
    })
  })

  describe('decode transform', () => {
    it('produces correct JavaScript decode output', () => {
      harness.codec.mode.value = 'decode'
      harness.codec.input.value = '\\u4F60\\u597D'
      harness.codec.transform('decode')
      expect(harness.codec.output.value).toBe('你好')
    })

    it('decodes lowercase hex', () => {
      harness.codec.mode.value = 'decode'
      harness.codec.input.value = '\\u4f60\\u597d'
      harness.codec.transform('decode')
      expect(harness.codec.output.value).toBe('你好')
    })

    it('decodes surrogate pair to emoji', () => {
      harness.codec.mode.value = 'decode'
      harness.codec.input.value = '\\uD83D\\uDE00'
      harness.codec.transform('decode')
      expect(harness.codec.output.value).toBe('😀')
    })

    it('sets error for invalid decode', () => {
      harness.codec.mode.value = 'decode'
      harness.codec.input.value = '\\uZZZZ'
      harness.codec.transform('decode')
      expect(harness.codec.output.value).toBeNull()
      expect(harness.codec.error.value).toBeTruthy()
      expect(harness.codec.error.value).toContain('invalid hex')
    })

    it('clears error after valid input succeeds', () => {
      // First, trigger an error
      harness.codec.mode.value = 'decode'
      harness.codec.input.value = '\\uZZZZ'
      harness.codec.transform('decode')
      expect(harness.codec.error.value).toBeTruthy()

      // Then, fix the input
      harness.codec.input.value = '\\u4F60'
      harness.codec.transform('decode')
      expect(harness.codec.error.value).toBeNull()
      expect(harness.codec.output.value).toBe('你')
    })
  })

  describe('mode switch', () => {
    it('selectMode switches from encode to decode', () => {
      harness.codec.selectMode('decode')
      expect(harness.codec.mode.value).toBe('decode')
    })

    it('selectMode re-transforms current input', () => {
      harness.codec.input.value = 'hello'
      harness.codec.selectMode('encode')
      expect(harness.codec.output.value).toBe('hello')

      // Switch to decode — same input, different interpretation
      harness.codec.selectMode('decode')
      expect(harness.codec.output.value).toBe('hello')
    })
  })

  describe('clear', () => {
    it('clears input, output, and error', () => {
      harness.codec.input.value = '你好'
      harness.codec.transform('encode')
      expect(harness.codec.output.value).toBeTruthy()

      harness.codec.clear()
      expect(harness.codec.input.value).toBe('')
      expect(harness.codec.output.value).toBeNull()
      expect(harness.codec.error.value).toBeNull()
    })

    it('preserves mode after clear', () => {
      harness.codec.selectMode('decode')
      harness.codec.clear()
      expect(harness.codec.mode.value).toBe('decode')
    })
  })

  describe('swap', () => {
    it('swaps input and output when output exists', () => {
      harness.codec.input.value = '你好'
      harness.codec.transform('encode')
      const outputBefore = harness.codec.output.value

      harness.toolbar.execute('swap')
      expect(harness.codec.input.value).toBe(outputBefore)
      expect(harness.codec.output.value).toBeNull()
    })

    it('is safe no-op when output is null', () => {
      harness.codec.input.value = 'hello'
      harness.codec.output.value = null

      harness.toolbar.execute('swap')
      expect(harness.codec.input.value).toBe('hello')
      expect(harness.codec.output.value).toBeNull()
    })
  })
})

// ═══════════════════════════════════════════════════════════════════════
// Layer 3: Wiring / Action Dispatch Tests
// ═══════════════════════════════════════════════════════════════════════

describe('toolbar wiring — action dispatch', () => {
  let harness: ReturnType<typeof createTestHarness>

  beforeEach(() => {
    harness = createTestHarness()
    clipboardSpy.mockClear()
  })

  describe('copy action', () => {
    it('toolbar.execute("copy") calls copyText when output exists', async () => {
      harness.codec.input.value = '你好'
      harness.codec.transform('encode')
      expect(harness.codec.output.value).toBeTruthy()

      await harness.toolbar.execute('copy')
      expect(clipboardSpy).toHaveBeenCalledWith('\\u4F60\\u597D')
    })

    it('toolbar.execute("copy") sets error when no output', async () => {
      harness.codec.output.value = null
      await harness.toolbar.execute('copy')
      expect(clipboardSpy).not.toHaveBeenCalled()
      expect(harness.codec.error.value).toBe('No output to copy')
    })
  })

  describe('clear action', () => {
    it('toolbar.execute("clear") resets state', () => {
      harness.codec.input.value = '你好'
      harness.codec.transform('encode')
      expect(harness.codec.output.value).toBeTruthy()

      harness.toolbar.execute('clear')
      expect(harness.codec.input.value).toBe('')
      expect(harness.codec.output.value).toBeNull()
      expect(harness.codec.error.value).toBeNull()
    })
  })

  describe('swap action', () => {
    it('toolbar.execute("swap") swaps when output exists', () => {
      harness.codec.input.value = '你好'
      harness.codec.transform('encode')
      const encoded = harness.codec.output.value

      harness.toolbar.execute('swap')
      expect(harness.codec.input.value).toBe(encoded)
      expect(harness.codec.output.value).toBeNull()
    })

    it('swap action is registered in toolbar actions', () => {
      const swapAction = harness.toolbar.actions.find(a => a.id === 'swap')
      expect(swapAction).toBeDefined()
    })

    it('copy action is registered in toolbar actions', () => {
      const copyAction = harness.toolbar.actions.find(a => a.id === 'copy')
      expect(copyAction).toBeDefined()
    })

    it('clear action is registered in toolbar actions', () => {
      const clearAction = harness.toolbar.actions.find(a => a.id === 'clear')
      expect(clearAction).toBeDefined()
    })

    it('all toolbar actions have handlers', () => {
      for (const action of harness.toolbar.actions) {
        expect(action.handler).toBeDefined()
        expect(typeof action.handler).toBe('function')
      }
    })
  })
})

// ═══════════════════════════════════════════════════════════════════════
// Code Point Variant — State Tests
// ═══════════════════════════════════════════════════════════════════════

describe('useCodecTransform — Code Point variant', () => {
  it('encodes with code-point variant', () => {
    const codec = useCodecTransform({
      encode: (input: string) => encodeUnicode(input, 'code-point'),
      decode: (input: string) => decodeUnicode(input, 'code-point'),
      defaultMode: 'encode',
    })

    codec.input.value = '你好'
    codec.transform('encode')
    expect(codec.output.value).toBe('U+4F60 U+597D')
  })

  it('decodes with code-point variant', () => {
    const codec = useCodecTransform({
      encode: (input: string) => encodeUnicode(input, 'code-point'),
      decode: (input: string) => decodeUnicode(input, 'code-point'),
      defaultMode: 'decode',
    })

    codec.mode.value = 'decode'
    codec.input.value = 'U+4F60 U+597D'
    codec.transform('decode')
    expect(codec.output.value).toBe('你好')
  })

  it('decodes emoji code point', () => {
    const codec = useCodecTransform({
      encode: (input: string) => encodeUnicode(input, 'code-point'),
      decode: (input: string) => decodeUnicode(input, 'code-point'),
      defaultMode: 'decode',
    })

    codec.mode.value = 'decode'
    codec.input.value = 'U+1F600'
    codec.transform('decode')
    expect(codec.output.value).toBe('😀')
  })

  it('sets error for invalid code point', () => {
    const codec = useCodecTransform({
      encode: (input: string) => encodeUnicode(input, 'code-point'),
      decode: (input: string) => decodeUnicode(input, 'code-point'),
      defaultMode: 'decode',
    })

    codec.mode.value = 'decode'
    codec.input.value = 'U+110000'
    codec.transform('decode')
    expect(codec.output.value).toBeNull()
    expect(codec.error.value).toBeTruthy()
  })

  it('clears error on subsequent valid input', () => {
    const codec = useCodecTransform({
      encode: (input: string) => encodeUnicode(input, 'code-point'),
      decode: (input: string) => decodeUnicode(input, 'code-point'),
      defaultMode: 'decode',
    })

    // Trigger error
    codec.mode.value = 'decode'
    codec.input.value = 'U+ZZZZ'
    codec.transform('decode')
    expect(codec.error.value).toBeTruthy()

    // Fix input
    codec.input.value = 'U+4F60'
    codec.transform('decode')
    expect(codec.error.value).toBeNull()
    expect(codec.output.value).toBe('你')
  })
})

// ═══════════════════════════════════════════════════════════════════════
// Empty Input Handling
// ═══════════════════════════════════════════════════════════════════════

describe('empty input handling', () => {
  it('empty input produces null output (not error) on encode', () => {
    const harness = createTestHarness()
    harness.codec.input.value = ''
    harness.codec.transform('encode')
    expect(harness.codec.output.value).toBeNull()
    expect(harness.codec.error.value).toBeNull()
  })

  it('empty input produces null output (not error) on decode', () => {
    const harness = createTestHarness()
    harness.codec.mode.value = 'decode'
    harness.codec.input.value = ''
    harness.codec.transform('decode')
    expect(harness.codec.output.value).toBeNull()
    expect(harness.codec.error.value).toBeNull()
  })

  it('swap with no output is safe no-op', () => {
    const harness = createTestHarness()
    harness.codec.input.value = 'hello'
    harness.codec.output.value = null
    harness.toolbar.execute('swap')
    expect(harness.codec.input.value).toBe('hello')
    expect(harness.codec.output.value).toBeNull()
  })
})
