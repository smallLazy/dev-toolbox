<script setup lang="ts">
/**
 * ToolHeader — Standard page header
 *
 * Renders the tool title and description.
 * Use the default slot to provide custom description content (e.g. with <kbd> elements).
 * If no slot content is provided, the `description` prop is rendered as plain text.
 */
withDefaults(defineProps<{
  title: string
  description?: string
  shortcutHints?: string[]
  badge?: string
}>(), {
  description: '',
  shortcutHints: () => [],
  badge: '',
})
</script>

<template>
  <header class="page-header">
    <div class="page-title-row">
      <h1 class="page-title">{{ title }}</h1>
      <span v-if="badge" class="page-badge">{{ badge }}</span>
    </div>
    <p v-if="description || $slots.default" class="page-desc">
      <slot>
        {{ description }}
      </slot>
    </p>
    <div v-if="shortcutHints.length" class="page-shortcuts" aria-label="Keyboard shortcuts">
      <kbd v-for="hint in shortcutHints" :key="hint">{{ hint }}</kbd>
    </div>
  </header>
</template>

<style scoped>
.page-header {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.page-title-row {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  min-width: 0;
}

.page-title {
  font-size: var(--text-title);
  font-weight: var(--weight-semibold);
  color: var(--color-neutral-110);
  letter-spacing: 0;
  line-height: var(--leading-tight);
}

.page-desc {
  font-size: var(--text-body);
  color: var(--color-neutral-70);
}

.page-badge {
  font-size: var(--text-caption);
  font-weight: var(--weight-medium);
  color: var(--color-info-text);
  background: var(--color-info-bg);
  border-radius: var(--radius-full);
  padding: var(--space-compact) var(--space-tight);
}

.page-shortcuts {
  display: flex;
  gap: var(--space-2);
  flex-wrap: wrap;
  margin-top: var(--space-1);
}

.page-desc :deep(kbd),
.page-shortcuts kbd {
  font-size: var(--text-caption);
  padding: var(--space-kbd-y) var(--space-kbd-x);
  background: var(--color-neutral-40);
  border: var(--border-width-thin) solid var(--border-color-default);
  border-radius: var(--radius-sm);
  font-family: var(--font-mono);
}
</style>
