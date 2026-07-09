<script setup lang="ts">
/**
 * QR Code Generator — Main View
 *
 * Generate QR codes from text, URLs, and other content.
 * Supports size, error correction, and margin configuration.
 */

import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useQrcode } from './composables'
import ToolLayout from '@/templates/ToolLayout.vue'
import ToolWorkspace from '@/templates/ToolWorkspace.vue'
import InputOutputPanel from '@/templates/InputOutputPanel.vue'
import ToolActionBar from '@/templates/ToolActionBar.vue'
import ToolStatusBar from '@/templates/ToolStatusBar.vue'
import type { ToolAction } from '@/templates/types'
import type { QrErrorCorrectionLevel } from './types'

const {
  input, dataUrl, error, loading, stats, options,
  toolbar, execute, downloadPng, updateOption, loadExample, init, dispose,
} = useQrcode()

const statusPhase = ref<'idle' | 'loading' | 'success' | 'error' | 'copied'>('idle')
const statusMessage = ref<string | null>('Ready')

const primaryAction = computed<ToolAction>(() => ({
  id: 'generate',
  label: 'Generate',
  busy: loading.value,
  disabled: loading.value || !input.value.trim(),
  shortcut: 'Cmd Enter',
  ariaLabel: 'Generate QR code',
}))

const secondaryActions = computed<ToolAction[]>(() => [
  { id: 'copy', label: 'Copy Image', disabled: !dataUrl.value || loading.value },
  { id: 'download', label: 'Download PNG', disabled: !dataUrl.value || loading.value },
  { id: 'clear', label: 'Clear', disabled: loading.value },
  { id: 'example', label: 'Load Sample', disabled: loading.value },
])

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

const outputStats = computed(() => {
  if (!stats.value) return null
  return {
    chars: stats.value.characters,
    lines: 1,
  }
})

async function handlePrimaryAction() {
  await execute()
  if (!error.value && dataUrl.value) {
    statusPhase.value = 'success'
    statusMessage.value = 'Generated successfully.'
  }
}

async function handleSecondaryAction(id: string) {
  if (id === 'copy') {
    await toolbar.execute('copy')
    if (!error.value) {
      statusPhase.value = 'copied'
      statusMessage.value = 'Copied to clipboard.'
    }
    return
  }

  if (id === 'download') {
    downloadPng()
    statusPhase.value = 'success'
    statusMessage.value = 'Downloaded.'
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
    // execute() is called inside loadExample
    if (!error.value && dataUrl.value) {
      statusPhase.value = 'success'
      statusMessage.value = 'Generated successfully.'
    }
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
    title="QR Code"
    description="Generate QR codes from text, URLs, and other content."
    :shortcut-hints="['Cmd Enter to generate']"
    layout="io"
  >
    <template #workspace>
      <ToolWorkspace layout="io">
        <template #input>
          <InputOutputPanel
            title="Content"
            :stats="{ chars: input.length }"
            :invalid="!!error"
            aria-label="QR Code content input"
          >
            <textarea
              v-model="input"
              class="dt-textarea tool-textarea"
              rows="8"
              placeholder="Enter text, URL, or any content to generate a QR code."
              aria-label="QR Code content input"
              spellcheck="false"
            />
            <div class="qr-options">
              <label class="opt-label">
                Size
                <select
                  :value="options.size"
                  class="opt-select"
                  @change="updateOption('size', Number(($event.target as HTMLSelectElement).value))"
                >
                  <option :value="128">128</option>
                  <option :value="256">256</option>
                  <option :value="512">512</option>
                  <option :value="1024">1024</option>
                </select>
              </label>
              <label class="opt-label">
                Error Correction
                <select
                  :value="options.errorCorrectionLevel"
                  class="opt-select"
                  @change="updateOption('errorCorrectionLevel', ($event.target as HTMLSelectElement).value as QrErrorCorrectionLevel)"
                >
                  <option value="L">L</option>
                  <option value="M">M</option>
                  <option value="Q">Q</option>
                  <option value="H">H</option>
                </select>
              </label>
              <label class="opt-label">
                Margin
                <input
                  type="number"
                  :value="options.margin"
                  min="0"
                  max="8"
                  class="opt-number"
                  @change="updateOption('margin', Number(($event.target as HTMLInputElement).value))"
                />
              </label>
            </div>
          </InputOutputPanel>
        </template>
        <template #output>
          <InputOutputPanel
            title="Preview"
            :stats="outputStats ?? undefined"
            aria-label="QR code preview"
          >
            <div v-if="dataUrl" class="qr-preview">
              <img :src="dataUrl" alt="QR Code" class="qr-image" />
            </div>
            <div v-else class="qr-empty">
              QR code preview will appear here.
            </div>
          </InputOutputPanel>
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

.qr-options {
  display: flex;
  gap: var(--space-4);
  padding-top: var(--space-3);
  border-top: var(--border-width-thin) solid var(--border-color-subtle);
}

.opt-label {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  font-size: var(--text-body);
  color: var(--color-neutral-80);
}

.opt-select {
  padding: var(--space-1) var(--space-2);
  border: var(--border-width-thin) solid var(--border-color-default);
  border-radius: var(--radius-md);
  background: var(--color-neutral-35);
  color: var(--color-neutral-110);
  font-size: var(--text-body);
  font-family: var(--font-sans);
}

.opt-select:focus {
  outline: none;
  border-color: var(--color-accent-primary);
}

.opt-number {
  width: 56px;
  padding: var(--space-1) var(--space-2);
  border: var(--border-width-thin) solid var(--border-color-default);
  border-radius: var(--radius-md);
  background: var(--color-neutral-35);
  color: var(--color-neutral-110);
  font-size: var(--text-body);
  font-family: var(--font-mono);
  text-align: center;
}

.opt-number:focus {
  outline: none;
  border-color: var(--color-accent-primary);
}

.qr-preview {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-4);
  flex: 1;
}

.qr-image {
  max-width: 100%;
  max-height: 320px;
  border-radius: var(--radius-md);
  image-rendering: pixelated;
}

.qr-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 1;
  color: var(--color-neutral-60);
  font-size: var(--text-body);
}
</style>
