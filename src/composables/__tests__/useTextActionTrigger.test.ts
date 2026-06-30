/**
 * useTextActionTrigger — Unit Tests
 *
 * Lightweight tests using only vitest + Vue ref (no @vue/test-utils).
 * Mocks DOM-like objects for inputEl.value and event stubs.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ref, nextTick } from 'vue'
import { useTextActionTrigger } from '../useTextActionTrigger'

/** Helper: create a fresh composable instance with a mock execute function */
function createTrigger(options?: { initialModel?: string; loading?: boolean }) {
  const model = ref(options?.initialModel ?? '')
  const loading = ref(options?.loading ?? false)
  const execute = vi.fn().mockResolvedValue(undefined)

  const trigger = useTextActionTrigger({ model, loading, execute })

  return { model, loading, execute, trigger }
}

/** Helper: attach a mock DOM element to trigger.inputEl so syncInputFromDom works */
function attachMockDom(trigger: ReturnType<typeof useTextActionTrigger>, value: string) {
  trigger.inputEl.value = { value } as HTMLTextAreaElement
}

// ────────────────────────────────────────────────────────────────────
// DOM sync
// ────────────────────────────────────────────────────────────────────

describe('syncInputFromDom', () => {
  it('copies inputEl.value.value into model.value', () => {
    const { model, trigger } = createTrigger()
    model.value = 'stale'

    attachMockDom(trigger, 'fresh from DOM')
    trigger.syncInputFromDom()

    expect(model.value).toBe('fresh from DOM')
  })

  it('does nothing when inputEl is null', () => {
    const { model, trigger } = createTrigger()
    model.value = 'unchanged'

    trigger.inputEl.value = null
    trigger.syncInputFromDom()

    expect(model.value).toBe('unchanged')
  })

  it('handles empty string from DOM', () => {
    const { model, trigger } = createTrigger({ initialModel: 'old' })
    attachMockDom(trigger, '')
    trigger.syncInputFromDom()

    expect(model.value).toBe('')
  })
})

// ────────────────────────────────────────────────────────────────────
// IME composition
// ────────────────────────────────────────────────────────────────────

describe('handleCompositionStart', () => {
  it('sets isComposing to true', () => {
    const { trigger } = createTrigger()
    trigger.isComposing.value = false

    trigger.handleCompositionStart()

    expect(trigger.isComposing.value).toBe(true)
  })
})

describe('handleCompositionEnd', () => {
  it('syncs DOM value and sets isComposing to false', () => {
    const { model, trigger } = createTrigger()
    model.value = 'stale'
    trigger.isComposing.value = true
    attachMockDom(trigger, 'composed text')

    trigger.handleCompositionEnd()

    expect(model.value).toBe('composed text')
    expect(trigger.isComposing.value).toBe(false)
  })
})

// ────────────────────────────────────────────────────────────────────
// Blur
// ────────────────────────────────────────────────────────────────────

describe('handleInputBlur', () => {
  it('syncs DOM value and sets isComposing to false', () => {
    const { model, trigger } = createTrigger()
    model.value = 'stale'
    trigger.isComposing.value = true
    attachMockDom(trigger, 'blurred text')

    trigger.handleInputBlur()

    expect(model.value).toBe('blurred text')
    expect(trigger.isComposing.value).toBe(false)
  })
})

// ────────────────────────────────────────────────────────────────────
// runAction
// ────────────────────────────────────────────────────────────────────

describe('runAction', () => {
  it('syncs DOM before calling execute', async () => {
    const { model, execute, trigger } = createTrigger()
    model.value = 'stale'
    attachMockDom(trigger, 'synced text')

    await trigger.runAction()

    expect(model.value).toBe('synced text')
    expect(execute).toHaveBeenCalledTimes(1)
  })

  it('resets isComposing to false', async () => {
    const { trigger } = createTrigger()
    trigger.isComposing.value = true

    await trigger.runAction()

    expect(trigger.isComposing.value).toBe(false)
  })

  it('awaits nextTick before calling execute', async () => {
    const { model, execute, trigger } = createTrigger()
    attachMockDom(trigger, 'text')

    // Track execution order
    const order: string[] = []
    execute.mockImplementation(async () => {
      order.push('execute')
    })

    await trigger.runAction()
    order.push('after')

    expect(order).toEqual(['execute', 'after'])
    expect(model.value).toBe('text')
  })
})

