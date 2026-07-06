<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref } from 'vue'
import { useJsonPlugin } from './composables'
import { useTextActionTrigger } from '@/composables/useTextActionTrigger'
import ToolLayout from '@/templates/ToolLayout.vue'
import ToolWorkspace from '@/templates/ToolWorkspace.vue'
import InputOutputPanel from '@/templates/InputOutputPanel.vue'
import ToolActionBar from '@/templates/ToolActionBar.vue'
import ToolStatusBar from '@/templates/ToolStatusBar.vue'
import type { ToolAction } from '@/templates/types'
import type { JsonMode } from './types'

const {
  input, output, error, loading, stats,
  toolbar, execute, selectMode, loadExample, init, dispose,
} = useJsonPlugin()

const {
  inputEl,
  syncInputFromDom,
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
  disabled: loading.value,
  shortcut: 'Cmd Enter',
  ariaLabel: 'Format JSON',
}))

const secondaryActions = computed<ToolAction[]>(() => [
  { id: 'minify', label: 'Minify', disabled: loading.value },
  { id: 'validate', label: 'Validate', disabled: loading.value },
  { id: 'copy', label: 'Copy Result', disabled: !output.value || loading.value },
  { id: 'clear', label: 'Clear', disabled: loading.value },
  { id: 'example', label: 'Example', disabled: loading.value },
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

async function runMode(nextMode: JsonMode) {
  syncInputFromDom()
  selectMode(nextMode)
  await nextTick()
  await execute()
  if (!error.value && output.value) {
    statusPhase.value = 'success'
    if (nextMode === 'format') {
      statusMessage.value = 'Formatted successfully'
    } else if (nextMode === 'minify') {
      statusMessage.value = 'Minified successfully'
    } else if (nextMode === 'validate') {
      statusMessage.value = 'Valid JSON'
    }
  }
}

async function runFormat() {
  await runMode('format')
}

async function handleSecondaryAction(id: string) {
  if (id === 'minify' || id === 'validate') {
    await runMode(id)
    return
  }

  if (id === 'copy') {
    await toolbar.execute('copy')
    if (!error.value) {
      statusPhase.value = 'copied'
      statusMessage.value = 'Copied to clipboard'
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
    // Auto-format — runFormat sets the final status message
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
    title="JSON Formatter"
    description="Format, minify, and validate JSON."
    :shortcut-hints="['Cmd Enter to format']"
    layout="editor"
    @keydown="handleShortcut"
  >
    <template #workspace>
      <ToolWorkspace layout="editor">
        <template #input>
          <InputOutputPanel
            title="Input"
            :stats="{ chars: input.length }"
            :invalid="!!error"
            aria-label="JSON input"
          >
            <textarea
              ref="inputEl"
              v-model="input"
              class="dt-textarea tool-textarea mono-editor"
              rows="14"
              placeholder='Paste JSON text, for example {"name":"Dev Toolbox","version":"1.0.0"}'
              aria-label="JSON input"
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
            placeholder="Output will appear here."
            :stats="output ? outputPanelStats : null"
            aria-label="JSON output"
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
