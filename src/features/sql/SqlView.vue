<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useSql } from './composables'
import { useTextActionTrigger } from '@/composables/useTextActionTrigger'
import ToolLayout from '@/templates/ToolLayout.vue'
import ToolWorkspace from '@/templates/ToolWorkspace.vue'
import InputOutputPanel from '@/templates/InputOutputPanel.vue'
import ToolActionBar from '@/templates/ToolActionBar.vue'
import ToolOptionsRow from '@/templates/ToolOptionsRow.vue'
import ToolStatusBar from '@/templates/ToolStatusBar.vue'
import ToolSegmentedControl from '@/templates/ToolSegmentedControl.vue'
import type { SqlInValueType, SqlInLineMode } from './types'
import type { ToolAction } from '@/templates/types'

const { input, output, error, loading, inConfig, toolbar, execute, init, dispose } = useSql()

const {
  inputEl,
  handleCompositionStart,
  handleCompositionEnd,
  handleInputBlur,
  handlePointerDown,
  handleClick,
  handleShortcut,
} = useTextActionTrigger({ model: input, loading, execute })

const statusPhase = ref<'idle' | 'loading' | 'success' | 'error' | 'copied'>('idle')
const statusMessage = ref<string | null>(null)

const valueTypeOptions = [
  { label: 'String', value: 'string' },
  { label: 'Number', value: 'number' },
]

const outputLayoutOptions = [
  { label: 'Single Line', value: 'single' },
  { label: 'Multi Line', value: 'multi' },
]

const primaryAction = computed<ToolAction>(() => ({
  id: 'convert',
  label: 'Convert',
  busy: loading.value,
  disabled: loading.value,
  shortcut: 'Cmd Enter',
  ariaLabel: 'Build SQL IN list',
}))

const secondaryActions = computed<ToolAction[]>(() => [
  { id: 'copy', label: 'Copy Result', disabled: !output.value || loading.value },
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
  if (loading.value) return 'Converting...'
  if (error.value) return error.value
  return statusMessage.value
})

function handleValueTypeChange(newVal: string) {
  inConfig.valueType = newVal as SqlInValueType
}

function handleLineModeChange(newVal: string) {
  inConfig.lineMode = newVal as SqlInLineMode
}

async function handleSecondaryAction(id: string) {
  if (id === 'copy') {
    await toolbar.execute('copy')
    if (!error.value) {
      statusPhase.value = 'copied'
      statusMessage.value = 'Result copied to clipboard.'
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
    title="SQL IN Builder"
    description="Build SQL IN lists from batch values."
    :shortcut-hints="['Cmd Enter to convert']"
    layout="io"
    @keydown="handleShortcut"
  >
    <template #options>
      <ToolOptionsRow>
        <div class="tool-field">
          <label class="tool-field-label">Value Type</label>
          <ToolSegmentedControl
            :model-value="inConfig.valueType"
            :options="valueTypeOptions"
            @update:model-value="handleValueTypeChange"
          />
        </div>
        <div class="tool-field">
          <label class="tool-field-label">Output Layout</label>
          <ToolSegmentedControl
            :model-value="inConfig.lineMode"
            :options="outputLayoutOptions"
            @update:model-value="handleLineModeChange"
          />
        </div>
        <label class="tool-check-field">
          <input v-model="inConfig.wrapWithParentheses" type="checkbox" />
          <span>Wrap parentheses</span>
        </label>
        <label class="tool-check-field">
          <input v-model="inConfig.dedupe" type="checkbox" />
          <span>Remove duplicates</span>
        </label>
      </ToolOptionsRow>
    </template>

    <template #workspace>
      <ToolWorkspace layout="io">
        <template #input>
          <InputOutputPanel
            title="Input"
            :stats="{ chars: input.length }"
            :invalid="!!error"
            aria-label="Batch values to convert to SQL IN list"
          >
            <textarea
              ref="inputEl"
              v-model="input"
              class="dt-textarea tool-textarea"
              rows="12"
              aria-label="Batch values to convert to SQL IN list"
              placeholder="1001&#10;1002&#10;1003"
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
            placeholder="SQL IN result will appear here."
            :stats="output ? outputPanelStats : null"
            aria-label="SQL IN output"
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

.tool-check-field {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  color: var(--text-color-body);
  font-size: var(--text-body);
  cursor: pointer;
  min-height: var(--space-control-min-height);
}

.tool-check-field input {
  width: var(--icon-sm);
  height: var(--icon-sm);
  accent-color: var(--color-accent-primary);
}

.tool-textarea {
  flex: 1;
  min-height: var(--tool-textarea-min-height);
  font-family: var(--font-mono);
  font-size: var(--text-body);
  line-height: var(--leading-normal);
}
</style>
