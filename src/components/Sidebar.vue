<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { Icons, APP_ICONS } from '@/design/icons'
import { useWorkspaceStore } from '@/stores/workspace'
import PluginEmptyState from '@/templates/PluginEmptyState.vue'

const router = useRouter()
const route = useRoute()
const workspaceStore = useWorkspaceStore()
const searchQuery = ref('')

const appVersion = `v${__APP_VERSION__}`

// ── Categories with collapsible state ────────────────────────────────

interface MenuItem { path: string; label: string; icon: keyof typeof Icons; keywords: string; category?: string; pluginId?: string }
interface CategorySection { id: string; label: string; icon: keyof typeof Icons; items: MenuItem[] }

const collapsed = ref<Set<string>>(new Set())

function toggleCategory(id: string) {
  if (collapsed.value.has(id)) collapsed.value.delete(id)
  else collapsed.value.add(id)
  collapsed.value = new Set(collapsed.value) // trigger reactivity
}

const categories: CategorySection[] = [
  {
    id: 'encoding', label: 'Encoding', icon: 'CaseSensitive', items: [
      { path: '/base64', label: 'Base64', icon: 'CaseSensitive', keywords: 'base64 encode decode', category: 'encoding', pluginId: 'base64' },
      { path: '/url', label: 'URL', icon: 'Link', keywords: 'url encode decode uri', category: 'encoding', pluginId: 'url' },
      { path: '/jwt', label: 'JWT', icon: 'Shield', keywords: 'jwt token decode', category: 'encoding', pluginId: 'jwt' },
      { path: '/cloud-encrypt', label: 'Cloud Encrypt', icon: 'Package', keywords: 'base_encryption filter urlencode', category: 'encoding', pluginId: 'cloud-encrypt' },
    ],
  },
  {
    id: 'crypto', label: 'Crypto', icon: 'Lock', items: [
      { path: '/crypto', label: 'AES', icon: 'Lock', keywords: 'aes encrypt decrypt cbc ecb', category: 'crypto', pluginId: 'crypto' },
      { path: '/hash', label: 'Hash', icon: 'Hash', keywords: 'md5 sha256 hash', category: 'crypto', pluginId: 'hash' },
    ],
  },
  {
    id: 'formatter', label: 'Formatter', icon: 'FileJson', items: [
      { path: '/json', label: 'JSON', icon: 'FileJson', keywords: 'json format compact', category: 'formatter', pluginId: 'json' },
      { path: '/sql-in', label: 'SQL IN', icon: 'Database', keywords: 'sql in list', category: 'formatter', pluginId: 'sql-in' },
    ],
  },
  {
    id: 'converter', label: 'Converter', icon: 'Clock', items: [
      { path: '/timestamp', label: 'Timestamp', icon: 'Clock', keywords: 'timestamp unix date', category: 'converter', pluginId: 'timestamp' },
    ],
  },
  {
    id: 'developer', label: 'Developer', icon: 'Beaker', items: [
      { path: '/hello', label: 'Hello', icon: 'Beaker', keywords: 'hello framework validation', category: 'developer', pluginId: 'hello' },
    ],
  },
]

// ── Workspace section (always visible, not collapsible) ───────────────

const workspaceItems: MenuItem[] = [
  { path: '/', label: 'Home', icon: 'Home', keywords: 'home dashboard', pluginId: 'home' },
]

// ── Search → Command Palette ──────────────────────────────────────────

function onSearchFocus() {
  // Open Command Palette instead of filtering sidebar (VSCode-style)
  window.dispatchEvent(new CustomEvent('workspace:open-palette'))
}

const filteredSections = computed(() => {
  const q = searchQuery.value.toLowerCase().trim()
  if (!q) return null
  return allItems.value.filter(item =>
    item.label.toLowerCase().includes(q) || item.keywords.toLowerCase().includes(q)
  )
})

const allItems = computed(() => categories.flatMap(c => c.items))

// ── Navigation — single code path, always touches recent ─────────────

function navigate(path: string, pluginId?: string) {
  if (pluginId) {
    workspaceStore.touchRecent(pluginId)
  } else {
    // Fallback: look up plugin by path in workspace store
    const tool = workspaceStore.tools.find(t => t.path === path)
    if (tool) workspaceStore.touchRecent(tool.id)
  }
  router.push(path)
}

function isActive(path: string): boolean {
  if (path === '/') return route.path === '/'
  return route.path.startsWith(path)
}
</script>

