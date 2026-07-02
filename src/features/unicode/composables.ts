/**
 * Unicode Plugin — Vue Composable
 *
 * Bridges UnicodeFeature to Vue reactivity.
 * Uses shared useCodecTransform for mode-switching state machine.
 * No Core/Registry/Service access.
 */

import { ref, computed } from 'vue'
import { createFeatureContext } from '@/sdk/feature'
import { copyText } from '@/shared/clipboard'
import { useCodecTransform } from '@/composables/useCodecTransform'
import type { CodecMode } from '@/composables/useCodecTransform'
import { UnicodeFeature } from './UnicodeFeature'
import { createToolbar } from './toolbar'
import { defaults } from './settings'
import { encodeUnicode, decodeUnicode, getStats } from './logic'
import type { UnicodeConfig, UnicodeMode, UnicodeVariant } from './types'

export function useUnicode() {
  // Context & Feature
  const context = createFeatureContext<UnicodeConfig>({
    id: 'unicode',
    name: 'Unicode',
    description: 'Encode and decode Unicode escape sequences',
    icon: 'CaseSensitive',
    version: '1.0.0',
    category: 'encoder',
  })
  const feature = new UnicodeFeature(context)

  // Variant is specific to Unicode feature (javascript / code-point)
  const variant = ref<UnicodeVariant>('javascript')

  // ── Shared encode/decode state machine ─────────────────────────────
  // Encode/decode functions close over variant ref — variant.value is
  // evaluated at call time, so changing variant immediately affects
  // subsequent transforms.
  const codec = useCodecTransform({
    encode: (input: string) => encodeUnicode(input, variant.value),
    decode: (input: string) => decodeUnicode(input, variant.value),
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
    if (codec.output.value) {
      outputStats.value = getStats(codec.output.value)
    }
  }

  // ── Variant switching ──────────────────────────────────────────────
  function selectVariant(nextVariant: UnicodeVariant): void {
    variant.value = nextVariant
    // Re-transform with new variant if there's input
    if (codec.input.value) {
      codec.transform(codec.mode.value)
    }
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
      const config: UnicodeConfig = { mode: codec.mode.value, variant: variant.value }
      const result = await feature.run(codec.input.value, config)
      codec.output.value = result.output
      outputStats.value = {
        chars: result.output.length,
        lines: result.output.split('\n').length,
        bytes: new TextEncoder().encode(result.output).length,
      }
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
    // Unicode-specific
    variant,
    selectVariant,
    loading,
    stats,
    outputStats,
    toolbar,
    execute,
    init,
    dispose,
  }
}