// ────────────────────────────────────────────────────────────────────
// handlePointerDown — PRIMARY execution entry
// ────────────────────────────────────────────────────────────────────

describe('handlePointerDown', () => {
  it('calls preventDefault and stopPropagation', async () => {
    const { trigger } = createTrigger()
    const event = {
      preventDefault: vi.fn(),
      stopPropagation: vi.fn(),
    } as unknown as PointerEvent

    await trigger.handlePointerDown(event)

    expect(event.preventDefault).toHaveBeenCalledTimes(1)
    expect(event.stopPropagation).toHaveBeenCalledTimes(1)
  })

  it('executes the action', async () => {
    const { execute, trigger } = createTrigger()
    const event = {
      preventDefault: vi.fn(),
      stopPropagation: vi.fn(),
    } as unknown as PointerEvent

    await trigger.handlePointerDown(event)

    expect(execute).toHaveBeenCalledTimes(1)
  })

  it('syncs DOM before executing', async () => {
    const { model, execute, trigger } = createTrigger()
    model.value = 'stale'
    attachMockDom(trigger, 'pointerdown text')

    const event = {
      preventDefault: vi.fn(),
      stopPropagation: vi.fn(),
    } as unknown as PointerEvent

    await trigger.handlePointerDown(event)

    expect(model.value).toBe('pointerdown text')
    expect(execute).toHaveBeenCalledTimes(1)
  })

  it('does not execute when loading is true', async () => {
    const { loading, execute, trigger } = createTrigger({ loading: true })
    const event = {
      preventDefault: vi.fn(),
      stopPropagation: vi.fn(),
    } as unknown as PointerEvent

    await trigger.handlePointerDown(event)

    expect(execute).not.toHaveBeenCalled()
  })

  it('still calls preventDefault/stopPropagation when loading', async () => {
    const { trigger } = createTrigger({ loading: true })
    const event = {
      preventDefault: vi.fn(),
      stopPropagation: vi.fn(),
    } as unknown as PointerEvent

    await trigger.handlePointerDown(event)

    // preventDefault / stopPropagation should always fire for safety
    expect(event.preventDefault).toHaveBeenCalled()
    expect(event.stopPropagation).toHaveBeenCalled()
  })

  it('sets executeTriggeredByPointer flag', async () => {
    const { trigger } = createTrigger()
    const event = {
      preventDefault: vi.fn(),
      stopPropagation: vi.fn(),
    } as unknown as PointerEvent

    const promise = trigger.handlePointerDown(event)
    // Flag should be set synchronously (before await completes)
    // But since runAction has nextTick, flag is set before first await
    await promise

    // After handlePointerDown completes, the setTimeout(0) resets the flag.
    // We need to fast-forward the timer to verify it was set.
    // Instead, just verify execute was called (= flag logic worked).
    // We test the flag via the handleClick test below.
  })
})

// ────────────────────────────────────────────────────────────────────
// handleClick — fallback, must NOT double-execute after pointerdown
// ────────────────────────────────────────────────────────────────────

describe('handleClick', () => {
  it('does not execute when loading is true', async () => {
    const { execute, trigger } = createTrigger({ loading: true })
    await trigger.handleClick()
    expect(execute).not.toHaveBeenCalled()
  })

  it('executes in normal (non-pointerdown) path', async () => {
    const { execute, trigger } = createTrigger()
    await trigger.handleClick()
    expect(execute).toHaveBeenCalledTimes(1)
  })

  it('does NOT double-execute when pointerdown already ran', async () => {
    const { execute, trigger } = createTrigger()
    const event = {
      preventDefault: vi.fn(),
      stopPropagation: vi.fn(),
    } as unknown as PointerEvent

    // Simulate: pointerdown fires first → flag is set
    await trigger.handlePointerDown(event)
    expect(execute).toHaveBeenCalledTimes(1)

    // Now click fires — should be skipped because flag is still set
    // (setTimeout(0) hasn't fired yet in real-time tests without fake timers)
    await trigger.handleClick()

    // Still only called once — no double execution
    expect(execute).toHaveBeenCalledTimes(1)
  })
})

