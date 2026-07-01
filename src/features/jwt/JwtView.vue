<script setup lang="ts">
/**
 * JWT Plugin — Main View
 */

import { onMounted } from 'vue'
import { useJwt } from './composables'
import { useTextActionTrigger } from '@/composables/useTextActionTrigger'
import { usePointerSafeAction } from '@/composables/usePointerSafeAction'

const {
  input, result, output, error, loading,
  toolbar, execute, copyHeader, copyPayload, copySignature, init, dispose,
} = useJwt()

const { inputEl, handleCompositionStart, handleCompositionEnd, handleInputBlur, handlePointerDown, handleClick, handleShortcut }
  = useTextActionTrigger({ model: input, loading, execute })

const copyAllAction = usePointerSafeAction()
const clearAction = usePointerSafeAction({ disabled: () => loading.value })
const copyHeaderAction = usePointerSafeAction()
const copyPayloadAction = usePointerSafeAction()
const copySignatureAction = usePointerSafeAction()

onMounted(() => init())
</script>

<template>
  <div class="page" @keydown="handleShortcut">
    <header class="page-header">
      <h1 class="page-title">JWT Decoder</h1>
      <p class="page-desc">Decode JWT header, payload, and signature locally &mdash; <kbd>⌘Enter</kbd> to decode</p>
    </header>

    <div class="page-content">
      <!-- Notice -->
      <div class="notice">
        This tool decodes tokens locally. It does not verify signatures.
      </div>

      <!-- Input Card -->
      <div class="card">
        <div class="card-header">JWT Token</div>
        <div class="card-body">
          <textarea
            ref="inputEl"
            v-model="input"
            class="dt-textarea"
            rows="3"
            aria-label="JWT token input"
            placeholder="Paste JWT token here (eyJhbGciOi...)"
            spellcheck="false"
            @blur="handleInputBlur"
            @compositionstart="handleCompositionStart"
            @compositionend="handleCompositionEnd"
          />
        </div>
      </div>

      <!-- Action Bar -->
      <div class="action-bar">
        <button type="button" class="btn-accent" :disabled="loading" aria-label="Decode JWT"
          @pointerdown="handlePointerDown" @click="handleClick"
        >{{ loading ? 'Decoding...' : 'Decode' }}</button>
        <button v-if="output" class="btn-secondary" aria-label="Copy all decoded output"
          @pointerdown="copyAllAction.handlePointerDown($event, () => toolbar.execute('copy'))"
          @click="copyAllAction.handleClick(() => toolbar.execute('copy'))"
        >Copy All</button>
        <button class="btn-secondary" aria-label="Clear input and output"
          @pointerdown="clearAction.handlePointerDown($event, () => toolbar.execute('clear'))"
          @click="clearAction.handleClick(() => toolbar.execute('clear'))"
        >Clear</button>
      </div>

      <!-- Error -->
      <div v-if="error" class="alert-error" role="alert">{{ error }}</div>

      <!-- Header Card -->
      <div class="card" v-if="result">
        <div class="card-header">
          <span>Header</span>
          <button class="btn-sm" aria-label="Copy header"
            @pointerdown="copyHeaderAction.handlePointerDown($event, copyHeader)"
            @click="copyHeaderAction.handleClick(copyHeader)"
          >Copy</button>
        </div>
        <div class="card-body">
          <pre class="code-block">{{ result.header.formatted }}</pre>
        </div>
      </div>

      <!-- Payload Card -->
      <div class="card" v-if="result">
        <div class="card-header">
          <span>Payload</span>
          <button class="btn-sm" aria-label="Copy payload"
            @pointerdown="copyPayloadAction.handlePointerDown($event, copyPayload)"
            @click="copyPayloadAction.handleClick(copyPayload)"
          >Copy</button>
        </div>
        <div class="card-body">
          <pre class="code-block">{{ result.payload.formatted }}</pre>
        </div>
      </div>

      <!-- Claims Card -->
      <div class="card" v-if="result && (result.payloadInfo.exp || result.payloadInfo.iat || result.payloadInfo.nbf)">
        <div class="card-header">Claims</div>
        <div class="card-body">
          <div v-if="result.payloadInfo.iat" class="claim-row">
            <span class="claim-label">Issued At (iat)</span>
            <span class="claim-value">{{ result.payloadInfo.iat.iso }} ({{ result.payloadInfo.iat.local }})</span>
          </div>
          <div v-if="result.payloadInfo.nbf" class="claim-row">
            <span class="claim-label">Not Before (nbf)</span>
            <span class="claim-value">{{ result.payloadInfo.nbf.iso }} ({{ result.payloadInfo.nbf.local }})</span>
          </div>
          <div v-if="result.payloadInfo.exp" class="claim-row">
            <span class="claim-label">Expires (exp)</span>
            <span class="claim-value">
              {{ result.payloadInfo.exp.iso }} ({{ result.payloadInfo.exp.local }})
              <span v-if="result.payloadInfo.exp.expired" class="claim-expired">Expired</span>
              <span v-else class="claim-valid">Valid</span>
            </span>
          </div>
        </div>
      </div>

      <!-- Signature Card -->
      <div class="card card-signature" v-if="result">
        <div class="card-header">
          <span>Signature</span>
          <button class="btn-sm" aria-label="Copy signature"
            @pointerdown="copySignatureAction.handlePointerDown($event, copySignature)"
            @click="copySignatureAction.handleClick(copySignature)"
          >Copy</button>
        </div>
        <div class="card-body">
          <div class="sig-text">{{ result.signature }}</div>
        </div>
      </div>

      <!-- Empty State -->
      <div class="card" v-if="!result && !error && !input">
        <div class="card-body empty-hint">
          <p>JWT Decoder</p>
          <p class="hint-desc">Paste a JWT token above and click <strong>Decode</strong> or press <kbd>⌘Enter</kbd></p>
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

