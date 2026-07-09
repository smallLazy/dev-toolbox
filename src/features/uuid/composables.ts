/**
 * UUID Plugin — Vue Composable
 *
 * Bridges pure logic to Vue reactivity.
 * Supports generate, validate, and normalize modes.
 * No Core/Registry/Service access.
 */

import { ref, computed } from 'vue'
import { createFeatureContext } from '@/sdk/feature'
import { copyText } from '@/shared/clipboard'
import { UuidFeature } from './UuidFeature'
import { createToolbar } from './toolbar'
import { generateUuids, validateUuid, normalizeUuid, SAMPLE_UUID } from './logic'
import { defaults } from './settings'
import type { UuidConfig, UuidMode, UuidValidationResult } from './types'

export function useUuid() {
  // ── Context & Feature ──────────────────────────────────────────────
  const context = createFeatureContext<UuidConfig>({
    id: 'uuid',
    name: 'UUID',
    description: 'Generate, validate, and normalize UUIDs',
    icon: 'Fingerprint',
    version: '1.0.0',
    category: 'converter',
  })
  const feature = new UuidFeature(context)

  // ── Reactive State ──────────────────────────────────────────────────
  const input = ref('')
  const output = ref<string | null>(null)
  const error = ref<string | null>(null)
  const loading = ref(false)
  const mode = ref<UuidMode>('generate')
  const count = ref(1)
  const validationResult = ref<UuidValidationResult | null>(null)

  // ── Derived ─────────────────────────────────────────────────────────
  const stats = computed(() => feature.toolState)

  // ── Toolbar ─────────────────────────────────────────────────────────
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
      validationResult.value = null
    },
    onSwap() {
      if (output.value) {
        input.value = output.value
        output.value = null
        validationResult.value = null
      }
    },
  })

  // ── Actions ─────────────────────────────────────────────────────────

  function execute(op?: UuidMode) {
    const currentMode = op ?? mode.value
    error.value = null
    output.value = null
    validationResult.value = null

    try {
      switch (currentMode) {
        case 'generate': {
          const uuids = generateUuids(count.value)
          output.value = uuids.join('\n')
          feature.recordHistory()
          break
        }
        case 'validate': {
          const result = validateUuid(input.value)
          validationResult.value = result
          if (result.valid) {
            output.value = `${result.message}\nNormalized: ${result.normalized}`
          } else {
            error.value = result.message
            output.value = result.message
          }
          break
        }
        case 'normalize': {
          const norm = normalizeUuid(input.value)
          if (norm) {
            output.value = norm
            feature.recordHistory()
          } else {
            const result = validateUuid(input.value)
            error.value = result.message
          }
          break
        }
      }
    } catch (e) {
      error.value = (e as Error).message || 'UUID processing failed'
    }
  }

  function selectMode(nextMode: UuidMode) {
    mode.value = nextMode
    output.value = null
    error.value = null
    validationResult.value = null
    // Auto-execute generate mode (doesn't need input)
    if (nextMode === 'generate') {
      execute('generate')
    }
  }

  function loadExample() {
    input.value = SAMPLE_UUID
    output.value = null
    error.value = null
    validationResult.value = null
    mode.value = 'validate'
  }

  // ── Lifecycle ───────────────────────────────────────────────────────
  async function init() {
    await feature.initialize()
    await feature.activate()
    // Auto-generate a UUID on load
    execute('generate')
  }

  function dispose() {
    feature.deactivate()
  }

  return {
    // State
    input, output, error, loading, mode, count, stats, validationResult,
    // Toolbar
    toolbar,
    // Actions
    execute, selectMode, loadExample, init, dispose,
  }
}
