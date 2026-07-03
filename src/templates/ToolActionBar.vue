<script setup lang="ts">
import type { ToolAction } from './types'

const props = withDefaults(defineProps<{
  primary?: ToolAction
  secondary?: ToolAction[]
}>(), {
  primary: undefined,
  secondary: () => [],
})

const emit = defineEmits<{
  action: [id: string]
  primaryPointerDown: [event: PointerEvent]
  primaryClick: [event: MouseEvent]
}>()

if (import.meta.env.DEV) {
  const primaryCount = [props.primary, ...props.secondary].filter(a => a?.variant === 'primary').length + (props.primary ? 1 : 0)
  if (primaryCount > 1) {
    console.warn('ToolActionBar expects at most one primary action.')
  }
}

function onSecondary(action: ToolAction) {
  if (!action.disabled && !action.busy) emit('action', action.id)
}
</script>

<template>
  <div class="tool-action-bar">
    <button
      v-if="primary"
      type="button"
      class="btn-accent"
      :disabled="primary.disabled || primary.busy"
      :aria-label="primary.ariaLabel || primary.label"
      @pointerdown="emit('primaryPointerDown', $event)"
      @click="emit('primaryClick', $event)"
    >
      <span v-if="primary.busy" class="spinner" aria-hidden="true"></span>
      <span>{{ primary.busy ? 'Processing...' : primary.label }}</span>
      <kbd v-if="primary.shortcut" class="tool-action-shortcut">{{ primary.shortcut }}</kbd>
    </button>

    <button
      v-for="action in secondary"
      :key="action.id"
      type="button"
      class="btn-secondary"
      :disabled="action.disabled || action.busy"
      :aria-label="action.ariaLabel || action.label"
      @click="onSecondary(action)"
    >
      <span>{{ action.label }}</span>
      <kbd v-if="action.shortcut" class="tool-action-shortcut">{{ action.shortcut }}</kbd>
    </button>

    <slot />
  </div>
</template>

<style scoped>
.tool-action-bar {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  flex-wrap: wrap;
}

.tool-action-shortcut {
  font-size: var(--text-caption);
  font-family: var(--font-mono);
  color: currentColor;
  opacity: var(--opacity-shortcut);
}
</style>
