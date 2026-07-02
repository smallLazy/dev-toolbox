/**
 * HtmlEncode Plugin — Vue Composable
 *
 * Bridges HtmlEncodeFeature to Vue reactivity.
 * Uses shared useCodecTransform for mode-switching state machine.
 * No Core/Registry/Service access.
 */

import { ref, computed } from 'vue'
import { createFeatureContext } from '@/sdk/feature'
import { copyText } from '@/shared/clipboard'
import { useCodecTransform } from '@/composables/useCodecTransform'
import type { CodecMode } from '@/composables/useCodecTransform'
import { HtmlEncodeFeature } from './HtmlEncodeFeature'
import { createToolbar } from './toolbar'
import { defaults } from './settings'
import { encodeHtml, decodeHtml, getStats } from './logic'
import type { HtmlEncodeConfig } from './types'

export function useHtmlEncode() {
  // Context & Feature
  const context = createFeatureContext<HtmlEncodeConfig>({
    id: 'html-encode',
    name: 'HTML Encode',
    description: 'Encode and decode HTML entities',
    icon: 'CodeXml',
    version: '1.0.0',
    category: 'encoding',
  })
  const feature = new HtmlEncodeFeature(context)

  // ── Shared encode/decode state machine ─────────────────────────────
  const codec = useCodecTransform({
    encode: (input: string) => encodeHtml(input),
    decode: (input: string) => decodeHtml(input),
    defaultMode: 'encode',
  })

  // ── Feature-specific state ─────────────────────────────────────────
  const loading = ref(false)
  const outputStats = ref<{ chars: number; lines: number; bytes: number } | null>(null)

  // Derived
  const stats = computed(() => feature.toolState)

  // ── Mode switching (wraps shared codec + feature stats) ────────────
  function selectMode(nextMode: CodecMode): void {
    outputStats.value = null
    codec.selectMode(nextMode)
    // Recompute stats for the new output (codec.transform already ran)
    if (codec.output.value) {
      outputStats.value = getStats(codec.output.value)
    }
  }

  // ── Toolbar ────────────────────────────────────────────────────────
  const toolbar = createToolbar({
    async onCopy() {
      codec.error.value = null

      if (!codec.output.value) {
        codec.error.value = 'No output to copy'
        return
      }

      try {
        await copyText(codec.output.value)
      } catch (e) {
        codec.error.value = e instanceof Error ? e.message : 'Failed to copy output'
      }
    },
    onClear() {
      codec.clear()
      outputStats.value = null
    },
    onSwap() {
      if (codec.output.value) {
        codec.input.value = codec.output.value
        codec.output.value = null
        outputStats.value = null
      }
    },
  })

  // ── Full execute pipeline (validate + run + stats + history) ──────
  async function execute() {
    codec.error.value = null
    codec.output.value = null
    outputStats.value = null

    const v = feature.validate(codec.input.value)
    if (!v.valid) {
      codec.error.value = v.errors![0].message
      return
    }

    loading.value = true
    try {
      const config: HtmlEncodeConfig = { mode: codec.mode.value }
      const result = await feature.run(codec.input.value, config)
      codec.output.value = result
      outputStats.value = getStats(result)
      feature.recordHistory()
    } catch (e) {
      codec.error.value = (e as Error).message
    } finally {
      loading.value = false
    }
  }

  // ── Lifecycle ──────────────────────────────────────────────────────
  async function init() {
    await feature.initialize()
    await feature.activate()
  }

  function dispose() {
    feature.deactivate()
  }

  return {
    // From shared codec
    input: codec.input,
    output: codec.output,
    error: codec.error,
    mode: codec.mode,
    selectMode,
    transform: codec.transform,
    clear: codec.clear,
    // Feature-specific
    loading,
    stats,
    outputStats,
    toolbar,
    execute,
    init,
    dispose,
  }
}
