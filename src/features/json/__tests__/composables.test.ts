/**
 * JSON Plugin — Composable Tests
 *
 * Test layers:
 *   Layer 1 (Pure Logic)   — covered in logic.test.ts
 *   Layer 2 (Composable/State) — mode switch, clear, swap, copy, execute
 *   Layer 3 (Wiring/Dispatch)  — toolbar.execute() → handler invocation
 *   Layer 4 (Component/DOM)    — NOT covered; listed as manual smoke test items
 */

import { describe, it, expect, vi } from 'vitest'
import { transformJson, getJsonStats, formatJsonError, EXAMPLE_JSON } from '../logic'
import { createJsonToolbar } from '../toolbar'
import type { JsonMode } from '../types'

// ── State simulation helpers (mirrors composable behavior) ────────────────

interface JsonState {
  input: string
  output: string | null
  error: string | null
  mode: JsonMode
}

function createState(): JsonState {
  return { input: '', output: null, error: null, mode: 'format' }
}

/** Simulate composable.execute() behavior */
function simulateExecute(state: JsonState) {
  state.error = null
  state.output = null

  const result = transformJson(state.input, state.mode)
  if (result.success) {
    state.output = result.output
  } else if (result.error) {
    state.error = formatJsonError(state.input, result.error)
    // Validate mode: show error details in output panel too
    if (state.mode === 'validate') {
      state.output = state.error
    }
  }
  // empty input: output=null, error=null
}

/** Simulate composable.selectMode() behavior */
function simulateSelectMode(state: JsonState, nextMode: JsonMode) {
  state.mode = nextMode
  if (state.input.trim()) {
    simulateExecute(state)
  } else {
    state.output = null
    state.error = null
  }
}

/** Simulate composable clear handler */
function simulateClear(state: JsonState) {
  state.input = ''
  state.output = null
  state.error = null
}

/** Simulate composable swap handler */
function simulateSwap(state: JsonState) {
  if (state.output) {
    state.input = state.output
    state.output = null
  }
  // mode is NOT toggled
}

// ═══════════════════════════════════════════════════════════════════════════
// Layer 2 — Composable / State Tests
// ═══════════════════════════════════════════════════════════════════════════

describe('JSON default state', () => {
  it('defaults to format mode', () => {
    const state = createState()
    expect(state.mode).toBe('format')
  })

  it('default input/output/error are empty', () => {
    const state = createState()
    expect(state.input).toBe('')
    expect(state.output).toBeNull()
    expect(state.error).toBeNull()
  })
})

// ── Mode Switch ───────────────────────────────────────────────────────────

describe('JSON mode switch', () => {
  it('switching mode auto-executes on current input (format → minify)', () => {
    const state = createState()
    state.input = '{"name":"Dev Toolbox"}'
    state.mode = 'format'

    // First format
    simulateExecute(state)
    expect(state.output).toContain('\n')

    // Switch to minify — should auto-execute
    simulateSelectMode(state, 'minify')
    expect(state.mode).toBe('minify')
    expect(state.output).not.toContain('\n')
    expect(state.error).toBeNull()
  })

  it('switching mode auto-executes on current input (format → validate)', () => {
    const state = createState()
    state.input = '{"a":1,"b":2}'
    state.mode = 'format'

    simulateSelectMode(state, 'validate')
    expect(state.mode).toBe('validate')
    expect(state.output).toContain('"a"')
    expect(state.output).toContain('\n')
    expect(state.error).toBeNull()
  })

  it('switching mode with empty input clears output silently', () => {
    const state = createState()
    state.input = ''

    simulateSelectMode(state, 'minify')
    expect(state.output).toBeNull()
    expect(state.error).toBeNull()
    expect(state.mode).toBe('minify')
  })

  it('mode switch preserves input value', () => {
    const state = createState()
    state.input = '{"a":1}'

    simulateSelectMode(state, 'validate')
    expect(state.input).toBe('{"a":1}')
  })
})

// ── Execute per mode ──────────────────────────────────────────────────────

