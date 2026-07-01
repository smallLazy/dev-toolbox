/**
 * JWT Plugin — Vue Composable
 */

import { ref, computed } from 'vue'
import { createFeatureContext } from '@/sdk/feature'
import { copyText } from '@/shared/clipboard'
import { JwtFeature } from './JwtFeature'
import { createToolbar } from './toolbar'
import { defaults } from './settings'
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

  const stats = computed(() => feature.toolState)

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
      result.value = null
      output.value = null
      error.value = null
    },
  })

  // Per-part copy helpers
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
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ;(feature as any).recordHistory?.()
    } catch (e) {
      error.value = (e as Error).message
    } finally {
      loading.value = false
    }
  }

  async function init() {
    await feature.initialize()
    await feature.activate()
  }

  function dispose() {
    feature.deactivate()
  }

  return {
    input, result, output, error, loading, stats, toolbar,
    execute, copyHeader, copyPayload, copySignature, init, dispose,
  }
}
