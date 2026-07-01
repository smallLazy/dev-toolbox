<script setup lang="ts">
/**
 * ToolPage — Standard tool page wrapper
 *
 * Provides the outermost .page container with max-width centering.
 * All tool pages should wrap their content in this component.
 */
</script>

<template>
  <div class="page">
    <slot />
  </div>
</template>

<style scoped>
.page {
  max-width: var(--content-max-width);
  margin: 0 auto;
}
</style>
