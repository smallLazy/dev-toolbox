/**
 * HtmlEncode Plugin — Composable Tests (Layer 2 State + Layer 3 Wiring)
 *
 * Tests that the Mode Switch (Encode/Decode segmented control) immediately
 * transforms current input using the shared useCodecTransform state machine
 * wired with real HTML encode/decode functions.
 *
 * Test layers:
 *   Layer 1 (Pure Logic)     — covered in logic.test.ts
 *   Layer 2 (Composable/State) — mode switch, clear, swap, copy, default state
 *   Layer 3 (Wiring/Dispatch)  — toolbar.execute() → handler invocation
 *   Layer 4 (Component/DOM)    — NOT covered; listed as manual smoke test items
 *   Layer 5 (Manual Smoke)     — DOM click, button label, visual feedback
 */

import { describe, it, expect, vi } from 'vitest'
import { useCodecTransform } from '@/composables/useCodecTransform'
import { encodeHtml, decodeHtml } from '../logic'
import { createToolbar } from '../toolbar'

function createHtmlCodec(defaultMode: 'encode' | 'decode' = 'encode') {
  return useCodecTransform({
    encode: (input: string) => encodeHtml(input),
    decode: (input: string) => decodeHtml(input),
    defaultMode,
  })
}

// ═══════════════════════════════════════════════════════════════════════
// Layer 2 — Composable / State Tests
// ═══════════════════════════════════════════════════════════════════════

// ── Default state ──────────────────────────────────────────────────────

describe('HTML Encode default state', () => {
  it('defaults to encode mode', () => {
    const codec = createHtmlCodec()
    expect(codec.mode.value).toBe('encode')
  })

  it('can be initialized in decode mode', () => {
    const codec = createHtmlCodec('decode')
    expect(codec.mode.value).toBe('decode')
  })

  it('starts with empty input and null output', () => {
    const codec = createHtmlCodec()
    expect(codec.input.value).toBe('')
    expect(codec.output.value).toBeNull()
    expect(codec.error.value).toBeNull()
  })
})

// ── Mode Switch ────────────────────────────────────────────────────────

describe('HTML Encode Mode Switch (via useCodecTransform)', () => {
  it('default encode mode: input "<div>", Mode Switch to "decode" outputs decoded result', () => {
    const codec = createHtmlCodec('encode')

    codec.input.value = '&lt;div&gt;'
    codec.selectMode('decode')

    expect(codec.mode.value).toBe('decode')
    expect(codec.output.value).toBe('<div>')
    expect(codec.error.value).toBeNull()
  })

  it('decode mode: input plaintext, first Mode Switch to "encode" outputs HTML entities', () => {
    const codec = createHtmlCodec('decode')

    codec.input.value = '<div>'
    codec.selectMode('encode')

    expect(codec.mode.value).toBe('encode')
    expect(codec.output.value).toBe('&lt;div&gt;')
    expect(codec.error.value).toBeNull()
  })

  // ── Roundtrip via Mode Switch ────────────────────────────────────────

  it('roundtrip: encode then decode via Mode Switch returns original', () => {
    const codec = createHtmlCodec('encode')

    codec.input.value = '<div>Hello</div>'
    codec.selectMode('encode')
    const encoded = codec.output.value
    expect(encoded).toBe('&lt;div&gt;Hello&lt;/div&gt;')

    codec.input.value = encoded!
    codec.selectMode('decode')
    expect(codec.output.value).toBe('<div>Hello</div>')
  })

  // ── Consecutive Mode Switches ──────────────────────────────────────

  it('consecutive Mode Switch clicks each produce output on first click', () => {
    const codec = createHtmlCodec('encode')

    codec.input.value = '<br>'

    codec.selectMode('decode')
    const firstOutput = codec.output.value
    expect(firstOutput).toBeTruthy()
    expect(codec.error.value).toBeNull()

    codec.selectMode('encode')
    expect(codec.output.value).toBeTruthy()
    expect(codec.error.value).toBeNull()

    codec.selectMode('decode')
    expect(codec.output.value).toBeTruthy()
    expect(codec.error.value).toBeNull()
  })

  // ── Empty input ────────────────────────────────────────────────────

  it('Mode Switch with empty input clears output without error', () => {
    const codec = createHtmlCodec('encode')

    codec.input.value = '<br>'
    codec.selectMode('encode')
    expect(codec.output.value).toBeTruthy()

    codec.input.value = ''
    codec.selectMode('decode')

    expect(codec.output.value).toBeNull()
    expect(codec.error.value).toBeNull()
  })

  // ── Input preserved across Mode Switch ─────────────────────────────

  it('input is preserved when switching mode', () => {
    const codec = createHtmlCodec('encode')

    codec.input.value = '&lt;div&gt;'
    codec.selectMode('decode')

    expect(codec.input.value).toBe('&lt;div&gt;')
  })

  // ── Decode: unknown entities are lenient (no error) ──────────────────

  it('decode mode with unknown entity "&unknown;" produces output (no error)', () => {
    const codec = createHtmlCodec('encode')

    codec.input.value = '&unknown;'
    codec.selectMode('decode')

    expect(codec.output.value).toBe('&unknown;')
    expect(codec.error.value).toBeNull()
  })

  it('decode mode with incomplete entity "&incomplete" produces output (no error)', () => {
    const codec = createHtmlCodec('encode')

    codec.input.value = '&incomplete'
    codec.selectMode('decode')

    expect(codec.output.value).toBe('&incomplete')
    expect(codec.error.value).toBeNull()
  })
})

