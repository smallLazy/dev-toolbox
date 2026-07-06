<script setup lang="ts">
/**
 * PresetView — Generic Pipeline Preset UI
 *
 * Renders any PipelinePreset with encode/decode mode toggle,
 * input/output textareas, action bar, status bar, and contextual help.
 */
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { usePreset } from './composables'
import { useTextActionTrigger } from '@/composables/useTextActionTrigger'
import type { PipelinePreset } from '@/shared/pipeline/types'
import ToolLayout from '@/templates/ToolLayout.vue'
import ToolWorkspace from '@/templates/ToolWorkspace.vue'
import InputOutputPanel from '@/templates/InputOutputPanel.vue'
import ToolActionBar from '@/templates/ToolActionBar.vue'
import ToolOptionsRow from '@/templates/ToolOptionsRow.vue'
import ToolStatusBar from '@/templates/ToolStatusBar.vue'
import ToolSegmentedControl from '@/templates/ToolSegmentedControl.vue'
import type { ToolAction } from '@/templates/types'

// Preset registry — maps preset IDs to their definitions
const presetRegistry: Record<string, PipelinePreset> = {}

// Auto-register presets from barrel
import { phpCompatiblePreset } from './php-compatible.preset'
presetRegistry[phpCompatiblePreset.id] = phpCompatiblePreset

const route = useRoute()
const presetId = (route.meta?.preset as string) ?? 'php-compatible'
const preset = computed(() => presetRegistry[presetId])

const {
  input, output, error, loading, mode,
  pipelineResult, execute, clear, swap, copy, selectMode,
} = usePreset(preset.value!)

const statusPhase = ref<'idle' | 'loading' | 'success' | 'error' | 'copied'>('idle')
const statusMessage = ref<string | null>(null)

async function runPreset() {
  await execute()
  if (error.value) return
  if (output.value) {
    statusPhase.value = 'success'
    statusMessage.value = mode.value === 'encode'
      ? 'Encoding pipeline completed.'
      : 'Decoding pipeline completed.'
  }
}

const {
  inputEl,
  syncInputFromDom,
  handleCompositionStart,
  handleCompositionEnd,
  handleInputBlur,
  handlePointerDown,
  handleClick,
  handleShortcut,
} = useTextActionTrigger({ model: input, loading, execute: runPreset })

onMounted(() => {
  if (!presetRegistry[presetId]) {
    console.warn(`[PresetView] Unknown preset: "${presetId}"`)
  }
})

const showMigrationBanner = computed(() =>
  route.query?.from === preset.value?.deprecated?.oldRoute?.slice(1),
)

// ── Mode options for ToolSegmentedControl ─────────────────────────────
const modeOptions = [
  { label: 'Encode', value: 'encode' },
  { label: 'Decode', value: 'decode' },
]

function handleModeChange(value: string) {
  syncInputFromDom()
  selectMode(value as 'encode' | 'decode')
  statusPhase.value = 'idle'
  statusMessage.value = null
}

const primaryAction = computed<ToolAction>(() => ({
  id: 'run',
  label: mode.value === 'encode' ? 'Encode' : 'Decode',
  busy: loading.value,
  disabled: loading.value,
  shortcut: 'Cmd Enter',
  ariaLabel: mode.value === 'encode' ? 'Run PHP-compatible encode pipeline' : 'Run PHP-compatible decode pipeline',
}))

const secondaryActions = computed<ToolAction[]>(() => [
  { id: 'copy', label: 'Copy Output', disabled: !output.value || loading.value },
  { id: 'swap', label: 'Swap I/O', disabled: !output.value || loading.value },
  { id: 'clear', label: 'Clear', disabled: loading.value },
])

const outputStats = computed(() => {
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
    await copy()
    if (!error.value) {
      statusPhase.value = 'copied'
      statusMessage.value = 'Output copied to clipboard.'
    }
    return
  }

  if (id === 'swap') {
    swap()
    statusPhase.value = 'idle'
    statusMessage.value = null
    return
  }

  if (id === 'clear') {
    clear()
    statusPhase.value = 'idle'
    statusMessage.value = null
  }
}

function clearStatus() {
  error.value = null
  statusPhase.value = 'idle'
  statusMessage.value = null
}
</script>

