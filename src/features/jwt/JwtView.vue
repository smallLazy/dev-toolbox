<script setup lang="ts">
/**
 * JWT Plugin — Main View
 *
 * Standard io layout matching JSON Formatter / Base64 / URL Encode patterns.
 */
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useJwt } from './composables'
import { useTextActionTrigger } from '@/composables/useTextActionTrigger'
import ToolLayout from '@/templates/ToolLayout.vue'
import ToolWorkspace from '@/templates/ToolWorkspace.vue'
import InputOutputPanel from '@/templates/InputOutputPanel.vue'
import ToolActionBar from '@/templates/ToolActionBar.vue'
import ToolStatusBar from '@/templates/ToolStatusBar.vue'
import ToolHeader from '@/templates/ToolHeader.vue'
import type { ToolAction } from '@/templates/types'

const {
  input, output, error, loading, statusPhase, statusMessage,
  toolbar, execute, loadExample, init, dispose,
} = useJwt()

const {
  inputEl,
  syncInputFromDom,
  handleCompositionStart,
  handleCompositionEnd,
  handleInputBlur,
  handlePointerDown,
  handleClick,
  handleShortcut,
} = useTextActionTrigger({ model: input, loading, execute })

// ── Actions ───────────────────────────────────────────────────────────

const primaryAction = computed<ToolAction>(() => ({
  id: 'decode',
  label: 'Decode',
  busy: loading.value,
  disabled: loading.value,
  shortcut: 'Cmd Enter',
  ariaLabel: 'Decode JWT',
}))

const secondaryActions = computed<ToolAction[]>(() => {
  const actions: ToolAction[] = []
  // Copy Output — hidden when no output (per Section 3a Action Visibility Rules)
  if (output.value) {
    actions.push({ id: 'copy', label: 'Copy Output', disabled: loading.value })
  }
  actions.push({ id: 'clear', label: 'Clear', disabled: loading.value })
  actions.push({ id: 'example', label: 'Example', disabled: loading.value })
  return actions
})

const visibleStatusPhase = computed(() => {
  if (loading.value) return 'loading'
  if (error.value) return 'error'
  return statusPhase.value
})

const visibleStatusMessage = computed(() => {
  if (loading.value) return 'Processing...'
  if (error.value) return error.value
  return statusMessage.value
})

// ── Handlers ──────────────────────────────────────────────────────────

async function handleSecondaryAction(id: string) {
  if (id === 'copy') {
    await toolbar.execute('copy')
    return
  }
  if (id === 'clear') {
    await toolbar.execute('clear')
    return
  }
  if (id === 'example') {
    await loadExample()
  }
}

function clearStatus() {
  error.value = null
  statusPhase.value = 'idle'
  statusMessage.value = 'Ready'
}

onMounted(() => init())
onUnmounted(() => dispose())
</script>

<template>
  <ToolLayout
    title="JWT Decoder"
    description="Decode JWT header, payload, and signature locally"
    layout="io"
    @keydown="handleShortcut"
  >
    <template #header>
      <ToolHeader
        title="JWT Decoder"
        description="Decode JWT header, payload, and signature locally"
      />
      <p class="jwt-notice">This tool decodes tokens locally. It does not verify signatures.</p>
    </template>

    <template #workspace>
      <ToolWorkspace layout="io">
        <template #input>
          <InputOutputPanel
            title="JWT Token"
            :stats="{ chars: input.length }"
            :invalid="!!error"
            aria-label="JWT token input"
          >
            <textarea
              ref="inputEl"
              v-model="input"
              class="dt-textarea tool-textarea"
              rows="12"
              placeholder="Paste JWT token here (eyJhbGciOi...)"
              aria-label="JWT token input"
              spellcheck="false"
              @blur="handleInputBlur"
              @compositionstart="handleCompositionStart"
              @compositionend="handleCompositionEnd"
            />
          </InputOutputPanel>
        </template>
        <template #output>
          <InputOutputPanel
            title="Output"
            :value="output ?? ''"
            readonly
            placeholder="Decoded JWT output will appear here."
            :stats="output ? { chars: output.length } : null"
            aria-label="JWT decoded output"
          />
        </template>
      </ToolWorkspace>
    </template>

    <template #actions>
      <ToolActionBar
        :primary="primaryAction"
        :secondary="secondaryActions"
        @primary-pointer-down="handlePointerDown"
        @primary-click="handleClick"
        @action="handleSecondaryAction"
      />
    </template>

    <template #status>
      <ToolStatusBar
        :phase="visibleStatusPhase"
        :message="visibleStatusMessage"
        :clearable="!!visibleStatusMessage"
        @clear="clearStatus"
      />
    </template>
  </ToolLayout>
</template>

<style scoped>
.jwt-notice {
  font-size: var(--text-caption);
  color: var(--color-neutral-70);
  margin-top: var(--space-2);
}

.tool-textarea {
  flex: 1;
  min-height: var(--tool-textarea-min-height);
}
</style>