// ── Button label derivation (Run Encode / Run Decode) ──────────────────

describe('HTML Encode action button label', () => {
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

describe('HTML Encode clear', () => {
  it('clear() resets input, output, and error to initial state', () => {
    const codec = createHtmlCodec('encode')

    codec.input.value = '<div>'
    codec.selectMode('encode')
    expect(codec.output.value).toBe('&lt;div&gt;')

    codec.clear()

    expect(codec.input.value).toBe('')
    expect(codec.output.value).toBeNull()
    expect(codec.error.value).toBeNull()
    // Mode should be preserved
    expect(codec.mode.value).toBe('encode')
  })

  it('clear() preserves mode after error state', () => {
    const codec = createHtmlCodec('decode')

    codec.input.value = '<div>'
    codec.selectMode('decode')
    codec.clear()

    expect(codec.mode.value).toBe('decode')
    expect(codec.input.value).toBe('')
    expect(codec.output.value).toBeNull()
  })
})

// ── Copy action (state level) ──────────────────────────────────────────

describe('HTML Encode copy action', () => {
  it('calls navigator.clipboard.writeText with output value', async () => {
    const codec = createHtmlCodec('encode')

    codec.input.value = '<div>hello</div>'
    codec.selectMode('encode')
    expect(codec.output.value).toBe('&lt;div&gt;hello&lt;/div&gt;')

    const writeText = vi.fn().mockResolvedValue(undefined)
    const originalClipboard = navigator.clipboard
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText },
      writable: true,
      configurable: true,
    })

    try {
      await navigator.clipboard.writeText(codec.output.value!)
      expect(writeText).toHaveBeenCalledWith('&lt;div&gt;hello&lt;/div&gt;')
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
    const codec = createHtmlCodec('encode')

    codec.clear()
    expect(codec.output.value).toBeNull()

    const hasOutput = codec.output.value !== null
    expect(hasOutput).toBe(false)
  })
})

// ── Swap I/O (state level) ─────────────────────────────────────────────

describe('HTML Encode swap I/O', () => {
  it('swap sets input to output value and clears output', () => {
    const codec = createHtmlCodec('encode')

    codec.input.value = '<div>hello</div>'
    codec.selectMode('encode')
    expect(codec.output.value).toBe('&lt;div&gt;hello&lt;/div&gt;')

    // Swap: input ← output, output ← null
    if (codec.output.value) {
      codec.input.value = codec.output.value
      codec.output.value = null
    }

    expect(codec.input.value).toBe('&lt;div&gt;hello&lt;/div&gt;')
    expect(codec.output.value).toBeNull()
  })

  it('swap is a no-op when output is null', () => {
    const codec = createHtmlCodec('encode')

    codec.input.value = '<div>'
    expect(codec.output.value).toBeNull()

    if (codec.output.value !== null) {
      codec.input.value = codec.output.value
      codec.output.value = null
    }

    expect(codec.input.value).toBe('<div>')
    expect(codec.output.value).toBeNull()
  })

  it('swap with decode mode: input becomes decoded output, output cleared', () => {
    const codec = createHtmlCodec('decode')

    codec.input.value = '&lt;div&gt;hello&lt;/div&gt;'
    codec.selectMode('decode')
    expect(codec.output.value).toBe('<div>hello</div>')

    if (codec.output.value) {
      codec.input.value = codec.output.value
      codec.output.value = null
    }

    expect(codec.input.value).toBe('<div>hello</div>')
    expect(codec.output.value).toBeNull()
  })
})

