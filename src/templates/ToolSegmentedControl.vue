<script setup lang="ts">
/**
 * ToolSegmentedControl — Segmented button group for mode/variant toggles
 *
 * Supports v-model for two-way binding.
 * Uses pointer-safe event handling to prevent double-firing.
 *
 * @example
 * <ToolSegmentedControl
 *   v-model="mode"
 *   :options="[{ label: 'Encode', value: 'encode' }, { label: 'Decode', value: 'decode' }]"
 *   aria-label="Mode selector"
 * />
 */
import { ref } from 'vue'

const props = defineProps<{
  modelValue: string
  options: { label: string; value: string }[]
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const triggeredByPointer = ref(false)

function select(value: string) {
  emit('update:modelValue', value)
}

function handlePointerDown(event: PointerEvent, value: string) {
  event.preventDefault()
  event.stopPropagation()
  triggeredByPointer.value = true
  select(value)
  globalThis.setTimeout(() => {
    triggeredByPointer.value = false
  }, 0)
}

function handleClick(value: string) {
  if (triggeredByPointer.value) {
    return
  }
  select(value)
}
</script>

<template>
  <div class="segmented-control" role="group">
    <button
      v-for="opt in options"
      :key="opt.value"
      type="button"
      :class="{ active: modelValue === opt.value }"
      :aria-pressed="modelValue === opt.value"
      @pointerdown="handlePointerDown($event, opt.value)"
      @click="handleClick(opt.value)"
    >
      {{ opt.label }}
    </button>
  </div>
</template>

<style scoped>
.segmented-control {
  display: inline-flex;
  gap: 0;
}

.segmented-control button {
  flex: 1;
  white-space: nowrap;
  padding: var(--space-1) var(--space-4);
  font-size: var(--text-body);
  font-weight: var(--weight-medium);
  background: var(--color-neutral-25);
  color: var(--color-neutral-70);
  border: var(--border-width-thin) solid var(--border-color-default);
  cursor: pointer;
  transition:
    background var(--duration-fast) var(--ease-standard),
    color var(--duration-fast) var(--ease-standard),
    border-color var(--duration-fast) var(--ease-standard);
}

.segmented-control button:first-child {
  border-radius: var(--radius-md) 0 0 var(--radius-md);
}

.segmented-control button:last-child {
  border-radius: 0 var(--radius-md) var(--radius-md) 0;
}

.segmented-control button.active {
  background: var(--color-accent-primary);
  color: var(--color-neutral-120);
  border-color: var(--color-accent-primary);
}
</style>
