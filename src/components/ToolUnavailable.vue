<script setup lang="ts">
/**
 * ToolUnavailable — Fallback page for unregistered or unimplemented paths.
 *
 * Three modes based on plugin status:
 *   1. Known plugin, status 'coming-soon' → "Tool not activated"
 *   2. Known plugin, status 'disabled'    → "Tool unavailable"
 *   3. Unknown path (no matching plugin)  → "Page not found"
 *
 * Zero emoji. All icons from @/design/icons.
 */
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useWorkspaceStore, type PluginStatus } from '@/stores/workspace'
import { Icons } from '@/design/icons'

const route = useRoute()
const store = useWorkspaceStore()

const toolMeta = computed(() => {
  const path = route.path
  return store.tools.find(t => t.path === path) ?? null
})

const pluginStatus = computed<PluginStatus | null>(() => toolMeta.value?.status ?? null)

const isKnownPlugin = computed(() => toolMeta.value !== null)
const isDisabled = computed(() => pluginStatus.value === 'disabled')

const displayName = computed(() => toolMeta.value?.name ?? 'Page not found')

const displayDescription = computed(() => {
  if (toolMeta.value) return toolMeta.value.description
  return 'The page you are looking for does not exist.'
})

const cardTitle = computed(() => {
  if (!isKnownPlugin.value) return 'Page not found'
  if (isDisabled.value) return 'Tool unavailable'
  return 'Tool not activated'
})

const cardDescription = computed(() => {
  if (!isKnownPlugin.value) {
    return 'The page you are looking for does not exist. It may have been removed or the link may be incorrect.'
  }
  if (isDisabled.value) {
    return 'This tool has been disabled. Check your workspace settings or contact the administrator.'
  }
  return 'This tool is planned but not available in the current beta. Check the roadmap or contribute on GitHub.'
})
</script>

<template>
  <div class="page">
    <header class="page-header">
      <h1 class="page-title">{{ displayName }}</h1>
      <p class="page-desc">{{ displayDescription }}</p>
    </header>

    <div class="unavailable-card">
      <div class="unavailable-icon">
        <Icons.Clock v-if="isKnownPlugin" :size="48" />
        <Icons.Search v-else :size="48" />
      </div>
      <h2 class="unavailable-title">{{ cardTitle }}</h2>
      <p class="unavailable-desc">{{ cardDescription }}</p>
      <div v-if="isKnownPlugin" class="unavailable-actions">
        <a
          class="btn-secondary"
          href="https://github.com/smallLazy/dev-toolbox"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Icons.ExternalLink :size="14" />
          View on GitHub
        </a>
      </div>
    </div>
  </div>
</template>

<style scoped>
.page {
  max-width: var(--content-max-width);
  margin: 0 auto;
}

.page-header {
  margin-bottom: var(--space-8);
}

.page-title {
  font-size: var(--text-title);
  font-weight: var(--weight-semibold);
  color: var(--color-neutral-110);
  margin-bottom: var(--space-1);
  letter-spacing: -0.01em;
}

.page-desc {
  font-size: var(--text-body);
  color: var(--color-neutral-70);
}

.unavailable-card {
  text-align: center;
  padding: var(--space-16) var(--space-5);
  background: var(--color-neutral-35);
  border: var(--border-width-thin) solid var(--border-color-subtle);
  border-radius: var(--radius-xl);
}

.unavailable-icon {
  color: var(--color-neutral-70);
  opacity: 0.3;
  margin-bottom: var(--space-6);
}

.unavailable-title {
  font-size: var(--text-subtitle);
  font-weight: var(--weight-semibold);
  color: var(--color-neutral-90);
  margin-bottom: var(--space-2);
}

.unavailable-desc {
  font-size: var(--text-body);
  color: var(--color-neutral-70);
  max-width: 420px;
  margin: 0 auto var(--space-6);
  line-height: var(--leading-relaxed);
}

.unavailable-actions {
  display: flex;
  justify-content: center;
  gap: var(--space-3);
}

.btn-secondary {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-4);
  background: var(--color-neutral-40);
  color: var(--color-neutral-100);
  border: var(--border-width-thin) solid var(--border-color-default);
  border-radius: var(--radius-md);
  font-size: var(--text-body);
  font-family: var(--font-sans);
  font-weight: var(--weight-medium);
  cursor: pointer;
  text-decoration: none;
  transition: background var(--duration-fast) var(--ease-standard);
}

.btn-secondary:hover {
  background: var(--color-neutral-45);
}
</style>
