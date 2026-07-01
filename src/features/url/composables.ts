/**
 * URL Plugin — Vue Composable
 *
 * Bridges UrlFeature to Vue reactivity.
 * No Core/Registry/Service access.
 */

import { ref, computed } from 'vue'
import { createFeatureContext } from '@/sdk/feature'
import { copyText } from '@/shared/clipboard'
import { UrlFeature } from './UrlFeature'
import { createToolbar } from './toolbar'
import { defaults } from './settings'
import type { UrlConfig, UrlMode, UrlVariant } from './types'

export function useUrl() {
  // Context & Feature
  const context = createFeatureContext<UrlConfig>({
    id: 'url',
    name: 'URL',
    description: 'Encode and decode URLs using URI or component modes',
    icon: 'Link',
    version: '1.0.0',
    category: 'encoder',
  })
  const feature = new UrlFeature(context)

  // Reactive State
  const input = ref('')
  const output = ref<string | null>(null)
  const error = ref<string | null>(null)
  const loading = ref(false)
  const mode = ref<UrlMode>('encode')
  const variant = ref<UrlVariant>('component')
  const outputStats = ref<{ chars: number; lines: number; bytes: number } | null>(null)

  // Derived
  const stats = computed(() => feature.toolState)

  // Toolbar
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
      outputStats.value = null
      error.value = null
    },
    onSwap() {
      if (output.value) {
        input.value = output.value
        output.value = null
        outputStats.value = null
      }
    },
  })

  // Actions
  async function execute() {
    error.value = null
    output.value = null
    outputStats.value = null

    const v = feature.validate(input.value)
    if (!v.valid) {
      error.value = v.errors![0].message
      return
    }

    loading.value = true
    try {
      const config: UrlConfig = { mode: mode.value, variant: variant.value }
      const result = await feature.run(input.value, config)
      output.value = result.output
      outputStats.value = {
        chars: result.output.length,
        lines: result.output.split('\n').length,
        bytes: new TextEncoder().encode(result.output).length,
      }
      feature.recordHistory()
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
    input,
    output,
    error,
    loading,
    mode,
    variant,
    stats,
    outputStats,
    toolbar,
    execute,
    init,
    dispose,
  }
}
