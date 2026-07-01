/**
 * JSON Plugin — Vue Composable
 *
 * Bridges JsonFeature to Vue reactivity.
 * No Core/Registry/Service access. Only JsonFeature + context.
 */

import { ref, computed, watch } from 'vue'
import { createFeatureContext, type FeatureContext } from '@/sdk/feature'
import { copyText } from '@/shared/clipboard'
import { JsonFeature } from './JsonFeature'
import { createJsonToolbar } from './toolbar'
import type { JsonConfig, JsonMode } from './types'
import { jsonDefaults } from './settings'

export function useJsonPlugin() {
  // ── Context & Feature ────────────────────────────────────────────
  const context = createFeatureContext<JsonConfig>({
    id: 'json',
    name: 'JSON 格式化',
    description: 'JSON 美化与压缩',
    icon: '📋',
    version: '1.0.0',
    category: 'formatter',
  })
  const feature = new JsonFeature(context)

  // ── Reactive State ────────────────────────────────────────────────
  const input = ref('')
  const output = ref<string | null>(null)
  const error = ref<string | null>(null)
  const loading = ref(false)
  const mode = ref<JsonMode>('format')

  // ── Derived ───────────────────────────────────────────────────────
  const isValid = computed(() => {
    if (!input.value.trim()) return null
    const vr = feature.validate(input.value)
    return vr.valid
  })

  const inputStats = computed(() => feature.inputStats)
  const outputStats = computed(() => feature.outputStats)

  // ── Toolbar ───────────────────────────────────────────────────────
  const toolbar = createJsonToolbar({
    async onCopyOutput() {
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
    async onCopyInput() { await feature.copyInput() },
    async onPaste() {
      await feature.pasteInput()
      input.value = feature.state.input
    },
    onClear() { input.value = ''; output.value = null; error.value = null },
    onSwap() {
      if (output.value) {
        input.value = output.value
        output.value = null
      }
      mode.value = mode.value === 'format' ? 'minify' : 'format'
    },
    onExport() {
      if (output.value) {
        const blob = new Blob([output.value], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url; a.download = 'output.json'; a.click()
        URL.revokeObjectURL(url)
      }
    },
    async onImport() {
      const text = await context.clipboard.paste()
      if (text) input.value = text
    },
  })

  // ── Actions ───────────────────────────────────────────────────────
  async function execute(op?: JsonMode) {
    const currentMode = op ?? mode.value
    error.value = null
    output.value = null

    const validation = feature.validate(input.value)
    if (!validation.valid) {
      error.value = validation.errors[0]?.message ?? 'Invalid JSON'
      return
    }

    loading.value = true
    try {
      const config: JsonConfig = { ...jsonDefaults, mode: currentMode } as JsonConfig & { mode: string }
      const result = await feature.run(input.value, config)
      output.value = result
      feature.recordHistory(currentMode)
    } catch (e) {
      error.value = (e as Error).message
    } finally {
      loading.value = false
    }
  }

  // ── Lifecycle ─────────────────────────────────────────────────────
  async function init() {
    await feature.initialize()
    await feature.activate()
  }

  function dispose() {
    feature.deactivate()
  }

  return {
    // State
    input, output, error, loading, mode,
    // Derived
    isValid, inputStats, outputStats,
    // Toolbar
    toolbar,
    // Actions
    execute, init, dispose,
  }
}
