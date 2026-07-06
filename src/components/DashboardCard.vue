<script setup lang="ts">
import { computed } from 'vue'
import { getToolIcon, ICON_SIZE, Icons } from '@/design/icons'
import { useFavorites } from '@/composables/useFavorites'
import type { Component } from 'vue'

const props = defineProps<{
  pluginId: string
  name: string
  description: string
  icon: string
  path: string
  status?: string
  variant?: 'default' | 'recent' | 'favorite'
}>()

const emit = defineEmits<{
  select: [pluginId: string]
  'toggle-favorite': [pluginId: string]
}>()

const { isFavorite, toggle } = useFavorites()

const iconComponent = computed<Component>(() => getToolIcon(props.pluginId))
const favorited = computed(() => isFavorite(props.pluginId))
const ariaLabel = computed(() => `${props.name} — ${props.description}`)

function onToggleFavorite(e: Event) {
  e.stopPropagation()
  e.preventDefault()
  toggle(props.pluginId)
  emit('toggle-favorite', props.pluginId)
}

function onCardKeydown(e: KeyboardEvent) {
  if (e.key === 'Enter') {
    emit('select', props.pluginId)
  } else if (e.key === ' ') {
    e.preventDefault()
    emit('select', props.pluginId)
  }
}
</script>

<template>
  <div
    class="dashboard-card"
    :class="[`card-${variant ?? 'default'}`]"
    role="button"
    tabindex="0"
    :aria-label="ariaLabel"
    @click="emit('select', pluginId)"
    @keydown="onCardKeydown"
  >
    <div class="card-header">
      <div class="card-title-group">
        <div class="card-icon">
          <component :is="iconComponent" :size="ICON_SIZE['2xl']" />
        </div>
        <span class="card-title">{{ name }}</span>
      </div>
      <div class="card-actions">
        <span v-if="status === 'coming-soon'" class="card-status-badge">Soon</span>
        <button
          class="card-favorite"
          :class="{ 'card-favorite-active': favorited }"
          :aria-label="favorited ? `Remove ${name} from favorites` : `Add ${name} to favorites`"
          @click="onToggleFavorite"
        >
          <Icons.Star :size="ICON_SIZE.sm" />
        </button>
      </div>
    </div>
    <span class="card-desc" :title="description">{{ description }}</span>
  </div>
</template>

<style scoped>
.dashboard-card {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: var(--space-1);
  width: 100%;
  height: var(--dashboard-card-height);
  padding: 0 var(--space-4);
  background: var(--color-neutral-35);
  border: var(--border-width-thin) solid var(--border-color-subtle);
  border-radius: var(--radius-xl);
  cursor: pointer;
  text-align: left;
  font-family: var(--font-sans);
  transition: box-shadow var(--duration-normal) var(--ease-decelerate),
              border-color var(--duration-normal) var(--ease-decelerate);
}

.dashboard-card:hover {
  border-color: var(--border-color-hover);
  box-shadow: var(--shadow-sm);
}

.dashboard-card:focus-visible {
  border-color: var(--border-color-focus);
  outline: var(--border-width-thin) solid var(--border-color-focus);
  outline-offset: 2px;
}

.card-icon {
  flex-shrink: 0;
  color: var(--color-accent-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  width: var(--card-icon-size-lg);
  height: var(--card-icon-size-lg);
}

.card-header {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  width: 100%;
}

.card-title-group {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  flex: 1;
  min-width: 0;
}

.card-title {
  flex: 1;
  min-width: 0;
  font-size: var(--text-base);
  font-weight: var(--weight-medium);
  color: var(--color-neutral-100);
  line-height: var(--leading-snug);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.card-desc {
  width: 100%;
  font-size: var(--text-label);
  color: var(--color-neutral-70);
  line-height: var(--leading-snug);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* ── Actions Area ────────────────────────────────────────────────── */

.card-actions {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

/* ── Favorite Button ─────────────────────────────────────────────── */

button.card-favorite {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: var(--card-icon-size-sm);
  height: var(--card-icon-size-sm);
  padding: 0;
  border: none;
  border-radius: var(--radius-sm);
  background: transparent;
  color: var(--color-neutral-60);
  cursor: pointer;
  transition: color var(--duration-fast) var(--ease-standard),
              background var(--duration-fast) var(--ease-standard);
}

button.card-favorite:hover {
  color: var(--color-neutral-90);
  background: var(--color-neutral-40);
}

button.card-favorite-active {
  color: var(--color-accent-primary);
}

button.card-favorite-active:hover {
  color: var(--color-accent-hover);
}

/* ── Status Badge ─────────────────────────────────────────────────── */

.card-status-badge {
  flex-shrink: 0;
  font-size: var(--text-caption);
  font-weight: var(--weight-medium);
  color: var(--color-warning-text);
  background: var(--color-warning-bg);
  padding: var(--space-compact) var(--space-tight);
  border-radius: var(--radius-full);
}
</style>
