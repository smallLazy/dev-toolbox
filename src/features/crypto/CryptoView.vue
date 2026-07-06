<script setup lang="ts">
/**
 * Crypto (AES) Plugin — Main View
 *
 * AES-256 symmetric encryption via Tauri native command.
 * Supports CBC and ECB modes with configurable encodings.
 *
 * Phase 4.1: Migrated to unified ToolLayout / ToolWorkspace structure.
 */

import { computed, onMounted, ref } from 'vue'
import { useCrypto } from './composables'
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

const {
  input, key, iv, output, error, loading,
  mode, inConfig, toolbar, execute, init, dispose,
} = useCrypto()

// ── useTextActionTrigger for Execute ─────────────────────────────────
const {
  inputEl,
  handleCompositionStart,
  handleCompositionEnd,
  handleInputBlur,
  handlePointerDown,
  handleClick,
  handleShortcut,
} = useTextActionTrigger({ model: input, loading, execute })

// ── Mode options ─────────────────────────────────────────────────────
const modeOptions = [
  { label: 'Encrypt', value: 'encrypt' },
  { label: 'Decrypt', value: 'decrypt' },
]

// ── Status bar ───────────────────────────────────────────────────────
const statusPhase = ref<'idle' | 'loading' | 'success' | 'error' | 'copied'>('idle')
const statusMessage = ref<string | null>(null)

// ── Actions ──────────────────────────────────────────────────────────
const primaryAction = computed<ToolAction>(() => ({
  id: 'run',
  label: mode.value === 'encrypt' ? 'Encrypt' : 'Decrypt',
  busy: loading.value,
  disabled: loading.value,
  shortcut: 'Cmd Enter',
  ariaLabel: mode.value === 'encrypt' ? 'Encrypt input with AES' : 'Decrypt input with AES',
}))

const secondaryActions = computed<ToolAction[]>(() => [
  { id: 'copy', label: 'Copy Output', disabled: !output.value || loading.value },
  { id: 'swap', label: 'Swap I/O', disabled: !output.value || loading.value },
  { id: 'clear', label: 'Clear', disabled: loading.value },
])

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

// ── Lifecycle ────────────────────────────────────────────────────────
onMounted(() => init())
</script>

<template>
  <ToolLayout
    title="AES"
    description="AES-256 symmetric encryption using CBC or ECB mode."
    :shortcut-hints="['Cmd Enter to run']"
    layout="io"
    @keydown="handleShortcut"
  >
    <template #options>
      <ToolOptionsRow>
        <div class="aes-options-grid">
          <ToolOptionGroup label="Operation">
            <ToolSegmentedControl
              :model-value="mode"
              :options="modeOptions"
              @update:model-value="(v: string) => mode = v as 'encrypt' | 'decrypt'"
            />
          </ToolOptionGroup>

          <ToolOptionGroup label="Algorithm">
            <select v-model="inConfig.algorithm" class="dt-select">
              <option value="aes-256-cbc">AES-256-CBC</option>
              <option value="aes-256-ecb">AES-256-ECB</option>
            </select>
          </ToolOptionGroup>

          <ToolOptionGroup label="Key">
            <input
              v-model="key"
              type="text"
              class="dt-input"
              placeholder="32-byte key"
              spellcheck="false"
            />
          </ToolOptionGroup>

          <ToolOptionGroup v-if="inConfig.algorithm === 'aes-256-cbc'" label="IV">
            <input
              v-model="iv"
              type="text"
              class="dt-input"
              placeholder="16-byte IV for CBC"
              spellcheck="false"
            />
          </ToolOptionGroup>

          <ToolOptionGroup label="Key Encoding">
            <select v-model="inConfig.keyEncoding" class="dt-select">
              <option value="utf8">UTF-8</option>
              <option value="hex">Hex</option>
              <option value="base64">Base64</option>
            </select>
          </ToolOptionGroup>

          <ToolOptionGroup v-if="inConfig.algorithm === 'aes-256-cbc'" label="IV Encoding">
            <select v-model="inConfig.ivEncoding" class="dt-select">
              <option value="utf8">UTF-8</option>
              <option value="hex">Hex</option>
              <option value="base64">Base64</option>
            </select>
          </ToolOptionGroup>

          <ToolOptionGroup label="Input Encoding">
            <select v-model="inConfig.inputEncoding" class="dt-select">
              <option value="utf8">UTF-8</option>
              <option value="hex">Hex</option>
              <option value="base64">Base64</option>
            </select>
          </ToolOptionGroup>

          <ToolOptionGroup label="Output Encoding">
            <select v-model="inConfig.outputEncoding" class="dt-select">
              <option value="hex">Hex</option>
              <option value="base64">Base64</option>
            </select>
          </ToolOptionGroup>
        </div>
      </ToolOptionsRow>
    </template>

    <template #workspace>
      <ToolWorkspace layout="io">
        <template #input>
          <InputOutputPanel
            title="Input"
            :model-value="input"
            :stats="{ chars: input.length }"
            :invalid="!!error"
            :aria-label="mode === 'encrypt' ? 'Plaintext to encrypt' : 'Ciphertext to decrypt'"
          >
            <textarea
              ref="inputEl"
              v-model="input"
              class="dt-textarea tool-textarea"
              rows="12"
              :placeholder="mode === 'encrypt' ? 'Enter plaintext to encrypt...' : 'Enter ciphertext to decrypt...'"
              :aria-label="mode === 'encrypt' ? 'Plaintext to encrypt' : 'Ciphertext to decrypt'"
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
            :placeholder="mode === 'encrypt' ? 'Encrypted output will appear here.' : 'Decrypted output will appear here.'"
            :stats="output ? { chars: output.length } : null"
            :aria-label="mode === 'encrypt' ? 'Encrypted output' : 'Decrypted output'"
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
.aes-options-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-3);
  width: 100%;
}

.tool-textarea {
  flex: 1;
  min-height: var(--tool-textarea-min-height);
}

@media (max-width: 980px) {
  .aes-options-grid {
    grid-template-columns: 1fr;
  }
}
</style>
