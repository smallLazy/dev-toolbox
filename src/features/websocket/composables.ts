/**
 * Websocket Plugin — Vue Composable
 *
 * Bridges WebsocketFeature to Vue reactivity.
 * No Core/Registry/Service access.
 */

import { ref, computed } from 'vue'
import { createFeatureContext } from '@/sdk/feature'
import { copyText } from '@/shared/clipboard'
import { WebsocketFeature } from './WebsocketFeature'
import { createToolbar } from './toolbar'
import { defaults } from './settings'
import type { WebsocketConfig } from './types'

export function useWebsocket() {
  // Context & Feature
  const context = createFeatureContext<WebsocketConfig>({
    id: 'websocket',
    name: 'Websocket',
    description: 'Network tool — HTTP request and response analysis',
    icon: '🌐',
    version: '1.0.0',
    category: 'network',
  })
  const feature = new WebsocketFeature(context)

  // Reactive State
  const input = ref('')
  const output = ref<string | null>(null)
  const error = ref<string | null>(null)
  const loading = ref(false)

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
    onClear() { input.value = ''; output.value = null; error.value = null },
    onSwap() { if (output.value) { input.value = output.value; output.value = null } },
  })

  // Actions
  async function execute() {
    error.value = null; output.value = null
    const v = feature.validate(input.value)
    if (!v.valid) { error.value = v.errors[0].message; return }
    loading.value = true
    try {
      const result = await feature.run(input.value, defaults)
      output.value = result
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

  return { input, output, error, loading, stats, toolbar, execute, init, dispose }
}
