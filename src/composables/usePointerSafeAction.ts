/**
 * usePointerSafeAction — Pointer-safe action trigger for non-execute buttons.
 *
 * Solves the same first-click-loss problem as useTextActionTrigger, but for
 * generic action buttons (Copy, Clear, Swap, etc.) that are NOT the primary
 * Execute button with textarea interaction requirements.
 *
 * Core strategy:
 *   1. @pointerdown is the PRIMARY execution entry — fires before blur/click
 *   2. @click is a fallback for keyboard-triggered clicks (Enter on focused button)
 *   3. A flag prevents double-execution when both pointerdown and click fire
 *
 * Unlike useTextActionTrigger, this composable:
 *   - Does NOT manage input refs or DOM sync (no textarea interaction)
 *   - Accepts an action callback at call time (no model binding)
 *   - Supports an optional disabled guard to block action during loading
 *
 * Usage (in a Vue SFC <script setup>):
 *   const copyAction = usePointerSafeAction()
 *   const clearAction = usePointerSafeAction({ disabled: () => loading.value })
 *
 * Template:
 *   <button
 *     type="button"
 *     @pointerdown="copyAction.handlePointerDown($event, () => toolbar.execute('copy'))"
 *     @click="copyAction.handleClick(() => toolbar.execute('copy'))"
 *   >Copy Output</button>
 */

import { ref } from 'vue'

export interface UsePointerSafeActionOptions {
  /**
   * Optional guard — when returns true, pointerdown and click are both skipped.
   * Use for loading states, disabled conditions, etc.
   */
  disabled?: () => boolean
}

export function usePointerSafeAction(options: UsePointerSafeActionOptions = {}) {
  /**
   * Set synchronously in handlePointerDown so that the subsequent click
   * (which always fires after pointerdown for mouse/touch) can detect
   * that the action already ran and skip.
   *
   * Reset via setTimeout(0) — after the current event-loop tick completes
   * (pointerdown → click → ... all dispatched), the flag is cleared so
   * the next real click works.
   */
  const triggeredByPointer = ref(false)

  /**
   * Shared execution helper. Checks the disabled guard then runs the action.
   */
  async function runAction(action: () => void | Promise<void>): Promise<void> {
    if (options.disabled?.()) {
      return
    }
    await action()
  }

  /**
   * Bind to @pointerdown on the action button.
   *
   * PRIMARY entry — fires before blur/click. Sets the dedup flag so the
   * subsequent click (which always fires for mouse/touch) is skipped.
   *
   * Calls preventDefault + stopPropagation to prevent focus transfer
   * and other pointer-event side effects.
   */
  async function handlePointerDown(
    event: PointerEvent,
    action: () => void | Promise<void>,
  ): Promise<void> {
    event.preventDefault()
    event.stopPropagation()

    if (options.disabled?.()) {
      return
    }

    triggeredByPointer.value = true
    await runAction(action)

    // Reset after the current event loop so the next genuine click works.
    // Uses globalThis.setTimeout for Node/vitest compat.
    globalThis.setTimeout(() => {
      triggeredByPointer.value = false
    }, 0)
  }

  /**
   * Bind to @click on the action button.
   *
   * FALLBACK — only executes when pointerdown didn't already run the action.
   * This covers keyboard activation (Enter on a focused button) where
   * pointerdown may not fire.
   */
  async function handleClick(action: () => void | Promise<void>): Promise<void> {
    if (triggeredByPointer.value) {
      return
    }

    await runAction(action)
  }

  return {
    /** Whether the current interaction was pointer-initiated */
    triggeredByPointer,
    /** @pointerdown handler — PRIMARY entry */
    handlePointerDown,
    /** @click handler — fallback for keyboard activation */
    handleClick,
  }
}
