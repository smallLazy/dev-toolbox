/**
 * JWT Plugin — Vue Composable
 */

import { ref, computed } from 'vue'
import { createFeatureContext } from '@/sdk/feature'
import { copyText } from '@/shared/clipboard'
import { JwtFeature } from './JwtFeature'
import { createToolbar } from './toolbar'
import { EXAMPLE_JWT } from './logic'
import type { JwtConfig, JwtResult } from './types'

export function useJwt() {
  const context = createFeatureContext<JwtConfig>({
    id: 'jwt',
    name: 'JWT',
    description: 'Decode JSON Web Tokens locally',
    icon: 'Shield',
    version: '1.0.0',
    category: 'encoding',
  })
  const feature = new JwtFeature(context)

  const input = ref('')
  const result = ref<JwtResult | null>(null)
  const output = ref<string | null>(null)
  const error = ref<string | null>(null)
  const loading = ref(false)

  const statusPhase = ref<'idle' | 'loading' | 'success' | 'error' | 'copied'>('idle')
  const statusMessage = ref<string | null>('Ready')

  const stats = computed(() => feature.toolState)

  // ── Toolbar ─────────────────────────────────────────────────────────

  const toolbar = createToolbar({
    async onCopy() {
      error.value = null
      if (!output.value) {
        error.value = 'No output to copy'
        return
      }
      try {
        await copyText(output.value)
        statusPhase.value = 'copied'
        statusMessage.value = 'Copied to clipboard'
      } catch (e) {
        error.value = e instanceof Error ? e.message : 'Failed to copy output'
      }
    },
    onClear() {
      input.value = ''
      result.value = null
      output.value = null
      error.value = null
      statusPhase.value = 'idle'
      statusMessage.value = 'Ready'
    },
  })

  // ── Per-part copy helpers ──────────────────────────────────────────

  async function copyHeader() {
    error.value = null
    if (!result.value) { error.value = 'No header to copy'; return }
    try { await copyText(result.value.header.formatted) } catch (e) { error.value = (e as Error).message }
  }

  async function copyPayload() {
    error.value = null
    if (!result.value) { error.value = 'No payload to copy'; return }
    try { await copyText(result.value.payload.formatted) } catch (e) { error.value = (e as Error).message }
  }

  async function copySignature() {
    error.value = null
    if (!result.value) { error.value = 'No signature to copy'; return }
    try { await copyText(result.value.signature) } catch (e) { error.value = (e as Error).message }
  }

  // ── Execute ─────────────────────────────────────────────────────────

  async function execute() {
    error.value = null
    result.value = null
    output.value = null

    const v = feature.validate(input.value)
    if (!v.valid) {
      error.value = v.errors![0].message
      return
    }

    loading.value = true
    try {
      const config: JwtConfig = { pretty: true }
      const res = await feature.run(input.value, config)
      result.value = res
      output.value = res.output
      statusPhase.value = 'success'
      statusMessage.value = 'JWT decoded successfully'
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ;(feature as any).recordHistory?.()
    } catch (e) {
      error.value = (e as Error).message
    } finally {
      loading.value = false
    }
  }

  // ── Example ─────────────────────────────────────────────────────────

  /** Fill input with the example JWT and auto-decode. */
  async function loadExample() {
    input.value = EXAMPLE_JWT
    result.value = null
    output.value = null
    error.value = null
    // Auto-decode — execute sets the final status message
    await execute()
  }

  // ── Lifecycle ───────────────────────────────────────────────────────

  async function init() {
    await feature.initialize()
    await feature.activate()
  }

  function dispose() {
    feature.deactivate()
  }

  return {
    input, result, output, error, loading, statusPhase, statusMessage, stats, toolbar,
    execute, copyHeader, copyPayload, copySignature, loadExample, init, dispose,
  }
}
