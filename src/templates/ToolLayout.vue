<script setup lang="ts">
import ToolHeader from './ToolHeader.vue'

withDefaults(defineProps<{
  title: string
  description?: string
  shortcutHints?: string[]
  badge?: string
  layout?: 'io' | 'editor' | 'inspector' | 'custom'
}>(), {
  description: '',
  shortcutHints: () => [],
  badge: '',
  layout: 'io',
})
</script>

<template>
  <section class="tool-layout" :data-layout="layout">
    <slot name="header">
      <ToolHeader
        :title="title"
        :description="description"
        :shortcut-hints="shortcutHints"
        :badge="badge"
      />
    </slot>

    <div v-if="$slots.options" class="tool-layout-options">
      <slot name="options" />
    </div>

    <div class="tool-layout-workspace">
      <slot name="workspace">
        <slot />
      </slot>
    </div>

    <div v-if="$slots.actions" class="tool-layout-actions">
      <slot name="actions" />
    </div>

    <div v-if="$slots.status" class="tool-layout-status">
      <slot name="status" />
    </div>
  </section>
</template>

<style scoped>
.tool-layout {
  width: min(100%, var(--tool-layout-max-width));
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.tool-layout-options,
.tool-layout-actions,
.tool-layout-status {
  width: 100%;
}

.tool-layout-workspace {
  min-width: 0;
}
</style>
