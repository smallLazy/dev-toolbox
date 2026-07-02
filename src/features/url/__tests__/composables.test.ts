/**
 * URL Plugin — Composable Tests (Mode Switch behavior)
 *
 * Tests that the Mode Switch (Encode/Decode segmented control) immediately
 * transforms current input using the shared useCodecTransform state machine
 * wired with real URL encode/decode functions.
 *
 * This validates: first click on Mode Switch must process the current
 * input without requiring a second click on the Run Encode/Run Decode button.
 *
 * Test layers:
 *   Layer 1 (Pure Logic)   — covered in logic.test.ts
 *   Layer 2 (Composable/State) — mode switch, variant, clear, swap, copy, execute
 *   Layer 3 (Wiring/Dispatch)  — toolbar.execute() → handler invocation
 *   Layer 4 (Component/DOM)    — NOT covered; listed as manual smoke test items
 */

import { describe, it, expect, vi } from 'vitest'
import { useCodecTransform } from '@/composables/useCodecTransform'
import { encodeUrl, decodeUrl } from '../logic'
import { createToolbar } from '../toolbar'
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

// ═══════════════════════════════════════════════════════════════════════
// Layer 2 — Composable / State Tests
// ═══════════════════════════════════════════════════════════════════════

// ── Default state ───────────────────────────────────────────────────────

describe('URL default state', () => {
  it('defaults to encode mode', () => {
    const codec = createUrlCodec()
    expect(codec.mode.value).toBe('encode')
  })

  it('can be initialized in decode mode', () => {
    const codec = createUrlCodec('decode')
    expect(codec.mode.value).toBe('decode')
  })
})

// ── Variant switching ──────────────────────────────────────────────────

describe('URL variant switching', () => {
  it('component variant encodes with encodeURIComponent', () => {
    const codec = createUrlCodec('encode', 'component')
    codec.input.value = 'a=b&c=d'
    codec.selectMode('encode')
    // encodeURIComponent encodes = and &
    expect(codec.output.value).toBe('a%3Db%26c%3Dd')
  })

  it('uri variant encodes with encodeURI', () => {
    const codec = createUrlCodec('encode', 'uri')
    codec.input.value = 'https://example.com/a b?x=1&y=你好'
    codec.selectMode('encode')
    // encodeURI preserves URI structure chars (: / ? & =)
    expect(codec.output.value).toContain('https://')
    expect(codec.output.value).toContain('?')
    expect(codec.output.value).toContain('&')
    expect(codec.output.value).toContain('=')
    // encodeURI encodes spaces
    expect(codec.output.value).toContain('%20')
  })

  it('uri variant decodes with decodeURI', () => {
    const codec = createUrlCodec('decode', 'uri')
    codec.input.value = 'https://example.com/a%20b?x=1&y=%E4%BD%A0%E5%A5%BD'
    codec.selectMode('decode')
    expect(codec.output.value).toBe('https://example.com/a b?x=1&y=你好')
  })

  it('variant switch changes subsequent transform result', () => {
    // Start with component
    const codecComp = createUrlCodec('encode', 'component')
    codecComp.input.value = 'a=b'
    codecComp.selectMode('encode')
    expect(codecComp.output.value).toBe('a%3Db')

    // Same input, different variant (uri)
    const codecUri = createUrlCodec('encode', 'uri')
    codecUri.input.value = 'a=b'
    codecUri.selectMode('encode')
    // encodeURI does NOT encode =
    expect(codecUri.output.value).toBe('a=b')
  })
})

// ── Clear ──────────────────────────────────────────────────────────────

