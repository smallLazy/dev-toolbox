/**
 * JSON Plugin — Vue Composable
 *
 * Bridges pure logic to Vue reactivity.
 * Uses transformJson() (safe, never throws) for the UI path.
 * JsonFeature is kept for lifecycle/history — not for transform.
 * No Core/Registry/Service access.
 */

import { ref, computed } from 'vue'
import { createFeatureContext } from '@/sdk/feature'
import { copyText } from '@/shared/clipboard'
import { JsonFeature } from './JsonFeature'
import { createJsonToolbar } from './toolbar'
import { transformJson, getJsonStats } from './logic'
import type { JsonConfig, JsonMode, JsonStats } from './types'
import { jsonDefaults } from './settings'

export function useJsonPlugin() {
  // ── Context & Feature (lifecycle only) ──────────────────────────────
  const context = createFeatureContext<JsonConfig>({
    id: 'json',
    name: 'JSON Formatter',
    description: 'Format, validate, and minify JSON',
    icon: 'FileJson',
    version: '1.0.0',
    category: 'formatter',
  })
  const feature = new JsonFeature(context)

  // ── Reactive State ──────────────────────────────────────────────────
  const input = ref('')
  const output = ref<string | null>(null)
  const error = ref<string | null>(null)
  const loading = ref(false)
  const mode = ref<JsonMode>('format')
  const stats = ref<JsonStats | null>(null)

  // ── Derived ─────────────────────────────────────────────────────────
  const isValid = computed(() => {
    if (!input.value.trim()) return null
    try {
      JSON.parse(input.value.trim())
      return true
    } catch {
      return false
    }
  })

  // ── Toolbar (copy / clear / swap only) ──────────────────────────────
  const toolbar = createJsonToolbar({
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
      stats.value = null
    },
    onSwap() {
      if (output.value) {
        input.value = output.value
        output.value = null
        stats.value = null
      }
      // Mode is NOT toggled — swap only moves data
    },
  })

  // ── Actions ─────────────────────────────────────────────────────────

  /** Execute transform for the given mode. Defaults to current mode. */
  function execute(op?: JsonMode) {
    const currentMode = op ?? mode.value
    error.value = null
    output.value = null
    stats.value = null

    const result = transformJson(input.value, currentMode, jsonDefaults)
    if (result.success) {
      output.value = result.output
      stats.value = result.stats
      feature.recordHistory(currentMode)
    } else if (result.error) {
      error.value = result.error
    }
    // Empty input: output=null, error=null (result.error is null)
  }

  /** Switch mode and auto-execute if input has content. */
  function selectMode(nextMode: JsonMode) {
    mode.value = nextMode
    if (input.value.trim()) {
      execute(nextMode)
    } else {
      // Clear any previous output/error when switching on empty
      output.value = null
      error.value = null
      stats.value = null
    }
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
    // State
    input, output, error, loading, mode, stats,
    // Derived
    isValid,
    // Toolbar
    toolbar,
    // Actions
    execute, selectMode, init, dispose,
  }
}
