<script setup lang="ts">
/**
 * UpdateDialog — Manual Update v1
 *
 * Modal dialog shown when an update is available.
 * States: UPDATE_AVAILABLE | DOWNLOADING | READY_TO_INSTALL | ERROR
 *
 * Design: Uses only var(--*-*) tokens, no hardcoded values, no emoji.
 */
import { computed } from 'vue'
import { Icons } from '@/design/icons'
import type { UpdateState } from './useUpdater'
import { dialogTitle } from './logic'

const props = defineProps<{
  state: UpdateState
}>()

const emit = defineEmits<{
  download: []
  install: []
  dismiss: []
}>()

const isUpdateAvailable = computed(() => props.state.status === 'update-available')
const isDownloading = computed(() => props.state.status === 'downloading')
const isReadyToInstall = computed(() => props.state.status === 'ready-to-install')
const isError = computed(() => props.state.status === 'error')

const title = computed(() => dialogTitle(props.state.status))

const progressPercent = computed(() => props.state.downloadProgress?.percentage ?? 0)
const downloaded = computed(() => props.state.downloadProgress?.downloadedFormatted ?? '')
const total = computed(() => props.state.downloadProgress?.totalFormatted ?? '')
</script>

<template>
  <Teleport to="body">
    <div class="dialog-overlay" @click.self="emit('dismiss')">
      <div class="dialog-card">
        <!-- Header -->
        <div class="dialog-header">
          <h2 class="dialog-title">{{ title }}</h2>
          <button class="dialog-close" @click="emit('dismiss')" aria-label="Close">
            <Icons.X :size="18" />
          </button>
        </div>

        <!-- Body -->
        <div class="dialog-body">
          <!-- Announcement -->
          <p class="update-announcement">
            Dev Toolbox <span class="version-highlight">v{{ state.latestVersion }}</span> is available
          </p>

          <!-- Version Info -->
          <dl class="update-info">
            <div class="info-row">
              <dt class="info-label">Current</dt>
              <dd class="info-value">v{{ state.currentVersion }}</dd>
            </div>
            <div class="info-row">
              <dt class="info-label">Latest</dt>
              <dd class="info-value info-value-highlight">v{{ state.latestVersion }}</dd>
            </div>
            <div v-if="state.releaseDate" class="info-row">
              <dt class="info-label">Date</dt>
              <dd class="info-value">{{ state.releaseDate }}</dd>
            </div>
          </dl>

          <!-- Release Notes -->
          <div v-if="state.releaseNotes" class="release-notes">
            <h3 class="release-notes-title">Release Notes</h3>
            <div class="release-notes-content">{{ state.releaseNotes }}</div>
          </div>

          <!-- Progress Bar (DOWNLOADING state) -->
          <div v-if="isDownloading" class="progress-section">
            <div class="progress-bar-track">
              <div
                class="progress-bar-fill"
                :style="{ width: progressPercent + '%' }"
              />
            </div>
            <div class="progress-stats">
              <span class="progress-percent">{{ progressPercent }}%</span>
              <span v-if="downloaded && total" class="progress-bytes">{{ downloaded }} / {{ total }}</span>
            </div>
          </div>

          <!-- Error Message -->
          <div v-if="isError && state.error" class="error-message">
            <Icons.Alert :size="16" class="error-icon" />
            <span>{{ state.error }}</span>
          </div>
        </div>

        <!-- Actions -->
        <div class="dialog-actions">
          <button
            v-if="isUpdateAvailable"
            class="btn-accent"
            @click="emit('download')"
          >
            <Icons.Download :size="16" class="btn-icon" />
            Download Update
          </button>

          <button
            v-if="isReadyToInstall"
            class="btn-accent"
            @click="emit('install')"
          >
            <Icons.Check :size="16" class="btn-icon" />
            Install &amp; Restart
          </button>

          <button
            v-if="!isDownloading && !isReadyToInstall"
            class="btn-secondary"
            @click="emit('dismiss')"
          >
            Cancel
          </button>

          <button
            v-if="isError"
            class="btn-secondary"
            @click="emit('dismiss')"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
/* ── Overlay ──────────────────────────────────────────────────────────── */
.dialog-overlay {
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-surface-overlay);
  backdrop-filter: blur(4px);
}

