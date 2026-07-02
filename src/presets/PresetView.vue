<script setup lang="ts">
/**
 * PresetView — Generic Pipeline Preset UI
 *
 * Renders any PipelinePreset with encode/decode mode toggle,
 * input/output textareas, execute button, pipeline step preview,
 * and optional migration banner.
 *
 * Layout uses shared ToolPage components for consistent visual spec.
 */
import { onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { usePreset } from './composables'
import { usePointerSafeAction } from '@/composables/usePointerSafeAction'
import type { PipelinePreset } from '@/shared/pipeline/types'
import ToolPage from '@/templates/ToolPage.vue'
import ToolHeader from '@/templates/ToolHeader.vue'
import ToolSection from '@/templates/ToolSection.vue'
import ToolActions from '@/templates/ToolActions.vue'
import ToolOutputPanel from '@/templates/ToolOutputPanel.vue'
import ToolSegmentedControl from '@/templates/ToolSegmentedControl.vue'

// Preset registry — maps preset IDs to their definitions
const presetRegistry: Record<string, PipelinePreset> = {}

// Auto-register presets from barrel
import { phpCompatiblePreset } from './php-compatible.preset'
presetRegistry[phpCompatiblePreset.id] = phpCompatiblePreset

const route = useRoute()
const presetId = (route.meta?.preset as string) ?? 'php-compatible'
const preset = computed(() => presetRegistry[presetId])

const {
  input, output, error, loading, mode,
  pipelineResult, execute, clear, swap, copy, selectMode,
} = usePreset(preset.value!)

onMounted(() => {
  if (!presetRegistry[presetId]) {
    console.warn(`[PresetView] Unknown preset: "${presetId}"`)
  }
})

const showMigrationBanner = computed(() =>
  route.query?.from === preset.value?.deprecated?.oldRoute?.slice(1),
)

// ── Mode options for ToolSegmentedControl ─────────────────────────────
const modeOptions = [
  { label: 'Encode', value: 'encode' },
  { label: 'Decode', value: 'decode' },
]

function handleModeChange(value: string) {
  selectMode(value as 'encode' | 'decode')
}

// ── Pointer-safe toolbar actions (Copy, Clear, Swap) ──────────────────
const copyAction = usePointerSafeAction()
const clearAction = usePointerSafeAction({ disabled: () => loading.value })
const swapAction = usePointerSafeAction()
</script>

<template>
  <ToolPage v-if="preset">
    <ToolHeader
      :title="preset.name"
      :description="preset.description"
    />

    <div class="page-content">
      <!-- Configuration: Mode selector -->
      <ToolSection title="Configuration">
        <div class="field">
          <label class="field-label">Mode</label>
          <ToolSegmentedControl
            :model-value="mode"
            :options="modeOptions"
            @update:model-value="handleModeChange"
          />
        </div>
      </ToolSection>

      <!-- Input -->
      <ToolSection title="Input">
        <textarea
          v-model="input"
          class="dt-textarea"
          rows="6"
          :placeholder="mode === 'encode' ? 'Enter text to encode...' : 'Enter text to decode...'"
        />
      </ToolSection>

      <!-- Actions -->
      <ToolActions>
        <button class="btn-accent" :disabled="loading" @click="execute">
          <span v-if="loading" class="spinner"></span>
          {{ loading ? 'Processing...' : (mode === 'encode' ? 'Run Encode' : 'Run Decode') }}
        </button>
        <button
          v-if="output"
          type="button"
          class="btn-secondary"
          aria-label="Copy output to clipboard"
          @pointerdown="copyAction.handlePointerDown($event, () => copy())"
          @click="copyAction.handleClick(() => copy())"
        >Copy Output</button>
        <button
          type="button"
          class="btn-secondary"
          aria-label="Clear input and output"
          @pointerdown="clearAction.handlePointerDown($event, () => clear())"
          @click="clearAction.handleClick(() => clear())"
        >Clear</button>
        <button
          type="button"
          class="btn-secondary"
          :disabled="!output"
          aria-label="Swap input and output"
          @pointerdown="swapAction.handlePointerDown($event, () => swap())"
          @click="swapAction.handleClick(() => swap())"
        >Swap I/O</button>
      </ToolActions>

      <!-- Error -->
      <div v-if="error" class="alert-error">{{ error }}</div>

      <!-- Migration banner -->
      <div v-if="showMigrationBanner" class="migration-banner">
        You were redirected from the legacy "{{ preset.deprecated?.oldName }}" tool.
        {{ preset.deprecated?.migrationNote }}
      </div>

      <!-- Pipeline preview (preserved: unique to PresetView) -->
      <div v-if="pipelineResult && pipelineResult.steps.length > 0" class="card pipeline-card">
        <div class="card-header">Pipeline Preview</div>
        <div class="card-body pipeline-body">
          <div class="pipeline-step-initial">
            <span class="pipeline-label">Input</span>
            <code class="pipeline-value">{{ input.slice(0, 80) }}{{ input.length > 80 ? '...' : '' }}</code>
          </div>
          <div v-for="step in pipelineResult.steps" :key="step.stepId" class="pipeline-step">
            <div class="pipeline-arrow">↓ {{ step.label }}</div>
            <code class="pipeline-value">{{ step.output.slice(0, 100) }}{{ step.output.length > 100 ? '...' : '' }}</code>
          </div>
          <div class="pipeline-timing">
            Total {{ pipelineResult.totalDurationMs.toFixed(2) }}ms
          </div>
        </div>
      </div>

      <!-- Output -->
      <ToolSection v-if="output" title="Output" variant="output">
        <ToolOutputPanel
          :value="output"
          :aria-label="'Pipeline output'"
        />
        <button
          type="button"
          class="btn-secondary btn-copy"
          aria-label="Copy output to clipboard"
          @pointerdown="copyAction.handlePointerDown($event, () => copy())"
          @click="copyAction.handleClick(() => copy())"
        >Copy</button>
      </ToolSection>

      <!-- Info: Encode / Decode Pipeline description (preserved: unique to PHP Codec) -->
      <div class="info-card">
        <h4 v-if="mode === 'encode'">Encode Pipeline</h4>
        <h4 v-else>Decode Pipeline</h4>
        <p class="pipeline">
          <code v-if="mode === 'encode'">
            Input → URL Encode(PHP, spaces to +) → Base64 Encode → Remove trailing =
          </code>
          <code v-else>
            Input → Restore Base64 padding → Base64 Decode → URL Decode(PHP)
          </code>
        </p>
        <p v-if="mode === 'encode'" class="pipeline-note">
          Note: This is not encryption. It is a compatibility encoding pipeline.
        </p>
        <p v-else class="pipeline-note">
          Note: This is not decryption. It is a compatibility decoding pipeline.
        </p>
        <ul>
          <li>Equivalent to PHP <code>base_encryption()</code> / <code>filter()</code></li>
          <li>Not an encryption algorithm — encoding/compatibility only</li>
        </ul>
      </div>
    </div>
  </ToolPage>

  <div v-else class="page">
    <p>Unknown preset: {{ presetId }}</p>
  </div>
</template>

<style scoped>
.page-content { display: flex; flex-direction: column; gap: var(--space-3); }

.field { display: flex; flex-direction: column; gap: var(--space-compact); }
.field-label { font-size: var(--text-label); font-weight: var(--weight-medium); color: var(--color-neutral-80); }

/* ── Error ─────────────────────────────────────────────────────────── */
.alert-error {
  padding: var(--space-3) var(--space-4);
  background: var(--color-danger-bg);
  color: var(--color-danger-text);
  border: var(--border-width-thin) solid var(--color-danger-border);
  border-radius: var(--radius-md);
  font-size: var(--text-body);
}

/* ── Migration banner (preserved: unique to PresetView) ─────────────── */
.migration-banner {
  padding: var(--space-3) var(--space-4);
  background: var(--color-info-bg);
  color: var(--color-info-text);
  border: var(--border-width-thin) solid rgba(107, 165, 231, 0.15);
  border-radius: var(--radius-md);
  font-size: var(--text-body);
}

/* ── Pipeline Preview card (preserved: unique to PresetView) ────────── */
.card { background: var(--color-neutral-35); border: var(--border-width-thin) solid var(--border-color-subtle); border-radius: var(--radius-xl); overflow: hidden; }
.card-header { padding: var(--space-card-header-y) var(--space-5); font-size: var(--text-caption); font-weight: var(--weight-medium); color: var(--color-neutral-60); text-transform: uppercase; letter-spacing: 0.06em; border-bottom: var(--border-width-thin) solid var(--border-color-subtle); }
.card-body { padding: var(--space-4) var(--space-5); }

.pipeline-card { border-color: var(--border-color-focus); }
.pipeline-body { font-size: var(--text-label); }
.pipeline-step-initial { margin-bottom: var(--space-2); }
.pipeline-step { margin-bottom: var(--space-2); }
.pipeline-arrow { color: var(--color-neutral-60); margin-bottom: var(--space-compact); font-size: var(--text-caption); font-weight: var(--weight-medium); }
.pipeline-label { font-weight: var(--weight-medium); color: var(--color-neutral-80); }
.pipeline-value {
  display: block;
  font-family: var(--font-mono);
  font-size: var(--text-caption);
  color: var(--color-neutral-90);
  background: rgba(0, 0, 0, 0.15);
  padding: var(--space-compact) var(--space-2);
  border-radius: var(--radius-sm);
  word-break: break-all;
  max-height: 3em;
  overflow: hidden;
}
.pipeline-timing {
  font-size: var(--text-caption);
  color: var(--color-neutral-60);
  margin-top: var(--space-2);
  padding-top: var(--space-2);
  border-top: var(--border-width-thin) solid var(--border-color-subtle);
}

/* ── Info card (preserved: unique to PHP Codec) ─────────────────────── */
.info-card {
  background: var(--color-info-bg);
  border: var(--border-width-thin) solid rgba(107, 165, 231, 0.15);
  border-radius: var(--radius-xl);
  padding: var(--space-4) var(--space-5);
}
.info-card h4 { font-size: var(--text-body); font-weight: var(--weight-medium); color: var(--color-info-text); margin-bottom: var(--space-2); }
.info-card .pipeline { margin-bottom: var(--space-2); }
.info-card .pipeline-note {
  font-size: var(--text-label);
  color: var(--color-info-text);
  margin-bottom: var(--space-2);
  font-weight: var(--weight-medium);
}
.info-card .pipeline code {
  font-size: var(--text-label); font-family: var(--font-mono); color: var(--color-neutral-100);
  background: rgba(0, 0, 0, 0.3); padding: var(--space-compact) var(--space-2); border-radius: var(--radius-sm);
}
.info-card ul { font-size: var(--text-label); color: var(--color-neutral-80); padding-left: var(--space-5); }
.info-card li { margin-bottom: 2px; }
.info-card code { font-family: var(--font-mono); background: rgba(0, 0, 0, 0.3); padding: 1px 5px; border-radius: var(--radius-sm); font-size: var(--text-caption); color: var(--color-info-text); }

/* ── Utility ────────────────────────────────────────────────────────── */
.btn-copy { margin-top: var(--space-3); }
</style>
