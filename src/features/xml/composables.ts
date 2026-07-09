/**
 * XML Plugin — Vue Composable
 *
 * Bridges pure logic to Vue reactivity.
 * Uses transformXml() (safe, never throws) for the UI path.
 * No Core/Registry/Service access.
 */

import { ref, computed } from 'vue'
import { createFeatureContext } from '@/sdk/feature'
import { copyText } from '@/shared/clipboard'
import { XmlFeature } from './XmlFeature'
import { createToolbar } from './toolbar'
import { transformXml, getXmlStats, validateXml, EXAMPLE_XML } from './logic'
import { defaults } from './settings'
import type { XmlConfig, XmlMode, XmlStats } from './types'

export function useXml() {
  // ── Context & Feature (lifecycle only) ──────────────────────────────
  const context = createFeatureContext<XmlConfig>({
    id: 'xml',
    name: 'XML',
    description: 'Format, minify, and validate XML',
    icon: 'FileCode',
    version: '1.0.0',
    category: 'formatter',
  })
  const feature = new XmlFeature(context)

  // ── Reactive State ──────────────────────────────────────────────────
  const input = ref('')
  const output = ref<string | null>(null)
  const error = ref<string | null>(null)
  const loading = ref(false)
  const mode = ref<XmlMode>('format')
  const stats = ref<XmlStats | null>(null)

  // ── Derived ─────────────────────────────────────────────────────────
  const isValid = computed(() => {
    if (!input.value.trim()) return null
    return validateXml(input.value) === null
  })

  // ── Toolbar (copy / clear / swap only) ──────────────────────────────
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
      stats.value = null
    },
    onSwap() {
      if (output.value) {
        input.value = output.value
        output.value = null
        stats.value = null
      }
    },
  })

  // ── Actions ─────────────────────────────────────────────────────────

  /** Execute transform for the given mode. Defaults to current mode. */
  function execute(op?: XmlMode) {
    const currentMode = op ?? mode.value
    error.value = null
    output.value = null
    stats.value = null

    const result = transformXml(input.value, currentMode, defaults)
    if (result.success) {
      output.value = result.output
      stats.value = result.stats
      feature.recordHistory()
    } else if (result.error) {
      error.value = result.error
      // Validate mode: show error details in output panel too
      if (currentMode === 'validate') {
        output.value = result.error
      }
    }
    // Empty input: output=null, error=null
  }

  /** Switch mode and auto-execute if input has content. */
  function selectMode(nextMode: XmlMode) {
    mode.value = nextMode
    if (input.value.trim()) {
      execute(nextMode)
    } else {
      output.value = null
      error.value = null
      stats.value = null
    }
  }

  /** Fill input with example XML and reset output/error. */
  function loadExample() {
    input.value = EXAMPLE_XML
    output.value = null
    error.value = null
    stats.value = null
    mode.value = 'format'
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
    execute, selectMode, loadExample, init, dispose,
  }
}
