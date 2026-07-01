<script setup lang="ts">
/**
 * ToolOutputPanel — Readonly output textarea with character count
 *
 * Used inside a ToolSection with variant="output".
 * Displays the transformation result in a readonly textarea.
 */
defineProps<{
  value: string
  ariaLabel?: string
  stats?: { chars: number } | null
}>()
</script>

<template>
  <textarea
    :value="value"
    class="dt-textarea"
    rows="6"
    readonly
    spellcheck="false"
    :aria-label="ariaLabel"
    aria-live="polite"
  />
  <div v-if="stats" class="char-count">chars: {{ stats.chars }}</div>
</template>

<style scoped>
.char-count {
  font-size: var(--text-caption);
  color: var(--color-neutral-50);
  margin-top: var(--space-1);
  text-align: right;
}
</style>
