/**
 * useTextActionTrigger — Generic text-input + execute-button interaction.
 *
 * Solves the IME composition race condition where the first click on an
 * Execute button only blurs the textarea without actually running the
 * action (common with Chinese/Japanese/Korean IMEs).
 *
 * Core strategy:
 *   1. @pointerdown is the PRIMARY execution entry — it fires before blur/click
 *   2. @click is a fallback for keyboard-triggered clicks (Enter on focused button)
 *   3. A flag prevents double-execution when both pointerdown and click fire
 *   4. DOM .value is always synced to the model ref before execution
 *
 * Supports: HTMLTextAreaElement | HTMLInputElement
 *
 * Usage (in a Vue SFC <script setup>):
 *   const { inputEl, handleCompositionStart, handleCompositionEnd,
 *           handleInputBlur, handlePointerDown, handleClick, handleShortcut }
 *     = useTextActionTrigger({ model: input, loading, execute })
 *
 * Template:
 *   <textarea ref="inputEl" v-model="input"
 *     @blur="handleInputBlur"
 *     @compositionstart="handleCompositionStart"
 *     @compositionend="handleCompositionEnd" />
 *   <button @pointerdown="handlePointerDown" @click="handleClick">Run</button>
 *   <div @keydown="handleShortcut"> ... </div>
 */

import { nextTick, ref, type Ref } from 'vue'

export interface UseTextActionTriggerOptions {
  /** Reactive model bound to the textarea/input via v-model */
  model: Ref<string>
  /** Loading ref — when true, pointerdown is skipped (prevents double submission) */
  loading?: Ref<boolean>
  /** The actual action to execute (encode, decode, hash, etc.) */
  execute: () => void | Promise<void>
}

export function useTextActionTrigger(options: UseTextActionTriggerOptions) {
  const inputEl = ref<HTMLTextAreaElement | HTMLInputElement | null>(null)
  const isComposing = ref(false)

  /**
   * Set synchronously in handlePointerDown so that the subsequent click
   * (which always fires after pointerdown for mouse/touch) can detect
   * that the action already ran and skip.
   *
   * Reset via setTimeout(0) — after the current event-loop tick completes
   * (pointerdown → click → ... all dispatched), the flag is cleared so
   * the next real click works.
   */
  const executeTriggeredByPointer = ref(false)

  // ── DOM sync ────────────────────────────────────────────────────────

  /** Copy the live DOM .value into the Vue model ref. Safe during IME. */
  function syncInputFromDom() {
    const domValue = inputEl.value?.value
    if (typeof domValue === 'string') {
      options.model.value = domValue
    }
  }

  // ── IME composition handlers ────────────────────────────────────────

  function handleCompositionStart() {
    isComposing.value = true
  }

  function handleCompositionEnd() {
    syncInputFromDom()
    isComposing.value = false
  }

  // ── Blur ────────────────────────────────────────────────────────────

  function handleInputBlur() {
    syncInputFromDom()
    isComposing.value = false
  }

  // ── Core execution ──────────────────────────────────────────────────

  /**
   * Shared execution path.
   *
   * Deliberately does NOT check isComposing — empty/invalid input is
   * handled by the caller's execute/validate, not silently dropped.
   */
  async function runAction() {
    syncInputFromDom()
    isComposing.value = false
    await nextTick()
    await options.execute()
  }

  // ── Pointerdown: PRIMARY execution entry ────────────────────────────

  /**
   * Bind to @pointerdown on the Execute button.
   *
   * Fires before blur/click, while the textarea still has focus and
   * the IME hasn't been torn down. We sync the DOM value synchronously,
   * then execute.
   */
  async function handlePointerDown(event: PointerEvent) {
    event.preventDefault()
    event.stopPropagation()

    if (options.loading?.value) {
      return
    }

    executeTriggeredByPointer.value = true
    await runAction()

    // Reset after the current event loop so the next genuine click works.
    // setTimeout(0) ensures pointerdown → click (and any other events in
    // this interaction) have all been dispatched before the flag clears.
    // Uses globalThis.setTimeout (not window.setTimeout) for Node/vitest compat.
    globalThis.setTimeout(() => {
      executeTriggeredByPointer.value = false
    }, 0)
  }

  // ── Click: fallback for keyboard-triggered clicks ───────────────────

  /**
   * Bind to @click on the Execute button.
   *
   * For mouse/touch: executeTriggeredByPointer is already true → skip.
   * For keyboard (Enter on focused button): pointerdown may not fire,
   * so this acts as the fallback path.
   *
   * Loading guard: when loading is true, skip (prevents double-submission
   * from rapid clicks in the click fallback path).
   */
  async function handleClick() {
    if (options.loading?.value) {
      return
    }

    if (executeTriggeredByPointer.value) {
      return
    }

    await runAction()
  }

  // ── Keyboard shortcut: Cmd/Ctrl + Enter ─────────────────────────────

  /**
   * Bind to @keydown on the page container.
   *
   * Calls runAction() which syncs DOM → model → nextTick → execute.
   *
   * Loading guard: when loading is true, skip (prevents double-submission
   * from rapid ⌘Enter presses while an action is already running).
   */
  async function handleShortcut(event: KeyboardEvent) {
    if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') {
      event.preventDefault()

      if (options.loading?.value) {
        return
      }

      await runAction()
    }
  }

  return {
    /** Bind to textarea/input ref */
    inputEl,
    /** Whether IME is currently composing */
    isComposing,
    /** Sync DOM .value → model ref */
    syncInputFromDom,
    /** @compositionstart handler */
    handleCompositionStart,
    /** @compositionend handler */
    handleCompositionEnd,
    /** @blur handler */
    handleInputBlur,
    /** Core execution — sync then execute */
    runAction,
    /** @pointerdown on Execute button — PRIMARY entry */
    handlePointerDown,
    /** @click on Execute button — fallback only */
    handleClick,
    /** @keydown on page container for Cmd/Ctrl+Enter */
    handleShortcut,
  }
}
