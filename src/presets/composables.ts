/**
 * Preset Composable — Bridges PipelinePreset to Vue reactivity.
 *
 * Uses shared useCodecTransform for mode-switching state machine.
 * Manages pipeline-specific state (pipelineResult, loading) on top.
 * No Core/Registry/Service access.
 */

import { ref } from 'vue'
import { copyText } from '@/shared/clipboard'
import { runPipeline } from '@/shared/pipeline'
import { useCodecTransform } from '@/composables/useCodecTransform'
import type { CodecMode } from '@/composables/useCodecTransform'
import type { PipelinePreset, PipelineResult, PipelineError } from '@/shared/pipeline/types'

export function usePreset(preset: PipelinePreset) {
  // ── Shared encode/decode state machine ─────────────────────────────
  const codec = useCodecTransform({
    encode: (input: string) => runPipeline(preset, 'encode', input).output,
    decode: (input: string) => runPipeline(preset, 'decode', input).output,
    defaultMode: preset.mode as CodecMode,
  })

  // ── Preset-specific state ──────────────────────────────────────────
  const loading = ref(false)
  const pipelineResult = ref<PipelineResult | null>(null)

  // ── Mode switching (wraps shared codec + clears pipeline preview) ──
  function selectMode(nextMode: CodecMode): void {
    pipelineResult.value = null
    codec.selectMode(nextMode)
  }

  // ── Full execute pipeline (with loading + pipeline preview) ────────
  async function execute() {
    codec.error.value = null
    codec.output.value = null
    pipelineResult.value = null

    if (!codec.input.value.trim()) {
      codec.error.value = codec.mode.value === 'encode'
        ? 'Input is empty'
        : 'Input is empty'
      return
    }

    loading.value = true
    try {
      const result = runPipeline(preset, codec.mode.value, codec.input.value)
      pipelineResult.value = result
      codec.output.value = result.output
    } catch (e) {
      const pe = e as PipelineError
      codec.error.value = pe.stepLabel
        ? `${pe.stepLabel}: ${pe.message}`
        : (e as Error).message
    } finally {
      loading.value = false
    }
  }

  function clear() {
    codec.clear()
    pipelineResult.value = null
  }

  function swap() {
    if (codec.output.value) {
      codec.input.value = codec.output.value
      codec.output.value = null
      pipelineResult.value = null
    }
  }

  async function copy() {
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
  }

  return {
    // From shared codec
    input: codec.input,
    output: codec.output,
    error: codec.error,
    mode: codec.mode,
    selectMode,
    // Preset-specific
    loading,
    pipelineResult,
    execute,
    clear,
    swap,
    copy,
    // Backward-compat alias used by PresetView
    switchMode: selectMode,
  }
}
