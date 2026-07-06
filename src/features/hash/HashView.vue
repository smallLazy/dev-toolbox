<script setup lang="ts">
/**
 * Hash Plugin — Main View
 *
 * Phase 2 migration: ToolLayout skeleton with unified status bar.
 * Business logic and composables unchanged.
 */

import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useHash } from './composables'
import { useTextActionTrigger } from '@/composables/useTextActionTrigger'
import ToolLayout from '@/templates/ToolLayout.vue'
import ToolWorkspace from '@/templates/ToolWorkspace.vue'
import InputOutputPanel from '@/templates/InputOutputPanel.vue'
import ToolActionBar from '@/templates/ToolActionBar.vue'
import ToolOptionsRow from '@/templates/ToolOptionsRow.vue'
import ToolOptionGroup from '@/templates/ToolOptionGroup.vue'
import ToolStatusBar from '@/templates/ToolStatusBar.vue'
import ToolSegmentedControl from '@/templates/ToolSegmentedControl.vue'
import type { ToolAction } from '@/templates/types'
import type { HashAlgorithm } from './types'

const { input, output, error, loading, algorithm, outputStats, toolbar, execute, init, dispose } =
  useHash()

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

const algorithmOptions = [
  { label: 'MD5', value: 'md5' },
  { label: 'SHA-256', value: 'sha256' },
]

const algoTriggeredByPointer = ref(false)

function handleAlgoPointerDown(event: PointerEvent, next: HashAlgorithm) {
  event.preventDefault()
  event.stopPropagation()
  algoTriggeredByPointer.value = true
  syncInputFromDom()
  algorithm.value = next
  globalThis.setTimeout(() => { algoTriggeredByPointer.value = false }, 0)
}

function handleAlgoClick(next: HashAlgorithm) {
  if (algoTriggeredByPointer.value) return
  syncInputFromDom()
  algorithm.value = next
}

// ── Unified status bar ───────────────────────────────────────────────
const statusPhase = ref<'idle' | 'loading' | 'success' | 'error' | 'copied'>('idle')
const statusMessage = ref<string | null>(null)

const primaryAction = computed<ToolAction>(() => ({
  id: 'generate',
  label: 'Generate',
  busy: loading.value,
  disabled: loading.value,
  shortcut: 'Cmd Enter',
  ariaLabel: 'Generate hash',
}))

const secondaryActions = computed<ToolAction[]>(() => [
  { id: 'copy', label: 'Copy Output', disabled: !output.value || loading.value },
  { id: 'clear', label: 'Clear', disabled: loading.value },
])

const outputPanelStats = computed(() => {
  if (!output.value || !outputStats.value) return null
  return { chars: outputStats.value.chars }
})
const visibleStatusPhase = computed(() => {
  if (loading.value) return 'loading'
  if (error.value) return 'error'
  return statusPhase.value
})
const visibleStatusMessage = computed(() => {
  if (loading.value) return 'Generating...'
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
    title="Hash Generator"
    description="Generate MD5 and SHA-256 hashes."
    :shortcut-hints="['Cmd Enter to generate']"
    layout="io"
    @keydown="handleShortcut"
  >
    <template #options>
      <ToolOptionsRow>
        <ToolOptionGroup label="Algorithm">
          <ToolSegmentedControl
            :model-value="algorithm"
            :options="algorithmOptions"
            @update:model-value="(v: string) => handleAlgoClick(v as HashAlgorithm)"
          />
        </ToolOptionGroup>
      </ToolOptionsRow>
    </template>

    <template #workspace>
      <ToolWorkspace layout="io">
        <template #input>
          <InputOutputPanel
            title="Input"
            :stats="{ chars: input.length }"
            :invalid="!!error"
            aria-label="Text input to hash"
          >
            <textarea
              ref="inputEl"
              v-model="input"
              class="dt-textarea tool-textarea hash-textarea"
              rows="12"
              placeholder="Enter text to hash..."
              aria-label="Text input to hash"
              spellcheck="false"
              @blur="handleInputBlur"
              @compositionstart="handleCompositionStart"
              @compositionend="handleCompositionEnd"
            />
          </InputOutputPanel>
        </template>
        <template #output>
          <InputOutputPanel
            title="Output (Hex)"
            :value="output ?? ''"
            readonly
            placeholder="Hash output will appear here."
            :stats="output ? outputPanelStats : null"
            aria-label="Hash output"
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

.hash-textarea {
  font-family: var(--font-mono);
}
</style>
