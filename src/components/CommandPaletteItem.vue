<script setup lang="ts">
import { computed } from 'vue'
import { getToolIcon, ICON_SIZE } from '@/design/icons'
import { Icons } from '@/design/icons'
import type { Component } from 'vue'
import type { PaletteItem } from '@/composables/useCommandPalette'

const props = defineProps<{
  item: PaletteItem
  active: boolean
}>()

const emit = defineEmits<{
  select: []
  hover: []
}>()

function onPointerDown(event: PointerEvent) {
  if (event.button !== 0) return
  event.preventDefault()
  emit('select')
}

const iconComponent = computed<Component>(() => {
  if (props.item.id === 'about') return Icons.Info
  if (props.item.type === 'setting') return Icons.Settings
  return getToolIcon(props.item.pluginId ?? props.item.id)
})
</script>

<template>
  <button
    type="button"
    class="palette-item"
    :class="{ 'palette-item-active': active }"
    role="option"
    :aria-selected="active"
    @pointerdown="onPointerDown"
    @mouseenter="$emit('hover')"
  >
    <div class="palette-item-icon">
      <component :is="iconComponent" :size="ICON_SIZE.lg" />
    </div>
    <div class="palette-item-body">
      <span class="palette-item-label">{{ item.label }}</span>
      <span v-if="item.description" class="palette-item-desc">{{ item.description }}</span>
    </div>
    <div class="palette-item-right">
      <span v-if="item.type === 'favorite'" class="palette-badge palette-badge-favorite">
        <Icons.Star :size="10" /> Favorite
      </span>
      <span v-else-if="item.type === 'recent'" class="palette-badge palette-badge-recent">Recent</span>
      <span v-else-if="item.type === 'command'" class="palette-badge palette-badge-command">Command</span>
      <span v-else-if="item.category && item.type === 'plugin'" class="palette-badge palette-badge-category">{{ item.category }}</span>
      <kbd v-if="item.shortcut" class="palette-item-shortcut">{{ item.shortcut }}</kbd>
    </div>
  </button>
</template>

<style scoped>
.palette-item {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  width: 100%;
  height: var(--command-palette-item-height);
  padding: 0 var(--space-4);
  border: none;
  background: transparent;
  color: var(--sidebar-text);
  font-family: var(--font-sans);
  font-size: var(--text-body);
  cursor: pointer;
  text-align: left;
  transition: background-color var(--duration-fast) var(--ease-standard);
}

.palette-item-active {
  background: var(--color-accent-dim);
}

.palette-item-icon {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  color: var(--sidebar-icon);
}

.palette-item-active .palette-item-icon {
  color: var(--color-accent-primary);
}

.palette-item-body {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 1px;
}

.palette-item-label {
  font-size: var(--text-body);
  font-weight: var(--weight-medium);
  color: var(--color-neutral-100);
  line-height: var(--leading-snug);
}

.palette-item-desc {
  font-size: var(--text-caption);
  color: var(--color-neutral-70);
  line-height: var(--leading-snug);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.palette-item-right {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.palette-badge {
  font-size: var(--text-micro);
  padding: 1px 5px;
  border-radius: var(--radius-full);
  font-weight: var(--weight-medium);
  line-height: var(--leading-tight);
  white-space: nowrap;
}

.palette-badge-favorite {
  color: var(--color-accent-primary);
  background: var(--color-accent-dim);
}

.palette-badge-recent {
  color: var(--color-neutral-80);
  background: var(--color-neutral-30);
}

.palette-badge-command {
  color: var(--color-info-text);
  background: var(--color-info-bg);
}

.palette-badge-category {
  color: var(--color-neutral-60);
  background: var(--color-neutral-30);
  text-transform: capitalize;
}

.palette-item-shortcut {
  font-size: var(--text-micro);
  padding: 1px 5px;
  background: var(--color-neutral-40);
  border: var(--border-width-thin) solid var(--sidebar-divider);
  border-radius: var(--radius-sm);
  color: var(--color-neutral-70);
  font-family: var(--font-sans);
}
</style>
