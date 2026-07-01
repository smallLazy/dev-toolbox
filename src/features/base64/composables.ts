/**
 * Base64 Plugin — Vue Composable
 *
 * Bridges Base64Feature to Vue reactivity.
 * No Core/Registry/Service access.
 */

import { ref, computed } from 'vue'
import { createFeatureContext } from '@/sdk/feature'
import { copyText } from '@/shared/clipboard'
import { Base64Feature } from './Base64Feature'
import { createToolbar } from './toolbar'
import { defaults } from './settings'
import type { Base64Config } from './types'

export function useBase64() {
  // Context & Feature
  const context = createFeatureContext<Base64Config>({
    id: 'base64',
    name: 'Base64',
    description: 'Encode and decode text to/from Base64 with full Unicode support',
    icon: 'CaseSensitive',
    version: '1.0.0',
    category: 'encoder',
  })
  const feature = new Base64Feature(context)

  // Reactive State
  const input = ref('')
  const output = ref<string | null>(null)
  const error = ref<string | null>(null)
  const loading = ref(false)
  const mode = ref<'encode' | 'decode'>('encode')
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
    onClear() { input.value = ''; output.value = null; outputStats.value = null; error.value = null },
    onSwap() { if (output.value) { input.value = output.value; output.value = null; outputStats.value = null } },
  })

  // Actions
  async function execute() {
    error.value = null; output.value = null; outputStats.value = null

    const v = feature.validate(input.value)
    if (!v.valid) { error.value = v.errors![0].message; return }

    loading.value = true
    try {
      const config: Base64Config = { mode: mode.value }
      const result = await feature.run(input.value, config)
      output.value = result.output
      outputStats.value = result.stats
      feature.recordHistory()
    } catch (e) {
      error.value = (e as Error).message
    } finally { loading.value = false }
  }

  async function init() {
    await feature.initialize()
    await feature.activate()
  }
  function dispose() { feature.deactivate() }

  return { input, output, error, loading, mode, stats, outputStats, toolbar, execute, init, dispose }
}
