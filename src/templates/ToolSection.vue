<script setup lang="ts">
/**
 * ToolSection — Standard card section
 *
 * Renders a card with a header and body.
 * Use variant="output" for output panels (accent border + darker body background).
 * Use the header-actions slot for right-aligned actions in the card header.
 */
withDefaults(defineProps<{
  title: string
  variant?: 'default' | 'output'
}>(), {
  variant: 'default',
})
</script>

<template>
  <div class="card" :class="{ 'card-output': variant === 'output' }">
    <div class="card-header">
      <span class="card-header-text">{{ title }}</span>
      <span v-if="$slots['header-actions']" class="card-header-actions">
        <slot name="header-actions" />
      </span>
    </div>
    <div class="card-body">
      <slot />
    </div>
  </div>
</template>

<style scoped>
.card {
  background: var(--color-neutral-35);
  border: var(--border-width-thin) solid var(--border-color-subtle);
  border-radius: var(--radius-xl);
  overflow: hidden;
}

.card-output {
  border-color: var(--border-color-focus);
}

.card-output .card-body {
  background: var(--color-neutral-15);
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-card-header-y) var(--space-5);
  font-size: var(--text-caption);
  font-weight: var(--weight-medium);
  color: var(--color-neutral-60);
  text-transform: uppercase;
  letter-spacing: 0.06em;
  border-bottom: var(--border-width-thin) solid var(--border-color-subtle);
}

.card-header-text {
  flex: 1;
}

.card-header-actions {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.card-body {
  padding: var(--space-4) var(--space-5);
}
</style>