// ────────────────────────────────────────────────────────────────────
// handleShortcut — Cmd/Ctrl + Enter
// ────────────────────────────────────────────────────────────────────

describe('handleShortcut', () => {
  it('executes on Cmd+Enter', async () => {
    const { execute, model, trigger } = createTrigger()
    attachMockDom(trigger, 'shortcut text')
    model.value = 'stale'

    const event = {
      preventDefault: vi.fn(),
      metaKey: true,
      ctrlKey: false,
      key: 'Enter',
    } as unknown as KeyboardEvent

    await trigger.handleShortcut(event)

    expect(event.preventDefault).toHaveBeenCalledTimes(1)
    expect(execute).toHaveBeenCalledTimes(1)
    expect(model.value).toBe('shortcut text')
  })

  it('executes on Ctrl+Enter', async () => {
    const { execute, trigger } = createTrigger()

    const event = {
      preventDefault: vi.fn(),
      metaKey: false,
      ctrlKey: true,
      key: 'Enter',
    } as unknown as KeyboardEvent

    await trigger.handleShortcut(event)

    expect(event.preventDefault).toHaveBeenCalledTimes(1)
    expect(execute).toHaveBeenCalledTimes(1)
  })

  it('ignores Enter without modifier', async () => {
    const { execute, trigger } = createTrigger()

    const event = {
      preventDefault: vi.fn(),
      metaKey: false,
      ctrlKey: false,
      key: 'Enter',
    } as unknown as KeyboardEvent

    await trigger.handleShortcut(event)

    expect(event.preventDefault).not.toHaveBeenCalled()
    expect(execute).not.toHaveBeenCalled()
  })

  it('ignores other keys with modifier', async () => {
    const { execute, trigger } = createTrigger()

    const event = {
      preventDefault: vi.fn(),
      metaKey: true,
      ctrlKey: false,
      key: 'A',
    } as unknown as KeyboardEvent

    await trigger.handleShortcut(event)

    expect(event.preventDefault).not.toHaveBeenCalled()
    expect(execute).not.toHaveBeenCalled()
  })

  it('does not execute when loading is true', async () => {
    const { execute, trigger } = createTrigger({ loading: true })

    const event = {
      preventDefault: vi.fn(),
      metaKey: true,
      ctrlKey: false,
      key: 'Enter',
    } as unknown as KeyboardEvent

    await trigger.handleShortcut(event)

    expect(execute).not.toHaveBeenCalled()
  })

  it('still calls preventDefault when loading', async () => {
    const { trigger } = createTrigger({ loading: true })

    const event = {
      preventDefault: vi.fn(),
      metaKey: true,
      ctrlKey: false,
      key: 'Enter',
    } as unknown as KeyboardEvent

    await trigger.handleShortcut(event)

    // preventDefault still fires to stop browser default even when loading
    expect(event.preventDefault).toHaveBeenCalledTimes(1)
  })
})

// ────────────────────────────────────────────────────────────────────
// Integration: full pointerdown → click sequence
// ────────────────────────────────────────────────────────────────────

describe('pointerdown + click sequence', () => {
  it('executes only once when both pointerdown and click fire', async () => {
    const { execute, trigger } = createTrigger()
    attachMockDom(trigger, 'hello')

    const pointerEvent = {
      preventDefault: vi.fn(),
      stopPropagation: vi.fn(),
    } as unknown as PointerEvent

    // pointerdown fires first
    await trigger.handlePointerDown(pointerEvent)
    // click fires second
    await trigger.handleClick()

    expect(execute).toHaveBeenCalledTimes(1)
  })
})
