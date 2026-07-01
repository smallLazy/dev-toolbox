/**
 * Crypto (AES) Plugin — Vue Composable
 *
 * Bridges CryptoFeature to Vue reactivity.
 * Handles Tauri invoke("aes_crypt") with 100% parameter compatibility.
 */

import { ref, reactive, computed } from 'vue'
import { createFeatureContext } from '@/sdk/feature'
import { copyText } from '@/shared/clipboard'
import { CryptoFeature } from './CryptoFeature'
import { createToolbar } from './toolbar'
import { defaultInConfig } from './settings'
import { buildAesCryptParams, validateCryptoInput } from './logic'
import type { CryptoConfig, CryptoMode, AesAlgorithm, CryptoInConfig, AesCryptParams } from './types'

/**
 * Dynamically import and invoke the Tauri `aes_crypt` command.
 *
 * Parameter structure MUST match `AesCryptRequest` in
 * `src-tauri/src/models/mod.rs` (camelCase serialization).
 */
async function invokeAesCrypt(params: AesCryptParams): Promise<string> {
  const { invoke } = await import('@tauri-apps/api/core')
  return invoke<string>('aes_crypt', { request: params })
}

export function useCrypto() {
  const context = createFeatureContext<CryptoConfig>({
    id: 'crypto',
    name: 'AES',
    description: 'AES-256 symmetric encryption using CBC or ECB mode',
    icon: 'Lock',
    version: '1.0.0',
    category: 'crypto',
  })
  const feature = new CryptoFeature(context)

  // ── Reactive State ──────────────────────────────────────────────────

  const input = ref('')
  const key = ref('')
  const iv = ref('')
  const output = ref<string | null>(null)
  const error = ref<string | null>(null)
  const loading = ref(false)
  const mode = ref<CryptoMode>('encrypt')
  const inConfig = reactive<CryptoInConfig>({ ...defaultInConfig })

  const stats = computed(() => feature.toolState)

  // ── Toolbar ──────────────────────────────────────────────────────────

  const toolbar = createToolbar({
    async onCopy() {
      error.value = null
      if (!output.value) {
        error.value = 'No output to copy'
        return
      }
      try {
        await copyText(output.value)
      } catch (e) {
        error.value = e instanceof Error ? e.message : 'Failed to copy output'
      }
    },
    onClear() {
      input.value = ''
      output.value = null
      error.value = null
      // Key and IV are preserved so the user doesn't have to re-enter them.
    },
    onSwap() {
      mode.value = mode.value === 'encrypt' ? 'decrypt' : 'encrypt'
    },
  })

  // ── Execute ──────────────────────────────────────────────────────────

  async function execute() {
    error.value = null
    output.value = null

    const v = validateCryptoInput(input.value, key.value, inConfig.algorithm, iv.value)
    if (!v.valid) {
      error.value = v.errors[0].message
      return
    }

    loading.value = true
    try {
      const params = buildAesCryptParams({
        mode: mode.value,
        algorithm: inConfig.algorithm,
        key: key.value,
        iv: iv.value,
        input: input.value,
        inConfig,
      })
      const result = await invokeAesCrypt(params)
      output.value = result
      feature.recordHistory()
    } catch (e: unknown) {
      const msg =
        typeof e === 'string'
          ? e
          : (e as Error).message || 'Unknown error'
      error.value = msg
    } finally {
      loading.value = false
    }
  }

  // ── Mode helpers ─────────────────────────────────────────────────────

  function setMode(m: CryptoMode) {
    mode.value = m
  }

  function setAlgorithm(a: AesAlgorithm) {
    inConfig.algorithm = a
  }

  // ── Lifecycle ────────────────────────────────────────────────────────

  async function init() {
    await feature.initialize()
    await feature.activate()
  }

  function dispose() {
    feature.deactivate()
  }

  return {
    input,
    key,
    iv,
    output,
    error,
    loading,
    mode,
    inConfig,
    stats,
    toolbar,
    execute,
    setMode,
    setAlgorithm,
    init,
    dispose,
  }
}
