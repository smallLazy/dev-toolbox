<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { Icons } from '@/design/icons'

const router = useRouter()
const route = useRoute()
const searchQuery = ref('')

// ── Sections ──────────────────────────────────────────────────────────

interface MenuItem { path: string; label: string; icon: keyof typeof Icons; keywords: string }
interface MenuSection { id: string; label?: string; items: MenuItem[] }

const sections: MenuSection[] = [
  {
    id: 'workspace',
    items: [
      { path: '/', label: 'Home', icon: 'Home', keywords: 'home dashboard 首页' },
    ],
  },
  {
    id: 'tools',
    label: 'Tools',
    items: [
      { path: '/json', label: 'JSON', icon: 'FileJson', keywords: 'json format compact' },
      { path: '/crypto', label: 'AES', icon: 'Lock', keywords: 'aes encrypt decrypt cbc ecb' },
      { path: '/base64', label: 'Base64', icon: 'CaseSensitive', keywords: 'base64 encode decode' },
      { path: '/url', label: 'URL', icon: 'Link', keywords: 'url encode decode uri' },
      { path: '/timestamp', label: 'Timestamp', icon: 'Clock', keywords: 'timestamp unix date' },
      { path: '/hash', label: 'Hash', icon: 'Hash', keywords: 'md5 sha256 hash' },
      { path: '/jwt', label: 'JWT', icon: 'Shield', keywords: 'jwt token decode' },
      { path: '/cloud-encrypt', label: 'Cloud Encrypt', icon: 'Package', keywords: 'base_encryption filter urlencode' },
      { path: '/sql-in', label: 'SQL IN', icon: 'Database', keywords: 'sql in list' },
      { path: '/hello', label: 'Hello', icon: 'Beaker', keywords: 'hello framework validation' },
    ],
  },
  {
    id: 'app',
    label: 'Application',
    items: [
      { path: '/settings', label: 'Settings', icon: 'Settings', keywords: 'settings preferences config' },
    ],
  },
]

// ── Search ────────────────────────────────────────────────────────────

const allItems = computed(() => sections.flatMap(s => s.items))

const filteredSections = computed(() => {
  const q = searchQuery.value.toLowerCase().trim()
  if (!q) return sections

  return sections
    .map(s => ({
      ...s,
      items: s.items.filter(
        item =>
          item.label.toLowerCase().includes(q) ||
          item.keywords.toLowerCase().includes(q)
      ),
    }))
    .filter(s => s.items.length > 0)
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
      <Icons.Search class="search-icon" :size="14" />
      <input v-model="searchQuery" type="text" class="search-input" placeholder="Search tools..." />
      <kbd v-if="!searchQuery" class="search-kbd">⌘K</kbd>
      <button v-if="searchQuery" class="search-clear" @click="searchQuery = ''">&times;</button>
    </div>

    <!-- Navigation Sections -->
    <nav class="sidebar-nav">
      <template v-for="section in filteredSections" :key="section.id">
        <div v-if="section.label" class="nav-section-label">{{ section.label }}</div>
        <button
          v-for="item in section.items"
          :key="item.path"
          :class="['nav-item', { active: isActive(item.path) }]"
          @click="navigate(item.path)"
        >
          <component :is="Icons[item.icon]" class="nav-icon" :size="18" />
          <span class="nav-label">{{ item.label }}</span>
        </button>
      </template>

      <div v-if="filteredSections.length === 0" class="nav-empty">
        No tools found
      </div>
    </nav>

    <!-- Footer -->
    <div class="sidebar-footer">
      <span class="version">v0.1.0</span>
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
  cursor: pointer; flex-shrink: 0; transition: opacity var(--duration-fast) var(--ease-standard);
}
.sidebar-header:hover { opacity: 0.8 }
.logo-icon { color: var(--color-accent-primary); flex-shrink: 0; }
.logo-text h1 { font-size: var(--text-subtitle); font-weight: var(--weight-semibold); color: var(--color-neutral-110); line-height: 1.2; }
.logo-sub { font-size: var(--text-caption); color: var(--color-neutral-70); font-weight: var(--weight-regular); }

/* Search */
.search-box {
  margin: 2px var(--space-3) var(--space-2); position: relative; display: flex; align-items: center;
}
.search-icon { position: absolute; left: 10px; color: var(--color-neutral-70); pointer-events: none; }
.search-input {
  width: 100%; padding: 6px 40px 6px 30px; border: var(--border-width-thin) solid rgba(255,255,255,0.06);
  border-radius: var(--radius-md); background: var(--color-neutral-20); color: var(--color-neutral-100);
  font-size: var(--text-body); font-family: var(--font-sans); outline: none; height: 30px;
  transition: border-color var(--duration-fast), background var(--duration-fast), box-shadow var(--duration-fast);
}
.search-input:hover { background: var(--color-neutral-25); border-color: rgba(255,255,255,0.10); }
.search-input:focus { background: var(--color-neutral-15); border-color: var(--border-color-focus); box-shadow: 0 0 0 2px var(--color-accent-dim); }
.search-input::placeholder { color: var(--color-neutral-70); }
.search-kbd {
  position: absolute; right: 8px; font-size: 10px; padding: 1px 5px;
  background: var(--color-neutral-40); border: var(--border-width-thin) solid rgba(255,255,255,0.06);
  border-radius: var(--radius-sm); color: var(--color-neutral-70); font-family: var(--font-sans);
}
.search-clear { position: absolute; right: 6px; background: none; border: none; color: var(--color-neutral-70); cursor: pointer; font-size: 14px; padding: 2px 4px; }

/* Sections */
.sidebar-nav { flex: 1; padding: var(--space-1) 0; overflow-y: auto; }

.nav-section-label {
  padding: var(--space-3) var(--space-5) 4px;
  font-size: var(--text-caption); font-weight: var(--weight-medium);
  color: var(--color-neutral-60); text-transform: uppercase; letter-spacing: 0.06em;
}

/* Nav Items */
.nav-item {
  display: flex; align-items: center; gap: 10px; width: 100%; height: 34px;
  padding: 0 var(--space-5); margin: 1px 0; border: none; background: transparent;
  color: var(--color-neutral-80); font-size: var(--text-body); font-family: var(--font-sans);
  cursor: pointer; text-align: left;
  border-left: var(--border-width-thick) solid transparent;
  transition: color var(--duration-fast) var(--ease-standard),
              background var(--duration-fast) var(--ease-standard),
              border-color var(--duration-fast) var(--ease-standard);
}
.nav-item:hover { background: rgba(255,255,255,0.04); color: var(--color-neutral-100); }
.nav-item.active { background: var(--color-accent-dim); color: var(--color-accent-primary); border-left-color: var(--color-accent-primary); }
.nav-item.active .nav-icon { color: var(--color-accent-primary); }

.nav-icon { flex-shrink: 0; color: var(--color-neutral-70); transition: color var(--duration-fast); }
.nav-item:hover .nav-icon { color: var(--color-neutral-90); }

.nav-label { white-space: nowrap; font-weight: var(--weight-regular); }
.nav-empty { padding: var(--space-5); text-align: center; color: var(--color-neutral-70); font-size: var(--text-body); }

/* Footer */
.sidebar-footer { padding: 10px var(--space-5); border-top: var(--border-width-thin) solid rgba(255,255,255,0.04); flex-shrink: 0; }
.version { font-size: var(--text-caption); color: var(--color-neutral-60); letter-spacing: 0.03em; }
</style>