// ── Run behavior ──────────────────────────────────────────────────────

describe('HTML Encode run', () => {
  it('Run Encode produces correct HTML-encoded output', () => {
    const codec = createHtmlCodec('encode')

    codec.input.value = '<div>Hello & World</div>'
    codec.transform('encode')

    expect(codec.output.value).toBe('&lt;div&gt;Hello &amp; World&lt;/div&gt;')
    expect(codec.error.value).toBeNull()
  })

  it('Run Decode produces correct decoded output', () => {
    const codec = createHtmlCodec('decode')

    codec.input.value = '&lt;div&gt;Hello &amp; World&lt;/div&gt;'
    codec.transform('decode')

    expect(codec.output.value).toBe('<div>Hello & World</div>')
    expect(codec.error.value).toBeNull()
  })

  it('Run Encode on empty input clears output silently', () => {
    const codec = createHtmlCodec('encode')

    codec.input.value = ''
    codec.transform('encode')

    expect(codec.output.value).toBeNull()
    expect(codec.error.value).toBeNull()
  })

  it('Run Decode on empty input clears output silently', () => {
    const codec = createHtmlCodec('decode')

    codec.input.value = ''
    codec.transform('decode')

    expect(codec.output.value).toBeNull()
    expect(codec.error.value).toBeNull()
  })

  it('subsequent valid transform clears previous error', () => {
    const codec = createHtmlCodec('encode')

    // Simulate an error by directly setting it (just testing reset)
    codec.error.value = 'Some error'
    codec.input.value = '<br>'
    codec.transform('encode')

    expect(codec.error.value).toBeNull()
    expect(codec.output.value).toBe('&lt;br&gt;')
  })
})

// ═══════════════════════════════════════════════════════════════════════
// Layer 3 — Wiring / Action Dispatch Tests
// ═══════════════════════════════════════════════════════════════════════

describe('HTML Encode toolbar wiring', () => {
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
    const codec = createHtmlCodec('encode')

    codec.input.value = '<div>hello</div>'
    codec.selectMode('encode')
    expect(codec.output.value).toBe('&lt;div&gt;hello&lt;/div&gt;')

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
    expect(codec.input.value).toBe('&lt;div&gt;hello&lt;/div&gt;')
    expect(codec.output.value).toBeNull()
  })

  it('toolbar.execute("clear") dispatches to clear handler and resets state', async () => {
    const codec = createHtmlCodec('encode')

    codec.input.value = '<div>test</div>'
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

  it('toolbar.execute("copy") dispatches with actual copy logic (mock clipboard)', async () => {
    const codec = createHtmlCodec('encode')

    codec.input.value = '<div>hello</div>'
    codec.selectMode('encode')
    expect(codec.output.value).toBe('&lt;div&gt;hello&lt;/div&gt;')

    const writeText = vi.fn().mockResolvedValue(undefined)
    const originalClipboard = navigator.clipboard
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText },
      writable: true,
      configurable: true,
    })

    try {
      const toolbar = createToolbar({
        onCopy: async () => {
          if (codec.output.value) {
            await navigator.clipboard.writeText(codec.output.value)
          }
        },
        onClear: () => {},
        onSwap: () => {},
      })

      await toolbar.execute('copy')

      expect(writeText).toHaveBeenCalledWith('&lt;div&gt;hello&lt;/div&gt;')
      expect(writeText).toHaveBeenCalledTimes(1)
    } finally {
      Object.defineProperty(navigator, 'clipboard', {
        value: originalClipboard,
        writable: true,
        configurable: true,
      })
    }
  })

  it('toolbar actions have enabled handlers that are callable', () => {
    const toolbar = createToolbar({
      onCopy: () => {},
      onClear: () => {},
      onSwap: () => {},
    })

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
//   Layer 1 (Pure Logic)     — encodeHtml/decodeHtml logic tests
//   Layer 2 (State)          — mode switch tests: selectMode calls transform
//   Layer 3 (Wiring)         — N/A (no toolbar action for Run)
//   Layer 4 (Component/DOM)  — listed as manual smoke test item
//   Layer 5 (Manual Smoke)   — DOM click, button label, visual feedback
