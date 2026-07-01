/**
 * Timestamp Plugin — Vue Composable
 */

import { ref, computed, onUnmounted } from 'vue'
import { createFeatureContext } from '@/sdk/feature'
import { copyText } from '@/shared/clipboard'
import { TimestampFeature } from './TimestampFeature'
import { createToolbar } from './toolbar'
import { defaults } from './settings'
import { formatOutput, validateInput, getCurrentTimestamp } from './logic'
import type { TimestampConfig, TimestampMode } from './types'

export function useTimestamp() {
  const context = createFeatureContext<TimestampConfig>({
    id: 'timestamp',
    name: 'Timestamp',
    description: 'Convert Unix timestamps and date strings',
    icon: 'Clock',
    version: '1.0.0',
    category: 'converter',
  })
  const feature = new TimestampFeature(context)

  const input = ref('')
  const output = ref<string | null>(null)
  const error = ref<string | null>(null)
  const loading = ref(false)
  const mode = ref<TimestampMode>('timestamp-to-date')

  // Current time
  const now = ref(getCurrentTimestamp())
  let timer: ReturnType<typeof setInterval> | null = null

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
      output.value = null
      error.value = null
    },
  })

  async function execute() {
    error.value = null
    output.value = null

    const v = validateInput(input.value, { mode: mode.value })
    if (!v.valid) {
      error.value = v.errors[0].message
      return
    }

    loading.value = true
    try {
      const config: TimestampConfig = { mode: mode.value }
      output.value = formatOutput(input.value, config)
    } catch (e) {
      error.value = (e as Error).message
    } finally {
      loading.value = false
    }
  }

  async function init() {
    await feature.initialize()
    await feature.activate()
    timer = setInterval(() => {
      now.value = getCurrentTimestamp()
    }, 1000)
  }

  function dispose() {
    feature.deactivate()
    if (timer) {
      clearInterval(timer)
      timer = null
    }
  }

  onUnmounted(() => dispose())

  return { input, output, error, loading, mode, now, stats, toolbar, execute, init, dispose }
}
