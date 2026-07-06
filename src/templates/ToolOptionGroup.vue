<script setup lang="ts">
/**
 * ToolOptionGroup — Shared label + control wrapper for tool options
 *
 * Replaces the duplicated .tool-field / .tool-field-label pattern that was
 * previously copied into every feature view.  Use inside a ToolOptionsRow.
 *
 * @example
 * <ToolOptionsRow>
 *   <ToolOptionGroup label="Mode">
 *     <ToolSegmentedControl v-model="mode" :options="modeOptions" />
 *   </ToolOptionGroup>
 *   <ToolOptionGroup label="Variant">
 *     <ToolSegmentedControl v-model="variant" :options="variantOptions" />
 *   </ToolOptionGroup>
 * </ToolOptionsRow>
 */
defineProps<{
  label: string
}>()
</script>

<template>
  <div class="tool-option-group">
    <label class="tool-option-group-label">{{ label }}</label>
    <slot />
  </div>
</template>

<style scoped>
.tool-option-group {
  display: flex;
  flex-direction: column;
  gap: var(--space-compact);
}

.tool-option-group-label {
  font-size: var(--text-label);
  font-weight: var(--weight-medium);
  color: var(--text-color-label);
}
</style>