<template>
  <aside class="sidebar">
    <!-- Logo -->
    <div class="sidebar-header" @click="navigate('/', 'home')">
      <component :is="APP_ICONS.workspace" class="logo-icon" :size="22" />
      <div class="logo-text">
        <h1>Dev Toolbox</h1>
        <span class="logo-sub">Workspace</span>
      </div>
    </div>

    <!-- Search -->
    <div class="search-box">
      <Icons.Search class="search-svg" :size="14" />
      <input v-model="searchQuery" type="text" class="search-input" placeholder="Search tools..." @focus="onSearchFocus" />
      <kbd v-if="!searchQuery" class="search-kbd">⌘K</kbd>
      <button v-if="searchQuery" class="search-clear" @click="searchQuery = ''">&times;</button>
    </div>

    <nav class="sidebar-nav">
      <!-- Workspace (always visible) -->
      <template v-if="!searchQuery">
        <button v-for="item in workspaceItems" :key="item.path"
          :class="['nav-item', { active: isActive(item.path) }]" @click="navigate(item.path, item.pluginId)">
          <component :is="Icons[item.icon]" class="nav-svg" :size="18" />
          <span class="nav-label">{{ item.label }}</span>
        </button>
        <div class="nav-divider" />
      </template>

      <!-- Search results (flat list) -->
      <template v-if="searchQuery">
        <button v-for="item in filteredSections" :key="item.path"
          :class="['nav-item', { active: isActive(item.path) }]" @click="navigate(item.path, item.pluginId)">
          <component :is="Icons[item.icon]" class="nav-svg" :size="18" />
          <span class="nav-label">{{ item.label }}</span>
          <span class="nav-badge">{{ item.category }}</span>
        </button>
        <PluginEmptyState
          v-if="searchQuery && filteredSections!.length === 0"
          :icon="Icons.Search"
          title="No tools found"
          description="Try a different search term."
        />
      </template>

      <!-- Categories (collapsible) -->
      <template v-if="!searchQuery">
        <div v-for="cat in categories" :key="cat.id" class="nav-category">
          <button class="nav-category-header" @click="toggleCategory(cat.id)">
            <Icons.ChevronRight
              :class="['category-chevron', { expanded: !collapsed.has(cat.id) }]"
              :size="12"
            />
            <component :is="Icons[cat.icon]" class="category-svg" :size="14" />
            <span class="category-label">{{ cat.label }}</span>
            <span class="category-count">{{ cat.items.length }}</span>
          </button>
          <div v-if="!collapsed.has(cat.id)" class="nav-category-items">
            <button v-for="item in cat.items" :key="item.path"
              :class="['nav-item nav-item-sub', { active: isActive(item.path) }]"
              @click="navigate(item.path, item.pluginId)">
              <span class="nav-label">{{ item.label }}</span>
            </button>
          </div>
        </div>
      </template>
    </nav>

    <!-- App Section -->
    <div class="sidebar-footer-section">
      <div class="nav-divider" />
      <button :class="['nav-item', { active: isActive('/settings') }]" @click="navigate('/settings', 'settings')">
        <Icons.Settings class="nav-svg" :size="18" />
        <span class="nav-label">Settings</span>
      </button>
      <button :class="['nav-item', { active: isActive('/about') }]" @click="navigate('/about')">
        <Icons.Info class="nav-svg" :size="18" />
        <span class="nav-label">About</span>
      </button>
    </div>

    <div class="sidebar-footer">
      <span class="version">{{ appVersion }}</span>
    </div>
  </aside>
</template>

<style scoped>
.sidebar {
  width: var(--sidebar-width); min-width: var(--sidebar-width);
  background: var(--sidebar-bg); color: var(--sidebar-text);
  display: flex; flex-direction: column; height: 100vh; user-select: none;
  border-right: var(--border-width-thin) solid var(--sidebar-divider);
}

/* Header */
.sidebar-header {
  padding: var(--space-4) var(--space-5) var(--space-3); display: flex; align-items: center; gap: var(--space-control-x);
  cursor: pointer; flex-shrink: 0; transition: opacity var(--duration-fast);
}
.sidebar-header:hover { opacity: 0.8; }
.logo-icon { color: var(--color-accent-primary); flex-shrink: 0; }
.logo-text h1 { font-size: var(--text-subtitle); font-weight: var(--weight-semibold); color: var(--color-neutral-110); line-height: 1.2; }
.logo-sub { font-size: var(--text-caption); color: var(--sidebar-text-secondary); }

