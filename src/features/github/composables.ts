/**
 * Github Plugin — Vue Composable
 *
 * Bridges GithubFeature to Vue reactivity.
 * No Core/Registry/Service access.
 */

import { ref, computed } from 'vue'
import { createFeatureContext } from '@/sdk/feature'
import { GithubFeature } from './GithubFeature'
import { createToolbar } from './toolbar'
import { defaults } from './settings'
import type { GithubConfig } from './types'

export function useGithub() {
  // Context & Feature
  const context = createFeatureContext<GithubConfig>({
    id: 'github',
    name: 'Github',
    description: '企业工具 — 外部服务集成',
    icon: '🏢',
    version: '1.0.0',
    category: 'utility',
  })
  const feature = new GithubFeature(context)

  // Reactive State
  const input = ref('')
  const output = ref<string | null>(null)
  const error = ref<string | null>(null)
  const loading = ref(false)

  // Derived
  const stats = computed(() => feature.toolState)

  // Toolbar
  const toolbar = createToolbar({
    onCopy() { feature.copyOutput() },
    onClear() { input.value = ''; output.value = null; error.value = null },
    onSwap() { if (output.value) { input.value = output.value; output.value = null } },
  })

  // Actions
  async function execute() {
    error.value = null; output.value = null
    const v = feature.validate(input.value)
    if (!v.valid) { error.value = v.errors[0].message; return }
    loading.value = true
    try {
      const result = await feature.run(input.value, defaults)
      output.value = result
      feature.recordHistory()
    } catch (e) {
      error.value = (e as Error).message
    } finally { loading.value = false }
  }

  async function init() {
    await feature.initialize()
    await feature.activate()
  }
  function dispose() { feature.deactivate() }

  return { input, output, error, loading, stats, toolbar, execute, init, dispose }
}
