<script setup lang="ts">
import { ref } from 'vue'

withDefaults(defineProps<{
  advancedLabel?: string
}>(), {
  advancedLabel: 'Advanced',
})

const advancedOpen = ref(false)
</script>

<template>
  <section class="tool-options-row">
    <div class="tool-options-main">
      <slot />
      <button
        v-if="$slots.advanced"
        type="button"
        class="tool-options-toggle"
        :aria-expanded="advancedOpen"
        @click="advancedOpen = !advancedOpen"
      >
        {{ advancedLabel }}
      </button>
    </div>
    <div v-if="$slots.advanced && advancedOpen" class="tool-options-advanced">
      <slot name="advanced" />
    </div>
  </section>
</template>

<style scoped>
.tool-options-row {
  background: var(--color-surface-panel);
  border: var(--border-width-thin) solid var(--border-color-subtle);
  border-radius: var(--radius-xl);
  padding: var(--space-3) var(--space-4);
}

.tool-options-main,
.tool-options-advanced {
  display: flex;
  align-items: flex-end;
  gap: var(--space-3);
  flex-wrap: wrap;
}

.tool-options-advanced {
  margin-top: var(--space-3);
  padding-top: var(--space-3);
  border-top: var(--border-width-thin) solid var(--border-color-subtle);
}

.tool-options-toggle {
  border: var(--border-width-thin) solid var(--border-color-default);
  border-radius: var(--radius-md);
  background: var(--color-neutral-40);
  color: var(--text-color-label);
  font-size: var(--text-label);
  font-family: var(--font-sans);
  padding: var(--space-tight) var(--space-control-x);
  cursor: pointer;
  transition:
    background var(--duration-fast) var(--ease-standard),
    border-color var(--duration-fast) var(--ease-standard),
    color var(--duration-fast) var(--ease-standard);
}

.tool-options-toggle:hover {
  background: var(--color-neutral-45);
  border-color: var(--border-color-hover);
  color: var(--text-color-body);
}
</style>
