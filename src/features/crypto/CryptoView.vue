<script setup lang="ts">
/**
 * Crypto (AES) Plugin — Main View
 *
 * AES-256 symmetric encryption via Tauri native command.
 * Supports CBC and ECB modes with configurable encodings.
 */

import { onMounted } from 'vue'
import { useCrypto } from './composables'
import { useTextActionTrigger } from '@/composables/useTextActionTrigger'
import { usePointerSafeAction } from '@/composables/usePointerSafeAction'
import ToolSegmentedControl from '@/templates/ToolSegmentedControl.vue'
import ToolOptionGroup from '@/templates/ToolOptionGroup.vue'

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

// ── Pointer-safe actions ─────────────────────────────────────────────
const copyAction = usePointerSafeAction()
const clearAction = usePointerSafeAction({ disabled: () => loading.value })
const swapAction = usePointerSafeAction({ disabled: () => loading.value })

// ── Lifecycle ────────────────────────────────────────────────────────
onMounted(() => init())
</script>

<template>
  <div class="page" @keydown="handleShortcut">
    <header class="page-header">
      <h1 class="page-title">AES</h1>
      <p class="page-desc">
        AES-256 symmetric encryption using CBC or ECB mode &mdash; <kbd>&#8984;Enter</kbd> to execute
      </p>
    </header>

    <div class="page-content">
      <!-- Configuration Card -->
      <div class="card">
        <div class="card-header">Configuration</div>
        <div class="card-body">
          <div class="form-grid">
            <!-- Operation -->
            <ToolOptionGroup label="Operation">
              <ToolSegmentedControl
                :model-value="mode"
                :options="[{ label: 'Encrypt', value: 'encrypt' }, { label: 'Decrypt', value: 'decrypt' }]"
                @update:model-value="(v: string) => mode = v as 'encrypt' | 'decrypt'"
              />
            </ToolOptionGroup>

            <ToolOptionGroup label="Algorithm">
              <select v-model="inConfig.algorithm" class="dt-select">
                <option value="aes-256-cbc">AES-256-CBC</option>
                <option value="aes-256-ecb">AES-256-ECB</option>
              </select>
            </ToolOptionGroup>

            <!-- Key -->
            <ToolOptionGroup label="Key">
              <input
                v-model="key"
                type="text"
                class="dt-input"
                placeholder="32-byte key"
                spellcheck="false"
              />
            </ToolOptionGroup>

            <!-- IV (CBC only) -->
            <ToolOptionGroup v-if="inConfig.algorithm === 'aes-256-cbc'" label="IV">
              <input
                v-model="iv"
                type="text"
                class="dt-input"
                placeholder="16-byte IV for CBC"
                spellcheck="false"
              />
            </ToolOptionGroup>

            <!-- Key Encoding -->
            <ToolOptionGroup label="Key Encoding">
              <select v-model="inConfig.keyEncoding" class="dt-select">
                <option value="utf8">UTF-8</option>
                <option value="hex">Hex</option>
                <option value="base64">Base64</option>
              </select>
            </ToolOptionGroup>

            <!-- IV Encoding (CBC only) -->
            <ToolOptionGroup v-if="inConfig.algorithm === 'aes-256-cbc'" label="IV Encoding">
              <select v-model="inConfig.ivEncoding" class="dt-select">
                <option value="utf8">UTF-8</option>
                <option value="hex">Hex</option>
                <option value="base64">Base64</option>
              </select>
            </ToolOptionGroup>

            <!-- Input Encoding -->
            <ToolOptionGroup label="Input Encoding">
              <select v-model="inConfig.inputEncoding" class="dt-select">
                <option value="utf8">UTF-8</option>
                <option value="hex">Hex</option>
                <option value="base64">Base64</option>
              </select>
            </ToolOptionGroup>

            <!-- Output Encoding -->
            <ToolOptionGroup label="Output Encoding">
              <select v-model="inConfig.outputEncoding" class="dt-select">
                <option value="hex">Hex</option>
                <option value="base64">Base64</option>
              </select>
            </ToolOptionGroup>
          </div>
        </div>
      </div>

      <!-- Input Card -->
      <div class="card">
        <div class="card-header">Input</div>
        <div class="card-body">
          <textarea
            ref="inputEl"
            v-model="input"
            class="dt-textarea"
            rows="5"
            :aria-label="mode === 'encrypt' ? 'Plaintext to encrypt' : 'Ciphertext to decrypt'"
            :placeholder="mode === 'encrypt' ? 'Enter plaintext to encrypt...' : 'Enter ciphertext to decrypt...'"
            spellcheck="false"
            @blur="handleInputBlur"
            @compositionstart="handleCompositionStart"
            @compositionend="handleCompositionEnd"
          />
        </div>
      </div>

      <!-- Action Bar -->
      <div class="action-bar">
        <button
          type="button"
          class="btn-accent"
          :disabled="loading"
          :aria-label="mode === 'encrypt' ? 'Encrypt' : 'Decrypt'"
          @pointerdown="handlePointerDown"
          @click="handleClick"
        >{{ loading ? 'Processing...' : (mode === 'encrypt' ? 'Encrypt' : 'Decrypt') }}</button>
        <button
          v-if="output"
          type="button"
          class="btn-secondary"
          aria-label="Copy output to clipboard"
          @pointerdown="copyAction.handlePointerDown($event, () => toolbar.execute('copy'))"
          @click="copyAction.handleClick(() => toolbar.execute('copy'))"
        >Copy Output</button>
        <button
          type="button"
          class="btn-secondary"
          aria-label="Clear input and output"
          @pointerdown="clearAction.handlePointerDown($event, () => toolbar.execute('clear'))"
          @click="clearAction.handleClick(() => toolbar.execute('clear'))"
        >Clear</button>
        <button
          type="button"
          class="btn-secondary"
          aria-label="Switch between encrypt and decrypt"
          @pointerdown="swapAction.handlePointerDown($event, () => toolbar.execute('swap'))"
          @click="swapAction.handleClick(() => toolbar.execute('swap'))"
        >Switch Mode</button>
      </div>

      <!-- Error -->
      <div v-if="error" class="alert-error" role="alert">{{ error }}</div>

      <!-- Output Card -->
      <div v-if="output" class="card card-output">
        <div class="card-header" role="status" aria-live="assertive">Output</div>
        <div class="card-body">
          <textarea
            :value="output"
            class="dt-textarea"
            rows="5"
            readonly
            spellcheck="false"
            aria-label="Encryption or decryption output"
            aria-live="polite"
          />
        </div>
      </div>

      <!-- Empty State -->
      <div v-if="!output && !error && !input && !key" class="card">
        <div class="card-body empty-hint">
          <p>AES-256 Symmetric Encryption</p>
          <p class="hint-desc">
            Enter a key, configure encodings, and type or paste input above.
            Click <strong>Encrypt</strong> or press <kbd>&#8984;Enter</kbd> to run.
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.page { max-width: var(--content-max-width); margin: 0 auto; }
.page-header { margin-bottom: var(--space-6); }
.page-title { font-size: var(--text-title); font-weight: var(--weight-semibold); color: var(--color-neutral-110); margin-bottom: var(--space-1); letter-spacing: -0.01em; }
.page-desc { font-size: var(--text-body); color: var(--color-neutral-70); }
.page-desc kbd { font-size: var(--text-caption); padding: 1px 5px; background: var(--color-neutral-40); border: var(--border-width-thin) solid var(--border-color-default); border-radius: var(--radius-sm); font-family: var(--font-mono); }
.page-content { display: flex; flex-direction: column; gap: var(--space-3); }

.card { background: var(--color-neutral-35); border: var(--border-width-thin) solid var(--border-color-subtle); border-radius: var(--radius-xl); overflow: hidden; }
.card-header { padding: var(--space-card-header-y) var(--space-5); font-size: var(--text-caption); font-weight: var(--weight-medium); color: var(--color-neutral-60); text-transform: uppercase; letter-spacing: 0.06em; border-bottom: var(--border-width-thin) solid var(--border-color-subtle); }
.card-body { padding: var(--space-4) var(--space-5); }
.card-output { border-color: var(--border-color-focus); }
.card-output .card-body { background: var(--color-neutral-15); }

.form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-3); }

.action-bar { display: flex; gap: var(--space-2); flex-wrap: wrap; }

.empty-hint { text-align: center; padding: var(--space-8) 0; }
.empty-hint p { font-size: var(--text-base); color: var(--color-neutral-90); }
.empty-hint .hint-desc { font-size: var(--text-body); color: var(--color-neutral-70); margin-top: var(--space-1); }
.empty-hint kbd { font-size: var(--text-caption); padding: 1px 5px; background: var(--color-neutral-40); border: var(--border-width-thin) solid var(--border-color-default); border-radius: var(--radius-sm); font-family: var(--font-mono); }
</style>
