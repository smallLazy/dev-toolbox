<script setup lang="ts">
/**
 * PresetView — Generic Pipeline Preset UI
 *
 * Renders any PipelinePreset with encode/decode mode toggle,
 * input/output textareas, execute button, pipeline step preview,
 * and optional migration banner.
 */
import { onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { usePreset } from './composables'
import type { PipelinePreset } from '@/shared/pipeline/types'

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
  pipelineResult, execute, clear, swap, copy, switchMode,
} = usePreset(preset.value!)

onMounted(() => {
  if (!presetRegistry[presetId]) {
    console.warn(`[PresetView] Unknown preset: "${presetId}"`)
  }
})

const showMigrationBanner = computed(() =>
  route.query?.from === preset.value?.deprecated?.oldRoute?.slice(1),
)
</script>

<template>
  <div v-if="preset" class="page">
    <header class="page-header">
      <h1 class="page-title">{{ preset.name }}</h1>
      <p class="page-desc">{{ preset.description }}</p>
    </header>

    <div class="page-content">
      <!-- Mode selector -->
      <div class="card">
        <div class="card-header">Mode</div>
        <div class="card-body">
          <div class="segmented-control">
            <button
              :class="{ active: mode === 'encode' }"
              @click="switchMode('encode')"
            >Encode</button>
            <button
              :class="{ active: mode === 'decode' }"
              @click="switchMode('decode')"
            >Decode</button>
          </div>
        </div>
      </div>

      <!-- Input -->
      <div class="card">
        <div class="card-header">Input</div>
        <div class="card-body">
          <textarea
            v-model="input"
            class="dt-textarea"
            rows="6"
            :placeholder="mode === 'encode' ? 'Enter text to encode...' : 'Enter text to decode...'"
          />
        </div>
      </div>

      <!-- Actions -->
      <div class="action-bar">
        <button class="btn-accent" :disabled="loading" @click="execute">
          <span v-if="loading" class="spinner"></span>
          {{ loading ? 'Processing...' : (mode === 'encode' ? 'Encode' : 'Decode') }}
        </button>
        <button class="btn-secondary" @click="clear">Clear</button>
        <button class="btn-secondary" @click="swap" :disabled="!output">Swap</button>
      </div>

      <!-- Error -->
      <div v-if="error" class="alert-error">{{ error }}</div>

      <!-- Migration banner -->
      <div v-if="showMigrationBanner" class="migration-banner">
        You were redirected from the legacy "{{ preset.deprecated?.oldName }}" tool.
        {{ preset.deprecated?.migrationNote }}
      </div>

      <!-- Pipeline preview -->
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
      <div v-if="output" class="card card-output">
        <div class="card-header">Output</div>
        <div class="card-body">
          <textarea :value="output" class="dt-textarea" rows="6" readonly />
          <button class="btn-secondary btn-copy" @click="copy">Copy</button>
        </div>
      </div>

      <!-- Info -->
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
  </div>

  <div v-else class="page">
    <p>Unknown preset: {{ presetId }}</p>
  </div>
</template>

<style scoped>
.page { max-width: var(--content-max-width); margin: 0 auto; }
.page-header { margin-bottom: var(--space-6); }
.page-title { font-size: var(--text-title); font-weight: var(--weight-semibold); color: var(--color-neutral-110); margin-bottom: var(--space-1); letter-spacing: -0.01em; }
.page-desc { font-size: var(--text-body); color: var(--color-neutral-70); }
.page-content { display: flex; flex-direction: column; gap: var(--space-3); }

.card { background: var(--color-neutral-35); border: var(--border-width-thin) solid var(--border-color-subtle); border-radius: var(--radius-xl); overflow: hidden; }
.card-header { padding: var(--space-card-header-y) var(--space-5); font-size: var(--text-caption); font-weight: var(--weight-medium); color: var(--color-neutral-60); text-transform: uppercase; letter-spacing: 0.06em; border-bottom: var(--border-width-thin) solid var(--border-color-subtle); }
.card-body { padding: var(--space-4) var(--space-5); }
.card-output { border-color: var(--border-color-focus); }
.card-output .card-body { background: var(--color-neutral-15); }

.segmented-control { display: flex; gap: var(--space-1); }
.segmented-control button {
  padding: var(--space-compact) var(--space-4);
  border: var(--border-width-thin) solid var(--border-color-subtle);
  background: var(--color-neutral-20);
  color: var(--color-neutral-80);
  border-radius: var(--radius-md);
  font-size: var(--text-body);
  font-family: var(--font-sans);
  cursor: pointer;
  transition: background var(--duration-fast), color var(--duration-fast), border-color var(--duration-fast);
}
.segmented-control button.active {
  background: var(--color-accent-primary);
  color: var(--color-neutral-10);
  border-color: var(--color-accent-primary);
}

.action-bar { display: flex; gap: var(--space-2); }

.alert-error {
  padding: var(--space-3) var(--space-4);
  background: var(--color-error-bg);
  color: var(--color-error-text);
  border: var(--border-width-thin) solid var(--color-error-border);
  border-radius: var(--radius-md);
  font-size: var(--text-body);
}

.migration-banner {
  padding: var(--space-3) var(--space-4);
  background: var(--color-info-bg);
  color: var(--color-info-text);
  border: var(--border-width-thin) solid rgba(107, 165, 231, 0.15);
  border-radius: var(--radius-md);
  font-size: var(--text-body);
}

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
  background: rgba(0,0,0,.15);
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

.info-card {
  background: var(--color-info-bg);
  border: var(--border-width-thin) solid rgba(107,165,231,0.15);
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
  background: rgba(0,0,0,.3); padding: var(--space-compact) var(--space-2); border-radius: var(--radius-sm);
}
.info-card ul { font-size: var(--text-label); color: var(--color-neutral-80); padding-left: var(--space-5); }
.info-card li { margin-bottom: 2px; }
.info-card code { font-family: var(--font-mono); background: rgba(0,0,0,.3); padding: 1px 5px; border-radius: var(--radius-sm); font-size: var(--text-caption); color: var(--color-info-text); }

.btn-copy { margin-top: var(--space-3); }
</style>