/* Search */
.search-box { margin: 2px var(--space-3) var(--space-2); position: relative; display: flex; align-items: center; }
.search-svg { position: absolute; left: 10px; color: var(--sidebar-icon); pointer-events: none; }
.search-input {
  width: 100%; padding: var(--space-tight) var(--space-10) var(--space-tight) var(--space-control-lg-x); border: var(--border-width-thin) solid var(--sidebar-divider);
  border-radius: var(--radius-md); background: var(--color-neutral-20); color: var(--sidebar-text);
  font-size: var(--text-body); font-family: var(--font-sans); outline: none; height: 30px;
  transition: border-color var(--duration-fast), background var(--duration-fast), box-shadow var(--duration-fast);
}
.search-input:hover { background: var(--color-neutral-25); border-color: var(--border-color-hover); }
.search-input:focus { background: var(--color-neutral-15); border-color: var(--border-color-focus); box-shadow: 0 0 0 2px var(--color-accent-dim); }
.search-input::placeholder { color: var(--sidebar-text-secondary); }
.search-kbd { position: absolute; right: 8px; font-size: 10px; padding: 1px 5px; background: var(--color-neutral-40); border: var(--border-width-thin) solid var(--sidebar-divider); border-radius: var(--radius-sm); color: var(--sidebar-text-secondary); font-family: var(--font-sans); }
.search-clear { position: absolute; right: 6px; background: none; border: none; color: var(--sidebar-text-secondary); cursor: pointer; font-size: 14px; padding: 2px 4px; }

/* Nav */
.sidebar-nav { flex: 1; padding: var(--space-1) 0; overflow-y: auto; }

.nav-item {
  display: flex; align-items: center; gap: var(--space-control-x); width: 100%; height: 34px;
  padding: 0 var(--space-5); margin: 1px 0; border: none; background: transparent;
  color: var(--sidebar-text); font-size: var(--text-body); font-family: var(--font-sans);
  cursor: pointer; text-align: left;
  border-left: var(--border-width-thick) solid transparent;
  transition: color var(--duration-fast), background var(--duration-fast), border-color var(--duration-fast);
}
.nav-item:hover { background: var(--sidebar-hover-bg); color: var(--sidebar-text-hover); }
.nav-item.active { background: var(--sidebar-active-bg); color: var(--color-accent-primary); border-left-color: var(--color-accent-primary); }

.nav-item-sub { padding-left: 40px; height: 30px; font-size: var(--text-body); }

.nav-svg { flex-shrink: 0; color: var(--sidebar-icon); transition: color var(--duration-fast); }
.nav-item:hover .nav-svg { color: var(--sidebar-icon-hover); }
.nav-item.active .nav-svg { color: var(--sidebar-icon-active); }
.nav-label { white-space: nowrap; font-weight: var(--weight-regular); flex: 1; }
.nav-badge { font-size: var(--text-caption); color: var(--sidebar-badge-text); background: var(--sidebar-badge-bg); padding: 1px 6px; border-radius: var(--radius-full); }
.nav-empty { padding: var(--space-5); text-align: center; color: var(--sidebar-text-secondary); font-size: var(--text-body); }
.nav-divider { height: 1px; background: var(--sidebar-divider); margin: var(--space-1) var(--space-3); }

/* Categories */
.nav-category { margin: 2px 0; }
.nav-category-header {
  display: flex; align-items: center; gap: var(--space-tight); width: 100%;
  padding: var(--space-tight) var(--space-5) var(--space-tight) var(--space-3); border: none; background: transparent;
  color: var(--sidebar-category); font-size: var(--text-label); font-family: var(--font-sans);
  font-weight: var(--weight-semibold); letter-spacing: 0.08em;
  cursor: pointer; transition: color var(--duration-fast);
}
.nav-category-header:hover { color: var(--sidebar-text); }
.category-chevron { flex-shrink: 0; color: var(--sidebar-category); transition: transform var(--duration-fast); }
.category-chevron.expanded { transform: rotate(90deg); }
.category-svg { flex-shrink: 0; }
.category-label { flex: 1; text-align: left; }
.category-count { font-size: 10px; color: var(--sidebar-badge-text); background: var(--sidebar-badge-bg); padding: 1px 5px; border-radius: var(--radius-full); font-weight: var(--weight-regular); letter-spacing: 0; }
.nav-category-items { overflow: hidden; }

/* Footer */
.sidebar-footer-section { flex-shrink: 0; }
.sidebar-footer { padding: var(--space-control-x) var(--space-5); border-top: var(--border-width-thin) solid var(--sidebar-divider); flex-shrink: 0; }
.version { font-size: var(--text-caption); color: var(--sidebar-text-secondary); letter-spacing: 0.03em; }
</style>
