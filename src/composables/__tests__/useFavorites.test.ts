/**
 * useFavorites — Unit Tests
 *
 * Tests the reactive favorites composable. Uses a real Pinia store
 * with manually-set mock tools to avoid depending on plugin barrel imports.
 *
 * Verifies:
 *  - items returns ToolMeta objects with all fields
 *  - isEmpty reflects favorite count
 *  - toggle adds/removes favorites
 *  - isFavorite reflects current state
 *  - favorite tools include status field for coming-soon badge
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useWorkspaceStore } from '@/stores/workspace'
import { useFavorites } from '../useFavorites'
import type { ToolMeta } from '@/stores/workspace'

// ── localStorage polyfill (not available in vitest default env) ──────────

function mockLocalStorage() {
  let store: Record<string, string> = {}
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => { store[key] = value },
    removeItem: (key: string) => { delete store[key] },
    clear: () => { store = {} },
  }
}

beforeEach(() => {
  ;(globalThis as any).localStorage = mockLocalStorage()
})

// ── Helpers ──────────────────────────────────────────────────────────────

const MOCK_TOOLS: ToolMeta[] = [
  {
    id: 'base64',
    name: 'Base64',
    description: 'Encode and decode text to/from Base64',
    icon: 'Binary',
    category: 'encoding',
    path: '/base64',
    status: 'active',
    commands: [],
    searchKeywords: ['base64', 'encode', 'decode'],
  },
  {
    id: 'rsa',
    name: 'RSA',
    description: 'RSA encryption and decryption',
    icon: 'Key',
    category: 'crypto',
    path: '/rsa',
    status: 'coming-soon',
    commands: [],
    searchKeywords: ['rsa', 'encrypt', 'decrypt'],
  },
  {
    id: 'json',
    name: 'JSON Formatter',
    description: 'Format, validate, and minify JSON',
    icon: 'Braces',
    category: 'formatter',
    path: '/json',
    status: 'active',
    commands: [],
    searchKeywords: ['json', 'format', 'validate'],
  },
  {
    id: 'curl',
    name: 'cURL',
    description: 'HTTP request builder and tester',
    icon: 'Terminal',
    category: 'network',
    path: '/curl',
    status: 'coming-soon',
    commands: [],
    searchKeywords: ['curl', 'http', 'request'],
  },
]

function setupStore() {
  const pinia = createPinia()
  setActivePinia(pinia)
  const store = useWorkspaceStore()

  // Manually set tools instead of calling init() which imports plugins
  store.tools = MOCK_TOOLS
  store.favoriteIds = []
  store.recentIds = []

  return store
}

// ── Tests ────────────────────────────────────────────────────────────────

describe('useFavorites', () => {
  describe('items (favoriteTools computed)', () => {
    it('returns empty array when no favorites', () => {
      setupStore()
      const { items } = useFavorites()
      expect(items.value).toHaveLength(0)
    })

    it('returns ToolMeta objects for each favorited tool', () => {
      const store = setupStore()
      store.favoriteIds = ['base64', 'json']
      const { items } = useFavorites()

      expect(items.value).toHaveLength(2)
      expect(items.value[0].id).toBe('base64')
      expect(items.value[0].name).toBe('Base64')
      expect(items.value[0].description).toBe('Encode and decode text to/from Base64')
      expect(items.value[1].id).toBe('json')
      expect(items.value[1].name).toBe('JSON Formatter')
    })

    it('each item has a status field', () => {
      const store = setupStore()
      store.favoriteIds = ['base64', 'rsa']
      const { items } = useFavorites()

      for (const item of items.value) {
        expect(item, `Tool "${item.id}" must have status`).toHaveProperty('status')
        expect(['active', 'coming-soon', 'disabled']).toContain(item.status)
      }
    })

    it('each item has description and name for card rendering', () => {
      const store = setupStore()
      store.favoriteIds = ['base64']
      const { items } = useFavorites()

      const tool = items.value[0]
      expect(tool.name).toBeTruthy()
      expect(tool.description).toBeTruthy()
      expect(tool.icon).toBeTruthy()
      expect(tool.path).toBeTruthy()
    })

    it('includes coming-soon tools with their status', () => {
      const store = setupStore()
      store.favoriteIds = ['rsa', 'curl']
      const { items } = useFavorites()

      expect(items.value).toHaveLength(2)
      expect(items.value[0].status).toBe('coming-soon')
      expect(items.value[1].status).toBe('coming-soon')
    })

    it('skips tools that do not exist in the store', () => {
      const store = setupStore()
      store.favoriteIds = ['base64', 'nonexistent', 'json']
      const { items } = useFavorites()

      expect(items.value).toHaveLength(2)
      expect(items.value[0].id).toBe('base64')
      expect(items.value[1].id).toBe('json')
    })
  })

  describe('isEmpty', () => {
    it('returns true when no favorites', () => {
      setupStore()
      const { isEmpty } = useFavorites()
      expect(isEmpty.value).toBe(true)
    })

    it('returns false when favorites exist', () => {
      const store = setupStore()
      store.favoriteIds = ['base64']
      const { isEmpty } = useFavorites()
      expect(isEmpty.value).toBe(false)
    })

    it('updates reactively when favorites are cleared', () => {
      const store = setupStore()
      store.favoriteIds = ['base64']
      const { isEmpty } = useFavorites()
      expect(isEmpty.value).toBe(false)

      store.favoriteIds = []
      expect(isEmpty.value).toBe(true)
    })
  })

  describe('total', () => {
    it('returns the count of favorited tools', () => {
      const store = setupStore()
      store.favoriteIds = ['base64', 'json', 'rsa']
      const { total } = useFavorites()
      expect(total.value).toBe(3)
    })
  })

  describe('toggle', () => {
    it('adds a tool to favorites', () => {
      const store = setupStore()
      const { toggle } = useFavorites()

      const result = toggle('base64')
      expect(result).toBe(true)
      expect(store.favoriteIds).toContain('base64')
    })

    it('removes a tool from favorites', () => {
      const store = setupStore()
      store.favoriteIds = ['base64', 'json']
      const { toggle } = useFavorites()

      const result = toggle('base64')
      expect(result).toBe(false)
      expect(store.favoriteIds).not.toContain('base64')
      expect(store.favoriteIds).toEqual(['json'])
    })

    it('caps favorites at 10', () => {
      const store = setupStore()
      store.favoriteIds = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10']
      const { toggle } = useFavorites()

      toggle('11')
      expect(store.favoriteIds).toHaveLength(10)
      expect(store.favoriteIds[0]).toBe('11')
    })

    it('persists favorites to localStorage', () => {
      const store = setupStore()
      const { toggle } = useFavorites()

      toggle('base64')
      toggle('json')

      const saved = localStorage.getItem('workspace:favorites')
      expect(saved).toBeTruthy()
      const parsed = JSON.parse(saved!)
      expect(parsed).toContain('base64')
      expect(parsed).toContain('json')
    })

    it('returns reactive result — items updates after toggle', () => {
      const store = setupStore()
      const { items, toggle } = useFavorites()

      toggle('base64')
      expect(items.value).toHaveLength(1)
      expect(items.value[0].id).toBe('base64')

      toggle('base64')
      expect(items.value).toHaveLength(0)
    })
  })

  describe('isFavorite', () => {
    it('returns true for favorited tools', () => {
      const store = setupStore()
      store.favoriteIds = ['base64']
      const { isFavorite } = useFavorites()

      expect(isFavorite('base64')).toBe(true)
    })

    it('returns false for non-favorited tools', () => {
      setupStore()
      const { isFavorite } = useFavorites()

      expect(isFavorite('base64')).toBe(false)
    })
  })
})
