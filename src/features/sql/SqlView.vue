<script setup lang="ts">
/**
 * SQL Plugin — Main View
 *
 * SQL IN Builder: batch values → SQL IN list.
 * TODO: add SQL Formatter mode.
 */

import { onMounted } from 'vue'
import { useSql } from './composables'
import { useTextActionTrigger } from '@/composables/useTextActionTrigger'
import { usePointerSafeAction } from '@/composables/usePointerSafeAction'

const { input, output, error, loading, inConfig, toolbar, execute, init, dispose } = useSql()

// ── useTextActionTrigger for Convert ─────────────────────────────────
const {
  inputEl,
  handleCompositionStart,
  handleCompositionEnd,
  handleInputBlur,
  handlePointerDown,
  handleClick,
  handleShortcut,
} = useTextActionTrigger({ model: input, loading, execute })

// ── Pointer-safe Copy / Clear ────────────────────────────────────────
const copyAction = usePointerSafeAction()
const clearAction = usePointerSafeAction({ disabled: () => loading.value })

// ── Lifecycle ────────────────────────────────────────────────────────
onMounted(() => init())
</script>

<template>
  <div class="page" @keydown="handleShortcut">
    <header class="page-header">
      <h1 class="page-title">SQL</h1>
      <p class="page-desc">Build SQL IN lists from batch values &mdash; <kbd>⌘Enter</kbd> to convert</p>
    </header>

    <div class="page-content">
      <!-- Configuration Card -->
      <div class="card">
        <div class="card-header">Configuration</div>
        <div class="card-body">
          <div class="form-row">
            <div class="field flex-1">
              <label class="field-label">Value Type</label>
              <div class="segmented-control">
                <button
                  type="button"
                  :class="{ active: inConfig.valueType === 'string' }"
                  :aria-pressed="inConfig.valueType === 'string'"
                  @click="inConfig.valueType = 'string'"
                >String</button>
                <button
                  type="button"
                  :class="{ active: inConfig.valueType === 'number' }"
                  :aria-pressed="inConfig.valueType === 'number'"
                  @click="inConfig.valueType = 'number'"
                >Number</button>
              </div>
            </div>
            <div class="field flex-1">
              <label class="field-label">Output Layout</label>
              <div class="segmented-control">
                <button
                  type="button"
                  :class="{ active: inConfig.lineMode === 'single' }"
                  :aria-pressed="inConfig.lineMode === 'single'"
                  @click="inConfig.lineMode = 'single'"
                >Single Line</button>
                <button
                  type="button"
                  :class="{ active: inConfig.lineMode === 'multi' }"
                  :aria-pressed="inConfig.lineMode === 'multi'"
                  @click="inConfig.lineMode = 'multi'"
                >Multi Line</button>
              </div>
            </div>
          </div>
          <div class="checkbox-row">
            <label class="check-field">
              <input v-model="inConfig.wrapWithParentheses" type="checkbox" />
              <span>Wrap with parentheses</span>
            </label>
            <label class="check-field">
              <input v-model="inConfig.dedupe" type="checkbox" />
              <span>Remove duplicates</span>
            </label>
          </div>
        </div>
      </div>

      <!-- Input Card -->
      <div class="card">
        <div class="card-header">Input</div>
        <div class="card-body">
          <textarea
            ref="inputEl"
            v-model="input"
            class="dt-textarea"
            rows="8"
            aria-label="Batch values to convert to SQL IN list"
            placeholder="1001&#10;1002&#10;1003"
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
          aria-label="Build SQL IN list"
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
          <textarea :value="output" class="dt-textarea" rows="6" readonly spellcheck="false" aria-label="SQL IN output" aria-live="polite" />
        </div>
      </div>

      <!-- Empty State -->
      <div class="card" v-if="!output && !error && !input">
        <div class="card-body empty-hint">
          <p>SQL IN Builder</p>
          <p class="hint-desc">Paste batch values above and click <strong>Convert</strong> or press <kbd>⌘Enter</kbd></p>
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

.form-row { display: flex; gap: var(--space-3); }
.field { display: flex; flex-direction: column; gap: var(--space-compact); }
.field.flex-1 { flex: 1; }
.field-label { font-size: var(--text-label); font-weight: var(--weight-medium); color: var(--color-neutral-80); }

.segmented-control { display: flex; gap: 0; }
.segmented-control button { flex: 1; padding: var(--space-1) var(--space-4); font-size: var(--text-body); font-weight: var(--weight-medium); background: var(--color-neutral-25); color: var(--color-neutral-70); border: var(--border-width-thin) solid var(--border-color-default); cursor: pointer; transition: all var(--duration-fast); }
.segmented-control button:first-child { border-radius: var(--radius-md) 0 0 var(--radius-md); }
.segmented-control button:last-child { border-radius: 0 var(--radius-md) var(--radius-md) 0; }
.segmented-control button.active { background: var(--accent-primary); color: var(--color-neutral-120); border-color: var(--accent-primary); }

.checkbox-row { display: flex; gap: var(--space-5); margin-top: var(--space-3); }
.check-field { display: inline-flex; align-items: center; gap: var(--space-control-y); color: var(--color-neutral-90); font-size: var(--text-body); cursor: pointer; }
.check-field input { width: 14px; height: 14px; accent-color: var(--color-accent-primary); }

.action-bar { display: flex; gap: var(--space-2); flex-wrap: wrap; }

.empty-hint { text-align: center; padding: var(--space-8) 0; }
.empty-hint p { font-size: var(--text-base); color: var(--color-neutral-90); }
.empty-hint .hint-desc { font-size: var(--text-body); color: var(--color-neutral-70); margin-top: var(--space-1); }
.empty-hint kbd { font-size: var(--text-caption); padding: 1px 5px; background: var(--color-neutral-40); border: var(--border-width-thin) solid var(--border-color-default); border-radius: var(--radius-sm); font-family: var(--font-mono); }
</style>
