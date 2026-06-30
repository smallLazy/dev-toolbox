<script setup lang="ts">
defineProps<{
  icon?: string       // emoji fallback (until icon component is passed)
  title: string
  description: string
}>()
</script>

<template>
  <div class="empty-state">
    <div v-if="icon" class="empty-icon">{{ icon }}</div>
    <h3 class="empty-title">{{ title }}</h3>
    <p class="empty-desc">{{ description }}</p>
  </div>
</template>

<style scoped>
.empty-state { text-align: center; padding: var(--space-10) var(--space-5); }
.empty-icon { font-size: 48px; opacity: 0.15; margin-bottom: var(--space-4); }
.empty-title { font-size: var(--text-subtitle); font-weight: var(--weight-medium); color: var(--color-neutral-90); margin-bottom: var(--space-1); }
.empty-desc { font-size: var(--text-body); color: var(--color-neutral-70); }
</style>
