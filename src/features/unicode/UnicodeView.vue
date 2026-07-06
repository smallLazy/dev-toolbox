<script setup lang="ts">
/**
 * Unicode Plugin — Main View
 *
 * Phase 2 migration: ToolLayout skeleton with unified status bar.
 * Business logic and composables unchanged.
 */

import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useUnicode } from './composables'
import { useTextActionTrigger } from '@/composables/useTextActionTrigger'
import ToolLayout from '@/templates/ToolLayout.vue'
import ToolWorkspace from '@/templates/ToolWorkspace.vue'
import InputOutputPanel from '@/templates/InputOutputPanel.vue'
import ToolActionBar from '@/templates/ToolActionBar.vue'
import ToolOptionsRow from '@/templates/ToolOptionsRow.vue'
import ToolStatusBar from '@/templates/ToolStatusBar.vue'
import ToolSegmentedControl from '@/templates/ToolSegmentedControl.vue'
import type { ToolAction } from '@/templates/types'

const {
  input, output, error, loading, mode, variant,
  stats, outputStats, toolbar,
  selectMode, selectVariant, execute, init, dispose,
} = useUnicode()

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

const variantOptions = [
  { label: 'JavaScript', value: 'javascript' },
  { label: 'Code Point', value: 'code-point' },
]

function handleModeChange(newMode: string) {
  syncInputFromDom()
  selectMode(newMode as 'encode' | 'decode')
}

function handleVariantChange(newVariant: string) {
  syncInputFromDom()
  selectVariant(newVariant as 'javascript' | 'code-point')
}

// ── Unified status bar ───────────────────────────────────────────────
const statusPhase = ref<'idle' | 'loading' | 'success' | 'error' | 'copied'>('idle')
const statusMessage = ref<string | null>(null)

const primaryAction = computed<ToolAction>(() => ({
  id: 'run',
  label: mode.value === 'encode' ? 'Encode' : 'Decode',
  busy: loading.value,
  disabled: loading.value,
  shortcut: 'Cmd Enter',
  ariaLabel: mode.value === 'encode'
    ? (variant.value === 'code-point' ? 'Encode to U+XXXX code points' : 'Encode to \\uXXXX escape sequences')
    : (variant.value === 'code-point' ? 'Decode from U+XXXX code points' : 'Decode from \\uXXXX escape sequences'),
}))

const secondaryActions = computed<ToolAction[]>(() => [
  { id: 'copy', label: 'Copy Output', disabled: !output.value || loading.value },
  { id: 'swap', label: 'Swap I/O', disabled: !output.value || loading.value },
  { id: 'clear', label: 'Clear', disabled: loading.value },
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
    title="Unicode Encode / Decode"
    description="Encode and decode Unicode escape sequences."
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
        <div class="tool-field">
          <label class="tool-field-label">Variant</label>
          <ToolSegmentedControl
            :model-value="variant"
            :options="variantOptions"
            @update:model-value="handleVariantChange"
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
            :aria-label="mode === 'encode' ? 'Plain text input' : 'Unicode escape input'"
          >
            <textarea
              ref="inputEl"
              v-model="input"
              class="dt-textarea tool-textarea"
              rows="12"
              :placeholder="mode === 'encode'
                ? (variant === 'code-point' ? 'Enter text to encode to U+XXXX...' : 'Enter text to encode to \\uXXXX...')
                : (variant === 'code-point' ? 'Enter U+XXXX code points to decode...' : 'Enter \\uXXXX escape sequences to decode...')"
              :aria-label="mode === 'encode' ? 'Plain text input' : 'Unicode escape input'"
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
            placeholder="Unicode output will appear here."
            :stats="output ? outputPanelStats : null"
            :aria-label="mode === 'encode' ? 'Unicode encoded output' : 'Decoded text output'"
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
