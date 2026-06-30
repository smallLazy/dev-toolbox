/**
 * Workspace Store — Central Pinia store bridging plugins → Vue UI.
 *
 * Imports all 33 plugin modules at module level, extracts metadata,
 * and exposes reactive state for Dashboard, Sidebar, and Command Palette.
 *
 * This is the SINGLE source of truth for tool listings in the Product Layer.
 * It does NOT depend on Core RegistryManager (which is not wired to main.ts).
 */

import { defineStore } from 'pinia'
import { ref, computed, shallowRef } from 'vue'
import type { PluginInstance } from '@/sdk/plugin/PluginManifest'

// ── Barrel import ────────────────────────────────────────────────────────
import * as pluginModules from '@/plugins'

// ── Types ────────────────────────────────────────────────────────────────

export interface ToolCommand {
  id: string
  label: string
  description?: string
  shortcut?: string
}

export interface ToolMeta {
  id: string
  name: string
  description: string
  icon: string
  category: string
  path: string
  commands: ToolCommand[]
  searchKeywords: string[]
}

// ── Helpers ──────────────────────────────────────────────────────────────

function extractMetadata(instance: PluginInstance): ToolMeta {
  const def = instance.definition
  const routePath = typeof def.route === 'string' ? def.route : def.route.path
  const commands: ToolCommand[] = (def.commands ?? []).map(c => ({
    id: c.id,
    label: c.label,
    description: c.description,
    shortcut: c.shortcut,
  }))
  const searchKeywords: string[] = def.keywords ?? []

  return {
    id: def.id,
    name: def.name,
    description: def.description ?? '',
    icon: def.icon,
    category: def.category ?? 'utility',
    path: routePath,
    commands,
    searchKeywords,
  }
}

function relevanceScore(tool: ToolMeta, q: string): number {
  let score = 0
  const id = tool.id.toLowerCase()
  const name = tool.name.toLowerCase()
  const desc = tool.description.toLowerCase()

  if (id === q) score += 100
  if (name === q) score += 80
  if (name.startsWith(q)) score += 50
  if (name.includes(q)) score += 30
  if (desc.includes(q)) score += 10
  for (const kw of tool.searchKeywords) {
    if (kw.toLowerCase().includes(q)) score += 20
  }
  return score
}

// ── Store ────────────────────────────────────────────────────────────────

export const useWorkspaceStore = defineStore('workspace', () => {
  // ── State ────────────────────────────────────────────────────────────

  const tools = shallowRef<ToolMeta[]>([])
  const recentIds = ref<string[]>([])
  const favoriteIds = ref<string[]>([])
  let initialized = false

  // ── Computed ─────────────────────────────────────────────────────────

  const recentTools = computed<ToolMeta[]>(() =>
    recentIds.value
      .map(id => tools.value.find(t => t.id === id))
      .filter((t): t is ToolMeta => t != null),
  )

  const favoriteTools = computed<ToolMeta[]>(() =>
    favoriteIds.value
      .map(id => tools.value.find(t => t.id === id))
      .filter((t): t is ToolMeta => t != null),
  )

  const toolsByCategory = computed(() => {
    const map = new Map<string, ToolMeta[]>()
    for (const tool of tools.value) {
      const list = map.get(tool.category)
      if (list) list.push(tool)
      else map.set(tool.category, [tool])
    }
    return map
  })

  const categories = computed(() => [...toolsByCategory.value.keys()])

  const toolCount = computed(() => tools.value.length)

  // ── Init ─────────────────────────────────────────────────────────────

  function init(): void {
    if (initialized) return
    initialized = true

    // Collect metadata from all imported plugin modules
    const pluginList = Object.values(pluginModules) as PluginInstance[]
    tools.value = pluginList.map(extractMetadata)

    // Load persisted favorites
    try {
      const saved = localStorage.getItem('workspace:favorites')
      if (saved) {
        const parsed = JSON.parse(saved)
        if (Array.isArray(parsed)) {
          favoriteIds.value = parsed.filter((id: unknown) => typeof id === 'string').slice(0, 10)
        }
      }
    } catch {
      // localStorage unavailable or corrupt — start fresh
    }
  }

  // ── Recent ───────────────────────────────────────────────────────────

  function touchRecent(pluginId: string): void {
    // Move to front, deduplicate, cap at 10
    recentIds.value = [
      pluginId,
      ...recentIds.value.filter(id => id !== pluginId),
    ].slice(0, 10)
  }

  // ── Favorites ────────────────────────────────────────────────────────

  function toggleFavorite(pluginId: string): boolean {
    const idx = favoriteIds.value.indexOf(pluginId)
    if (idx >= 0) {
      favoriteIds.value.splice(idx, 1)
      persistFavorites()
      return false
    }
    favoriteIds.value.unshift(pluginId)
    if (favoriteIds.value.length > 10) favoriteIds.value.length = 10
    persistFavorites()
    return true
  }

  function isFavorite(pluginId: string): boolean {
    return favoriteIds.value.includes(pluginId)
  }

  function persistFavorites(): void {
    try {
      localStorage.setItem('workspace:favorites', JSON.stringify(favoriteIds.value))
    } catch {
      // localStorage unavailable
    }
  }

  // ── Search ───────────────────────────────────────────────────────────

  function searchTools(query: string): ToolMeta[] {
    const q = query.toLowerCase().trim()
    if (!q) return []
    return tools.value
      .filter(t => {
        if (t.id.toLowerCase().includes(q)) return true
        if (t.name.toLowerCase().includes(q)) return true
        if (t.description.toLowerCase().includes(q)) return true
        if (t.searchKeywords.some(k => k.toLowerCase().includes(q))) return true
        if (t.category.toLowerCase().includes(q)) return true
        return false
      })
      .sort((a, b) => relevanceScore(b, q) - relevanceScore(a, q))
  }

  function getTool(id: string): ToolMeta | undefined {
    return tools.value.find(t => t.id === id)
  }

  // ── Return ────────────────────────────────────────────────────────────

  return {
    // State
    tools,
    recentIds,
    favoriteIds,
    // Computed
    recentTools,
    favoriteTools,
    toolsByCategory,
    categories,
    toolCount,
    // Actions
    init,
    touchRecent,
    toggleFavorite,
    isFavorite,
    searchTools,
    getTool,
  }
})
