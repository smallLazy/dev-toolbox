<script setup lang="ts">
/**
 * URL Plugin — Main View
 *
 * Spec-aligned layout:
 *   Card: Configuration (Mode Encode|Decode + Variant Component|URI)
 *   Card: Input (textarea + char count)
 *   Action Bar (Execute, Copy, Clear, Swap I/O)
 *   Card: Output (conditional, readonly textarea + char count)
 *
 * ALL UI from Design System. Zero custom components.
 */

import { onMounted, onUnmounted, ref } from 'vue'
import { useUrl } from './composables'
import { useTextActionTrigger } from '@/composables/useTextActionTrigger'
import { usePointerSafeAction } from '@/composables/usePointerSafeAction'
import type { UrlMode, UrlVariant } from './types'

const { input, output, error, loading, mode, variant, outputStats, toolbar, execute, init, dispose } =
  useUrl()

// ── Generic text-input + execute-button interaction ──────────────────
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

// ── Mode switch (Encode / Decode tabs) ───────────────────────────────
const modeTriggeredByPointer = ref(false)

function switchMode(newMode: UrlMode) {
  syncInputFromDom()
  mode.value = newMode
}

function handleModePointerDown(event: PointerEvent, nextMode: UrlMode) {
  event.preventDefault()
  event.stopPropagation()
  modeTriggeredByPointer.value = true
  switchMode(nextMode)
  globalThis.setTimeout(() => {
    modeTriggeredByPointer.value = false
  }, 0)
}

function handleModeClick(nextMode: UrlMode) {
  if (modeTriggeredByPointer.value) {
    return
  }
  switchMode(nextMode)
}

// ── Variant switch (Component / URI tabs) ────────────────────────────
const variantTriggeredByPointer = ref(false)

function switchVariant(newVariant: UrlVariant) {
  syncInputFromDom()
  variant.value = newVariant
}

function handleVariantPointerDown(event: PointerEvent, nextVariant: UrlVariant) {
  event.preventDefault()
  event.stopPropagation()
  variantTriggeredByPointer.value = true
  switchVariant(nextVariant)
  globalThis.setTimeout(() => {
    variantTriggeredByPointer.value = false
  }, 0)
}

function handleVariantClick(nextVariant: UrlVariant) {
  if (variantTriggeredByPointer.value) {
    return
  }
  switchVariant(nextVariant)
}

// ── Pointer-safe toolbar actions (Copy, Clear, Swap) ──────────────
const copyAction = usePointerSafeAction()
const clearAction = usePointerSafeAction({ disabled: () => loading.value })
const swapAction = usePointerSafeAction({ disabled: () => loading.value })

// ── Lifecycle ────────────────────────────────────────────────────────
onMounted(() => init())
onUnmounted(() => dispose())
</script>

