<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useDiff } from './composables'
import { parseUnifiedDiffLines } from './logic'
import { useTextActionTrigger } from '@/composables/useTextActionTrigger'
import ToolLayout from '@/templates/ToolLayout.vue'
import ToolWorkspace from '@/templates/ToolWorkspace.vue'
import InputOutputPanel from '@/templates/InputOutputPanel.vue'
import ToolActionBar from '@/templates/ToolActionBar.vue'
import ToolOptionsRow from '@/templates/ToolOptionsRow.vue'
import ToolOptionGroup from '@/templates/ToolOptionGroup.vue'
import ToolStatusBar from '@/templates/ToolStatusBar.vue'
import ToolSegmentedControl from '@/templates/ToolSegmentedControl.vue'
import type { ToolAction } from '@/templates/types'

const {
  leftText,
  rightText,
  output,
  error,
  loading,
  contextLines,
  ignoreWhitespace,
  ignoreCase,
  leftStats,
  rightStats,
  diffStats,
  toolbar,
  execute,
  init,
  dispose,
} = useDiff()

// ── Execute wrapper — syncs right DOM value before running diff ─────
// useTextActionTrigger.runAction() already syncs the left textarea.
// This wrapper handles the right textarea sync on top.
async function executeWithSync() {
  syncRightFromDom()
  await execute()
}

// ── useTextActionTrigger — left textarea is the primary model ───────
const {
  inputEl,
  syncInputFromDom,
  handleCompositionStart,
  handleCompositionEnd,
  handleInputBlur,
  handlePointerDown,
  handleClick,
  handleShortcut,
} = useTextActionTrigger({ model: leftText, loading, execute: executeWithSync })

// ── Right textarea — manual IME/blur handlers ───────────────────────
const rightInputEl = ref<HTMLTextAreaElement | null>(null)
const isRightComposing = ref(false)

function syncRightFromDom() {
  const domValue = rightInputEl.value?.value
  if (typeof domValue === 'string') {
    rightText.value = domValue
  }
}

function handleRightCompositionStart() {
  isRightComposing.value = true
}

function handleRightCompositionEnd() {
  syncRightFromDom()
  isRightComposing.value = false
}

function handleRightBlur() {
  syncRightFromDom()
  isRightComposing.value = false
}

// ── Options ─────────────────────────────────────────────────────────
const contextLineOptions = [
  { label: '3', value: '3' },
  { label: '5', value: '5' },
  { label: '10', value: '10' },
  { label: 'All', value: '0' },
]

// ── Status ──────────────────────────────────────────────────────────
const statusPhase = ref<'idle' | 'loading' | 'success' | 'error' | 'copied'>('idle')
const statusMessage = ref<string | null>(null)

const visibleStatusPhase = computed(() => {
  if (loading.value) return 'loading'
  if (error.value) return 'error'
  return statusPhase.value
})

const visibleStatusMessage = computed(() => {
  if (loading.value) return 'Comparing...'
  if (error.value) return error.value
  return statusMessage.value
})

// ── Actions ─────────────────────────────────────────────────────────
const primaryAction = computed<ToolAction>(() => ({
  id: 'compare',
  label: 'Compare',
  busy: loading.value,
  disabled: loading.value,
  shortcut: 'Cmd Enter',
  ariaLabel: 'Compare left and right text',
}))

const secondaryActions = computed<ToolAction[]>(() => {
  const actions: ToolAction[] = []
  if (output.value) {
    actions.push({ id: 'copy', label: 'Copy Output', disabled: loading.value })
  }
  actions.push({ id: 'clear', label: 'Clear', disabled: loading.value })
  return actions
})

const parsedLines = computed(() => {
  if (!output.value) return []
  return parseUnifiedDiffLines(output.value)
})

const unchangedCount = computed(() => {
  return parsedLines.value.filter((l) => l.type === 'unchanged').length
})

const outputPanelStats = computed(() => {
  if (!output.value) return null
  return {
    chars: output.value.length,
    lines: output.value ? output.value.split('\n').length : 0,
  }
})

// ── Handlers ────────────────────────────────────────────────────────
function handleContextLinesChange(val: string) {
  contextLines.value = Number(val)
}

async function handleSecondaryAction(id: string) {
  if (id === 'copy') {
    await toolbar.execute('copy')
    if (!error.value) {
      statusPhase.value = 'copied'
      statusMessage.value = 'Result copied to clipboard.'
    }
    return
  }

  if (id === 'clear') {
    await toolbar.execute('clear')
    statusPhase.value = 'idle'
    statusMessage.value = null
  }
}

function clearStatus() {
  error.value = null
  statusPhase.value = 'idle'
  statusMessage.value = null
}

// ── Lifecycle ───────────────────────────────────────────────────────
onMounted(() => init())
onUnmounted(() => dispose())
</script>

