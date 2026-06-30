<script setup lang="ts">
/**
 * Base64 Plugin — Main View
 *
 * Spec-aligned layout:
 *   Card: Configuration (Encode | Decode toggle)
 *   Card: Input (textarea + char count)
 *   Action Bar (Execute, Copy, Clear, Swap I/O)
 *   Card: Output (conditional, readonly textarea + char count)
 *   Card: History (conditional, when history has items)
 *
 * ALL UI from Design System. Zero custom components.
 */

import { onMounted, onUnmounted, ref, nextTick } from 'vue'
import { useBase64 } from './composables'

const { input, output, error, loading, mode, stats, outputStats, toolbar, execute, init, dispose } = useBase64()

/** IME composition guard: true while IME is actively composing */
const isComposing = ref(false)

/** Direct DOM ref to input textarea — used to read real-time value during IME composition */
const inputTextareaRef = ref<HTMLTextAreaElement | null>(null)

onMounted(() => init())
onUnmounted(() => dispose())

// ── Debug (DEV only) ─────────────────────────────────────────────────
const DEBUG: boolean = import.meta.env.DEV

function debugLog(message: string, payload?: unknown) {
  if (!DEBUG) return
  console.debug('[base64]', message, ...(payload !== undefined ? [payload] : []))
}

// ── DOM sync ─────────────────────────────────────────────────────────
/** Read textarea DOM value directly into the Vue ref. Used before every execute. */
function syncInputFromDom() {
  const domValue = inputTextareaRef.value?.value
  if (typeof domValue === 'string') {
    input.value = domValue
  }
}

// ── Execute (shared core) ────────────────────────────────────────────
/**
 * Core execute path. Called by pointerdown, click fallback, and keyboard shortcut.
 *
 * KEY CHANGE: no isComposing guard. The caller is responsible for
 * syncing DOM → ref before calling this.  Empty/illegal input is
 * handled by execute() / validate() producing an error — we never
 * silently drop the user's action.
 */
async function handleExecute() {
  syncInputFromDom()
  isComposing.value = false
  await nextTick()
  await execute()
}

// ── Pointerdown: PRIMARY execute entry (first click MUST work) ───────
/**
 * Prevent double-execution when pointerdown already triggered execute
 * and the subsequent click fires on the same button.
 */
const executeTriggeredByPointer = ref(false)

/**
 * Called on @pointerdown of the Execute button.
 *
 * This is the PRIMARY execution path for mouse/touch clicks.
 * It runs BEFORE blur/click, so the textarea still has focus and
 * the IME hasn't been torn down yet. We force-sync the DOM value,
 * reset the IME flag, and execute immediately.
 *
 * The subsequent @click handler checks executeTriggeredByPointer
 * and skips to avoid double execution.
 */
async function handleExecutePointerDown(event: PointerEvent) {
  event.preventDefault()
  event.stopPropagation()

  if (loading.value) {
    debugLog('handleExecutePointerDown: already loading, skip')
    return
  }

  executeTriggeredByPointer.value = true
  debugLog('pointerdown → execute')

  syncInputFromDom()
  isComposing.value = false
  await nextTick()
  await execute()

  // Reset the flag after the current event loop so the next real click works
  window.setTimeout(() => {
    executeTriggeredByPointer.value = false
  }, 0)
}

// ── Click: keyboard / fallback only ──────────────────────────────────
/**
 * Called on @click of the Execute button.
 *
 * For mouse clicks: executeTriggeredByPointer is already true
 * (set by pointerdown), so this is a no-op → no double execution.
 *
 * For keyboard-triggered clicks (Enter on focused button): pointerdown
 * may not have fired, so this acts as the fallback path.
 */
async function handleExecuteClick() {
  if (executeTriggeredByPointer.value) {
    debugLog('click → skip (already executed in pointerdown)')
    return
  }
  debugLog('click → fallback execute')
  await handleExecute()
}

// ── Textarea event handlers ──────────────────────────────────────────
function handleInputBlur() {
  syncInputFromDom()
  isComposing.value = false
  debugLog('textarea:blur (synced)')
}

function handleCompositionStart() {
  isComposing.value = true
  debugLog('compositionstart')
}

function handleCompositionEnd() {
  syncInputFromDom()
  isComposing.value = false
  debugLog('compositionend (synced)')
}

// ── Keyboard shortcut ────────────────────────────────────────────────
function onKeydown(e: KeyboardEvent) {
  if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
    e.preventDefault()
    debugLog('keyboard:⌘Enter → execute')
    void handleExecute()
  }
}
</script>