<template>
  <div class="page" @keydown="handleShortcut">
    <header class="page-header">
      <h1 class="page-title">URL Encode / Decode</h1>
      <p class="page-desc">
        Encode and decode URLs using URI or component modes &mdash;
        <kbd>⌘Enter</kbd> to execute
      </p>
    </header>

    <div class="page-content">
      <!-- Card: Configuration -->
      <div class="card">
        <div class="card-header">Configuration</div>
        <div class="card-body">
          <div class="form-row">
            <div class="field flex-1">
              <label class="field-label">Mode</label>
              <div class="segmented-control">
                <button
                  type="button"
                  :class="{ active: mode === 'encode' }"
                  :aria-pressed="mode === 'encode'"
                  @pointerdown="handleModePointerDown($event, 'encode')"
                  @click="handleModeClick('encode')"
                >
                  Encode
                </button>
                <button
                  type="button"
                  :class="{ active: mode === 'decode' }"
                  :aria-pressed="mode === 'decode'"
                  @pointerdown="handleModePointerDown($event, 'decode')"
                  @click="handleModeClick('decode')"
                >
                  Decode
                </button>
              </div>
            </div>
            <div class="field flex-1">
              <label class="field-label">Variant</label>
              <div class="segmented-control">
                <button
                  type="button"
                  :class="{ active: variant === 'component' }"
                  :aria-pressed="variant === 'component'"
                  @pointerdown="handleVariantPointerDown($event, 'component')"
                  @click="handleVariantClick('component')"
                >
                  Component
                </button>
                <button
                  type="button"
                  :class="{ active: variant === 'uri' }"
                  :aria-pressed="variant === 'uri'"
                  @pointerdown="handleVariantPointerDown($event, 'uri')"
                  @click="handleVariantClick('uri')"
                >
                  URI
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Card: Input -->
      <div class="card">
        <div class="card-header">Input</div>
        <div class="card-body">
          <textarea
            ref="inputEl"
            v-model="input"
            class="dt-textarea"
            rows="6"
            :aria-label="
              mode === 'encode'
                ? 'Plain URL or text input'
                : 'Encoded URL input'
            "
            :placeholder="
              mode === 'encode'
                ? 'Enter URL or text to encode...'
                : 'Enter encoded URL to decode...'
            "
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
          :aria-label="
            mode === 'encode' ? 'Encode input to URL encoding' : 'Decode URL-encoded input'
          "
          @pointerdown="handlePointerDown"
          @click="handleClick"
        >
          {{ loading ? 'Processing...' : mode === 'encode' ? 'Encode' : 'Decode' }}
        </button>
        <button
          v-if="output"
          class="btn-secondary"
          @pointerdown="copyAction.handlePointerDown($event, () => toolbar.execute('copy'))"
          @click="copyAction.handleClick(() => toolbar.execute('copy'))"
          aria-label="Copy output to clipboard"
        >
          Copy Output
        </button>
        <button
          class="btn-secondary"
          @pointerdown="clearAction.handlePointerDown($event, () => toolbar.execute('clear'))"
          @click="clearAction.handleClick(() => toolbar.execute('clear'))"
          aria-label="Clear input and output"
        >
          Clear
        </button>
        <button
          v-if="output"
          class="btn-secondary"
          @pointerdown="swapAction.handlePointerDown($event, () => toolbar.execute('swap'))"
          @click="swapAction.handleClick(() => toolbar.execute('swap'))"
          aria-label="Swap input and output"
        >
          Swap I/O
        </button>
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
            :aria-label="
              mode === 'encode' ? 'URL-encoded output' : 'Decoded text output'
            "
            aria-live="polite"
          />
          <div class="char-count" v-if="outputStats">chars: {{ outputStats.chars }}</div>
        </div>
      </div>

      <!-- Empty State -->
      <div class="card" v-if="!output && !error && !input">
        <div class="card-body empty-hint">
          <p>URL Encode / Decode</p>
          <p class="hint-desc">
            Enter URL or text above and click <strong>{{ mode === 'encode' ? 'Encode' : 'Decode' }}</strong>
            or press <kbd>⌘Enter</kbd>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.page {
  max-width: var(--content-max-width);
  margin: 0 auto;
}
.page-header {
  margin-bottom: var(--space-6);
}
.page-title {
  font-size: var(--text-title);
  font-weight: var(--weight-semibold);
  color: var(--color-neutral-110);
  margin-bottom: var(--space-1);
  letter-spacing: -0.01em;
}
.page-desc {
  font-size: var(--text-body);
  color: var(--color-neutral-70);
}
.page-desc kbd {
  font-size: var(--text-caption);
  padding: 1px 5px;
  background: var(--color-neutral-40);
  border: var(--border-width-thin) solid var(--border-color-default);
  border-radius: var(--radius-sm);
  font-family: var(--font-mono);
}
.page-content {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.card {
  background: var(--color-neutral-35);
  border: var(--border-width-thin) solid var(--border-color-subtle);
  border-radius: var(--radius-xl);
  overflow: hidden;
}
.card-header {
  padding: var(--space-card-header-y) var(--space-5);
  font-size: var(--text-caption);
  font-weight: var(--weight-medium);
  color: var(--color-neutral-60);
  text-transform: uppercase;
  letter-spacing: 0.06em;
  border-bottom: var(--border-width-thin) solid var(--border-color-subtle);
}
.card-body {
  padding: var(--space-4) var(--space-5);
}
.card-output {
  border-color: var(--border-color-focus);
}
.card-output .card-body {
  background: var(--color-neutral-15);
}

.form-row {
  display: flex;
  gap: var(--space-3);
}
.field {
  display: flex;
  flex-direction: column;
  gap: var(--space-compact);
}
.field.flex-1 {
  flex: 1;
}
.field-label {
  font-size: var(--text-label);
  font-weight: var(--weight-medium);
  color: var(--color-neutral-80);
}

.segmented-control {
  display: flex;
  gap: 0;
}
.segmented-control button {
  flex: 1;
  padding: var(--space-1) var(--space-4);
  font-size: var(--text-body);
  font-weight: var(--weight-medium);
  background: var(--color-neutral-25);
  color: var(--color-neutral-70);
  border: var(--border-width-thin) solid var(--border-color-default);
  cursor: pointer;
  transition: all var(--duration-fast);
}
.segmented-control button:first-child {
  border-radius: var(--radius-md) 0 0 var(--radius-md);
}
.segmented-control button:last-child {
  border-radius: 0 var(--radius-md) var(--radius-md) 0;
}
.segmented-control button.active {
  background: var(--accent-primary);
  color: var(--color-neutral-120);
  border-color: var(--accent-primary);
}

.action-bar {
  display: flex;
  gap: var(--space-2);
  flex-wrap: wrap;
}

.char-count {
  font-size: var(--text-caption);
  color: var(--color-neutral-50);
  margin-top: var(--space-1);
  text-align: right;
}

.empty-hint {
  text-align: center;
  padding: var(--space-8) 0;
}
.empty-hint p {
  font-size: var(--text-base);
  color: var(--color-neutral-90);
}
.empty-hint .hint-desc {
  font-size: var(--text-body);
  color: var(--color-neutral-70);
  margin-top: var(--space-1);
}
.empty-hint kbd {
  font-size: var(--text-caption);
  padding: 1px 5px;
  background: var(--color-neutral-40);
  border: var(--border-width-thin) solid var(--border-color-default);
  border-radius: var(--radius-sm);
  font-family: var(--font-mono);
}
</style>
