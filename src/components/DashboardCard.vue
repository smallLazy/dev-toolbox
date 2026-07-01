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
    <div class="card-icon">
      <component :is="iconComponent" :size="ICON_SIZE['2xl']" />
    </div>
    <div class="card-body">
      <span class="card-title">{{ name }}</span>
      <span class="card-desc">{{ description }}</span>
    </div>
    <span v-if="status === 'coming-soon'" class="card-status-badge">Coming soon</span>
    <button
      class="card-favorite"
      :class="{ 'card-favorite-active': favorited }"
      :aria-label="favorited ? `Remove ${name} from favorites` : `Add ${name} to favorites`"
      @click="onToggleFavorite"
    >
      <Icons.Star :size="ICON_SIZE.sm" />
    </button>
  </div>
</template>

<style scoped>
.dashboard-card {
  position: relative;
  display: flex;
  align-items: center;
  gap: var(--space-3);
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
  width: 40px;
  height: 40px;
}

.card-body {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
  padding-right: 28px; /* space for favorite button */
}

.card-title {
  font-size: var(--text-base);
  font-weight: var(--weight-medium);
  color: var(--color-neutral-100);
  line-height: var(--leading-snug);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.card-desc {
  font-size: var(--text-label);
  color: var(--color-neutral-70);
  line-height: var(--leading-snug);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* ── Favorite Button ─────────────────────────────────────────────── */

.card-favorite {
  position: absolute;
  top: var(--space-2);
  right: var(--space-2);
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  padding: 0;
  border: none;
  border-radius: var(--radius-sm);
  background: transparent;
  color: var(--color-neutral-60);
  cursor: pointer;
  transition: color var(--duration-fast) var(--ease-standard),
              background var(--duration-fast) var(--ease-standard);
}

.card-favorite:hover {
  color: var(--color-neutral-90);
  background: var(--color-neutral-40);
}

.card-favorite-active {
  color: var(--color-accent-primary);
}

.card-favorite-active:hover {
  color: var(--color-accent-hover);
}

/* ── Status Badge ─────────────────────────────────────────────────── */

.card-status-badge {
  position: absolute;
  bottom: var(--space-tight);
  right: var(--space-3);
  font-size: var(--text-caption);
  font-weight: var(--weight-medium);
  color: var(--color-warning-text);
  background: var(--color-warning-bg);
  padding: var(--space-compact) var(--space-tight);
  border-radius: var(--radius-full);
  text-transform: uppercase;
}
</style>
