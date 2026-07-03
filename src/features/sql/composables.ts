/**
 * SQL Plugin — Vue Composable
 *
 * Bridges pure logic to Vue reactivity.
 * Follows JSON Formatter pattern: transformSql (discriminated union), toolbar actions.
 */

import { ref, computed, reactive } from 'vue'
import { createFeatureContext } from '@/sdk/feature'
import { copyText } from '@/shared/clipboard'
import { SqlFeature } from './SqlFeature'
import { createToolbar } from './toolbar'
import { defaults, defaultInConfig } from './settings'
import { transformSql } from './logic'
import type { SqlConfig, SqlInConfig } from './types'

export function useSql() {
  const context = createFeatureContext<SqlConfig>({
    id: 'sql',
    name: 'SQL',
    description: 'Build SQL IN lists from batch values',
    icon: 'Database',
    version: '1.0.0',
    category: 'formatter',
  })
  const feature = new SqlFeature(context)

  const input = ref('')
  const output = ref<string | null>(null)
  const error = ref<string | null>(null)
  const loading = ref(false)
  const inConfig = reactive<SqlInConfig>({ ...defaultInConfig })

  const stats = computed(() => feature.toolState)

  // ── Toolbar ────────────────────────────────────────────────────────
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
    onSwap() {
      if (output.value) {
        input.value = output.value
        output.value = null
        error.value = null
      }
    },
  })

  // ── Actions ────────────────────────────────────────────────────────

  /** Execute the SQL IN builder transform. */
  async function execute() {
    error.value = null
    output.value = null

    const config: SqlConfig = { mode: 'in-builder', inConfig: { ...inConfig } }

    loading.value = true
    try {
      const result = transformSql(input.value, config)
      if (result.error) {
        error.value = result.error
      } else if (result.output !== null) {
        output.value = result.output
        feature.recordHistory()
      }
      // Empty input: output=null, error=null — safe no-op
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

  return { input, output, error, loading, inConfig, stats, toolbar, execute, init, dispose }
}
