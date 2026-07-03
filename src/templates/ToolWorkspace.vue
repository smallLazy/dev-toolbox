<script setup lang="ts">
withDefaults(defineProps<{
  layout?: 'io' | 'editor' | 'inspector' | 'custom'
}>(), {
  layout: 'io',
})
</script>

<template>
  <div class="tool-workspace" :data-layout="layout">
    <template v-if="$slots.input || $slots.output || $slots.side">
      <div v-if="$slots.input" class="tool-workspace-pane">
        <slot name="input" />
      </div>
      <div v-if="$slots.output" class="tool-workspace-pane">
        <slot name="output" />
      </div>
      <aside v-if="$slots.side" class="tool-workspace-side">
        <slot name="side" />
      </aside>
    </template>
    <slot v-else />
  </div>
</template>

<style scoped>
.tool-workspace {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  gap: var(--space-4);
  align-items: stretch;
  min-width: 0;
}

.tool-workspace[data-layout="editor"] {
  grid-template-columns: minmax(0, 1.15fr) minmax(0, 0.85fr);
}

.tool-workspace[data-layout="inspector"] {
  grid-template-columns: minmax(0, 0.9fr) minmax(0, 1.1fr);
}

.tool-workspace-pane,
.tool-workspace-side {
  min-width: 0;
}

.tool-workspace-side {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

@media (max-width: 980px) {
  .tool-workspace,
  .tool-workspace[data-layout="editor"],
  .tool-workspace[data-layout="inspector"] {
    grid-template-columns: minmax(0, 1fr);
  }
}
</style>