/* ── Card ─────────────────────────────────────────────────────────────── */
.dialog-card {
  width: 480px;
  max-width: calc(100vw - var(--space-8));
  max-height: calc(100vh - var(--space-12));
  display: flex;
  flex-direction: column;
  background: var(--color-neutral-35);
  border: var(--border-width-thin) solid var(--border-color-default);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-lg);
  overflow: hidden;
}

/* ── Header ───────────────────────────────────────────────────────────── */
.dialog-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-4) var(--space-5);
  border-bottom: var(--border-width-thin) solid var(--border-color-subtle);
}

.dialog-title {
  font-size: var(--text-heading);
  font-weight: var(--weight-semibold);
  color: var(--color-neutral-110);
  line-height: var(--leading-tight);
}

.dialog-close {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border: none;
  border-radius: var(--radius-sm);
  background: transparent;
  color: var(--color-neutral-70);
  cursor: pointer;
  transition: background var(--duration-fast) var(--ease-standard);
}

.dialog-close:hover {
  background: var(--color-neutral-40);
  color: var(--color-neutral-100);
}

/* ── Body ─────────────────────────────────────────────────────────────── */
.dialog-body {
  padding: var(--space-4) var(--space-5);
  overflow-y: auto;
  flex: 1;
}

.update-announcement {
  font-size: var(--text-body);
  color: var(--color-neutral-90);
  margin-bottom: var(--space-4);
  line-height: var(--leading-normal);
}

.version-highlight {
  font-weight: var(--weight-semibold);
  color: var(--color-accent-primary);
}

/* ── Info Rows ────────────────────────────────────────────────────────── */
.update-info {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  margin-bottom: var(--space-4);
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
}

.info-label {
  font-size: var(--text-label);
  color: var(--color-neutral-60);
  font-weight: var(--weight-regular);
}

.info-value {
  font-size: var(--text-body);
  color: var(--color-neutral-100);
  font-weight: var(--weight-medium);
  font-family: var(--font-mono);
}

.info-value-highlight {
  color: var(--color-accent-primary);
}

/* ── Release Notes ────────────────────────────────────────────────────── */
.release-notes {
  margin-bottom: var(--space-4);
}

.release-notes-title {
  font-size: var(--text-caption);
  font-weight: var(--weight-medium);
  color: var(--color-neutral-60);
  text-transform: uppercase;
  letter-spacing: 0.06em;
  margin-bottom: var(--space-2);
}

.release-notes-content {
  font-size: var(--text-body);
  color: var(--color-neutral-80);
  line-height: var(--leading-normal);
  max-height: 160px;
  overflow-y: auto;
  padding: var(--space-3);
  background: var(--color-neutral-40);
  border-radius: var(--radius-md);
  white-space: pre-wrap;
  word-break: break-word;
}

/* ── Progress ─────────────────────────────────────────────────────────── */
.progress-section {
  margin-bottom: var(--space-4);
}

.progress-bar-track {
  width: 100%;
  height: 6px;
  background: var(--color-neutral-40);
  border-radius: var(--radius-full);
  overflow: hidden;
  margin-bottom: var(--space-2);
}

.progress-bar-fill {
  height: 100%;
  background: var(--color-accent-primary);
  border-radius: var(--radius-full);
  transition: width var(--duration-fast) var(--ease-standard);
}

.progress-stats {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.progress-percent {
  font-size: var(--text-label);
  color: var(--color-neutral-100);
  font-weight: var(--weight-semibold);
}

.progress-bytes {
  font-size: var(--text-caption);
  color: var(--color-neutral-60);
  font-family: var(--font-mono);
}

/* ── Error ────────────────────────────────────────────────────────────── */
.error-message {
  display: flex;
  align-items: flex-start;
  gap: var(--space-2);
  padding: var(--space-3);
  background: var(--color-danger-bg);
  border: var(--border-width-thin) solid var(--color-danger-border);
  border-radius: var(--radius-md);
  font-size: var(--text-body);
  color: var(--color-neutral-100);
  line-height: var(--leading-normal);
}

.error-icon {
  flex-shrink: 0;
  color: var(--color-neutral-80);
  margin-top: 1px;
}

/* ── Actions ──────────────────────────────────────────────────────────── */
.dialog-actions {
  display: flex;
  gap: var(--space-3);
  padding: var(--space-4) var(--space-5);
  border-top: var(--border-width-thin) solid var(--border-color-subtle);
}

.btn-icon {
  flex-shrink: 0;
}
</style>
