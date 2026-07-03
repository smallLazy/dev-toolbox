<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  title: string
  modelValue?: string
  value?: string
  readonly?: boolean
  placeholder?: string
  stats?: { chars?: number; lines?: number; size?: string | number } | null
  ariaLabel?: string
  invalid?: boolean
  error?: string | null
  rows?: number
}>(), {
  modelValue: undefined,
  value: undefined,
  readonly: false,
  placeholder: '',
  stats: null,
  ariaLabel: '',
  invalid: false,
  error: null,
  rows: 12,
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
  blur: [event: FocusEvent]
  compositionstart: [event: CompositionEvent]
  compositionend: [event: CompositionEvent]
}>()

const panelValue = computed(() => props.modelValue ?? props.value ?? '')
const hasStats = computed(() => props.stats && Object.values(props.stats).some(v => v != null && v !== ''))

function onInput(event: Event) {
  emit('update:modelValue', (event.target as HTMLTextAreaElement).value)
}
</script>

<template>
  <section class="io-panel" :class="{ 'io-panel-invalid': invalid || error }">
    <header class="io-panel-header">
      <span class="io-panel-title">{{ title }}</span>
      <span v-if="hasStats" class="io-panel-stats">
        <template v-if="stats?.chars != null">chars: {{ stats.chars }}</template>
        <template v-if="stats?.lines != null"> lines: {{ stats.lines }}</template>
        <template v-if="stats?.size != null"> size: {{ stats.size }}</template>
      </span>
    </header>
    <div class="io-panel-body">
      <slot>
        <textarea
          class="dt-textarea io-panel-textarea"
          :value="panelValue"
          :readonly="readonly"
          :rows="rows"
          :placeholder="placeholder"
          :aria-label="ariaLabel || title"
          :aria-invalid="invalid || !!error"
          spellcheck="false"
          @input="onInput"
          @blur="emit('blur', $event)"
          @compositionstart="emit('compositionstart', $event)"
          @compositionend="emit('compositionend', $event)"
        />
      </slot>
    </div>
    <p v-if="error" class="io-panel-error">{{ error }}</p>
  </section>
</template>

<style scoped>
.io-panel {
  display: flex;
  flex-direction: column;
  min-height: var(--tool-panel-min-height);
  height: 100%;
  background: var(--color-surface-panel);
  border: var(--border-width-thin) solid var(--border-color-subtle);
  border-radius: var(--radius-xl);
  overflow: hidden;
}

.io-panel-invalid {
  border-color: var(--color-danger-border);
}

.io-panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-3);
  padding: var(--space-card-header-y) var(--space-5);
  border-bottom: var(--border-width-thin) solid var(--border-color-subtle);
}

.io-panel-title {
  font-size: var(--text-caption);
  font-weight: var(--weight-medium);
  color: var(--text-color-card-header);
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.io-panel-stats {
  font-size: var(--text-caption);
  color: var(--text-color-description);
  white-space: nowrap;
}

.io-panel-body {
  flex: 1;
  display: flex;
  min-height: 0;
  padding: var(--space-4);
}

.io-panel-textarea {
  flex: 1;
  min-height: var(--tool-textarea-min-height);
  resize: vertical;
}

.io-panel-textarea[readonly] {
  background: var(--color-surface-output);
}

.io-panel-error {
  padding: 0 var(--space-4) var(--space-3);
  color: var(--color-danger-text);
  font-size: var(--text-body);
}
</style>
