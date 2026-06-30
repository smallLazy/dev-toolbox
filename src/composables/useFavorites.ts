/**
 * useFavorites — Reactive access to favorited tools.
 *
 * Reads from workspace store. Favorites persist to localStorage.
 */

import { computed } from 'vue'
import { useWorkspaceStore } from '@/stores/workspace'

export function useFavorites() {
  const store = useWorkspaceStore()

  const items = computed(() => store.favoriteTools)
  const isEmpty = computed(() => store.favoriteIds.length === 0)
  const total = computed(() => store.favoriteIds.length)

  function toggle(pluginId: string): boolean {
    return store.toggleFavorite(pluginId)
  }

  function isFavorite(pluginId: string): boolean {
    return store.isFavorite(pluginId)
  }

  return { items, isEmpty, total, toggle, isFavorite }
}
