<script setup lang="ts">
import { computed } from 'vue'
import { APP_ICONS } from '@/design/icons'

const props = withDefaults(defineProps<{
  phase?: 'idle' | 'loading' | 'success' | 'error' | 'copied'
  message?: string | null
  clearable?: boolean
}>(), {
  phase: 'idle',
  message: null,
  clearable: false,
})

const emit = defineEmits<{
  clear: []
}>()

const role = computed(() => props.phase === 'error' ? 'alert' : 'status')
</script>

<template>
  <div
    v-if="message || phase === 'loading'"
    class="tool-status-bar"
    :class="`tool-status-${phase}`"
    :role="role"
    :aria-live="phase === 'error' ? 'assertive' : 'polite'"
  >
    <span v-if="phase === 'loading'" class="spinner" aria-hidden="true"></span>
    <component
      v-else-if="phase === 'success' || phase === 'copied'"
      :is="APP_ICONS.check"
      class="tool-status-icon"
      :size="14"
      aria-hidden="true"
    />
    <component
      v-else-if="phase === 'error'"
      :is="APP_ICONS.alert"
      class="tool-status-icon"
      :size="14"
      aria-hidden="true"
    />
    <span class="tool-status-message">{{ message || 'Processing...' }}</span>
    <button
      v-if="clearable"
      type="button"
      class="tool-status-clear"
      aria-label="Clear status"
      @click="emit('clear')"
    >
      <component :is="APP_ICONS.close" :size="14" aria-hidden="true" />
    </button>
  </div>
</template>

<style scoped>
.tool-status-bar {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  min-height: var(--tool-status-height);
  padding: var(--space-2) var(--space-3);
  border: var(--border-width-thin) solid var(--border-color-subtle);
  border-radius: var(--radius-lg);
  background: var(--color-surface-panel);
  color: var(--text-color-body);
  font-size: var(--text-body);
}

.tool-status-success,
.tool-status-copied {
  border-color: var(--color-success-border);
  background: var(--color-success-bg);
  color: var(--color-success-text);
}

.tool-status-error {
  border-color: var(--color-danger-border);
  background: var(--color-danger-bg);
  color: var(--color-danger-text);
}

.tool-status-loading {
  color: var(--text-color-description);
}

.tool-status-icon {
  flex-shrink: 0;
}

.tool-status-message {
  flex: 1;
}

.tool-status-clear {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: var(--radius-sm);
  background: transparent;
  color: currentColor;
  cursor: pointer;
  padding: var(--space-1);
}

.tool-status-clear:hover {
  background: var(--color-neutral-40);
}
</style>
