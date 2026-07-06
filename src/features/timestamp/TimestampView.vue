<script setup lang="ts">
/**
 * Timestamp Plugin — Main View
 *
 * Phase 2 migration: ToolLayout skeleton with inspector layout.
 * Preserves the unique time-banner showing current time.
 * Business logic and composables unchanged.
 */

import { computed, onMounted, ref } from 'vue'
import { useTimestamp } from './composables'
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
import type { TimestampMode } from './types'

const { input, output, error, loading, mode, now, toolbar, execute, init, dispose } = useTimestamp()

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
  { label: 'Timestamp to Date', value: 'timestamp-to-date' },
  { label: 'Date to Timestamp', value: 'date-to-timestamp' },
]

const modeTriggeredByPointer = ref(false)

function handleModePointerDown(event: PointerEvent, next: TimestampMode) {
  event.preventDefault()
  event.stopPropagation()
  modeTriggeredByPointer.value = true
  syncInputFromDom()
  mode.value = next
  globalThis.setTimeout(() => { modeTriggeredByPointer.value = false }, 0)
}

function handleModeClick(next: TimestampMode) {
  if (modeTriggeredByPointer.value) return
  syncInputFromDom()
  mode.value = next
}

// ── Unified status bar ───────────────────────────────────────────────
const statusPhase = ref<'idle' | 'loading' | 'success' | 'error' | 'copied'>('idle')
const statusMessage = ref<string | null>(null)

const primaryAction = computed<ToolAction>(() => ({
  id: 'convert',
  label: 'Convert',
  busy: loading.value,
  disabled: loading.value,
  shortcut: 'Cmd Enter',
  ariaLabel: 'Convert',
}))

const secondaryActions = computed<ToolAction[]>(() => [
  { id: 'copy', label: 'Copy Output', disabled: !output.value || loading.value },
  { id: 'clear', label: 'Clear', disabled: loading.value },
])

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
</script>

<template>
  <ToolLayout
    title="Timestamp Converter"
    description="Convert Unix timestamps and date strings."
    :shortcut-hints="['Cmd Enter to convert']"
    layout="inspector"
    @keydown="handleShortcut"
  >
    <template #options>
      <!-- Current Time Banner — unique to Timestamp -->
      <div class="time-banner">
        <div class="time-row"><span class="time-label">Unix Seconds</span> <span class="time-value">{{ now.seconds }}</span></div>
        <div class="time-row"><span class="time-label">Unix Millis</span> <span class="time-value">{{ now.milliseconds }}</span></div>
        <div class="time-row"><span class="time-label">ISO 8601</span> <span class="time-value">{{ now.iso }}</span></div>
        <div class="time-row"><span class="time-label">Local</span> <span class="time-value">{{ now.local }}</span></div>
      </div>

      <ToolOptionsRow>
        <ToolOptionGroup label="Mode">
          <ToolSegmentedControl
            :model-value="mode"
            :options="modeOptions"
            @update:model-value="(v: string) => handleModeClick(v as TimestampMode)"
          />
        </ToolOptionGroup>
      </ToolOptionsRow>
    </template>

    <template #workspace>
      <ToolWorkspace layout="inspector">
        <template #input>
          <InputOutputPanel
            title="Input"
            :invalid="!!error"
            :aria-label="mode === 'timestamp-to-date' ? 'Unix timestamp (seconds or milliseconds)' : 'Date string (ISO 8601, etc.)'"
          >
            <input
              ref="inputEl"
              v-model="input"
              class="dt-input tool-input"
              type="text"
              :placeholder="mode === 'timestamp-to-date' ? 'e.g. 1700000000 or 1700000000000' : 'e.g. 2024-01-01T00:00:00Z'"
              :aria-label="mode === 'timestamp-to-date' ? 'Unix timestamp (seconds or milliseconds)' : 'Date string (ISO 8601, etc.)'"
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
            placeholder="Conversion output will appear here."
            :stats="output ? { chars: output.length } : null"
            aria-label="Conversion output"
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
.tool-input {
  flex: 1;
}

/* ── Current Time Banner — unique to Timestamp ───────────────────── */
.time-banner {
  background: var(--color-surface-panel);
  border: var(--border-width-thin) solid var(--border-color-subtle);
  border-radius: var(--radius-xl);
  padding: var(--space-4) var(--space-5);
  margin-bottom: var(--space-3);
}

.time-row {
  display: flex;
  justify-content: space-between;
  padding: 2px 0;
}

.time-label {
  font-size: var(--text-caption);
  color: var(--text-color-card-header);
  font-weight: var(--weight-medium);
}

.time-value {
  font-size: var(--text-body);
  color: var(--text-color-body);
  font-family: var(--font-mono);
}
</style>
