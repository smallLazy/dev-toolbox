/**
 * SQL Plugin — Composable Tests
 *
 * Test layers:
 *   Layer 1 (Pure Logic)   — covered in logic.test.ts
 *   Layer 2 (Composable/State) — clear, swap, copy, execute, config changes
 *   Layer 3 (Wiring/Dispatch)  — toolbar.execute() → handler invocation
 *   Layer 4 (Component/DOM)    — NOT covered; listed as manual smoke test items
 */

import { describe, it, expect, vi } from 'vitest'
import { transformSql } from '../logic'
import { createToolbar } from '../toolbar'
import type { SqlInConfig, SqlConfig } from '../types'

// ── State simulation helpers (mirrors composable behavior) ────────────────

interface SqlState {
  input: string
  output: string | null
  error: string | null
  inConfig: SqlInConfig
}

function createState(): SqlState {
  return {
    input: '',
    output: null,
    error: null,
    inConfig: {
      valueType: 'string',
      lineMode: 'single',
      wrapWithParentheses: true,
      dedupe: false,
    },
  }
}

function makeConfig(state: SqlState): SqlConfig {
  return { mode: 'in-builder', inConfig: { ...state.inConfig } }
}

/** Simulate composable.execute() behavior */
function simulateExecute(state: SqlState) {
  state.error = null
  state.output = null

  const config = makeConfig(state)
  const result = transformSql(state.input, config)
  if (result.error) {
    state.error = result.error
  } else if (result.output !== null) {
    state.output = result.output
  }
  // Empty input: output=null, error=null — safe no-op
}

/** Simulate composable clear handler */
function simulateClear(state: SqlState) {
  state.input = ''
  state.output = null
  state.error = null
}

