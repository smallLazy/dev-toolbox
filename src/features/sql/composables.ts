/**
 * SQL Plugin — Vue Composable
 */

import { ref, computed, reactive } from 'vue'
import { createFeatureContext } from '@/sdk/feature'
import { copyText } from '@/shared/clipboard'
import { SqlFeature } from './SqlFeature'
import { createToolbar } from './toolbar'
import { defaults, defaultInConfig } from './settings'
import { transformSql, validateSqlInput } from './logic'
import type { SqlConfig, SqlMode, SqlInConfig } from './types'

export function useSql() {
  const context = createFeatureContext<SqlConfig>({
    id: 'sql',
    name: 'SQL',
    description: 'SQL IN Builder and Formatter',
    icon: 'Database',
    version: '1.0.0',
    category: 'formatter',
  })
  const feature = new SqlFeature(context)

  const input = ref('')
  const output = ref<string | null>(null)
  const error = ref<string | null>(null)
  const loading = ref(false)
  const mode = ref<SqlMode>('in-builder')
  const inConfig = reactive<SqlInConfig>({ ...defaultInConfig })

  const stats = computed(() => feature.toolState)

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
  })

  async function execute() {
    error.value = null
    output.value = null

    const config: SqlConfig = { mode: mode.value, inConfig: { ...inConfig } }
    const v = validateSqlInput(input.value, config)
    if (!v.valid) {
      error.value = v.errors[0].message
      return
    }

    loading.value = true
    try {
      const result = transformSql(input.value, config)
      output.value = result.output
      feature.recordHistory()
    } catch (e) {
      error.value = (e as Error).message
    } finally {
      loading.value = false
    }
  }

  async function init() {
    await feature.initialize()
    await feature.activate()
  }

  function dispose() {
    feature.deactivate()
  }

  return { input, output, error, loading, mode, inConfig, stats, toolbar, execute, init, dispose }
}
