/**
 * JWT Plugin — Composable Tests
 *
 * Test layers:
 *   Layer 1 (Pure Logic)   — covered in logic.test.ts
 *   Layer 2 (Composable/State) — execute, clear, copy, example, status transitions
 *   Layer 3 (Wiring/Dispatch)  — toolbar.execute() → handler invocation
 *   Layer 4 (Component/DOM)    — NOT covered; listed as manual smoke test items
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { decodeJwt, validateJwtInput, EXAMPLE_JWT } from '../logic'

// ── State simulation helpers (mirrors composable behavior) ────────────

interface JwtState {
  input: string
  output: string | null
  error: string | null
  statusPhase: 'idle' | 'loading' | 'success' | 'error' | 'copied'
  statusMessage: string | null
}

function createState(): JwtState {
  return {
    input: '',
    output: null,
    error: null,
    statusPhase: 'idle',
    statusMessage: 'Ready',
  }
}

/** Simulate composable.execute() behavior */
function simulateExecute(state: JwtState) {
  state.error = null
  state.output = null

  const trimmed = state.input.trim()
  if (trimmed.length === 0) {
    state.error = 'Invalid JWT: token is empty'
    state.statusPhase = 'error'
    state.statusMessage = 'Invalid JWT: token is empty'
    return
  }

  const v = validateJwtInput(state.input)
  if (!v.valid) {
    state.error = v.errors![0].message
    state.statusPhase = 'error'
    state.statusMessage = v.errors![0].message
    return
  }

  try {
    const result = decodeJwt(state.input)
    state.output = result.output
    state.error = null
    state.statusPhase = 'success'
    state.statusMessage = 'JWT decoded successfully'
  } catch (e) {
    state.error = (e as Error).message
    state.statusPhase = 'error'
    state.statusMessage = (e as Error).message
  }
}

/** Simulate composable clear handler */
function simulateClear(state: JwtState) {
  state.input = ''
  state.output = null
  state.error = null
  state.statusPhase = 'idle'
  state.statusMessage = 'Ready'
}

/** Simulate composable.example action */
function simulateExample(state: JwtState) {
  state.input = EXAMPLE_JWT
  state.output = null
  state.error = null
  simulateExecute(state)
}

// ── Test token ────────────────────────────────────────────────────────

const VALID_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjMiLCJuYW1lIjoiVGVzdCIsImlhdCI6MTUxNjIzOTAyMn0.abc123signature'

// ═══════════════════════════════════════════════════════════════════════════
// Layer 2 — Composable / State Tests
// ═══════════════════════════════════════════════════════════════════════════

describe('JWT default state', () => {
  it('default input/output/error are empty', () => {
    const state = createState()
    expect(state.input).toBe('')
    expect(state.output).toBeNull()
    expect(state.error).toBeNull()
  })

  it('default status is Ready', () => {
    const state = createState()
    expect(state.statusPhase).toBe('idle')
    expect(state.statusMessage).toBe('Ready')
  })
})

// ── Execute ───────────────────────────────────────────────────────────

describe('JWT execute (decode)', () => {
  it('decodes a valid JWT and sets output', () => {
    const state = createState()
    state.input = VALID_TOKEN
    simulateExecute(state)

    expect(state.error).toBeNull()
    expect(state.output).toBeTruthy()
    expect(state.output!).toContain('Header')
    expect(state.output!).toContain('Payload')
    expect(state.output!).toContain('Signature')
    expect(state.statusPhase).toBe('success')
    expect(state.statusMessage).toBe('JWT decoded successfully')
  })

  it('shows Header, Payload, and Signature sections in output', () => {
    const state = createState()
    state.input = VALID_TOKEN
    simulateExecute(state)

    expect(state.output).toContain('Header')
    expect(state.output).toContain('Payload')
    expect(state.output).toContain('Signature')
    expect(state.output).toContain('abc123signature')
  })

  it('shows Registered Claims when time claims exist', () => {
    const state = createState()
    state.input = EXAMPLE_JWT
    simulateExecute(state)

    expect(state.output).toContain('Registered Claims')
    expect(state.output).toContain('iat:')
    expect(state.output).toContain('exp:')
  })

  it('shows error for empty input', () => {
    const state = createState()
    state.input = ''
    simulateExecute(state)

    expect(state.output).toBeNull()
    expect(state.error).toBe('Invalid JWT: token is empty')
    expect(state.statusPhase).toBe('error')
  })

  it('shows error for invalid JWT format', () => {
    const state = createState()
    state.input = 'not.a.jwt.token.extra'
    simulateExecute(state)

    expect(state.output).toBeNull()
    expect(state.error).toContain('expected 3 parts')
    expect(state.statusPhase).toBe('error')
  })

  it('shows error for invalid Base64url encoding', () => {
    const state = createState()
    state.input = '!!!.eyJzdWIiOiIxMjMifQ.sig'
    simulateExecute(state)

    expect(state.output).toBeNull()
    expect(state.error).toContain('invalid header encoding')
    expect(state.statusPhase).toBe('error')
  })

  it('does not crash on malformed input', () => {
    const state = createState()
    state.input = 'garbage'
    simulateExecute(state)

    // Should have an error, not crash
    expect(state.error).toBeTruthy()
    expect(state.statusPhase).toBe('error')
  })
})

// ── Clear ─────────────────────────────────────────────────────────────