.notice { padding: var(--space-3) var(--space-4); background: var(--color-neutral-25); border: var(--border-width-thin) solid var(--border-color-subtle); border-radius: var(--radius-md); font-size: var(--text-caption); color: var(--color-neutral-70); }

.card { background: var(--color-neutral-35); border: var(--border-width-thin) solid var(--border-color-subtle); border-radius: var(--radius-xl); overflow: hidden; }
.card-header { padding: var(--space-card-header-y) var(--space-5); font-size: var(--text-caption); font-weight: var(--weight-medium); color: var(--color-neutral-60); text-transform: uppercase; letter-spacing: 0.06em; border-bottom: var(--border-width-thin) solid var(--border-color-subtle); display: flex; justify-content: space-between; align-items: center; }
.card-body { padding: var(--space-4) var(--space-5); }
.card-signature .card-body { background: var(--color-warning-bg); }

.code-block { font-size: var(--text-body); font-family: var(--font-mono); color: var(--color-neutral-100); white-space: pre-wrap; overflow-x: auto; margin: 0; }
.sig-text { font-size: var(--text-caption); font-family: var(--font-mono); color: var(--color-warning-text); word-break: break-all; }

.claim-row { display: flex; justify-content: space-between; padding: var(--space-1) 0; }
.claim-label { font-size: var(--text-body); color: var(--color-neutral-70); font-weight: var(--weight-medium); }
.claim-value { font-size: var(--text-body); color: var(--color-neutral-100); font-family: var(--font-mono); }
.claim-expired { color: var(--color-error); font-weight: var(--weight-semibold); }
.claim-valid { color: var(--color-success); font-weight: var(--weight-semibold); }

.action-bar { display: flex; gap: var(--space-2); flex-wrap: wrap; }

.empty-hint { text-align: center; padding: var(--space-8) 0; }
.empty-hint p { font-size: var(--text-base); color: var(--color-neutral-90); }
.empty-hint .hint-desc { font-size: var(--text-body); color: var(--color-neutral-70); margin-top: var(--space-1); }
.empty-hint kbd { font-size: var(--text-caption); padding: 1px 5px; background: var(--color-neutral-40); border: var(--border-width-thin) solid var(--border-color-default); border-radius: var(--radius-sm); font-family: var(--font-mono); }
</style>