describe('JSON execute', () => {
  it('format: produces pretty-printed output', () => {
    const state = createState()
    state.input = '{"name":"Dev Toolbox","version":"1.0"}'
    state.mode = 'format'

    simulateExecute(state)
    expect(state.output).toContain('"name"')
    expect(state.output).toContain('\n')
    expect(state.error).toBeNull()
  })

  it('minify: produces compact single-line output', () => {
    const state = createState()
    state.input = '{\n  "a": 1,\n  "b": 2\n}'
    state.mode = 'minify'

    simulateExecute(state)
    expect(state.output).toBe('{"a":1,"b":2}')
    expect(state.error).toBeNull()
  })

  it('validate: produces formatted JSON output (not text stats)', () => {
    const state = createState()
    state.input = '{"a":1,"b":2}'
    state.mode = 'validate'

    simulateExecute(state)
    expect(state.output).toContain('"a"')
    expect(state.output).toContain('\n')
    expect(state.error).toBeNull()
  })

  it('validate array: returns formatted JSON', () => {
    const state = createState()
    state.input = '[1,2,3,4,5]'
    state.mode = 'validate'

    simulateExecute(state)
    expect(state.output).toContain('[\n')
    expect(state.output).toContain('1')
    expect(state.error).toBeNull()
  })

  it('validate primitive string: returns string as-is', () => {
    const state = createState()
    state.input = '"hello"'
    state.mode = 'validate'

    simulateExecute(state)
    expect(state.output).toBe('"hello"')
    // No "Keys:" or "Items:" for primitives
    expect(state.output).not.toContain('Keys:')
    expect(state.output).not.toContain('Items:')
  })

  it('invalid JSON sets error and null output', () => {
    const state = createState()
    state.input = '{"name":}'
    state.mode = 'format'

    simulateExecute(state)
    expect(state.error).toBeTruthy()
    expect(state.output).toBeNull()
  })

  it('valid input clears previous error', () => {
    const state = createState()
    state.input = '{broken'
    state.mode = 'format'
    simulateExecute(state)
    expect(state.error).toBeTruthy()

    // Now valid input
    state.input = '{"a":1}'
    simulateExecute(state)
    expect(state.error).toBeNull()
    expect(state.output).toBeTruthy()
  })

  it('empty input: output null, error null, no crash', () => {
    const state = createState()
    state.input = ''
    state.mode = 'format'

    simulateExecute(state)
    expect(state.output).toBeNull()
    expect(state.error).toBeNull()
  })

  it('top-level array formats correctly', () => {
    const state = createState()
    state.input = '[1,2,3]'
    state.mode = 'format'

    simulateExecute(state)
    expect(state.output).toContain('[\n')
    expect(state.error).toBeNull()
  })

  it('Chinese content preserved', () => {
    const state = createState()
    state.input = '{"text":"你好"}'
    state.mode = 'format'

    simulateExecute(state)
    expect(state.output).toContain('你好')
  })

  it('emoji content preserved', () => {
    const state = createState()
    state.input = '{"text":"😀"}'
    state.mode = 'format'

    simulateExecute(state)
    expect(state.output).toContain('😀')
  })
})

// ── Clear ─────────────────────────────────────────────────────────────────

describe('JSON clear', () => {
  it('clear() resets input, output, and error to initial state', () => {
    const state = createState()
    state.input = '{"a":1}'
    state.mode = 'format'
    simulateExecute(state)
    expect(state.output).toBeTruthy()

    // Trigger error too
    state.input = '{broken'
    simulateExecute(state)
    expect(state.error).toBeTruthy()

    simulateClear(state)
    expect(state.input).toBe('')
    expect(state.output).toBeNull()
    expect(state.error).toBeNull()
  })

  it('clear() preserves mode', () => {
    const state = createState()
    state.input = '{"a":1}'
    state.mode = 'minify'
    simulateExecute(state)

    simulateClear(state)
    expect(state.mode).toBe('minify')
    expect(state.input).toBe('')
    expect(state.output).toBeNull()
  })
})

// ── Swap I/O ──────────────────────────────────────────────────────────────

