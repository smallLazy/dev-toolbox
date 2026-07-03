<script setup lang="ts">
/**
 * SQL Plugin — Main View
 *
 * SQL IN Builder: batch values → SQL IN list.
 * Layout uses shared ToolPage components matching JSON Formatter reference.
 */

import { onMounted, onUnmounted, computed } from 'vue'
import { useSql } from './composables'
import { usePointerSafeAction } from '@/composables/usePointerSafeAction'
import { useTextActionTrigger } from '@/composables/useTextActionTrigger'
import ToolPage from '@/templates/ToolPage.vue'
import ToolHeader from '@/templates/ToolHeader.vue'
import ToolSection from '@/templates/ToolSection.vue'
import ToolActions from '@/templates/ToolActions.vue'
import ToolOutputPanel from '@/templates/ToolOutputPanel.vue'
import ToolSegmentedControl from '@/templates/ToolSegmentedControl.vue'
import type { SqlInValueType, SqlInLineMode } from './types'

const { input, output, error, loading, inConfig, toolbar, execute, init, dispose } = useSql()

// ── useTextActionTrigger for primary Convert button ──────────────────
const {
  inputEl,
  handleCompositionStart,
  handleCompositionEnd,
  handleInputBlur,
  handlePointerDown,
  handleClick,
  handleShortcut,
} = useTextActionTrigger({ model: input, loading, execute })

const copyAction = usePointerSafeAction()
const clearAction = usePointerSafeAction({ disabled: () => loading.value })
const swapAction = usePointerSafeAction({ disabled: () => loading.value })

onMounted(() => init())
onUnmounted(() => dispose())

// ── Segmented control options ────────────────────────────────────────
const valueTypeOptions = [
  { label: 'String', value: 'string' },
  { label: 'Number', value: 'number' },
]

const outputLayoutOptions = [
  { label: 'Single Line', value: 'single' },
  { label: 'Multi Line', value: 'multi' },
]

function handleValueTypeChange(newVal: string) {
  inConfig.valueType = newVal as SqlInValueType
}

function handleLineModeChange(newVal: string) {
  inConfig.lineMode = newVal as SqlInLineMode
}

// ── Derived stats for ToolOutputPanel ────────────────────────────────
const outputPanelStats = computed(() => {
  if (!output.value) return null
  return { chars: output.value.length }
})
</script>

<template>
  <ToolPage @keydown="handleShortcut">
    <ToolHeader
      title="SQL IN Builder"
      description="Build SQL IN lists from batch values"
    >
      <template #default>
        Build SQL IN lists from batch values &mdash;
        <kbd>⌘Enter</kbd> to convert
      </template>
    </ToolHeader>

    <div class="page-content">
      <!-- Configuration -->
      <ToolSection title="Configuration">
        <div class="form-row">
          <div class="field flex-1">
            <label class="field-label">Value Type</label>
            <ToolSegmentedControl
              :model-value="inConfig.valueType"
              :options="valueTypeOptions"
              @update:model-value="handleValueTypeChange"
            />
          </div>
          <div class="field flex-1">
            <label class="field-label">Output Layout</label>
            <ToolSegmentedControl
              :model-value="inConfig.lineMode"
              :options="outputLayoutOptions"
              @update:model-value="handleLineModeChange"
            />
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
      </ToolSection>

      <!-- Input -->
      <ToolSection title="Input">
        <textarea
          ref="inputEl"
          v-model="input"
          class="dt-textarea input-area"
          rows="8"
          aria-label="Batch values to convert to SQL IN list"
          placeholder="1001&#10;1002&#10;1003"
          spellcheck="false"
          @blur="handleInputBlur"
          @compositionstart="handleCompositionStart"
          @compositionend="handleCompositionEnd"
        />
        <div class="char-count">chars: {{ input.length }}</div>
      </ToolSection>

      <!-- Action Bar -->
      <ToolActions>
        <button
          type="button"
          class="btn-accent"
          :disabled="loading"
          aria-label="Build SQL IN list"
          @pointerdown="handlePointerDown"
          @click="handleClick"
        >
          <span v-if="loading" class="spinner"></span>
          {{ loading ? 'Converting...' : 'Convert' }}
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
      </ToolActions>

      <!-- Error -->
      <div v-if="error" class="alert-error" role="alert">{{ error }}</div>

      <!-- Output -->
      <ToolSection v-if="output" title="Output" variant="output">
        <ToolOutputPanel
          :value="output"
          :stats="outputPanelStats"
          aria-label="SQL IN output"
        />
      </ToolSection>

      <!-- Empty State -->
      <ToolSection v-if="!output && !error && !input" title="">
        <div class="empty-hint">
          <p>SQL IN Builder</p>
          <p class="hint-desc">
            Paste batch values above and click <strong>Convert</strong>
            or press <kbd>⌘Enter</kbd>
          </p>
        </div>
      </ToolSection>
    </div>
  </ToolPage>
</template>

<style scoped>
.page-content {
  display: flex;
  flex-direction: column;
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

.form-row {
  display: flex;
  gap: var(--space-3);
}

.checkbox-row {
  display: flex;
  gap: var(--space-5);
  margin-top: var(--space-3);
}

.check-field {
  display: inline-flex;
  align-items: center;
  gap: var(--space-control-y);
  color: var(--color-neutral-90);
  font-size: var(--text-body);
  cursor: pointer;
}

.check-field input {
  width: 14px;
  height: 14px;
  accent-color: var(--color-accent-primary);
}

.char-count {
  font-size: var(--text-caption);
  color: var(--color-neutral-50);
  margin-top: var(--space-1);
  text-align: right;
}

.input-area {
  font-family: var(--font-mono);
  font-size: var(--text-body);
  line-height: 1.6;
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
