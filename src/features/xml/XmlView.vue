<script setup lang="ts">
/**
 * XML Formatter — Main View
 *
 * Supports Format, Minify, and Validate modes.
 * Uses ToolLayout + ToolWorkspace standard layout.
 */

import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useXml } from './composables'
import { useTextActionTrigger } from '@/composables/useTextActionTrigger'
import ToolLayout from '@/templates/ToolLayout.vue'
import ToolWorkspace from '@/templates/ToolWorkspace.vue'
import InputOutputPanel from '@/templates/InputOutputPanel.vue'
import ToolActionBar from '@/templates/ToolActionBar.vue'
import ToolStatusBar from '@/templates/ToolStatusBar.vue'
import type { ToolAction } from '@/templates/types'
import type { XmlMode } from './types'

const {
  input, output, error, loading, stats,
  toolbar, execute, selectMode, loadExample, init, dispose,
} = useXml()

const {
  inputEl,
  handleCompositionStart,
  handleCompositionEnd,
  handleInputBlur,
  handlePointerDown,
  handleClick,
  handleShortcut,
} = useTextActionTrigger({ model: input, loading, execute: runFormat })

const statusPhase = ref<'idle' | 'loading' | 'success' | 'error' | 'copied'>('idle')
const statusMessage = ref<string | null>('Ready')

const primaryAction = computed<ToolAction>(() => ({
  id: 'format',
  label: 'Format',
  busy: loading.value,
  disabled: loading.value || !input.value.trim(),
  shortcut: 'Cmd Enter',
  ariaLabel: 'Format XML',
}))

const secondaryActions = computed<ToolAction[]>(() => [
  { id: 'minify', label: 'Minify', disabled: loading.value || !input.value.trim() },
  { id: 'validate', label: 'Validate', disabled: loading.value || !input.value.trim() },
  { id: 'copy', label: 'Copy Output', disabled: !output.value || loading.value },
  { id: 'clear', label: 'Clear', disabled: loading.value },
  { id: 'example', label: 'Load Sample', disabled: loading.value },
])

const outputPanelStats = computed(() => {
  if (!stats.value || stats.value.chars === 0) return null
  return { chars: stats.value.chars, lines: stats.value.lines }
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

async function runMode(nextMode: XmlMode) {
  selectMode(nextMode)
  await execute()
  if (!error.value && output.value) {
    statusPhase.value = 'success'
    if (nextMode === 'format') {
      statusMessage.value = 'Formatted successfully'
    } else if (nextMode === 'minify') {
      statusMessage.value = 'Minified successfully'
    } else if (nextMode === 'validate') {
      statusMessage.value = 'Valid XML'
    }
  }
}

async function runFormat() {
  await runMode('format')
}

async function handleSecondaryAction(id: string) {
  if (id === 'minify' || id === 'validate') {
    await runMode(id as XmlMode)
    return
  }

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
    statusMessage.value = 'Ready'
    return
  }

  if (id === 'example') {
    loadExample()
    await runFormat()
  }
}

function clearStatus() {
  error.value = null
  statusPhase.value = 'idle'
  statusMessage.value = 'Ready'
}

onMounted(() => init())
onUnmounted(() => dispose())
</script>

<template>
  <ToolLayout
    title="XML Formatter"
    description="Format, minify, and validate XML."
    :shortcut-hints="['Cmd Enter to format']"
    layout="io"
    @keydown="handleShortcut"
  >
    <template #workspace>
      <ToolWorkspace layout="io">
        <template #input>
          <InputOutputPanel
            title="Input"
            :stats="{ chars: input.length }"
            :invalid="!!error"
            aria-label="XML input"
          >
            <textarea
              ref="inputEl"
              v-model="input"
              class="dt-textarea tool-textarea mono-editor"
              rows="14"
              placeholder="Paste or type XML here..."
              aria-label="XML input"
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
            placeholder="Formatted XML output will appear here."
            :stats="output ? outputPanelStats : null"
            aria-label="XML output"
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
.tool-textarea {
  flex: 1;
  min-height: var(--tool-textarea-min-height);
}

.mono-editor {
  font-family: var(--font-mono);
  font-size: var(--text-body);
  line-height: var(--leading-normal);
  tab-size: 2;
}
</style>
