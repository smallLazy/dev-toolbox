<script setup lang="ts">
/**
 * PluginWorkspace — Standard Plugin Page Template
 *
 * All Plugins use this template. No custom layouts allowed.
 *
 * Slots:
 *   #header      — Page title + description
 *   #config      — Configuration card (mode, algorithm, encoding...)
 *   #input       — Input card (textarea, editor...)
 *   #toolbar     — Action buttons (execute, copy, clear, swap...)
 *   #alert       — Error/success message (conditional)
 *   #output      — Output card (conditional, shown when output exists)
 *   #history     — History card (conditional)
 *   #empty       — Empty state (shown when no input + no output)
 */
</script>

<template>
  <div class="page">
    <!-- Header -->
    <header v-if="$slots.header" class="page-header">
      <slot name="header" />
    </header>

    <div class="page-content">
      <!-- Config Card -->
      <div v-if="$slots.config" class="card">
        <div class="card-header">Configuration</div>
        <div class="card-body">
          <slot name="config" />
        </div>
      </div>

      <!-- Input Card -->
      <div v-if="$slots.input" class="card">
        <div class="card-header">Input</div>
        <div class="card-body">
          <slot name="input" />
        </div>
      </div>

      <!-- Toolbar -->
      <div v-if="$slots.toolbar" class="action-bar">
        <slot name="toolbar" />
      </div>

      <!-- Alert -->
      <div v-if="$slots.alert">
        <slot name="alert" />
      </div>

      <!-- Output Card -->
      <div v-if="$slots.output" class="card card-output">
        <div class="card-header">Output</div>
        <div class="card-body">
          <slot name="output" />
        </div>
      </div>

      <!-- History Card -->
      <div v-if="$slots.history" class="card">
        <div class="card-header">History</div>
        <div class="card-body">
          <slot name="history" />
        </div>
      </div>

      <!-- Empty State -->
      <div v-if="$slots.empty" class="card">
        <div class="card-body">
          <slot name="empty" />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.page { max-width: var(--content-max-width); margin: 0 auto; }
.page-header { margin-bottom: var(--space-6); }
.page-content { display: flex; flex-direction: column; gap: var(--space-3); }

.card { background: var(--color-neutral-35); border: var(--border-width-thin) solid var(--border-color-subtle); border-radius: var(--radius-xl); overflow: hidden; transition: all var(--duration-normal) var(--ease-decelerate); }
.card:hover { border-color: var(--border-color-hover); }
.card-header { padding: var(--space-card-header-y) var(--space-5); font-size: var(--text-caption); font-weight: var(--weight-medium); color: var(--color-neutral-60); text-transform: uppercase; letter-spacing: 0.06em; border-bottom: var(--border-width-thin) solid var(--border-color-subtle); }
.card-body { padding: var(--space-4) var(--space-5); }
.card-output { border-color: var(--border-color-focus); }
.card-output .card-body { background: var(--color-neutral-15); }

.action-bar { display: flex; gap: var(--space-2); flex-wrap: wrap; }
</style>