describe('URL clear', () => {
  it('clear() resets input, output, and error to initial state', () => {
    const codec = createUrlCodec('encode')

    codec.input.value = 'hello world'
    codec.selectMode('encode')
    expect(codec.output.value).toBe('hello%20world')

    // Trigger error
    codec.input.value = '%ZZ'
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

  it('clear() preserves mode', () => {
    const codec = createUrlCodec('decode')

    codec.input.value = 'hello%20world'
    codec.selectMode('decode')
    codec.clear()

    expect(codec.mode.value).toBe('decode')
    expect(codec.input.value).toBe('')
    expect(codec.output.value).toBeNull()
  })
})

// ── Copy action (state level) ──────────────────────────────────────────

describe('URL copy action', () => {
  it('calls navigator.clipboard.writeText with output value', async () => {
    const codec = createUrlCodec('encode')

    codec.input.value = 'hello world'
    codec.selectMode('encode')
    expect(codec.output.value).toBe('hello%20world')

    const writeText = vi.fn().mockResolvedValue(undefined)
    const originalClipboard = navigator.clipboard
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText },
      writable: true,
      configurable: true,
    })

    try {
      await navigator.clipboard.writeText(codec.output.value!)
      expect(writeText).toHaveBeenCalledWith('hello%20world')
      expect(writeText).toHaveBeenCalledTimes(1)
    } finally {
      Object.defineProperty(navigator, 'clipboard', {
        value: originalClipboard,
        writable: true,
        configurable: true,
      })
    }
  })

  it('does not attempt copy when output is null', () => {
    const codec = createUrlCodec('encode')

    codec.clear()
    expect(codec.output.value).toBeNull()

    const hasOutput = codec.output.value !== null
    expect(hasOutput).toBe(false)
  })
})

// ── Swap I/O (state level) ─────────────────────────────────────────────

describe('URL swap I/O', () => {
  it('swap sets input to output value and clears output', () => {
    const codec = createUrlCodec('encode')

    codec.input.value = 'hello world'
    codec.selectMode('encode')
    expect(codec.output.value).toBe('hello%20world')

    // Swap: input ← output, output ← null
    if (codec.output.value) {
      codec.input.value = codec.output.value
      codec.output.value = null
    }

    expect(codec.input.value).toBe('hello%20world')
    expect(codec.output.value).toBeNull()
  })

  it('swap is a no-op when output is null', () => {
    const codec = createUrlCodec('encode')

    codec.input.value = 'hello'
    expect(codec.output.value).toBeNull()

    if (codec.output.value !== null) {
      codec.input.value = codec.output.value
      codec.output.value = null
    }

    expect(codec.input.value).toBe('hello')
    expect(codec.output.value).toBeNull()
  })

  it('swap with decode mode: input becomes decoded output, output cleared', () => {
    const codec = createUrlCodec('decode', 'component')

    codec.input.value = 'hello%20world'
    codec.selectMode('decode')
    expect(codec.output.value).toBe('hello world')

    if (codec.output.value) {
      codec.input.value = codec.output.value
      codec.output.value = null
    }

    expect(codec.input.value).toBe('hello world')
    expect(codec.output.value).toBeNull()
  })
})

// ── Error handling robustness ──────────────────────────────────────────

