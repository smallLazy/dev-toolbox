<script setup lang="ts">
/**
 * Hash Plugin — Main View
 *
 * Spec-aligned layout:
 *   Card: Configuration (Algorithm MD5 | SHA-256)
 *   Card: Input (textarea + char count)
 *   Action Bar (Generate, Copy, Clear)
 *   Card: Output (conditional, readonly textarea + char count)
 *
 * ALL UI from Design System. Zero custom components.
 */

import { onMounted, onUnmounted, ref } from 'vue'
import { useHash } from './composables'
import { useTextActionTrigger } from '@/composables/useTextActionTrigger'
import { usePointerSafeAction } from '@/composables/usePointerSafeAction'
import type { HashAlgorithm } from './types'

const { input, output, error, loading, algorithm, outputStats, toolbar, execute, init, dispose } =
  useHash()

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

// ── Algorithm switch (MD5 / SHA-256 tabs) ────────────────────────────
const algorithmTriggeredByPointer = ref(false)

function switchAlgorithm(nextAlgorithm: HashAlgorithm) {
  syncInputFromDom()
  algorithm.value = nextAlgorithm
}

function handleAlgorithmPointerDown(event: PointerEvent, nextAlgorithm: HashAlgorithm) {
  event.preventDefault()
  event.stopPropagation()
  algorithmTriggeredByPointer.value = true
  switchAlgorithm(nextAlgorithm)
  globalThis.setTimeout(() => {
    algorithmTriggeredByPointer.value = false
  }, 0)
}

function handleAlgorithmClick(nextAlgorithm: HashAlgorithm) {
  if (algorithmTriggeredByPointer.value) {
    return
  }
  switchAlgorithm(nextAlgorithm)
}

// ── Pointer-safe toolbar actions (Copy, Clear) ────────────────────
const copyAction = usePointerSafeAction()
const clearAction = usePointerSafeAction({ disabled: () => loading.value })

// ── Lifecycle ────────────────────────────────────────────────────────
onMounted(() => init())
onUnmounted(() => dispose())
</script>

<template>
  <div class="page" @keydown="handleShortcut">
    <header class="page-header">
      <h1 class="page-title">Hash Generator</h1>
      <p class="page-desc">
        Generate MD5 and SHA-256 hashes &mdash;
        <kbd>⌘Enter</kbd> to generate
      </p>
    </header>

    <div class="page-content">
      <!-- Card: Configuration -->
      <div class="card">
        <div class="card-header">Configuration</div>
        <div class="card-body">
          <div class="field">
            <label class="field-label">Algorithm</label>
            <div class="segmented-control">
              <button
                type="button"
                :class="{ active: algorithm === 'md5' }"
                :aria-pressed="algorithm === 'md5'"
                @pointerdown="handleAlgorithmPointerDown($event, 'md5')"
                @click="handleAlgorithmClick('md5')"
              >
                MD5
              </button>
              <button
                type="button"
                :class="{ active: algorithm === 'sha256' }"
                :aria-pressed="algorithm === 'sha256'"
                @pointerdown="handleAlgorithmPointerDown($event, 'sha256')"
                @click="handleAlgorithmClick('sha256')"
              >
                SHA-256
              </button>
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
            aria-label="Text input to hash"
            placeholder="Enter text to hash..."
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
          aria-label="Generate hash"
          @pointerdown="handlePointerDown"
          @click="handleClick"
        >
          {{ loading ? 'Generating...' : 'Generate' }}
        </button>
        <button
          v-if="output"
          class="btn-secondary"
          @pointerdown="copyAction.handlePointerDown($event, () => toolbar.execute('copy'))"
          @click="copyAction.handleClick(() => toolbar.execute('copy'))"
          aria-label="Copy hash output to clipboard"
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
      </div>

      <!-- Error -->
      <div v-if="error" class="alert-error" role="alert">{{ error }}</div>

      <!-- Card: Output (conditional) -->
      <div class="card card-output" v-if="output">
        <div class="card-header" role="status" aria-live="assertive">Output (Hex)</div>
        <div class="card-body">
          <textarea
            :value="output"
            class="dt-textarea hash-output-textarea"
            rows="4"
            readonly
            spellcheck="false"
            aria-label="Hash output"
            aria-live="polite"
          />
          <div class="char-count" v-if="outputStats">chars: {{ outputStats.chars }}</div>
        </div>
      </div>

      <!-- Empty State -->
      <div class="card" v-if="!output && !error && !input">
        <div class="card-body empty-hint">
          <p>MD5 / SHA-256 Hash Generator</p>
          <p class="hint-desc">
            Enter text above and click <strong>Generate</strong> or press
            <kbd>⌘Enter</kbd>
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

.field {
  display: flex;
  flex-direction: column;
  gap: var(--space-compact);
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

.hash-output-textarea {
  font-family: var(--font-mono);
  word-break: break-all;
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
