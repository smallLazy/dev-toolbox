<script setup lang="ts">
/**
 * JSON Plugin — Main View
 *
 * Uses ONLY Design System components (Card, button classes, textarea, segmented control).
 * Zero custom components. All behavior from JsonFeature via composable.
 *
 * Monaco Editor integration point: replace <textarea> with <MonacoEditor>
 * when the component is registered in the Design System.
 */

import { onMounted, onUnmounted } from 'vue'
import { useJsonPlugin } from './composables'
import { usePointerSafeAction } from '@/composables/usePointerSafeAction'

const {
  input, output, error, loading, mode,
  inputStats, outputStats, isValid,
  toolbar, execute, init, dispose,
} = useJsonPlugin()

const copyAction = usePointerSafeAction()
const clearAction = usePointerSafeAction({ disabled: () => loading.value })
const swapAction = usePointerSafeAction({ disabled: () => loading.value })
const exportAction = usePointerSafeAction({ disabled: () => loading.value })

onMounted(() => init())
onUnmounted(() => dispose())

// ── Keyboard Shortcuts ───────────────────────────────────────────────
function onKeydown(e: KeyboardEvent) {
  if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
    e.preventDefault()
    execute()
  }
}
</script>

<template>
  <div class="page" @keydown="onKeydown">
    <header class="page-header">
      <h1 class="page-title">JSON Formatter</h1>
      <p class="page-desc">Format, minify, and validate JSON &mdash; <kbd>⌘Enter</kbd> to execute</p>
    </header>

    <div class="page-content">
      <!-- Card: Mode + Stats -->
      <div class="card">
        <div class="card-header">Mode</div>
        <div class="card-body">
          <div class="mode-row">
            <div class="segmented-control">
              <button :class="{ active: mode === 'format' }" @click="mode = 'format'">Format</button>
              <button :class="{ active: mode === 'minify' }" @click="mode = 'minify'">Minify</button>
              <button :class="{ active: mode === 'validate' }" @click="mode = 'validate'">Validate</button>
            </div>
            <div class="stats">
              <span v-if="inputStats" class="stat-item">Input {{ inputStats }}</span>
              <span v-if="outputStats" class="stat-item">Output {{ outputStats }}</span>
              <span v-if="isValid === true" class="stat-item valid">Valid</span>
              <span v-else-if="isValid === false" class="stat-item invalid">Invalid</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Card: Input -->
      <div class="card">
        <div class="card-header">
          <span>Input</span>
          <span class="header-actions">
            <button class="btn-sm" @pointerdown="clearAction.handlePointerDown($event, () => toolbar.execute('clear'))" @click="clearAction.handleClick(() => toolbar.execute('clear'))">Clear</button>
          </span>
        </div>
        <div class="card-body">
          <!-- Monaco Editor integration point: replace this textarea -->
          <textarea
            v-model="input"
            class="dt-textarea mono-editor"
            rows="14"
            placeholder='Paste JSON text... e.g. {"name": "Dev Toolbox", "version": "1.0"}'
            spellcheck="false"
          />
        </div>
      </div>

      <!-- Action Bar -->
      <div class="action-bar">
        <button class="btn-accent" @click="execute()" :disabled="loading">
          <span v-if="loading" class="spinner"></span>
          {{ loading ? 'Processing...' : mode === 'format' ? 'Format' : mode === 'minify' ? 'Minify' : 'Validate' }}
        </button>
        <button class="btn-secondary" @pointerdown="swapAction.handlePointerDown($event, () => toolbar.execute('swap'))" @click="swapAction.handleClick(() => toolbar.execute('swap'))">Swap Input/Output</button>
        <button v-if="output" class="btn-secondary" @pointerdown="copyAction.handlePointerDown($event, () => toolbar.execute('copy'))" @click="copyAction.handleClick(() => toolbar.execute('copy'))">Copy Output</button>
        <button v-if="output" class="btn-secondary" @pointerdown="exportAction.handlePointerDown($event, () => toolbar.execute('export'))" @click="exportAction.handleClick(() => toolbar.execute('export'))">Export</button>
      </div>

      <!-- Error -->
      <div v-if="error" class="alert-error">{{ error }}</div>

      <!-- Card: Output -->
      <div class="card card-output" v-if="output">
        <div class="card-header">
          <span>Output</span>
          <button v-if="output" class="btn-sm" @pointerdown="copyAction.handlePointerDown($event, () => toolbar.execute('copy'))" @click="copyAction.handleClick(() => toolbar.execute('copy'))">Copy</button>
        </div>
        <div class="card-body">
          <textarea
            :value="output"
            class="dt-textarea mono-editor"
            rows="14"
            readonly
            spellcheck="false"
          />
        </div>
      </div>

      <!-- Card: Empty State -->
      <div class="card" v-if="!output && !error && !input">
        <div class="card-body empty-hint">
          <p>Paste JSON text into the input area, select a mode, then execute.</p>
          <p class="hint-desc">Supports Format (Pretty Print), Minify, and Validate.</p>
          <p class="hint-desc"><kbd>⌘Enter</kbd> to execute</p>
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

/* Card */
.card { background: var(--color-neutral-35); border: var(--border-width-thin) solid var(--border-color-subtle); border-radius: var(--radius-xl); overflow: hidden; }
.card-header { padding: var(--space-card-header-y) var(--space-5); font-size: var(--text-caption); font-weight: var(--weight-medium); color: var(--color-neutral-60); text-transform: uppercase; letter-spacing: 0.06em; border-bottom: var(--border-width-thin) solid var(--border-color-subtle); display: flex; justify-content: space-between; align-items: center; }
.card-body { padding: var(--space-4) var(--space-5); }
.card-output { border-color: var(--border-color-focus); }
.card-output .card-body { background: var(--color-neutral-15); }
.card-output .card-body textarea { background: var(--color-neutral-10); border-color: var(--border-color-focus); }

/* Mode Row */
.mode-row { display: flex; align-items: center; justify-content: space-between; gap: var(--space-4); flex-wrap: wrap; }

/* Stats */
.stats { display: flex; gap: var(--space-3); flex-wrap: wrap; }
.stat-item { font-size: var(--text-label); font-family: var(--font-mono); color: var(--color-neutral-70); }
.stat-item.valid { color: var(--color-success-text); }
.stat-item.invalid { color: var(--color-danger-text); }

/* Action Bar */
.action-bar { display: flex; gap: var(--space-2); flex-wrap: wrap; }

/* Monaco Editor Placeholder */
.mono-editor {
  font-family: var(--font-mono) !important;
  font-size: var(--text-body) !important;
  line-height: 1.6 !important;
  tab-size: 2;
}

/* Header Actions */
.header-actions { display: flex; gap: var(--space-tight); }

/* Empty State */
.empty-hint { text-align: center; padding: var(--space-8) 0; }
.empty-hint p { font-size: var(--text-base); color: var(--color-neutral-90); }
.empty-hint .hint-desc { font-size: var(--text-body); color: var(--color-neutral-70); margin-top: var(--space-1); }
.empty-hint kbd { font-size: var(--text-caption); padding: 1px 5px; background: var(--color-neutral-40); border: var(--border-width-thin) solid var(--border-color-default); border-radius: var(--radius-sm); font-family: var(--font-mono); }
</style>
