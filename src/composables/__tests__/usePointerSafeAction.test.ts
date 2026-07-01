/**
 * usePointerSafeAction — Unit Tests
 *
 * Tests pointerdown + click dedup, disabled guard, async actions, error passthrough.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ref } from 'vue'
import { usePointerSafeAction } from '../usePointerSafeAction'

function createPointerEvent(): PointerEvent {
  return {
    preventDefault: vi.fn(),
    stopPropagation: vi.fn(),
  } as unknown as PointerEvent
}

beforeEach(() => {
  vi.useFakeTimers()
})

// ── handlePointerDown ────────────────────────────────────────────────

describe('handlePointerDown', () => {
  it('calls preventDefault and stopPropagation', async () => {
    const action = usePointerSafeAction()
    const event = createPointerEvent()

    await action.handlePointerDown(event, () => {})

    expect(event.preventDefault).toHaveBeenCalledTimes(1)
    expect(event.stopPropagation).toHaveBeenCalledTimes(1)
  })

  it('executes the action once', async () => {
    const action = usePointerSafeAction()
    const handler = vi.fn()
    const event = createPointerEvent()

    await action.handlePointerDown(event, handler)

    expect(handler).toHaveBeenCalledTimes(1)
  })

  it('supports async actions', async () => {
    const action = usePointerSafeAction()
    const order: string[] = []
    const handler = vi.fn().mockImplementation(async () => {
      order.push('action')
    })
    const event = createPointerEvent()

    await action.handlePointerDown(event, handler)
    order.push('after')

    expect(handler).toHaveBeenCalledTimes(1)
    expect(order).toEqual(['action', 'after'])
  })

  it('does not execute when disabled returns true', async () => {
    const disabled = ref(true)
    const action = usePointerSafeAction({ disabled: () => disabled.value })
    const handler = vi.fn()
    const event = createPointerEvent()

    await action.handlePointerDown(event, handler)

    expect(handler).not.toHaveBeenCalled()
  })

  it('still calls preventDefault/stopPropagation when disabled', async () => {
    const disabled = ref(true)
    const action = usePointerSafeAction({ disabled: () => disabled.value })
    const handler = vi.fn()
    const event = createPointerEvent()

    await action.handlePointerDown(event, handler)

    // Safety: always prevent default pointer behavior
    expect(event.preventDefault).toHaveBeenCalled()
    expect(event.stopPropagation).toHaveBeenCalled()
    expect(handler).not.toHaveBeenCalled()
  })

  it('sets triggeredByPointer flag synchronously', async () => {
    const action = usePointerSafeAction()
    const event = createPointerEvent()

    // Start the pointerdown but don't await yet
    const promise = action.handlePointerDown(event, () => {})

    // Flag should already be true (set before awaiting runAction starts)
    expect(action.triggeredByPointer.value).toBe(true)

    // Await the full pointerdown to complete (this queues setTimeout(0))
    await promise

    // Now advance past setTimeout(0) so the flag resets
    vi.advanceTimersByTime(0)

    expect(action.triggeredByPointer.value).toBe(false)
  })

  it('propagates errors from the action', async () => {
    const action = usePointerSafeAction()
    const handler = vi.fn().mockRejectedValue(new Error('action failed'))
    const event = createPointerEvent()

    await expect(action.handlePointerDown(event, handler)).rejects.toThrow('action failed')
  })
})

// ── handleClick ──────────────────────────────────────────────────────

describe('handleClick', () => {
  it('executes the action once', async () => {
    const action = usePointerSafeAction()
    const handler = vi.fn()

    await action.handleClick(handler)

    expect(handler).toHaveBeenCalledTimes(1)
  })

  it('does not execute when disabled returns true', async () => {
    const disabled = ref(true)
    const action = usePointerSafeAction({ disabled: () => disabled.value })
    const handler = vi.fn()

    await action.handleClick(handler)

    expect(handler).not.toHaveBeenCalled()
  })

  it('does NOT double-execute when pointerdown already ran', async () => {
    const action = usePointerSafeAction()
    const handler = vi.fn()
    const event = createPointerEvent()

    // pointerdown fires first → sets flag
    await action.handlePointerDown(event, handler)
    expect(handler).toHaveBeenCalledTimes(1)

    // click fires second → should be skipped (flag still set)
    await action.handleClick(handler)

    expect(handler).toHaveBeenCalledTimes(1) // still only once
  })

  it('executes via click after setTimeout resets the flag', async () => {
    const action = usePointerSafeAction()
    const handler = vi.fn()

    // Simulate a first pointerdown
    const event = createPointerEvent()
    await action.handlePointerDown(event, handler)
    expect(handler).toHaveBeenCalledTimes(1)

    // Advance past setTimeout(0) so flag resets
    vi.advanceTimersByTime(0)

    // Now a standalone click (keyboard) should work
    await action.handleClick(handler)
    expect(handler).toHaveBeenCalledTimes(2)
  })

  it('supports async actions', async () => {
    const action = usePointerSafeAction()
    const order: string[] = []
    const handler = vi.fn().mockImplementation(async () => {
      order.push('action')
    })

    await action.handleClick(handler)
    order.push('after')

    expect(handler).toHaveBeenCalledTimes(1)
    expect(order).toEqual(['action', 'after'])
  })
})

// ── Full pointerdown + click sequence ────────────────────────────────

describe('pointerdown + click sequence', () => {
  it('executes only once when both pointerdown and click fire', async () => {
    const action = usePointerSafeAction()
    const handler = vi.fn()
    const event = createPointerEvent()

    await action.handlePointerDown(event, handler)
    await action.handleClick(handler)

    expect(handler).toHaveBeenCalledTimes(1)
  })
})