<template>
  <ToolLayout
    title="Text Diff"
    description="Compare Modified Text against Original Text."
    :shortcut-hints="['Cmd Enter to compare']"
    layout="io"
    @keydown="handleShortcut"
  >
    <template #options>
      <ToolOptionsRow>
        <ToolOptionGroup label="Context Lines">
          <ToolSegmentedControl
            :model-value="String(contextLines)"
            :options="contextLineOptions"
            @update:model-value="handleContextLinesChange"
          />
        </ToolOptionGroup>
        <ToolOptionGroup label="Ignore Whitespace">
          <label class="tool-check-field">
            <input v-model="ignoreWhitespace" type="checkbox" />
            <span>Ignore Whitespace</span>
          </label>
        </ToolOptionGroup>
        <ToolOptionGroup label="Ignore Case">
          <label class="tool-check-field">
            <input v-model="ignoreCase" type="checkbox" />
            <span>Ignore Case</span>
          </label>
        </ToolOptionGroup>
      </ToolOptionsRow>
    </template>

    <template #workspace>
      <ToolWorkspace layout="io">
        <template #input>
          <div class="diff-input-stack">
            <InputOutputPanel
              title="Original Text"
              :stats="leftStats"
              :invalid="!!error"
              aria-label="Left text to compare"
            >
              <textarea
                ref="inputEl"
                v-model="leftText"
                class="dt-textarea tool-textarea"
                rows="8"
                placeholder="Paste the original version here..."
                aria-label="Left text to compare"
                spellcheck="false"
                @blur="handleInputBlur"
                @compositionstart="handleCompositionStart"
                @compositionend="handleCompositionEnd"
              />
            </InputOutputPanel>
            <InputOutputPanel
              title="Modified Text"
              :stats="rightStats"
              :invalid="!!error"
              aria-label="Right text to compare"
            >
              <textarea
                ref="rightInputEl"
                v-model="rightText"
                class="dt-textarea tool-textarea"
                rows="8"
                placeholder="Paste the modified version here..."
                aria-label="Right text to compare"
                spellcheck="false"
                @blur="handleRightBlur"
                @compositionstart="handleRightCompositionStart"
                @compositionend="handleRightCompositionEnd"
              />
            </InputOutputPanel>
          </div>
        </template>
        <template #output>
          <InputOutputPanel
            title="Diff Output"
            :stats="outputPanelStats"
            aria-label="Diff output"
          >
            <div v-if="output && parsedLines.length > 0" class="diff-viewer">
              <div class="diff-summary">
                <span class="diff-summary-stat diff-summary-added">+{{ diffStats?.addedCount ?? 0 }} added</span>
                <span class="diff-summary-stat diff-summary-removed">-{{ diffStats?.removedCount ?? 0 }} removed</span>
                <span class="diff-summary-stat diff-summary-unchanged">{{ unchangedCount }} unchanged</span>
                <span class="diff-summary-note">Modified vs. Original</span>
              </div>
              <div class="diff-lines" role="list" aria-label="Diff output lines">
                <div
                  v-for="(line, i) in parsedLines"
                  :key="i"
                  class="diff-line"
                  :class="`diff-line--${line.type}`"
                  role="listitem"
                >
                  <span class="diff-line-marker" aria-hidden="true">{{ line.marker }}</span>
                  <span class="diff-line-content">{{ line.content }}</span>
                </div>
              </div>
            </div>
            <div v-else class="diff-empty">
              Unified diff output will appear here.
            </div>
          </InputOutputPanel>
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
.diff-input-stack {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  min-height: 0;
  height: 100%;
}

.diff-input-stack > :deep(.io-panel) {
  flex: 1;
  min-height: 0;
}

.tool-textarea {
  flex: 1;
  min-height: var(--tool-textarea-min-height);
}

.tool-check-field {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  font-size: var(--text-body);
  color: var(--text-color-body);
  cursor: pointer;
  user-select: none;
}

/* ── Diff viewer ──────────────────────────────────────────────────── */

.diff-viewer {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
  overflow: hidden;
}

.diff-summary {
  display: flex;
  align-items: center;
  gap: var(--space-4);
  padding: var(--space-2) var(--space-3);
  border-bottom: var(--border-width-thin) solid var(--border-color-subtle);
  font-size: var(--text-caption);
  color: var(--text-color-description);
  flex-shrink: 0;
}

.diff-summary-added {
  color: var(--color-success-text);
}

.diff-summary-removed {
  color: var(--color-danger-text);
}

.diff-summary-note {
  margin-left: auto;
  color: var(--text-color-description);
  font-style: italic;
}

.diff-lines {
  flex: 1;
  overflow-y: auto;
  font-family: var(--font-mono);
  font-size: var(--text-body);
  line-height: 1.5;
}

.diff-line {
  display: flex;
  padding: 0 var(--space-3);
  white-space: pre;
  overflow-wrap: normal;
  min-height: calc(1.5em + 2px);
}

.diff-line-marker {
  width: 2ch;
  flex-shrink: 0;
  text-align: center;
  user-select: none;
}

.diff-line-content {
  flex: 1;
}

.diff-line--added {
  background: var(--color-success-bg);
  color: var(--color-success-text);
  border-left: 3px solid var(--color-success-border);
}

.diff-line--removed {
  background: var(--color-danger-bg);
  color: var(--color-danger-text);
  border-left: 3px solid var(--color-danger-border);
}

.diff-line--hunk {
  background: var(--color-surface-panel);
  color: var(--text-color-description);
  font-weight: var(--weight-semibold);
}

.diff-line--unchanged {
  color: var(--text-color-body);
}

.diff-empty {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-color-description);
  font-size: var(--text-body);
}
</style>
