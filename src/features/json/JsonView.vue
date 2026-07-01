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
      <h1 class="page-title">JSON 格式化</h1>
      <p class="page-desc">格式化、压缩与验证 JSON &mdash; <kbd>⌘Enter</kbd> 执行</p>
    </header>

    <div class="page-content">
      <!-- Card: Mode + Stats -->
      <div class="card">
        <div class="card-header">操作</div>
        <div class="card-body">
          <div class="mode-row">
            <div class="segmented-control">
              <button :class="{ active: mode === 'format' }" @click="mode = 'format'">格式化</button>
              <button :class="{ active: mode === 'minify' }" @click="mode = 'minify'">压缩</button>
              <button :class="{ active: mode === 'validate' }" @click="mode = 'validate'">验证</button>
            </div>
            <div class="stats">
              <span v-if="inputStats" class="stat-item">输入 {{ inputStats }}</span>
              <span v-if="outputStats" class="stat-item">输出 {{ outputStats }}</span>
              <span v-if="isValid === true" class="stat-item valid">有效</span>
              <span v-else-if="isValid === false" class="stat-item invalid">无效</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Card: Input -->
      <div class="card">
        <div class="card-header">
          <span>输入</span>
          <span class="header-actions">
            <button class="btn-sm" @pointerdown="clearAction.handlePointerDown($event, () => toolbar.execute('clear'))" @click="clearAction.handleClick(() => toolbar.execute('clear'))">清空</button>
          </span>
        </div>
        <div class="card-body">
          <!-- Monaco Editor integration point: replace this textarea -->
          <textarea
            v-model="input"
            class="dt-textarea mono-editor"
            rows="14"
            placeholder='粘贴 JSON 文本... 例如: {"name": "Dev Toolbox", "version": "1.0"}'
            spellcheck="false"
          />
        </div>
      </div>

      <!-- Action Bar -->
      <div class="action-bar">
        <button class="btn-accent" @click="execute()" :disabled="loading">
          <span v-if="loading" class="spinner"></span>
          {{ loading ? '处理中...' : mode === 'format' ? '格式化' : mode === 'minify' ? '压缩' : '验证' }}
        </button>
        <button class="btn-secondary" @pointerdown="swapAction.handlePointerDown($event, () => toolbar.execute('swap'))" @click="swapAction.handleClick(() => toolbar.execute('swap'))">交换输入/输出</button>
        <button v-if="output" class="btn-secondary" @pointerdown="copyAction.handlePointerDown($event, () => toolbar.execute('copy'))" @click="copyAction.handleClick(() => toolbar.execute('copy'))">复制输出</button>
        <button v-if="output" class="btn-secondary" @pointerdown="exportAction.handlePointerDown($event, () => toolbar.execute('export'))" @click="exportAction.handleClick(() => toolbar.execute('export'))">导出</button>
      </div>

      <!-- Error -->
      <div v-if="error" class="alert-error">{{ error }}</div>

      <!-- Card: Output -->
      <div class="card card-output" v-if="output">
        <div class="card-header">
          <span>输出</span>
          <button v-if="output" class="btn-sm" @pointerdown="copyAction.handlePointerDown($event, () => toolbar.execute('copy'))" @click="copyAction.handleClick(() => toolbar.execute('copy'))">复制</button>
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
          <p>粘贴 JSON 文本到输入框，选择操作模式后点击执行</p>
          <p class="hint-desc">支持格式化 (Pretty Print)、压缩 (Minify) 和验证 (Validate)</p>
          <p class="hint-desc"><kbd>⌘Enter</kbd> 快速执行</p>
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
