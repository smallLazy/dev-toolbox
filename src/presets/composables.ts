/**
 * Preset Composable — Bridges PipelinePreset to Vue reactivity.
 *
 * Manages input/output/error/loading state and executes the pipeline.
 * No Core/Registry/Service access.
 */

import { ref } from 'vue'
import { copyText } from '@/shared/clipboard'
import { runPipeline } from '@/shared/pipeline'
import type { PipelinePreset, PipelineResult, PipelineError } from '@/shared/pipeline/types'

export function usePreset(preset: PipelinePreset) {
  const input = ref('')
  const output = ref<string | null>(null)
  const error = ref<string | null>(null)
  const loading = ref(false)
  const mode = ref<'encode' | 'decode'>(preset.mode)
  const pipelineResult = ref<PipelineResult | null>(null)

  async function execute() {
    error.value = null
    output.value = null
    pipelineResult.value = null

    if (!input.value.trim()) {
      error.value = mode.value === 'encode' ? '请输入要编码的内容' : '请输入要解码的字符串'
      return
    }

    loading.value = true
    try {
      const result = runPipeline(preset, mode.value, input.value)
      pipelineResult.value = result
      output.value = result.output
    } catch (e) {
      const pe = e as PipelineError
      error.value = pe.stepLabel
        ? `${pe.stepLabel}: ${pe.message}`
        : (e as Error).message
    } finally {
      loading.value = false
    }
  }

  function clear() {
    input.value = ''
    output.value = null
    pipelineResult.value = null
    error.value = null
  }

  function swap() {
    if (output.value) {
      input.value = output.value
      output.value = null
      pipelineResult.value = null
    }
  }

  async function copy() {
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
  }

  function switchMode(m: 'encode' | 'decode') {
    mode.value = m
    output.value = null
    pipelineResult.value = null
    error.value = null
  }

  return {
    input,
    output,
    error,
    loading,
    mode,
    pipelineResult,
    execute,
    clear,
    swap,
    copy,
    switchMode,
  }
}
