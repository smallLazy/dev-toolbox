<script setup lang="ts">
/**
 * Timestamp Plugin — Main View
 */

import { onMounted, ref } from 'vue'
import { useTimestamp } from './composables'
import { useTextActionTrigger } from '@/composables/useTextActionTrigger'
import { usePointerSafeAction } from '@/composables/usePointerSafeAction'
import type { TimestampMode } from './types'

const { input, output, error, loading, mode, now, toolbar, execute, init, dispose } = useTimestamp()

// ── useTextActionTrigger for Convert button ──────────────────────────
const {
  inputEl,
  syncInputFromDom,
  handleCompositionStart,
  handleCompositionEnd,
  handleInputBlur,
  handlePointerDown,
  handleClick,
  handleShortcut,
} = useTextActionTrigger({ model: input, loading, execute })

// ── Mode tab pointer-safe switch ─────────────────────────────────────
const modeTriggeredByPointer = ref(false)

function switchMode(next: TimestampMode) {
  syncInputFromDom()
  mode.value = next
}

function handleModePointerDown(event: PointerEvent, next: TimestampMode) {
  event.preventDefault()
  event.stopPropagation()
  modeTriggeredByPointer.value = true
  switchMode(next)
  globalThis.setTimeout(() => { modeTriggeredByPointer.value = false }, 0)
}

function handleModeClick(next: TimestampMode) {
  if (modeTriggeredByPointer.value) return
  switchMode(next)
}

// ── Pointer-safe Copy / Clear ────────────────────────────────────────
const copyAction = usePointerSafeAction()
const clearAction = usePointerSafeAction({ disabled: () => loading.value })

// ── Lifecycle ────────────────────────────────────────────────────────
onMounted(() => init())
</script>

<template>
  <div class="page" @keydown="handleShortcut">
    <header class="page-header">
      <h1 class="page-title">Timestamp Converter</h1>
      <p class="page-desc">Convert Unix timestamps and date strings &mdash; <kbd>⌘Enter</kbd> to convert</p>
    </header>

    <div class="page-content">
      <!-- Current Time -->
      <div class="time-banner">
        <div class="time-row"><span class="time-label">Unix Seconds</span> <span class="time-value">{{ now.seconds }}</span></div>
        <div class="time-row"><span class="time-label">Unix Millis</span> <span class="time-value">{{ now.milliseconds }}</span></div>
        <div class="time-row"><span class="time-label">ISO 8601</span> <span class="time-value">{{ now.iso }}</span></div>
        <div class="time-row"><span class="time-label">Local</span> <span class="time-value">{{ now.local }}</span></div>
      </div>

      <!-- Configuration Card -->
      <div class="card">
        <div class="card-header">Configuration</div>
        <div class="card-body">
          <div class="field">
            <label class="field-label">Mode</label>
            <div class="segmented-control">
              <button
                type="button"
                :class="{ active: mode === 'timestamp-to-date' }"
                :aria-pressed="mode === 'timestamp-to-date'"
                @pointerdown="handleModePointerDown($event, 'timestamp-to-date')"
                @click="handleModeClick('timestamp-to-date')"
              >Timestamp to Date</button>
              <button
                type="button"
                :class="{ active: mode === 'date-to-timestamp' }"
                :aria-pressed="mode === 'date-to-timestamp'"
                @pointerdown="handleModePointerDown($event, 'date-to-timestamp')"
                @click="handleModeClick('date-to-timestamp')"
              >Date to Timestamp</button>
            </div>
          </div>
        </div>
      </div>

      <!-- Input Card -->
      <div class="card">
        <div class="card-header">Input</div>
        <div class="card-body">
          <input
            ref="inputEl"
            v-model="input"
            class="dt-input"
            type="text"
            :aria-label="mode === 'timestamp-to-date' ? 'Unix timestamp (seconds or milliseconds)' : 'Date string (ISO 8601, etc.)'"
            :placeholder="mode === 'timestamp-to-date' ? 'e.g. 1700000000 or 1700000000000' : 'e.g. 2024-01-01T00:00:00Z'"
            spellcheck="false"
            @blur="handleInputBlur"
            @compositionstart="handleCompositionStart"
            @compositionend="handleCompositionEnd"
          />
        </div>
      </div>

      <!-- Action Bar -->
      <div class="action-bar">
        <button
          type="button"
          class="btn-accent"
          :disabled="loading"
          aria-label="Convert"
          @pointerdown="handlePointerDown"
          @click="handleClick"
        >{{ loading ? 'Converting...' : 'Convert' }}</button>
        <button
          v-if="output"
          class="btn-secondary"
          @pointerdown="copyAction.handlePointerDown($event, () => toolbar.execute('copy'))"
          @click="copyAction.handleClick(() => toolbar.execute('copy'))"
          aria-label="Copy output to clipboard"
        >Copy Output</button>
        <button
          class="btn-secondary"
          @pointerdown="clearAction.handlePointerDown($event, () => toolbar.execute('clear'))"
          @click="clearAction.handleClick(() => toolbar.execute('clear'))"
          aria-label="Clear input and output"
        >Clear</button>
      </div>

      <!-- Error -->
      <div v-if="error" class="alert-error" role="alert">{{ error }}</div>

      <!-- Output Card -->
      <div class="card card-output" v-if="output">
        <div class="card-header" role="status" aria-live="assertive">Output</div>
        <div class="card-body">
          <textarea :value="output" class="dt-textarea" rows="5" readonly spellcheck="false" aria-label="Conversion output" aria-live="polite" />
        </div>
      </div>

      <!-- Empty State -->
      <div class="card" v-if="!output && !error && !input">
        <div class="card-body empty-hint">
          <p>Timestamp Converter</p>
          <p class="hint-desc">Enter a timestamp or date string and click <strong>Convert</strong> or press <kbd>⌘Enter</kbd></p>
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

