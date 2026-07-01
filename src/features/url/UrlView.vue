<script setup lang="ts">
/**
 * URL Plugin — Main View
 *
 * Layout uses shared ToolPage components for consistent visual spec:
 *   ToolPage > ToolHeader > ToolSection(Config: Mode + Variant) > ToolSection(Input)
 *   > ToolActions > ToolSection(Output)
 *
 * ALL UI from Design System. Zero custom components.
 */

import { onMounted, onUnmounted } from 'vue'
import { useUrl } from './composables'
import { useTextActionTrigger } from '@/composables/useTextActionTrigger'
import { usePointerSafeAction } from '@/composables/usePointerSafeAction'
import ToolPage from '@/templates/ToolPage.vue'
import ToolHeader from '@/templates/ToolHeader.vue'
import ToolSection from '@/templates/ToolSection.vue'
import ToolActions from '@/templates/ToolActions.vue'
import ToolOutputPanel from '@/templates/ToolOutputPanel.vue'
import ToolSegmentedControl from '@/templates/ToolSegmentedControl.vue'
import type { UrlMode, UrlVariant } from './types'

const { input, output, error, loading, mode, variant, outputStats, toolbar, selectMode, execute, init, dispose } =
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

// ── Mode switch (Encode / Decode) ────────────────────────────────────
const modeOptions = [
  { label: 'Encode', value: 'encode' },
  { label: 'Decode', value: 'decode' },
]

function handleModeChange(newMode: string) {
  syncInputFromDom()
  selectMode(newMode as UrlMode)
}

// ── Variant switch (Component / URI) ─────────────────────────────────
const variantOptions = [
  { label: 'Component', value: 'component' },
  { label: 'URI', value: 'uri' },
]

function handleVariantChange(newVariant: string) {
  syncInputFromDom()
  variant.value = newVariant as UrlVariant
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
  <ToolPage @keydown="handleShortcut">
    <ToolHeader
      title="URL Encode / Decode"
      description="Encode and decode URLs using URI or component modes —"
    >
      <template #default>
        Encode and decode URLs using URI or component modes &mdash;
        <kbd>⌘Enter</kbd> to execute
      </template>
    </ToolHeader>

    <div class="page-content">
      <!-- Configuration: Mode + Variant side by side -->
      <ToolSection title="Configuration">
        <div class="form-row">
          <div class="field flex-1">
            <label class="field-label">Mode</label>
            <ToolSegmentedControl
              :model-value="mode"
              :options="modeOptions"
              @update:model-value="handleModeChange"
            />
          </div>
          <div class="field flex-1">
            <label class="field-label">Variant</label>
            <ToolSegmentedControl
              :model-value="variant"
              :options="variantOptions"
              @update:model-value="handleVariantChange"
            />
          </div>
        </div>
      </ToolSection>

      <!-- Input -->
      <ToolSection title="Input">
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
      </ToolSection>

      <!-- Action Bar -->
      <ToolActions>
        <button
          type="button"
          class="btn-accent"
          :disabled="loading"
          :aria-label="
            mode === 'encode' ? 'Run Encode: encode input to URL encoding' : 'Run Decode: decode URL-encoded input'
          "
          @pointerdown="handlePointerDown"
          @click="handleClick"
        >
          <span v-if="loading" class="spinner"></span>
          {{ loading ? 'Processing...' : mode === 'encode' ? 'Run Encode' : 'Run Decode' }}
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
          :stats="outputStats"
          :aria-label="
            mode === 'encode' ? 'URL-encoded output' : 'Decoded text output'
          "
        />
      </ToolSection>

      <!-- Empty State -->
      <ToolSection v-if="!output && !error && !input" title="">
        <div class="empty-hint">
          <p>URL Encode / Decode</p>
          <p class="hint-desc">
            Enter URL or text above and click <strong>{{ mode === 'encode' ? 'Run Encode' : 'Run Decode' }}</strong>
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
