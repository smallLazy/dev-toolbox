/**
 * Diff Plugin — Vue Composable
 *
 * Bridges DiffFeature to Vue reactivity.
 * Two-input state pattern: leftText + rightText inputs, diff output.
 * No Core/Registry/Service access.
 */

import { ref, computed } from 'vue'
import { createFeatureContext } from '@/sdk/feature'
import { copyText } from '@/shared/clipboard'
import { DiffFeature } from './DiffFeature'
import { createToolbar } from './toolbar'
import { defaults } from './settings'
import type { DiffConfig } from './types'

export function useDiff() {
  // ── Context & Feature ──────────────────────────────────────────────
  const context = createFeatureContext<DiffConfig>({
    id: 'diff',
    name: 'Text Diff',
    description: 'Compare two text inputs and generate a unified diff.',
    icon: 'GitBranch',
    version: '1.0.0',
    category: 'formatter',
  })
  const feature = new DiffFeature(context)

  // ── Two-input reactive state ───────────────────────────────────────
  const leftText = ref('')
  const rightText = ref('')
  const output = ref<string | null>(null)
  const error = ref<string | null>(null)
  const loading = ref(false)

  // ── Options ────────────────────────────────────────────────────────
  const contextLines = ref(defaults.contextLines)
  const ignoreWhitespace = ref(defaults.ignoreWhitespace)
  const ignoreCase = ref(defaults.ignoreCase)
  const ignoreLineOrder = ref(defaults.ignoreLineOrder)

  // ── Derived stats ──────────────────────────────────────────────────
  const diffStats = computed(() => {
    if (!output.value) return null
    return feature.toolState
  })

  const leftStats = computed(() => ({
    chars: leftText.value.length,
    lines: leftText.value ? leftText.value.split('\n').length : 0,
  }))

  const rightStats = computed(() => ({
    chars: rightText.value.length,
    lines: rightText.value ? rightText.value.split('\n').length : 0,
  }))

  // ── Toolbar (no swap — diff output is not suitable as input) ───────
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
      leftText.value = ''
      rightText.value = ''
      output.value = null
      error.value = null
    },
  })

  // ── Execute: runs the diff ─────────────────────────────────────────
  async function execute() {
    error.value = null
    output.value = null

    // Validate: at least one side should have content
    if (!leftText.value.trim() && !rightText.value.trim()) {
      error.value = 'Both texts are empty'
      return
    }

    loading.value = true
    try {
      const config: DiffConfig = {
        ...defaults,
        rightText: rightText.value,
        contextLines: contextLines.value,
        ignoreWhitespace: ignoreWhitespace.value,
        ignoreCase: ignoreCase.value,
        ignoreLineOrder: ignoreLineOrder.value,
      }
      const result = await feature.run(leftText.value, config)
      output.value = result
      feature.recordHistory()
    } catch (e) {
      error.value = (e as Error).message
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
    leftText,
    rightText,
    output,
    error,
    loading,
    contextLines,
    ignoreWhitespace,
    ignoreCase,
    ignoreLineOrder,
    leftStats,
    rightStats,
    diffStats,
    toolbar,
    execute,
    init,
    dispose,
  }
}
