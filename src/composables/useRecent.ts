/**
 * useRecent — Reactive access to recently used tools.
 *
 * Reads from workspace store. Recent items are tracked
 * automatically via touchRecent() when navigating to tools.
 */

import { computed } from 'vue'
import { useWorkspaceStore } from '@/stores/workspace'

export function useRecent(limit = 6) {
  const store = useWorkspaceStore()

  const items = computed(() => store.recentTools.slice(0, limit))
  const isEmpty = computed(() => store.recentIds.length === 0)
  const total = computed(() => store.recentIds.length)

  function touch(pluginId: string) {
    store.touchRecent(pluginId)
  }

  return { items, isEmpty, total, touch }
}