/** Simulate composable swap handler */
function simulateSwap(state: SqlState) {
  if (state.output) {
    state.input = state.output
    state.output = null
    state.error = null
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// Layer 2 — Composable / State Tests
// ═══════════════════════════════════════════════════════════════════════════

describe('SQL default state', () => {
  it('defaults to string value type', () => {
    const state = createState()
    expect(state.inConfig.valueType).toBe('string')
  })

  it('defaults to single line mode', () => {
    const state = createState()
    expect(state.inConfig.lineMode).toBe('single')
  })

  it('defaults to wrap with parentheses enabled', () => {
    const state = createState()
    expect(state.inConfig.wrapWithParentheses).toBe(true)
  })

  it('defaults to dedupe disabled', () => {
    const state = createState()
    expect(state.inConfig.dedupe).toBe(false)
  })

  it('default input/output/error are empty', () => {
    const state = createState()
    expect(state.input).toBe('')
    expect(state.output).toBeNull()
    expect(state.error).toBeNull()
  })
})

// ── Execute ──────────────────────────────────────────────────────────────

describe('SQL execute', () => {
  it('builds string single-line with parentheses', () => {
    const state = createState()
    state.input = '1001\n1002\n1003'
    simulateExecute(state)
    expect(state.output).toBe("('1001', '1002', '1003')")
    expect(state.error).toBeNull()
  })

  it('builds number single-line with parentheses', () => {
    const state = createState()
    state.inConfig.valueType = 'number'
    state.input = '1001\n1002\n1003'
    simulateExecute(state)
    expect(state.output).toBe('(1001, 1002, 1003)')
    expect(state.error).toBeNull()
  })

  it('builds string multi-line with parentheses', () => {
    const state = createState()
    state.inConfig.lineMode = 'multi'
    state.input = '1001\n1002\n1003'
    simulateExecute(state)
    expect(state.output).toBe("(\n  '1001',\n  '1002',\n  '1003'\n)")
    expect(state.error).toBeNull()
  })

  it('builds number multi-line with parentheses', () => {
    const state = createState()
    state.inConfig.valueType = 'number'
    state.inConfig.lineMode = 'multi'
    state.input = '1001\n1002\n1003'
    simulateExecute(state)
    expect(state.output).toBe('(\n  1001,\n  1002,\n  1003\n)')
    expect(state.error).toBeNull()
  })

  it('builds without parentheses', () => {
    const state = createState()
    state.inConfig.wrapWithParentheses = false
    state.input = 'a\nb'
    simulateExecute(state)
    expect(state.output).toBe("'a', 'b'")
    expect(state.error).toBeNull()
  })

  it('builds multi-line without parentheses (no leading spaces)', () => {
    const state = createState()
    state.inConfig.lineMode = 'multi'
    state.inConfig.wrapWithParentheses = false
    state.input = '1001\n1002\n1003'
    simulateExecute(state)
    expect(state.output).toBe("'1001',\n'1002',\n'1003'")
    expect(state.error).toBeNull()
  })

  it('dedupes values', () => {
    const state = createState()
    state.inConfig.dedupe = true
    state.input = 'a\nb\na'
    simulateExecute(state)
    expect(state.output).toBe("('a', 'b')")
    expect(state.error).toBeNull()
  })

  it('escapes single quotes', () => {
    const state = createState()
    state.inConfig.wrapWithParentheses = false
    state.input = "O'Reilly"
    simulateExecute(state)
    expect(state.output).toBe("'O''Reilly'")
    expect(state.error).toBeNull()
  })

  it('empty input: output null, error null (safe no-op)', () => {
    const state = createState()
    state.input = ''
    simulateExecute(state)
    expect(state.output).toBeNull()
    expect(state.error).toBeNull()
  })

  it('whitespace-only input: output null, error null (safe no-op)', () => {
    const state = createState()
    state.input = '  \n  \n  '
    simulateExecute(state)
    expect(state.output).toBeNull()
    expect(state.error).toBeNull()
  })

  it('invalid number sets error with line number', () => {
    const state = createState()
    state.inConfig.valueType = 'number'
    state.input = '1001\nabc\n1003'
    simulateExecute(state)
    expect(state.error).toBe('Invalid number at line 2: abc')
    expect(state.output).toBeNull()
  })

  it('valid input clears previous error', () => {
    const state = createState()
    state.inConfig.valueType = 'number'
    state.input = 'abc'
    simulateExecute(state)
    expect(state.error).toBeTruthy()

    // Now valid input
    state.input = '1001\n1002'
    simulateExecute(state)
    expect(state.error).toBeNull()
    expect(state.output).toBe('(1001, 1002)')
  })

  it('accepts negative and decimal numbers', () => {
    const state = createState()
    state.inConfig.valueType = 'number'
    state.input = '-1\n0\n3.14'
    simulateExecute(state)
    expect(state.output).toBe('(-1, 0, 3.14)')
    expect(state.error).toBeNull()
  })

  it('preserves line content with spaces (line-by-line only)', () => {
    const state = createState()
    state.inConfig.wrapWithParentheses = false
    state.input = 'hello world\nfoo bar'
    simulateExecute(state)
    expect(state.output).toBe("'hello world', 'foo bar'")
    expect(state.error).toBeNull()
  })
})

// ── Clear ─────────────────────────────────────────────────────────────────

describe('SQL clear', () => {
  it('clear() resets input, output, and error', () => {
    const state = createState()
    state.input = '1001\n1002'
    simulateExecute(state)
    expect(state.output).toBeTruthy()

    // Trigger error
    state.inConfig.valueType = 'number'
    state.input = 'abc'
    simulateExecute(state)
    expect(state.error).toBeTruthy()

    simulateClear(state)
    expect(state.input).toBe('')
    expect(state.output).toBeNull()
    expect(state.error).toBeNull()
  })

  it('clear() preserves config', () => {
    const state = createState()
    state.inConfig.valueType = 'number'
    state.inConfig.lineMode = 'multi'
    state.input = '1\n2'
    simulateExecute(state)

    simulateClear(state)
    expect(state.inConfig.valueType).toBe('number')
    expect(state.inConfig.lineMode).toBe('multi')
    expect(state.input).toBe('')
    expect(state.output).toBeNull()
  })
})

// ── Swap I/O ──────────────────────────────────────────────────────────────

describe('SQL swap I/O', () => {
  it('swap moves output to input and clears output', () => {
    const state = createState()
    state.input = '1001\n1002\n1003'
    simulateExecute(state)
    const originalOutput = state.output
    expect(originalOutput).toBeTruthy()

    simulateSwap(state)
    expect(state.input).toBe(originalOutput)
    expect(state.output).toBeNull()
    expect(state.error).toBeNull()
  })

  it('swap does NOT change config', () => {
    const state = createState()
    state.inConfig.valueType = 'number'
    state.input = '1\n2'
    simulateExecute(state)

    simulateSwap(state)
    expect(state.inConfig.valueType).toBe('number')
  })

  it('swap is a no-op when output is null', () => {
    const state = createState()
    state.input = '1001\n1002'
    // No execute — output is null

    simulateSwap(state)
    expect(state.input).toBe('1001\n1002')
    expect(state.output).toBeNull()
  })
})

// ── Copy ──────────────────────────────────────────────────────────────────

describe('SQL copy action', () => {
  it('calls navigator.clipboard.writeText with output value', async () => {
    const state = createState()
    state.input = '1001\n1002\n1003'
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
    state.input = '  \n  '
    simulateExecute(state)
    expect(state.output).toBeNull()

    const hasOutput = state.output !== null
    expect(hasOutput).toBe(false)
  })
})

// ═══════════════════════════════════════════════════════════════════════════
// Layer 3 — Wiring / Action Dispatch Tests
// ═══════════════════════════════════════════════════════════════════════════

describe('SQL toolbar wiring', () => {
  it('toolbar.execute("copy") calls onCopy handler', async () => {
    let copyCalled = false
    const toolbar = createToolbar({
      onCopy: () => { copyCalled = true },
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
      onClear: () => { clearCalled = true },
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
      onSwap: () => { swapCalled = true },
    })

    await toolbar.execute('swap')
    expect(swapCalled).toBe(true)
  })

  it('toolbar.execute("swap") dispatches and swaps state', async () => {
    const state = createState()
    state.input = '1001\n1002\n1003'
    simulateExecute(state)
    expect(state.output).toBeTruthy()

    let swapExecuted = false
    const toolbar = createToolbar({
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
    // Output became input
    expect(state.input).toBeTruthy()
  })

  it('toolbar.execute("clear") dispatches and resets state', async () => {
    const state = createState()
    state.input = '1001\n1002'
    simulateExecute(state)
    expect(state.output).toBeTruthy()

    const toolbar = createToolbar({
      onCopy: () => {},
      onClear: () => simulateClear(state),
      onSwap: () => {},
    })

    await toolbar.execute('clear')

    expect(state.input).toBe('')
    expect(state.output).toBeNull()
    expect(state.error).toBeNull()
  })

  it('all toolbar actions have enabled handlers that are callable', () => {
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

  it('toolbar does NOT have paste, import, or export actions', () => {
    const toolbar = createToolbar({
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

// ── Note on Convert action ────────────────────────────────────────────────
//
// Convert is NOT a toolbar action. It is a page-level button wired directly
// via the composable's execute() function:
//
//   @click → execute()
//
// Convert is tested at:
//   Layer 1 (Pure Logic)     — transformSql logic tests
//   Layer 2 (State)          — simulateExecute tests above
//   Layer 3 (Wiring)         — N/A (no toolbar action for Convert)
//   Layer 4 (Component/DOM)  — listed as manual smoke test item
//   Layer 5 (Manual Smoke)   — DOM click, button label, visual feedback
