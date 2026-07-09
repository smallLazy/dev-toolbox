<script setup lang="ts">
/**
 * UUID Generator / Validator — Main View
 *
 * Supports Generate, Validate, and Normalize modes.
 */

import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useUuid } from './composables'
import ToolLayout from '@/templates/ToolLayout.vue'
import ToolWorkspace from '@/templates/ToolWorkspace.vue'
import InputOutputPanel from '@/templates/InputOutputPanel.vue'
import ToolActionBar from '@/templates/ToolActionBar.vue'
import ToolStatusBar from '@/templates/ToolStatusBar.vue'
import type { ToolAction } from '@/templates/types'
import type { UuidMode } from './types'

const {
  input, output, error, loading, mode, count,
  toolbar, execute, selectMode, loadExample, init, dispose,
} = useUuid()

const statusPhase = ref<'idle' | 'loading' | 'success' | 'error' | 'copied'>('idle')
const statusMessage = ref<string | null>('Ready')

const showInput = computed(() => mode.value === 'validate' || mode.value === 'normalize')

const primaryAction = computed<ToolAction>(() => ({
  id: mode.value,
  label: mode.value === 'generate' ? 'Generate' : mode.value === 'validate' ? 'Validate' : 'Normalize',
  busy: loading.value,
  disabled: loading.value || (showInput.value && !input.value.trim()),
  shortcut: 'Cmd Enter',
  ariaLabel: `Run ${mode.value}`,
}))

const secondaryActions = computed<ToolAction[]>(() => [
  { id: 'validate', label: 'Validate', disabled: loading.value },
  { id: 'normalize', label: 'Normalize', disabled: loading.value },
  { id: 'copy', label: 'Copy Output', disabled: !output.value || loading.value },
  { id: 'clear', label: 'Clear', disabled: loading.value },
  { id: 'example', label: 'Load Sample', disabled: loading.value },
])

const outputPanelStats = computed(() => {
  if (!output.value) return null
  return { chars: output.value.length, lines: output.value.split('\n').length }
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

async function runMode(nextMode: UuidMode) {
  selectMode(nextMode)
  // execute is called inside selectMode for generate; for others we call it explicitly
  if (nextMode !== 'generate') {
    execute(nextMode)
  }
  if (!error.value && output.value) {
    statusPhase.value = 'success'
    statusMessage.value = nextMode === 'generate'
      ? `Generated ${output.value.split('\n').length} UUID(s)`
      : nextMode === 'validate'
        ? 'Validation complete'
        : 'Normalized'
  }
}

function handlePrimaryAction() {
  execute(mode.value)
  if (!error.value && output.value) {
    statusPhase.value = 'success'
    statusMessage.value = mode.value === 'generate'
      ? `Generated ${output.value.split('\n').length} UUID(s)`
      : mode.value === 'validate'
        ? 'Validation complete'
        : 'Normalized'
  }
}

async function handleSecondaryAction(id: string) {
  if (id === 'validate' || id === 'normalize') {
    await runMode(id as UuidMode)
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
    execute('validate')
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
    title="UUID"
    description="Generate, validate, and normalize UUIDs."
    :shortcut-hints="['Cmd Enter to run']"
    layout="io"
  >
    <template #workspace>
      <ToolWorkspace layout="io">
        <template #input>
          <InputOutputPanel
            v-if="showInput"
            title="Input"
            :stats="{ chars: input.length }"
            :invalid="!!error"
            aria-label="UUID input"
          >
            <textarea
              v-model="input"
              class="dt-textarea tool-textarea mono-editor"
              rows="6"
              placeholder="Paste a UUID to validate or normalize..."
              aria-label="UUID input"
              spellcheck="false"
            />
          </InputOutputPanel>
          <InputOutputPanel
            v-else
            title="Generate UUIDs"
            :stats="null"
            aria-label="UUID generator"
          >
            <div class="generate-controls">
              <label class="count-label">
                Count
                <input
                  v-model.number="count"
                  type="number"
                  min="1"
                  max="100"
                  class="count-input"
                  @change="execute('generate')"
                />
              </label>
              <span class="count-hint">1 – 100</span>
            </div>
          </InputOutputPanel>
        </template>
        <template #output>
          <InputOutputPanel
            title="Output"
            :value="output ?? ''"
            readonly
            placeholder="Generated UUIDs or validation result will appear here."
            :stats="output ? outputPanelStats : null"
            aria-label="UUID output"
          />
        </template>
      </ToolWorkspace>
    </template>

    <template #actions>
      <ToolActionBar
        :primary="primaryAction"
        :secondary="secondaryActions"
        @primary-click="handlePrimaryAction"
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
}

.generate-controls {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

.count-label {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  font-size: var(--text-body);
  color: var(--color-neutral-90);
}

.count-input {
  width: 72px;
  padding: var(--space-1) var(--space-2);
  border: var(--border-width-thin) solid var(--border-color-default);
  border-radius: var(--radius-md);
  background: var(--color-neutral-35);
  color: var(--color-neutral-110);
  font-family: var(--font-mono);
  font-size: var(--text-body);
  text-align: center;
}

.count-input:focus {
  outline: none;
  border-color: var(--color-accent-primary);
}

.count-hint {
  font-size: var(--text-caption);
  color: var(--color-neutral-60);
}
</style>