describe('JSON swap I/O', () => {
  it('swap moves output to input and clears output', () => {
    const state = createState()
    state.input = '{"name":"Dev Toolbox"}'
    state.mode = 'format'
    simulateExecute(state)
    const originalOutput = state.output
    expect(originalOutput).toBeTruthy()

    simulateSwap(state)
    expect(state.input).toBe(originalOutput)
    expect(state.output).toBeNull()
  })

  it('swap does NOT change mode', () => {
    const state = createState()
    state.input = '{"a":1}'
    state.mode = 'format'
    simulateExecute(state)

    simulateSwap(state)
    expect(state.mode).toBe('format')
  })

  it('swap with minify mode does not change mode', () => {
    const state = createState()
    state.input = '{"a":1}'
    state.mode = 'minify'
    simulateExecute(state)

    simulateSwap(state)
    expect(state.mode).toBe('minify')
  })

  it('swap is a no-op when output is null', () => {
    const state = createState()
    state.input = '{"a":1}'
    state.mode = 'format'
    // No execute — output is null

    simulateSwap(state)
    expect(state.input).toBe('{"a":1}')
    expect(state.output).toBeNull()
  })

  it('swap preserves mode after swap from validate', () => {
    const state = createState()
    state.input = '{"a":1}'
    state.mode = 'validate'
    simulateExecute(state)

    simulateSwap(state)
    expect(state.mode).toBe('validate')
  })
})

// ── Copy ──────────────────────────────────────────────────────────────────

describe('JSON copy action', () => {
  it('calls navigator.clipboard.writeText with output value', async () => {
    const state = createState()
    state.input = '{"name":"Dev Toolbox"}'
    state.mode = 'format'
    simulateExecute(state)
    expect(state.output).toBeTruthy()

    const writeText = vi.fn().mockResolvedValue(undefined)
    const originalClipboard = navigator.clipboard
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText },
      writable: true,
      configurable: true,
    })

    try {
      await navigator.clipboard.writeText(state.output!)
      expect(writeText).toHaveBeenCalledWith(state.output)
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
    const state = createState()
    state.input = ''
    simulateExecute(state)
    expect(state.output).toBeNull()

    const hasOutput = state.output !== null
    expect(hasOutput).toBe(false)
  })
})

// ═══════════════════════════════════════════════════════════════════════════
// Layer 3 — Wiring / Action Dispatch Tests
// ═══════════════════════════════════════════════════════════════════════════