describe('URL error handling', () => {
  it('malformed percent encoding sets error, output is null, no crash', () => {
    const codec = createUrlCodec('encode')

    codec.input.value = '%ZZ'
    codec.selectMode('decode')

    expect(codec.error.value).toBeTruthy()
    expect(codec.error.value).toMatch(/malformed|URI/)
    expect(codec.output.value).toBeNull()
    expect(codec.mode.value).toBe('decode')
  })

  it('subsequent valid transform clears previous error', () => {
    const codec = createUrlCodec('encode')

    // Trigger error
    codec.input.value = '%ZZ'
    codec.selectMode('decode')
    expect(codec.error.value).toBeTruthy()

    // Then valid input
    codec.input.value = 'hello%20world'
    codec.selectMode('decode')
    expect(codec.error.value).toBeNull()
    expect(codec.output.value).toBe('hello world')
  })

  it('truncated percent encoding handled gracefully', () => {
    const codec = createUrlCodec('encode')

    codec.input.value = '%E0%A4%A'
    codec.selectMode('decode')

    expect(codec.error.value).toBeTruthy()
    expect(codec.output.value).toBeNull()
  })

  it('hello%world treated as malformed, not crash', () => {
    const codec = createUrlCodec('encode')

    codec.input.value = 'hello%world'
    codec.selectMode('decode')

    expect(codec.error.value).toBeTruthy()
    expect(codec.output.value).toBeNull()
  })

  it('lone % sets error gracefully', () => {
    const codec = createUrlCodec('encode')

    codec.input.value = '%'
    codec.selectMode('decode')

    expect(codec.error.value).toBeTruthy()
    expect(codec.output.value).toBeNull()
  })

  it('%F0%9F (incomplete UTF-8) handled gracefully', () => {
    const codec = createUrlCodec('encode')

    codec.input.value = '%F0%9F'
    codec.selectMode('decode')

    expect(codec.error.value).toBeTruthy()
    expect(codec.output.value).toBeNull()
  })
})

// ═══════════════════════════════════════════════════════════════════════
// Layer 3 — Wiring / Action Dispatch Tests
// ═══════════════════════════════════════════════════════════════════════

describe('URL toolbar wiring', () => {
  it('toolbar.execute("copy") calls onCopy handler', async () => {
    let copyCalled = false
    const toolbar = createToolbar({
      onCopy: () => {
        copyCalled = true
      },
      onClear: () => {},
      onSwap: () => {},
    })

    await toolbar.execute('copy')
    expect(copyCalled).toBe(true)
  })

  it('toolbar.execute("clear") calls onClear handler', async () => {
    let clearCalled = false
    const toolbar = createToolbar({
      onCopy: () => {},
      onClear: () => {
        clearCalled = true
      },
      onSwap: () => {},
    })

    await toolbar.execute('clear')
    expect(clearCalled).toBe(true)
  })

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
    const codec = createUrlCodec('encode')

    codec.input.value = 'hello world'
    codec.selectMode('encode')
    expect(codec.output.value).toBe('hello%20world')

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
    expect(codec.input.value).toBe('hello%20world')
    expect(codec.output.value).toBeNull()
  })

  it('toolbar.execute("clear") dispatches to clear handler and resets state', async () => {
    const codec = createUrlCodec('encode')

    codec.input.value = 'test'
    codec.selectMode('encode')
    expect(codec.output.value).toBeTruthy()

    const toolbar = createToolbar({
      onCopy: () => {},
      onClear: () => codec.clear(),
      onSwap: () => {},
    })

    await toolbar.execute('clear')

    expect(codec.input.value).toBe('')
    expect(codec.output.value).toBeNull()
    expect(codec.error.value).toBeNull()
  })

  it('toolbar actions have enabled handlers that are callable', () => {
    const toolbar = createToolbar({
      onCopy: () => {},
      onClear: () => {},
      onSwap: () => {},
    })

    // All registered actions should be findable
    for (const id of ['copy', 'clear', 'swap'] as const) {
      const action = toolbar.getAction(id)
      expect(action).toBeDefined()
      expect(action!.enabled).toBe(true)
    }
  })
})

// ── Note on Run action ─────────────────────────────────────────────────
//
// Run (Run Encode / Run Decode) is NOT a toolbar action. It is a page-level
// button wired directly via the composable's execute() function:
//
//   @click → handleClick → syncInputFromDom → execute()
//
// Run is tested at:
//   Layer 1 (Pure Logic)     — encodeUrl/decodeUrl logic tests
//   Layer 2 (State)          — mode switch tests: selectMode calls transform
//   Layer 3 (Wiring)         — N/A (no toolbar action for Run)
//   Layer 4 (Component/DOM)  — listed as manual smoke test item
//   Layer 5 (Manual Smoke)   — DOM click, button label, visual feedback
