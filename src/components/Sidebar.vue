<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { Icons } from '@/design/icons'

const router = useRouter()
const route = useRoute()
const searchQuery = ref('')

// ── Categories with collapsible state ────────────────────────────────

interface MenuItem { path: string; label: string; icon: keyof typeof Icons; keywords: string; category?: string }
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
      { path: '/base64', label: 'Base64', icon: 'CaseSensitive', keywords: 'base64 encode decode', category: 'encoding' },
      { path: '/url', label: 'URL', icon: 'Link', keywords: 'url encode decode uri', category: 'encoding' },
      { path: '/jwt', label: 'JWT', icon: 'Shield', keywords: 'jwt token decode', category: 'encoding' },
      { path: '/cloud-encrypt', label: 'Cloud Encrypt', icon: 'Package', keywords: 'base_encryption filter urlencode', category: 'encoding' },
    ],
  },
  {
    id: 'crypto', label: 'Crypto', icon: 'Lock', items: [
      { path: '/crypto', label: 'AES', icon: 'Lock', keywords: 'aes encrypt decrypt cbc ecb', category: 'crypto' },
      { path: '/hash', label: 'Hash', icon: 'Hash', keywords: 'md5 sha256 hash', category: 'crypto' },
    ],
  },
  {
    id: 'formatter', label: 'Formatter', icon: 'FileJson', items: [
      { path: '/json', label: 'JSON', icon: 'FileJson', keywords: 'json format compact', category: 'formatter' },
      { path: '/sql-in', label: 'SQL IN', icon: 'Database', keywords: 'sql in list', category: 'formatter' },
    ],
  },
  {
    id: 'converter', label: 'Converter', icon: 'Clock', items: [
      { path: '/timestamp', label: 'Timestamp', icon: 'Clock', keywords: 'timestamp unix date', category: 'converter' },
    ],
  },
  {
    id: 'developer', label: 'Developer', icon: 'Beaker', items: [
      { path: '/hello', label: 'Hello', icon: 'Beaker', keywords: 'hello framework validation', category: 'developer' },
    ],
  },
]

// ── Workspace section (always visible, not collapsible) ───────────────

const workspaceItems: MenuItem[] = [
  { path: '/', label: 'Home', icon: 'Home', keywords: 'home dashboard' },
]

// ── Search ────────────────────────────────────────────────────────────

const allItems = computed(() => categories.flatMap(c => c.items))

const filteredSections = computed(() => {
  const q = searchQuery.value.toLowerCase().trim()
  if (!q) return null // no filter → show categories

  // Search mode: flat list, no categories
  return allItems.value.filter(item =>
    item.label.toLowerCase().includes(q) || item.keywords.toLowerCase().includes(q)
  )
})

function navigate(path: string) { router.push(path) }
function isActive(path: string): boolean {
  if (path === '/') return route.path === '/'
  return route.path.startsWith(path)
}
</script>

<template>
  <aside class="sidebar">
    <!-- Logo -->
    <div class="sidebar-header" @click="navigate('/')">
      <Icons.Terminal class="logo-icon" :size="22" />
      <div class="logo-text">
        <h1>Dev Toolbox</h1>
        <span class="logo-sub">Workspace</span>
      </div>
    </div>

    <!-- Search -->
    <div class="search-box">
      <Icons.Search class="search-svg" :size="14" />
      <input v-model="searchQuery" type="text" class="search-input" placeholder="Search tools..." />
      <kbd v-if="!searchQuery" class="search-kbd">⌘K</kbd>
      <button v-if="searchQuery" class="search-clear" @click="searchQuery = ''">&times;</button>
    </div>

    <nav class="sidebar-nav">
      <!-- Workspace (always visible) -->
      <template v-if="!searchQuery">
        <button v-for="item in workspaceItems" :key="item.path"
          :class="['nav-item', { active: isActive(item.path) }]" @click="navigate(item.path)">
          <component :is="Icons[item.icon]" class="nav-svg" :size="18" />
          <span class="nav-label">{{ item.label }}</span>
        </button>
        <div class="nav-divider" />
      </template>

      <!-- Search results (flat list) -->
      <template v-if="searchQuery">
        <button v-for="item in filteredSections" :key="item.path"
          :class="['nav-item', { active: isActive(item.path) }]" @click="navigate(item.path)">
          <component :is="Icons[item.icon]" class="nav-svg" :size="18" />
          <span class="nav-label">{{ item.label }}</span>
          <span class="nav-badge">{{ item.category }}</span>
        </button>
        <div v-if="filteredSections!.length === 0" class="nav-empty">No tools found</div>
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
              @click="navigate(item.path)">
              <span class="nav-label">{{ item.label }}</span>
            </button>
          </div>
        </div>
      </template>
    </nav>

    <!-- App Section -->
    <div class="sidebar-footer-section">
      <div class="nav-divider" />
      <button :class="['nav-item', { active: isActive('/settings') }]" @click="navigate('/settings')">
        <Icons.Settings class="nav-svg" :size="18" />
        <span class="nav-label">Settings</span>
      </button>
    </div>

    <div class="sidebar-footer">
      <span class="version">v1.0.0</span>
    </div>
  </aside>
</template>