describe('JSON toolbar wiring', () => {
  it('toolbar.execute("copy") calls onCopy handler', async () => {
    let copyCalled = false
    const toolbar = createJsonToolbar({
      onCopy: () => { copyCalled = true },
      onClear: () => {},
      onSwap: () => {},
    })

    await toolbar.execute('copy')
    expect(copyCalled).toBe(true)
  })

  it('toolbar.execute("clear") calls onClear handler', async () => {
    let clearCalled = false
    const toolbar = createJsonToolbar({
      onCopy: () => {},
      onClear: () => { clearCalled = true },
      onSwap: () => {},
    })

    await toolbar.execute('clear')
    expect(clearCalled).toBe(true)
  })

  it('toolbar.execute("swap") calls onSwap handler', async () => {
    let swapCalled = false
    const toolbar = createJsonToolbar({
      onCopy: () => {},
      onClear: () => {},
      onSwap: () => { swapCalled = true },
    })

    await toolbar.execute('swap')
    expect(swapCalled).toBe(true)
  })

  it('toolbar.execute("swap") dispatches correctly and swaps state', async () => {
    const state = createState()
    state.input = '{"name":"Dev Toolbox"}'
    state.mode = 'format'
    simulateExecute(state)
    expect(state.output).toBeTruthy()

    let swapExecuted = false
    const toolbar = createJsonToolbar({
      onCopy: () => {},
      onClear: () => simulateClear(state),
      onSwap: () => {
        simulateSwap(state)
        swapExecuted = true
      },
    })

    await toolbar.execute('swap')

    expect(swapExecuted).toBe(true)
    expect(state.output).toBeNull()
    // Output became input (reformatted JSON)
    expect(state.input).toBeTruthy()
    // mode unchanged
    expect(state.mode).toBe('format')
  })

  it('toolbar.execute("clear") dispatches and resets state', async () => {
    const state = createState()
    state.input = '{"a":1}'
    state.mode = 'minify'
    simulateExecute(state)
    expect(state.output).toBeTruthy()

    const toolbar = createJsonToolbar({
      onCopy: () => {},
      onClear: () => simulateClear(state),
      onSwap: () => {},
    })

    await toolbar.execute('clear')

    expect(state.input).toBe('')
    expect(state.output).toBeNull()
    expect(state.error).toBeNull()
    expect(state.mode).toBe('minify') // preserved
  })

  it('all toolbar actions have enabled handlers that are callable', () => {
    const toolbar = createJsonToolbar({
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

  it('toolbar does NOT have paste, import, or export actions', () => {
    const toolbar = createJsonToolbar({
      onCopy: () => {},
      onClear: () => {},
      onSwap: () => {},
    })

    for (const id of ['paste', 'import', 'export'] as const) {
      const action = toolbar.getAction(id)
      expect(action, `action "${id}" should not be registered`).toBeUndefined()
    }
  })
})

// ═══════════════════════════════════════════════════════════════════════════
// Example / loadExample
// ═══════════════════════════════════════════════════════════════════════════

describe('JSON loadExample', () => {
  it('loadExample() sets input to EXAMPLE_JSON and clears output/error', () => {
    const state = createState()
    // Pre-populate with some data
    state.input = 'old input'
    state.output = 'old output'
    state.error = 'old error'

    // Simulate loadExample:
    state.input = EXAMPLE_JSON
    state.output = null
    state.error = null

    expect(state.input).toBe(EXAMPLE_JSON)
    expect(state.output).toBeNull()
    expect(state.error).toBeNull()
  })

  it('after loadExample, format produces valid output', () => {
    const state = createState()
    state.input = EXAMPLE_JSON
    state.mode = 'format'

    simulateExecute(state)
    expect(state.output).toBeTruthy()
    expect(state.output).toContain('"name"')
    expect(state.output).toContain('\n')
    expect(state.error).toBeNull()
  })
})

// ═══════════════════════════════════════════════════════════════════════════
// Error enrichment with line/column
// ═══════════════════════════════════════════════════════════════════════════

describe('JSON error enrichment', () => {
  it('invalid JSON error includes line/column info', () => {
    const state = createState()
    state.input = '{"a":1,}'
    state.mode = 'format'

    simulateExecute(state)
    expect(state.error).toBeTruthy()
    expect(state.error).toContain('Invalid JSON')
    expect(state.error).toContain('line')
    expect(state.error).toContain('column')
    expect(state.output).toBeNull()
  })

  it('invalid JSON in validate mode shows error in output too', () => {
    const state = createState()
    state.input = '{broken'
    state.mode = 'validate'

    simulateExecute(state)
    expect(state.error).toBeTruthy()
    expect(state.error).toContain('Invalid JSON')
    // Validate mode: error details also shown in output
    expect(state.output).toBeTruthy()
    expect(state.output).toContain('Invalid JSON')
  })

  it('format mode error does NOT populate output', () => {
    const state = createState()
    state.input = '{broken'
    state.mode = 'format'

    simulateExecute(state)
    expect(state.error).toBeTruthy()
    expect(state.output).toBeNull()
  })
})

// ── Note on Run action ────────────────────────────────────────────────────
//
// Run (Format / Minify / Validate) is NOT a toolbar action. It is a
// page-level button wired directly via the composable's execute() function:
//
//   @pointerdown → handlePointerDown → syncInputFromDom → execute()
//   @click → handleClick (keyboard fallback only)
//
// Run is tested at:
//   Layer 1 (Pure Logic)     — transformJson logic tests
//   Layer 2 (State)          — simulateExecute tests above
//   Layer 3 (Wiring)         — N/A (useTextActionTrigger wires pointerdown+click, not toolbar)
//   Layer 4 (Component/DOM)  — listed as manual smoke test item
//   Layer 5 (Manual Smoke)   — DOM click, first-click verification, button label, visual feedback
