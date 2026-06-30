/**
 * useTools — Reactive access to all tools and categories.
 *
 * Reads from workspace store. Provides tools grouped by category.
 */

import { computed } from 'vue'
import { useWorkspaceStore } from '@/stores/workspace'

export function useTools() {
  const store = useWorkspaceStore()

  const all = computed(() => store.tools)
  const byCategory = computed(() => store.toolsByCategory)
  const categoryList = computed(() => store.categories)
  const total = computed(() => store.toolCount)

  function getById(id: string) {
    return store.getTool(id)
  }

  return { all, byCategory, categoryList, total, getById }
}