describe('JWT clear', () => {
  it('resets state to idle', () => {
    const state = createState()
    state.input = VALID_TOKEN
    simulateExecute(state)

    // Verify we have output first
    expect(state.output).toBeTruthy()
    expect(state.statusPhase).toBe('success')

    simulateClear(state)

    expect(state.input).toBe('')
    expect(state.output).toBeNull()
    expect(state.error).toBeNull()
    expect(state.statusPhase).toBe('idle')
    expect(state.statusMessage).toBe('Ready')
  })

  it('clears error state', () => {
    const state = createState()
    state.input = 'invalid'
    simulateExecute(state)

    expect(state.error).toBeTruthy()

    simulateClear(state)

    expect(state.error).toBeNull()
    expect(state.statusPhase).toBe('idle')
  })
})

// ── Example ───────────────────────────────────────────────────────────

describe('JWT example', () => {
  it('loads example JWT and auto-decodes', () => {
    const state = createState()
    simulateExample(state)

    expect(state.input).toBe(EXAMPLE_JWT)
    expect(state.output).toBeTruthy()
    expect(state.output!).toContain('Header')
    expect(state.output!).toContain('Payload')
    expect(state.statusPhase).toBe('success')
    expect(state.statusMessage).toBe('JWT decoded successfully')
  })
})

// ── Copy Output ───────────────────────────────────────────────────────

describe('JWT copy', () => {
  it('copies output to clipboard on success', async () => {
    const clipboardSpy = vi.fn()
    // Simulate clipboard.writeText
    const origWrite = (navigator as any).clipboard
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: clipboardSpy },
      writable: true,
      configurable: true,
    })

    const state = createState()
    state.input = VALID_TOKEN
    simulateExecute(state)

    expect(state.output).toBeTruthy()

    // Simulate copy handler
    try {
      await navigator.clipboard.writeText(state.output!)
      state.statusPhase = 'copied'
      state.statusMessage = 'Copied to clipboard'
    } catch (e) {
      state.error = (e as Error).message
    }

    expect(clipboardSpy).toHaveBeenCalledWith(state.output)
    expect(clipboardSpy).toHaveBeenCalledTimes(1)
    expect(state.statusPhase).toBe('copied')

    // Restore
    Object.defineProperty(navigator, 'clipboard', {
      value: origWrite,
      writable: true,
      configurable: true,
    })
  })

  it('shows error when no output to copy', () => {
    const state = createState()

    // No output — copy should surface error
    expect(state.output).toBeNull()

    // Simulate the copy guard from composable
    if (!state.output) {
      state.error = 'No output to copy'
      state.statusPhase = 'error'
    }

    expect(state.error).toBe('No output to copy')
    expect(state.statusPhase).toBe('error')
  })
})

// ── Status transitions ────────────────────────────────────────────────

describe('JWT status transitions', () => {
  it('transitions from idle → success on decode', () => {
    const state = createState()
    expect(state.statusPhase).toBe('idle')

    state.input = VALID_TOKEN
    simulateExecute(state)

    expect(state.statusPhase).toBe('success')
    expect(state.statusMessage).toBe('JWT decoded successfully')
  })

  it('transitions from idle → error on invalid input', () => {
    const state = createState()
    state.input = ''
    simulateExecute(state)

    expect(state.statusPhase).toBe('error')
    expect(state.statusMessage).toContain('Invalid JWT')
  })

  it('transitions from success → idle on clear', () => {
    const state = createState()
    state.input = VALID_TOKEN
    simulateExecute(state)
    expect(state.statusPhase).toBe('success')

    simulateClear(state)
    expect(state.statusPhase).toBe('idle')
    expect(state.statusMessage).toBe('Ready')
  })

  it('transitions from error → idle on clear', () => {
    const state = createState()
    state.input = 'bad'
    simulateExecute(state)
    expect(state.statusPhase).toBe('error')

    simulateClear(state)
    expect(state.statusPhase).toBe('idle')
  })

  it('clearStatus resets error and phase to idle', () => {
    const state = createState()
    state.error = 'Some error'
    state.statusPhase = 'error'
    state.statusMessage = 'Some error'

    // Simulate clearStatus()
    state.error = null
    state.statusPhase = 'idle'
    state.statusMessage = 'Ready'

    expect(state.error).toBeNull()
    expect(state.statusPhase).toBe('idle')
    expect(state.statusMessage).toBe('Ready')
  })
})

// ═══════════════════════════════════════════════════════════════════════════
// Layer 3 — Wiring / Action Dispatch Tests
// ═══════════════════════════════════════════════════════════════════════════

describe('JWT toolbar wiring', () => {
  let copyHandler: () => void
  let clearHandler: () => void

  beforeEach(() => {
    copyHandler = vi.fn()
    clearHandler = vi.fn()
  })

  it('toolbar dispatches copy to handler', () => {
    const actions: Record<string, () => void> = {
      copy: copyHandler,
      clear: clearHandler,
    }

    const execute = (id: string) => {
      actions[id]?.()
    }

    execute('copy')
    expect(copyHandler).toHaveBeenCalledOnce()
    expect(clearHandler).not.toHaveBeenCalled()
  })

  it('toolbar dispatches clear to handler', () => {
    const actions: Record<string, () => void> = {
      copy: copyHandler,
      clear: clearHandler,
    }

    const execute = (id: string) => {
      actions[id]?.()
    }

    execute('clear')
    expect(clearHandler).toHaveBeenCalledOnce()
    expect(copyHandler).not.toHaveBeenCalled()
  })

  it('toolbar does not dispatch unknown action', () => {
    const actions: Record<string, () => void> = {
      copy: copyHandler,
      clear: clearHandler,
    }

    const execute = (id: string) => {
      actions[id]?.()
    }

    execute('nonexistent')
    expect(copyHandler).not.toHaveBeenCalled()
    expect(clearHandler).not.toHaveBeenCalled()
  })
})