.time-banner { background: var(--color-neutral-35); border: var(--border-width-thin) solid var(--border-color-subtle); border-radius: var(--radius-xl); padding: var(--space-4) var(--space-5); }
.time-row { display: flex; justify-content: space-between; padding: 2px 0; }
.time-label { font-size: var(--text-caption); color: var(--color-neutral-60); font-weight: var(--weight-medium); }
.time-value { font-size: var(--text-body); color: var(--color-neutral-100); font-family: var(--font-mono); }

.card { background: var(--color-neutral-35); border: var(--border-width-thin) solid var(--border-color-subtle); border-radius: var(--radius-xl); overflow: hidden; }
.card-header { padding: var(--space-card-header-y) var(--space-5); font-size: var(--text-caption); font-weight: var(--weight-medium); color: var(--color-neutral-60); text-transform: uppercase; letter-spacing: 0.06em; border-bottom: var(--border-width-thin) solid var(--border-color-subtle); }
.card-body { padding: var(--space-4) var(--space-5); }
.card-output { border-color: var(--border-color-focus); }
.card-output .card-body { background: var(--color-neutral-15); }

.field { display: flex; flex-direction: column; gap: var(--space-compact); }
.field-label { font-size: var(--text-label); font-weight: var(--weight-medium); color: var(--color-neutral-80); }

.segmented-control { display: flex; gap: 0; }
.segmented-control button { flex: 1; padding: var(--space-1) var(--space-4); font-size: var(--text-body); font-weight: var(--weight-medium); background: var(--color-neutral-25); color: var(--color-neutral-70); border: var(--border-width-thin) solid var(--border-color-default); cursor: pointer; transition: background var(--duration-fast) var(--ease-standard), color var(--duration-fast) var(--ease-standard), border-color var(--duration-fast) var(--ease-standard); }
.segmented-control button:first-child { border-radius: var(--radius-md) 0 0 var(--radius-md); }
.segmented-control button:last-child { border-radius: 0 var(--radius-md) var(--radius-md) 0; }
.segmented-control button.active { background: var(--color-accent-primary); color: var(--color-neutral-120); border-color: var(--color-accent-primary); }

.action-bar { display: flex; gap: var(--space-2); flex-wrap: wrap; }

.empty-hint { text-align: center; padding: var(--space-8) 0; }
.empty-hint p { font-size: var(--text-base); color: var(--color-neutral-90); }
.empty-hint .hint-desc { font-size: var(--text-body); color: var(--color-neutral-70); margin-top: var(--space-1); }
.empty-hint kbd { font-size: var(--text-caption); padding: 1px 5px; background: var(--color-neutral-40); border: var(--border-width-thin) solid var(--border-color-default); border-radius: var(--radius-sm); font-family: var(--font-mono); }
</style>
