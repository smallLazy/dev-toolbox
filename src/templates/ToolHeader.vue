<script setup lang="ts">
/**
 * ToolHeader — Standard page header
 *
 * Renders the tool title and description.
 * Use the default slot to provide custom description content (e.g. with <kbd> elements).
 * If no slot content is provided, the `description` prop is rendered as plain text.
 */
defineProps<{
  title: string
  description?: string
}>()
</script>

<template>
  <header class="page-header">
    <h1 class="page-title">{{ title }}</h1>
    <p v-if="description || $slots.default" class="page-desc">
      <slot>
        {{ description }}
      </slot>
    </p>
  </header>
</template>

<style scoped>
.page-header {
  margin-bottom: var(--space-6);
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

.page-desc :deep(kbd) {
  font-size: var(--text-caption);
  padding: 1px 5px;
  background: var(--color-neutral-40);
  border: var(--border-width-thin) solid var(--border-color-default);
  border-radius: var(--radius-sm);
  font-family: var(--font-mono);
}
</style>
