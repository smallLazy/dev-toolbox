<script setup lang="ts">
/**
 * ToolActions — Standard action button bar
 *
 * Renders a flex container for action buttons (Execute, Copy, Clear, Swap, etc.).
 * Positioned between input and output sections.
 */
</script>

<template>
  <div class="action-bar">
    <slot />
  </div>
</template>

<style scoped>
.action-bar {
  display: flex;
  gap: var(--space-2);
  flex-wrap: wrap;
}
</style>