<template>
  <div class="page" @keydown="onKeydown">
    <header class="page-header">
      <h1 class="page-title">Base64</h1>
      <p class="page-desc">Encode and decode text to/from Base64 &mdash; <kbd>⌘Enter</kbd> to execute</p>
    </header>

    <div class="page-content">
      <!-- Card: Configuration -->
      <div class="card">
        <div class="card-header">Configuration</div>
        <div class="card-body">
          <div class="field">
            <label class="field-label">Mode</label>
            <div class="segmented-control">
              <button
                :class="{ active: mode === 'encode' }"
                @click="mode = 'encode'"
              >Encode</button>
              <button
                :class="{ active: mode === 'decode' }"
                @click="mode = 'decode'"
              >Decode</button>
            </div>
          </div>
        </div>
      </div>

      <!-- Card: Input -->
      <div class="card">
        <div class="card-header">Input</div>
        <div class="card-body">
          <textarea
            ref="inputTextareaRef"
            v-model="input"
            class="dt-textarea"
            rows="6"
            :aria-label="mode === 'encode' ? 'Plain text input' : 'Base64 input'"
            :placeholder="mode === 'encode' ? 'Enter text to encode...' : 'Enter Base64 string to decode...'"
            spellcheck="false"
            @blur="handleInputBlur"
            @compositionstart="handleCompositionStart"
            @compositionend="handleCompositionEnd"
          />
          <div class="char-count">chars: {{ input.length }}</div>
        </div>
      </div>

      <!-- Action Bar -->
      <div class="action-bar">
        <button
          type="button"
          class="btn-accent"
          :disabled="loading"
          :aria-label="mode === 'encode' ? 'Encode input to Base64' : 'Decode Base64 input'"
          @pointerdown="handleExecutePointerDown"
          @click="handleExecuteClick"
        >
          <span v-if="loading" class="spinner"></span>
          {{ loading ? 'Processing...' : (mode === 'encode' ? 'Encode' : 'Decode') }}
        </button>
        <button v-if="output" class="btn-secondary" @click="toolbar.execute('copy')" aria-label="Copy output to clipboard">Copy Output</button>
        <button class="btn-secondary" @click="toolbar.execute('clear')" aria-label="Clear input and output">Clear</button>
        <button v-if="output" class="btn-secondary" @click="toolbar.execute('swap')" aria-label="Swap input and output">Swap I/O</button>
      </div>

      <!-- Error -->
      <div v-if="error" class="alert-error" role="alert">{{ error }}</div>

      <!-- Card: Output (conditional) -->
      <div class="card card-output" v-if="output">
        <div class="card-header" role="status" aria-live="assertive">Output</div>
        <div class="card-body">
          <textarea
            :value="output"
            class="dt-textarea"
            rows="6"
            readonly
            spellcheck="false"
            :aria-label="mode === 'encode' ? 'Base64 output' : 'Decoded text output'"
            aria-live="polite"
          />
          <div class="char-count" v-if="outputStats">chars: {{ outputStats.chars }}</div>
        </div>
      </div>

      <!-- Empty State -->
      <div class="card" v-if="!output && !error && !input">
        <div class="card-body empty-hint">
          <p>Base64 Encode / Decode</p>
          <p class="hint-desc">Enter text above and click <strong>Encode</strong> or press <kbd>⌘Enter</kbd></p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.page { max-width: var(--content-max-width); margin: 0 auto; }
.page-header { margin-bottom: var(--space-6); }
.page-title { font-size: var(--text-title); font-weight: var(--weight-semibold); color: var(--color-neutral-110); margin-bottom: var(--space-1); letter-spacing: -0.01em; }
.page-desc { font-size: var(--text-body); color: var(--color-neutral-70); }
.page-desc kbd { font-size: var(--text-caption); padding: 1px 5px; background: var(--color-neutral-40); border: var(--border-width-thin) solid var(--border-color-default); border-radius: var(--radius-sm); font-family: var(--font-mono); }
.page-content { display: flex; flex-direction: column; gap: var(--space-3); }

.card { background: var(--color-neutral-35); border: var(--border-width-thin) solid var(--border-color-subtle); border-radius: var(--radius-xl); overflow: hidden; }
.card-header { padding: var(--space-card-header-y) var(--space-5); font-size: var(--text-caption); font-weight: var(--weight-medium); color: var(--color-neutral-60); text-transform: uppercase; letter-spacing: 0.06em; border-bottom: var(--border-width-thin) solid var(--border-color-subtle); }
.card-body { padding: var(--space-4) var(--space-5); }
.card-output { border-color: var(--border-color-focus); }
.card-output .card-body { background: var(--color-neutral-15); }

.field { display: flex; flex-direction: column; gap: var(--space-compact); }
.field-label { font-size: var(--text-label); font-weight: var(--weight-medium); color: var(--color-neutral-80); }

.segmented-control { display: flex; gap: 0; }
.segmented-control button {
  flex: 1; padding: var(--space-1) var(--space-4);
  font-size: var(--text-body); font-weight: var(--weight-medium);
  background: var(--color-neutral-25); color: var(--color-neutral-70);
  border: var(--border-width-thin) solid var(--border-color-default);
  cursor: pointer; transition: all var(--duration-fast);
}
.segmented-control button:first-child { border-radius: var(--radius-md) 0 0 var(--radius-md); }
.segmented-control button:last-child { border-radius: 0 var(--radius-md) var(--radius-md) 0; }
.segmented-control button.active {
  background: var(--accent-primary); color: var(--color-neutral-120);
  border-color: var(--accent-primary);
}

.action-bar { display: flex; gap: var(--space-2); flex-wrap: wrap; }

.char-count { font-size: var(--text-caption); color: var(--color-neutral-50); margin-top: var(--space-1); text-align: right; }

.empty-hint { text-align: center; padding: var(--space-8) 0; }
.empty-hint p { font-size: var(--text-base); color: var(--color-neutral-90); }
.empty-hint .hint-desc { font-size: var(--text-body); color: var(--color-neutral-70); margin-top: var(--space-1); }
.empty-hint kbd { font-size: var(--text-caption); padding: 1px 5px; background: var(--color-neutral-40); border: var(--border-width-thin) solid var(--border-color-default); border-radius: var(--radius-sm); font-family: var(--font-mono); }
</style>
