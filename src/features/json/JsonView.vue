<script setup lang="ts">
/**
 * JSON Plugin — Main View
 *
 * Layout uses shared ToolPage components for consistent visual spec:
 *   ToolPage > ToolHeader > ToolSection(Mode) > ToolSection(Input)
 *   > ToolActions > ToolSection(Output)
 *
 * ALL UI from Design System. Zero custom components.
 * Monaco Editor integration point: replace <textarea> with <MonacoEditor>
 * when the component is registered in the Design System.
 */

import { onMounted, onUnmounted, computed } from 'vue'
import { useJsonPlugin } from './composables'
import { usePointerSafeAction } from '@/composables/usePointerSafeAction'
import ToolPage from '@/templates/ToolPage.vue'
import ToolHeader from '@/templates/ToolHeader.vue'
import ToolSection from '@/templates/ToolSection.vue'
import ToolActions from '@/templates/ToolActions.vue'
import ToolOutputPanel from '@/templates/ToolOutputPanel.vue'
import ToolSegmentedControl from '@/templates/ToolSegmentedControl.vue'
import type { JsonMode } from './types'

const {
  input, output, error, loading, mode, stats,
  toolbar, execute, selectMode, init, dispose,
} = useJsonPlugin()

const copyAction = usePointerSafeAction()
const clearAction = usePointerSafeAction({ disabled: () => loading.value })
const swapAction = usePointerSafeAction({ disabled: () => loading.value })

onMounted(() => init())
onUnmounted(() => dispose())

// ── Mode options ───────────────────────────────────────────────────────
const modeOptions = [
  { label: 'Format', value: 'format' },
  { label: 'Minify', value: 'minify' },
  { label: 'Validate', value: 'validate' },
]

function handleModeChange(newMode: string) {
  selectMode(newMode as JsonMode)
}

// ── Keyboard Shortcuts ─────────────────────────────────────────────────
function onKeydown(e: KeyboardEvent) {
  if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
    e.preventDefault()
    execute()
  }
}

// ── Derived stats for ToolOutputPanel ──────────────────────────────────
const outputPanelStats = computed(() => {
  if (!stats.value || stats.value.chars === 0) return null
  return { chars: stats.value.chars }
})
</script>

<template>
  <ToolPage @keydown="onKeydown">
    <ToolHeader
      title="JSON Formatter"
      description="Format, minify, and validate JSON —"
    >
      <template #default>
        Format, minify, and validate JSON &mdash;
        <kbd>⌘Enter</kbd> to execute
      </template>
    </ToolHeader>

    <div class="page-content">
      <!-- Configuration: Mode -->
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
        <!-- Monaco Editor integration point: replace this textarea -->
        <textarea
          v-model="input"
          class="dt-textarea mono-editor"
          rows="14"
          :aria-label="`JSON input for ${mode}`"
          placeholder='Paste JSON text... e.g. {"name": "Dev Toolbox", "version": "1.0"}'
          spellcheck="false"
        />
        <div class="char-count">chars: {{ input.length }}</div>
      </ToolSection>

      <!-- Action Bar -->
      <ToolActions>
        <button
          type="button"
          class="btn-accent"
          :disabled="loading"
          :aria-label="`Run ${mode}: ${mode} JSON`"
          @click="execute()"
        >
          <span v-if="loading" class="spinner"></span>
          {{ loading ? 'Processing...' : mode === 'format' ? 'Format' : mode === 'minify' ? 'Minify' : 'Validate' }}
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
          v-if="output && mode !== 'validate'"
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
          :aria-label="`${mode} output`"
        />
      </ToolSection>

      <!-- Empty State -->
      <ToolSection v-if="!output && !error && !input" title="">
        <div class="empty-hint">
          <p>JSON Formatter</p>
          <p class="hint-desc">
            Paste JSON text above and click <strong>{{ mode === 'format' ? 'Format' : mode === 'minify' ? 'Minify' : 'Validate' }}</strong>
            or press <kbd>⌘Enter</kbd>
          </p>
          <p class="hint-desc">Supports Format (Pretty Print), Minify, and Validate.</p>
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

/* Monaco Editor Placeholder */
.mono-editor {
  font-family: var(--font-mono) !important;
  font-size: var(--text-body) !important;
  line-height: 1.6 !important;
  tab-size: 2;
}
</style>
