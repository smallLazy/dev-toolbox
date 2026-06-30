/**
 * useCommandPalette — Global Command Palette state and search.
 *
 * Powers the ⌘K Command Palette with fuzzy search across
 * plugins, commands, recent items, favorites, and settings.
 *
 * Search ranking: Favorite > Recent > Match score
 */

import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useWorkspaceStore, type ToolMeta } from '@/stores/workspace'

export interface PaletteItem {
  id: string
  label: string
  description?: string
  icon: string
  type: 'plugin' | 'command' | 'recent' | 'favorite' | 'setting'
  pluginId?: string
  category?: string
  action: () => void
  shortcut?: string
}

const isOpen = ref(false)
const query = ref('')
const selectedIndex = ref(0)

export function useCommandPalette() {
  const store = useWorkspaceStore()
  const router = useRouter()

  // ── Build palette items ────────────────────────────────────────────

  const paletteItems = computed<PaletteItem[]>(() => {
    const results: PaletteItem[] = []
    const q = query.value.toLowerCase().trim()

    if (!q) {
      // ── No query: recent → favorites (deduped) → all tools ──
      const seen = new Set<string>()

      for (const id of store.recentIds.slice(0, 5)) {
        const tool = store.getTool(id)
        if (tool) {
          seen.add(tool.id)
          results.push(toolToPaletteItem(tool, 'recent', store, router))
        }
      }

      for (const id of store.favoriteIds) {
        if (seen.has(id)) continue
        const tool = store.getTool(id)
        if (tool) {
          seen.add(tool.id)
          results.push(toolToPaletteItem(tool, 'favorite', store, router))
        }
      }

      // All tools alphabetically
      const sorted = [...store.tools].sort((a, b) => a.name.localeCompare(b.name))
      for (const tool of sorted) {
        results.push(toolToPaletteItem(tool, 'plugin', store, router))
      }
    } else {
      // ── With query: fuzzy search with ranking ──
      const matched = store.searchTools(q)

      // Assign rank priority: Favorite → Recent → match score
      const ranked = matched.map((tool, i) => {
        let rank = 0
        if (store.isFavorite(tool.id)) rank = 200
        else if (store.recentIds.includes(tool.id)) rank = 100
        return { tool, rank: rank + (matched.length - i) }
      })

      ranked.sort((a, b) => b.rank - a.rank)

      for (const { tool } of ranked) {
        const type = store.isFavorite(tool.id) ? 'favorite'
          : store.recentIds.includes(tool.id) ? 'recent'
          : 'plugin'
        results.push(toolToPaletteItem(tool, type, store, router))
      }

      // Also search commands across all tools
      for (const tool of store.tools) {
        for (const cmd of tool.commands) {
          if (
            cmd.label.toLowerCase().includes(q) ||
            (cmd.description ?? '').toLowerCase().includes(q)
          ) {
            results.push({
              id: cmd.id,
              label: cmd.label,
              description: cmd.description,
              icon: tool.icon,
              type: 'command',
              pluginId: tool.id,
              category: tool.category,
              action: () => {
                store.touchRecent(tool.id)
                router.push(tool.path)
              },
              shortcut: cmd.shortcut,
            })
          }
        }
      }
    }

    // Settings always at the bottom
    results.push({
      id: 'settings',
      label: 'Settings',
      description: 'Application settings and preferences',
      icon: 'settings',
      type: 'setting',
      action: () => router.push('/settings'),
    })

    // About
    results.push({
      id: 'about',
      label: 'About Dev Toolbox',
      description: 'Version info, build details, and license',
      icon: 'info',
      type: 'setting',
      action: () => router.push('/about'),
    })

    return results.slice(0, 20)
  })

  const selectedItem = computed(() => paletteItems.value[selectedIndex.value] ?? null)

  // ── Actions ────────────────────────────────────────────────────────

  function open() {
    isOpen.value = true
    query.value = ''
    selectedIndex.value = 0
  }

  function close() {
    isOpen.value = false
  }

  function toggle() {
    isOpen.value ? close() : open()
  }

  function moveUp() {
    selectedIndex.value = Math.max(0, selectedIndex.value - 1)
  }

  function moveDown() {
    selectedIndex.value = Math.min(paletteItems.value.length - 1, selectedIndex.value + 1)
  }

  function execute() {
    const item = selectedItem.value
    if (item) {
      item.action()
      if (item.type === 'plugin' || item.type === 'recent' || item.type === 'favorite') {
        store.touchRecent(item.pluginId ?? '')
      }
      close()
    }
  }

  // Reset selection when query changes
  watch(query, () => {
    selectedIndex.value = 0
  })

  return {
    isOpen,
    query,
    paletteItems,
    selectedIndex,
    selectedItem,
    open,
    close,
    toggle,
    moveUp,
    moveDown,
    execute,
  }
}

// ── Helpers ──────────────────────────────────────────────────────────

function toolToPaletteItem(
  tool: ToolMeta,
  type: PaletteItem['type'],
  store: ReturnType<typeof useWorkspaceStore>,
  router: ReturnType<typeof useRouter>,
): PaletteItem {
  return {
    id: tool.id,
    label: tool.name,
    description: tool.description,
    icon: tool.icon,
    type,
    pluginId: tool.id,
    category: tool.category,
    action() {
      store.touchRecent(tool.id)
      router.push(tool.path)
    },
  }
}
