<script setup lang="ts">
/**
 * Base64 Plugin — Main View
 *
 * Layout uses shared ToolPage components for consistent visual spec:
 *   ToolPage > ToolHeader > ToolSection(Config) > ToolSection(Input)
 *   > ToolActions > ToolSection(Output)
 *
 * ALL UI from Design System. Zero custom components.
 */

import { onMounted, onUnmounted } from 'vue'
import { useBase64 } from './composables'
import { useTextActionTrigger } from '@/composables/useTextActionTrigger'
import { usePointerSafeAction } from '@/composables/usePointerSafeAction'
import ToolPage from '@/templates/ToolPage.vue'
import ToolHeader from '@/templates/ToolHeader.vue'
import ToolSection from '@/templates/ToolSection.vue'
import ToolActions from '@/templates/ToolActions.vue'
import ToolOutputPanel from '@/templates/ToolOutputPanel.vue'
import ToolSegmentedControl from '@/templates/ToolSegmentedControl.vue'

const { input, output, error, loading, mode, stats, outputStats, toolbar, selectMode, execute, init, dispose } = useBase64()

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

// ── Mode switch (Encode / Decode) via ToolSegmentedControl ───────────
type Base64Mode = 'encode' | 'decode'
const modeOptions = [
  { label: 'Encode', value: 'encode' },
  { label: 'Decode', value: 'decode' },
]

function handleModeChange(newMode: string) {
  syncInputFromDom()
  selectMode(newMode as Base64Mode)
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
      title="Base64"
      description="Encode and decode text to/from Base64 —"
    >
      <template #default>
        Encode and decode text to/from Base64 &mdash;
        <kbd>⌘Enter</kbd> to execute
      </template>
    </ToolHeader>

    <div class="page-content">
      <!-- Configuration -->
      <ToolSection title="Configuration">
        <div class="field">
          <label class="field-label">Mode</label>
          <ToolSegmentedControl
            :model-value="mode"
            :options="modeOptions"
            @update:model-value="handleModeChange"
          />
        </div>
      </ToolSection>

      <!-- Input -->
      <ToolSection title="Input">
        <textarea
          ref="inputEl"
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
      </ToolSection>

      <!-- Action Bar -->
      <ToolActions>
        <button
          type="button"
          class="btn-accent"
          :disabled="loading"
          :aria-label="mode === 'encode' ? 'Run Encode: encode input to Base64' : 'Run Decode: decode Base64 input'"
          @pointerdown="handlePointerDown"
          @click="handleClick"
        >
          <span v-if="loading" class="spinner"></span>
          {{ loading ? 'Processing...' : (mode === 'encode' ? 'Run Encode' : 'Run Decode') }}
        </button>
        <button v-if="output" class="btn-secondary" @pointerdown="copyAction.handlePointerDown($event, () => toolbar.execute('copy'))" @click="copyAction.handleClick(() => toolbar.execute('copy'))" aria-label="Copy output to clipboard">Copy Output</button>
        <button class="btn-secondary" @pointerdown="clearAction.handlePointerDown($event, () => toolbar.execute('clear'))" @click="clearAction.handleClick(() => toolbar.execute('clear'))" aria-label="Clear input and output">Clear</button>
        <button v-if="output" class="btn-secondary" @pointerdown="swapAction.handlePointerDown($event, () => toolbar.execute('swap'))" @click="swapAction.handleClick(() => toolbar.execute('swap'))" aria-label="Swap input and output">Swap I/O</button>
      </ToolActions>

      <!-- Error -->
      <div v-if="error" class="alert-error" role="alert">{{ error }}</div>

      <!-- Output -->
      <ToolSection v-if="output" title="Output" variant="output">
        <template #header-actions>
          <span v-if="output" role="status" aria-live="assertive" class="sr-only">Output available</span>
        </template>
        <ToolOutputPanel
          :value="output"
          :stats="outputStats"
          :aria-label="mode === 'encode' ? 'Base64 output' : 'Decoded text output'"
        />
      </ToolSection>

      <!-- Empty State -->
      <ToolSection v-if="!output && !error && !input" title="">
        <div class="empty-hint">
          <p>Base64 Encode / Decode</p>
          <p class="hint-desc">Enter text above and click <strong>Run Encode</strong> or press <kbd>⌘Enter</kbd></p>
        </div>
      </ToolSection>
    </div>
  </ToolPage>
</template>

<style scoped>
.page-content { display: flex; flex-direction: column; gap: var(--space-3); }

.field { display: flex; flex-direction: column; gap: var(--space-compact); }
.field-label { font-size: var(--text-label); font-weight: var(--weight-medium); color: var(--color-neutral-80); }

.char-count { font-size: var(--text-caption); color: var(--color-neutral-50); margin-top: var(--space-1); text-align: right; }

.empty-hint { text-align: center; padding: var(--space-8) 0; }
.empty-hint p { font-size: var(--text-base); color: var(--color-neutral-90); }
.empty-hint .hint-desc { font-size: var(--text-body); color: var(--color-neutral-70); margin-top: var(--space-1); }
.empty-hint kbd { font-size: var(--text-caption); padding: 1px 5px; background: var(--color-neutral-40); border: var(--border-width-thin) solid var(--border-color-default); border-radius: var(--radius-sm); font-family: var(--font-mono); }

.sr-only { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0, 0, 0, 0); white-space: nowrap; border-width: 0; }
</style>
