<script setup lang="ts">
/**
 * HTML Encode Plugin — Main View
 *
 * Phase 2 migration: ToolLayout skeleton with unified status bar.
 * Business logic and composables unchanged.
 */

import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useHtmlEncode } from './composables'
import { useTextActionTrigger } from '@/composables/useTextActionTrigger'
import ToolLayout from '@/templates/ToolLayout.vue'
import ToolWorkspace from '@/templates/ToolWorkspace.vue'
import InputOutputPanel from '@/templates/InputOutputPanel.vue'
import ToolActionBar from '@/templates/ToolActionBar.vue'
import ToolOptionsRow from '@/templates/ToolOptionsRow.vue'
import ToolStatusBar from '@/templates/ToolStatusBar.vue'
import ToolSegmentedControl from '@/templates/ToolSegmentedControl.vue'
import type { ToolAction } from '@/templates/types'
import type { HtmlMode } from './types'

const { input, output, error, loading, mode, outputStats, toolbar, selectMode, execute, init, dispose } =
  useHtmlEncode()

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

const modeOptions = [
  { label: 'Encode', value: 'encode' },
  { label: 'Decode', value: 'decode' },
]

function handleModeChange(newMode: string) {
  syncInputFromDom()
  selectMode(newMode as HtmlMode)
}

// ── Unified status bar ───────────────────────────────────────────────
const statusPhase = ref<'idle' | 'loading' | 'success' | 'error' | 'copied'>('idle')
const statusMessage = ref<string | null>(null)

const primaryAction = computed<ToolAction>(() => ({
  id: 'run',
  label: mode.value === 'encode' ? 'Run Encode' : 'Run Decode',
  busy: loading.value,
  disabled: loading.value,
  shortcut: 'Cmd Enter',
  ariaLabel: mode.value === 'encode' ? 'Encode HTML entities in input' : 'Decode HTML entities in input',
}))

const secondaryActions = computed<ToolAction[]>(() => [
  { id: 'copy', label: 'Copy Output', disabled: !output.value || loading.value },
  { id: 'clear', label: 'Clear', disabled: loading.value },
  { id: 'swap', label: 'Swap I/O', disabled: !output.value || loading.value },
])

const outputPanelStats = computed(() => {
  if (!output.value) return null
  return { chars: output.value.length }
})
const visibleStatusPhase = computed(() => {
  if (loading.value) return 'loading'
  if (error.value) return 'error'
  return statusPhase.value
})
const visibleStatusMessage = computed(() => {
  if (loading.value) return 'Processing...'
  if (error.value) return error.value
  return statusMessage.value
})

async function handleSecondaryAction(id: string) {
  if (id === 'copy') {
    await toolbar.execute('copy')
    if (!error.value) {
      statusPhase.value = 'copied'
      statusMessage.value = 'Copied to clipboard.'
    }
    return
  }
  if (id === 'clear') {
    await toolbar.execute('clear')
    statusPhase.value = 'idle'
    statusMessage.value = null
    return
  }
  if (id === 'swap') {
    await toolbar.execute('swap')
  }
}

function clearStatus() {
  error.value = null
  statusPhase.value = 'idle'
  statusMessage.value = null
}

onMounted(() => init())
onUnmounted(() => dispose())
</script>

<template>
  <ToolLayout
    title="HTML Encode / Decode"
    description="Encode and decode HTML entities."
    :shortcut-hints="['Cmd Enter to run']"
    layout="io"
    @keydown="handleShortcut"
  >
    <template #options>
      <ToolOptionsRow>
        <div class="tool-field">
          <label class="tool-field-label">Mode</label>
          <ToolSegmentedControl
            :model-value="mode"
            :options="modeOptions"
            @update:model-value="handleModeChange"
          />
        </div>
      </ToolOptionsRow>
    </template>

    <template #workspace>
      <ToolWorkspace layout="io">
        <template #input>
          <InputOutputPanel
            title="Input"
            :stats="{ chars: input.length }"
            :invalid="!!error"
            :aria-label="mode === 'encode' ? 'Plain HTML or text input' : 'HTML-entity-encoded input'"
          >
            <textarea
              ref="inputEl"
              v-model="input"
              class="dt-textarea tool-textarea"
              rows="12"
              :placeholder="mode === 'encode' ? 'Enter HTML or text to encode...' : 'Enter HTML-entity-encoded string to decode...'"
              :aria-label="mode === 'encode' ? 'Plain HTML or text input' : 'HTML-entity-encoded input'"
              spellcheck="false"
              @blur="handleInputBlur"
              @compositionstart="handleCompositionStart"
              @compositionend="handleCompositionEnd"
            />
          </InputOutputPanel>
        </template>
        <template #output>
          <InputOutputPanel
            title="Output"
            :value="output ?? ''"
            readonly
            :placeholder="mode === 'encode' ? 'HTML-encoded output will appear here.' : 'Decoded text output will appear here.'"
            :stats="output ? outputPanelStats : null"
            :aria-label="mode === 'encode' ? 'HTML-encoded output' : 'Decoded text output'"
          />
        </template>
      </ToolWorkspace>
    </template>

    <template #actions>
      <ToolActionBar
        :primary="primaryAction"
        :secondary="secondaryActions"
        @primary-pointer-down="handlePointerDown"
        @primary-click="handleClick"
        @action="handleSecondaryAction"
      />
    </template>

    <template #status>
      <ToolStatusBar
        :phase="visibleStatusPhase"
        :message="visibleStatusMessage"
        :clearable="!!visibleStatusMessage"
        @clear="clearStatus"
      />
    </template>
  </ToolLayout>
</template>

<style scoped>
.tool-field {
  display: flex;
  flex-direction: column;
  gap: var(--space-compact);
}

.tool-field-label {
  font-size: var(--text-label);
  font-weight: var(--weight-medium);
  color: var(--text-color-label);
}

.tool-textarea {
  flex: 1;
  min-height: var(--tool-textarea-min-height);
}
</style>