<style scoped>
.sidebar {
  width: var(--sidebar-width); min-width: var(--sidebar-width);
  background: var(--color-neutral-15); color: var(--color-neutral-100);
  display: flex; flex-direction: column; height: 100vh; user-select: none;
  border-right: var(--border-width-thin) solid rgba(255,255,255,0.04);
}

/* Header */
.sidebar-header {
  padding: 16px var(--space-5) 12px; display: flex; align-items: center; gap: 10px;
  cursor: pointer; flex-shrink: 0; transition: opacity var(--duration-fast);
}
.sidebar-header:hover { opacity: 0.8; }
.logo-icon { color: var(--color-accent-primary); flex-shrink: 0; }
.logo-text h1 { font-size: var(--text-subtitle); font-weight: var(--weight-semibold); color: var(--color-neutral-110); line-height: 1.2; }
.logo-sub { font-size: var(--text-caption); color: var(--color-neutral-70); }

/* Search */
.search-box { margin: 2px var(--space-3) var(--space-2); position: relative; display: flex; align-items: center; }
.search-svg { position: absolute; left: 10px; color: var(--color-neutral-70); pointer-events: none; }
.search-input {
  width: 100%; padding: 6px 40px 6px 30px; border: var(--border-width-thin) solid rgba(255,255,255,0.06);
  border-radius: var(--radius-md); background: var(--color-neutral-20); color: var(--color-neutral-100);
  font-size: var(--text-body); font-family: var(--font-sans); outline: none; height: 30px;
  transition: border-color var(--duration-fast), background var(--duration-fast), box-shadow var(--duration-fast);
}
.search-input:hover { background: var(--color-neutral-25); border-color: rgba(255,255,255,0.10); }
.search-input:focus { background: var(--color-neutral-15); border-color: var(--border-color-focus); box-shadow: 0 0 0 2px var(--color-accent-dim); }
.search-input::placeholder { color: var(--color-neutral-70); }
.search-kbd { position: absolute; right: 8px; font-size: 10px; padding: 1px 5px; background: var(--color-neutral-40); border: var(--border-width-thin) solid rgba(255,255,255,0.06); border-radius: var(--radius-sm); color: var(--color-neutral-70); font-family: var(--font-sans); }
.search-clear { position: absolute; right: 6px; background: none; border: none; color: var(--color-neutral-70); cursor: pointer; font-size: 14px; padding: 2px 4px; }

/* Nav */
.sidebar-nav { flex: 1; padding: var(--space-1) 0; overflow-y: auto; }

.nav-item {
  display: flex; align-items: center; gap: 10px; width: 100%; height: 34px;
  padding: 0 var(--space-5); margin: 1px 0; border: none; background: transparent;
  color: var(--color-neutral-80); font-size: var(--text-body); font-family: var(--font-sans);
  cursor: pointer; text-align: left;
  border-left: var(--border-width-thick) solid transparent;
  transition: color var(--duration-fast), background var(--duration-fast), border-color var(--duration-fast);
}
.nav-item:hover { background: rgba(255,255,255,0.04); color: var(--color-neutral-100); }
.nav-item.active { background: var(--color-accent-dim); color: var(--color-accent-primary); border-left-color: var(--color-accent-primary); }

.nav-item-sub { padding-left: 40px; height: 30px; font-size: var(--text-body); }

.nav-svg { flex-shrink: 0; color: var(--color-neutral-70); transition: color var(--duration-fast); }
.nav-item:hover .nav-svg, .nav-item.active .nav-svg { color: currentColor; }
.nav-label { white-space: nowrap; font-weight: var(--weight-regular); flex: 1; }
.nav-badge { font-size: var(--text-caption); color: var(--color-neutral-60); background: var(--color-neutral-30); padding: 1px 6px; border-radius: var(--radius-full); }
.nav-empty { padding: var(--space-5); text-align: center; color: var(--color-neutral-70); font-size: var(--text-body); }
.nav-divider { height: 1px; background: rgba(255,255,255,0.04); margin: var(--space-1) var(--space-3); }

/* Categories */
.nav-category { margin: 2px 0; }
.nav-category-header {
  display: flex; align-items: center; gap: 6px; width: 100%;
  padding: 6px var(--space-5) 6px var(--space-3); border: none; background: transparent;
  color: var(--color-neutral-60); font-size: var(--text-caption); font-family: var(--font-sans);
  font-weight: var(--weight-medium); text-transform: uppercase; letter-spacing: 0.06em;
  cursor: pointer; transition: color var(--duration-fast);
}
.nav-category-header:hover { color: var(--color-neutral-80); }
.category-chevron { flex-shrink: 0; color: var(--color-neutral-60); transition: transform var(--duration-fast); }
.category-chevron.expanded { transform: rotate(90deg); }
.category-svg { flex-shrink: 0; opacity: 0.7; }
.category-label { flex: 1; text-align: left; }
.category-count { font-size: 10px; background: var(--color-neutral-30); padding: 1px 5px; border-radius: var(--radius-full); font-weight: var(--weight-regular); letter-spacing: 0; }
.nav-category-items { overflow: hidden; }

/* Footer */
.sidebar-footer-section { flex-shrink: 0; }
.sidebar-footer { padding: 10px var(--space-5); border-top: var(--border-width-thin) solid rgba(255,255,255,0.04); flex-shrink: 0; }
.version { font-size: var(--text-caption); color: var(--color-neutral-60); letter-spacing: 0.03em; }
</style>