<template>
  <ToolLayout
    v-if="preset"
    :title="preset.name"
    :description="preset.description"
    :shortcut-hints="['Cmd Enter to run']"
    layout="io"
    @keydown="handleShortcut"
  >
    <template #options>
      <ToolOptionsRow>
        <div class="field">
          <label class="field-label">Mode</label>
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
            :aria-label="mode === 'encode' ? 'PHP Codec plain text input' : 'PHP Codec encoded input'"
          >
            <textarea
              ref="inputEl"
              v-model="input"
              class="dt-textarea tool-textarea"
              rows="12"
              :placeholder="mode === 'encode' ? 'Enter text to encode...' : 'Enter text to decode...'"
              :aria-label="mode === 'encode' ? 'PHP Codec plain text input' : 'PHP Codec encoded input'"
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
            :placeholder="mode === 'encode' ? 'Encoded PHP-compatible output will appear here.' : 'Decoded text output will appear here.'"
            :stats="outputStats"
            aria-label="PHP Codec output"
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

      <div class="preset-help">
        <p v-if="showMigrationBanner" class="migration-note">
          Redirected from "{{ preset.deprecated?.oldName }}". {{ preset.deprecated?.migrationNote }}
        </p>

        <div class="pipeline-help">
          <h4 v-if="mode === 'encode'">Encode Pipeline</h4>
          <h4 v-else>Decode Pipeline</h4>
          <p class="pipeline">
            <code v-if="mode === 'encode'">
              Input -> URL Encode(PHP, spaces to +) -> Base64 Encode -> Remove trailing =
            </code>
            <code v-else>
              Input -> Restore Base64 padding -> Base64 Decode -> URL Decode(PHP)
            </code>
          </p>
          <p v-if="mode === 'encode'" class="pipeline-note">
            Note: This is not encryption. It is a compatibility encoding pipeline.
          </p>
          <p v-else class="pipeline-note">
            Note: This is not decryption. It is a compatibility decoding pipeline.
          </p>
          <p class="pipeline-note">
            Equivalent to PHP <code>base_encryption()</code> / <code>filter()</code>.
          </p>
          <div v-if="pipelineResult && pipelineResult.steps.length > 0" class="pipeline-summary">
            <span v-for="step in pipelineResult.steps" :key="step.stepId">
              {{ step.label }} {{ step.durationMs.toFixed(2) }}ms
            </span>
            <span>Total {{ pipelineResult.totalDurationMs.toFixed(2) }}ms</span>
          </div>
        </div>
      </div>
    </template>
  </ToolLayout>

  <div v-else class="page">
    <p>Unknown preset: {{ presetId }}</p>
  </div>
</template>

<style scoped>
.field { display: flex; flex-direction: column; gap: var(--space-compact); }
.field-label { font-size: var(--text-label); font-weight: var(--weight-medium); color: var(--color-neutral-80); }

.tool-textarea {
  flex: 1;
  min-height: var(--tool-textarea-min-height);
}

.preset-help {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  margin-top: var(--space-3);
}

.migration-note,
.pipeline-help {
  background: var(--color-info-bg);
  border: var(--border-width-thin) solid var(--color-info-border);
  border-radius: var(--radius-lg);
  padding: var(--space-4) var(--space-5);
}

.migration-note {
  color: var(--color-info-text);
  font-size: var(--text-body);
}

.pipeline-help h4 {
  font-size: var(--text-body);
  font-weight: var(--weight-medium);
  color: var(--color-info-text);
  margin-bottom: var(--space-2);
}

.pipeline-help .pipeline {
  margin-bottom: var(--space-2);
}

.pipeline-note {
  font-size: var(--text-label);
  color: var(--color-info-text);
  margin-bottom: var(--space-2);
  font-weight: var(--weight-medium);
}

.pipeline-help code {
  font-family: var(--font-mono);
  font-size: var(--text-caption);
  color: var(--color-info-text);
  background: var(--color-surface-code);
  padding: var(--space-kbd-y) var(--space-kbd-x);
  border-radius: var(--radius-sm);
}

.pipeline-summary {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
  padding-top: var(--space-2);
  border-top: var(--border-width-thin) solid var(--color-info-border);
  color: var(--color-neutral-80);
  font-size: var(--text-caption);
}
</style>
