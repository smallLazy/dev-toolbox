/**
 * FeatureToolbar — SDK Unit Tests
 *
 * Covers: action creation, enabled/handler gating, execute dispatch,
 *         configure, and the swap regression (was disabled by default).
 */

import { describe, it, expect } from 'vitest'
import { createFeatureToolbar } from '../FeatureToolbar'
import type { ToolbarAction } from '../FeatureToolbar'

// ── Handler-presence gating ────────────────────────────────────────

describe('createFeatureToolbar — handler gating', () => {
  it('includes actions when handler is provided', () => {
    const toolbar = createFeatureToolbar({
      copy: () => {},
      clear: () => {},
    })

    const ids = toolbar.actions.map((a) => a.id)
    expect(ids).toContain('copy')
    expect(ids).toContain('clear')
  })

  it('excludes actions when handler is NOT provided (even if default enabled)', () => {
    // swap defaults to enabled:true but no handler passed → must be excluded
    const toolbar = createFeatureToolbar({
      copy: () => {},
      clear: () => {},
    })

    const swapAction = toolbar.getAction('swap')
    expect(swapAction).toBeUndefined()
  })

  it('includes swap when handler IS provided', () => {
    const toolbar = createFeatureToolbar({
      copy: () => {},
      clear: () => {},
      swap: () => {},
    })

    const swapAction = toolbar.getAction('swap')
    expect(swapAction).toBeDefined()
    expect(swapAction!.enabled).toBe(true)
  })

  it('excludes favorite/history/settings/refresh (no features pass them)', () => {
    const toolbar = createFeatureToolbar({
      copy: () => {},
      clear: () => {},
    })

    expect(toolbar.getAction('favorite')).toBeUndefined()
    expect(toolbar.getAction('history')).toBeUndefined()
    expect(toolbar.getAction('settings')).toBeUndefined()
    expect(toolbar.getAction('refresh')).toBeUndefined()
  })

  it('excludes actions where enabled is false, even if handler passed', () => {
    const toolbar = createFeatureToolbar({
      copy: () => {},
      clear: () => {},
      paste: () => {}, // enabled: false by default
      export: () => {}, // enabled: false by default
      import: () => {}, // enabled: false by default
    })

    expect(toolbar.getAction('paste')).toBeUndefined()
    expect(toolbar.getAction('export')).toBeUndefined()
    expect(toolbar.getAction('import')).toBeUndefined()
  })
})

// ── execute dispatch ───────────────────────────────────────────────

describe('createFeatureToolbar — execute dispatch', () => {
  it('execute("copy") calls the copy handler', async () => {
    let called = false
    const toolbar = createFeatureToolbar({
      copy: () => { called = true },
      clear: () => {},
    })

    await toolbar.execute('copy')
    expect(called).toBe(true)
  })

  it('execute("clear") calls the clear handler', async () => {
    let called = false
    const toolbar = createFeatureToolbar({
      copy: () => {},
      clear: () => { called = true },
    })

    await toolbar.execute('clear')
    expect(called).toBe(true)
  })

  it('execute("swap") calls the swap handler when provided', async () => {
    let called = false
    const toolbar = createFeatureToolbar({
      copy: () => {},
      clear: () => {},
      swap: () => { called = true },
    })

    await toolbar.execute('swap')
    expect(called).toBe(true)
  })

  it('execute("swap") is a safe no-op when swap handler not provided', async () => {
    const toolbar = createFeatureToolbar({
      copy: () => {},
      clear: () => {},
    })

    // Must not throw — swap action not in list, execute gracefully returns
    await expect(toolbar.execute('swap')).resolves.toBeUndefined()
  })

  it('execute of non-existent action does not throw', async () => {
    const toolbar = createFeatureToolbar({
      copy: () => {},
      clear: () => {},
    })

    await expect(
      toolbar.execute('favorite' as ToolbarAction),
    ).resolves.toBeUndefined()
  })
})

// ── configure ──────────────────────────────────────────────────────

describe('createFeatureToolbar — configure', () => {
  it('configure can enable a disabled action (if handler exists)', () => {
    const toolbar = createFeatureToolbar({
      copy: () => {},
      clear: () => {},
      paste: () => {},
    })

    // paste is disabled by default
    expect(toolbar.getAction('paste')).toBeUndefined()

    // Enable paste
    toolbar.configure({ paste: true })
    expect(toolbar.getAction('paste')).toBeDefined()
  })

  it('configure can disable an enabled action', () => {
    const toolbar = createFeatureToolbar({
      copy: () => {},
      clear: () => {},
    })

    expect(toolbar.getAction('copy')).toBeDefined()

    toolbar.configure({ copy: false })
    expect(toolbar.getAction('copy')).toBeUndefined()
  })

  it('configure cannot enable an action without a handler', () => {
    const toolbar = createFeatureToolbar({
      copy: () => {},
      clear: () => {},
    })

    // swap has no handler — configure({ swap: true }) should NOT create it
    toolbar.configure({ swap: true })
    expect(toolbar.getAction('swap')).toBeUndefined()
  })
})

// ── copy/clear unaffected ──────────────────────────────────────────

describe('createFeatureToolbar — copy/clear baseline', () => {
  it('copy and clear work with only those handlers provided', async () => {
    let copyCalled = false
    let clearCalled = false
    const toolbar = createFeatureToolbar({
      copy: () => { copyCalled = true },
      clear: () => { clearCalled = true },
    })

    await toolbar.execute('copy')
    expect(copyCalled).toBe(true)

    await toolbar.execute('clear')
    expect(clearCalled).toBe(true)
  })

  it('actions list does not contain unexpected entries', () => {
    const toolbar = createFeatureToolbar({
      copy: () => {},
      clear: () => {},
    })

    const ids = toolbar.actions.map((a) => a.id)
    // Only copy and clear — no swap, favorite, history, settings, refresh
    expect(ids).toEqual(['copy', 'clear'])
  })
})
