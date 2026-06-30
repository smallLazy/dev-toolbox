<script setup lang="ts">
import { computed, ref } from 'vue'
import { APP_ICONS, Icons } from '@/design/icons'
import { useWorkspaceStore } from '@/stores/workspace'

const store = useWorkspaceStore()

// Build-time globals injected by Vite define
const appVersion: string = __APP_VERSION__
const gitHash: string = __GIT_HASH__
const gitBranch: string = __GIT_BRANCH__
const buildTimeRaw: string = __BUILD_TIME__
const buildMode: string = __BUILD_MODE__
const tauriVersion: string = __TAURI_VERSION__
const vueVersion: string = __VUE_VERSION__
const rustVersion: string = __RUST_VERSION__
const buildArch: string = __BUILD_ARCH__

const copyLabel = ref('Copy Version')

const platform = computed(() => {
  const ua = navigator.userAgent
  if (ua.includes('Mac')) return 'macOS'
  if (ua.includes('Win')) return 'Windows'
  if (ua.includes('Linux')) return 'Linux'
  return navigator.platform ?? 'Unknown'
})

const architecture = computed(() => {
  if (buildArch === 'arm64') return 'ARM64 (Apple Silicon)'
  if (buildArch === 'x64') return 'x86_64 (Intel)'
  return buildArch
})

const buildTime = computed(() => {
  try {
    return new Date(buildTimeRaw).toLocaleString()
  } catch {
    return buildTimeRaw
  }
})

const buildNumber = computed(() => {
  try {
    const d = new Date(buildTimeRaw)
    const year = d.getFullYear().toString().slice(2)
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    const hours = String(d.getHours()).padStart(2, '0')
    const mins = String(d.getMinutes()).padStart(2, '0')
    return `${year}${month}${day}.${hours}${mins}`
  } catch {
    return 'unknown'
  }
})

function openRepo() {
  globalThis.open('https://github.com/smallLazy/dev-toolbox', '_blank')
}

function openDocs() {
  globalThis.open('https://github.com/smallLazy/dev-toolbox#readme', '_blank')
}

async function copyVersion() {
  const info = [
    `Dev Toolbox v${appVersion}`,
    `Build: ${buildNumber.value}`,
    `Commit: ${gitHash}`,
    `Branch: ${gitBranch}`,
    `Platform: ${platform.value} (${architecture.value})`,
    `Tauri: v${tauriVersion}`,
    `Vue: v${vueVersion}`,
    `Rust: ${rustVersion}`,
  ].join('\n')
  try {
    await navigator.clipboard.writeText(info)
    copyLabel.value = 'Copied!'
    setTimeout(() => { copyLabel.value = 'Copy Version' }, 2000)
  } catch {
    copyLabel.value = 'Failed'
    setTimeout(() => { copyLabel.value = 'Copy Version' }, 2000)
  }
}
</script>

<template>
  <div class="page">
    <header class="page-header">
      <component :is="APP_ICONS.toolbox" class="branding-icon" :size="32" />
      <div class="page-header-text">
        <h1 class="page-title">Dev Toolbox</h1>
        <p class="page-desc">A desktop developer toolkit — crypto, encoding, formatting, conversion, and inspection tools.</p>
      </div>
    </header>

    <div class="about-grid">
      <!-- Version -->
      <div class="card card-span-2">
        <div class="card-header">Version</div>
        <div class="card-body">
          <dl class="info-list">
            <div class="info-row">
              <dt class="info-label">Version</dt>
              <dd class="info-value">{{ appVersion }}</dd>
            </div>
            <div class="info-row">
              <dt class="info-label">Build Number</dt>
              <dd class="info-value info-mono">{{ buildNumber }}</dd>
            </div>
            <div class="info-row">
              <dt class="info-label">Git Commit</dt>
              <dd class="info-value info-mono">{{ gitHash }}</dd>
            </div>
            <div class="info-row">
              <dt class="info-label">Git Branch</dt>
              <dd class="info-value info-mono">{{ gitBranch }}</dd>
            </div>
            <div class="info-row">
              <dt class="info-label">Build Time</dt>
              <dd class="info-value">{{ buildTime }}</dd>
            </div>
            <div class="info-row">
              <dt class="info-label">Build Mode</dt>
              <dd class="info-value">{{ buildMode }}</dd>
            </div>
            <div class="info-row">
              <dt class="info-label">Platform</dt>
              <dd class="info-value">{{ platform }}</dd>
            </div>
            <div class="info-row">
              <dt class="info-label">Architecture</dt>
              <dd class="info-value info-mono">{{ architecture }}</dd>
            </div>
          </dl>
        </div>
      </div>

      <!-- Tech Stack -->
      <div class="card">
        <div class="card-header">Tech Stack</div>
        <div class="card-body">
          <dl class="info-list">
            <div class="info-row">
              <dt class="info-label">Tauri</dt>
              <dd class="info-value info-mono">v{{ tauriVersion }}</dd>
            </div>
            <div class="info-row">
              <dt class="info-label">Vue</dt>
              <dd class="info-value info-mono">v{{ vueVersion }}</dd>
            </div>
            <div class="info-row">
              <dt class="info-label">Rust</dt>
              <dd class="info-value info-mono">{{ rustVersion }}</dd>
            </div>
            <div class="info-row">
              <dt class="info-label">Plugins</dt>
              <dd class="info-value">{{ store.toolCount }} official</dd>
            </div>
          </dl>
        </div>
      </div>

      <!-- Links -->
      <div class="card">
        <div class="card-header">Links & License</div>
        <div class="card-body">
          <div class="links-section">
            <a
              class="link-item"
              href="https://github.com/smallLazy/dev-toolbox"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Icons.ExternalLink class="link-icon" :size="14" />
              <span class="link-label">GitHub Repository</span>
            </a>
            <a
              class="link-item"
              href="https://github.com/smallLazy/dev-toolbox"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Icons.ExternalLink class="link-icon" :size="14" />
              <span class="link-label">Homepage</span>
            </a>
            <a
              class="link-item"
              href="https://github.com/smallLazy/dev-toolbox#readme"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Icons.ExternalLink class="link-icon" :size="14" />
              <span class="link-label">Documentation</span>
            </a>
          </div>
          <hr class="divider" />
          <p class="license-text">MIT License</p>
          <p class="license-desc">Free to use, modify, and distribute.</p>
        </div>
      </div>
    </div>

    <!-- Action Buttons -->
    <div class="action-bar">
      <button class="btn-secondary" @click="copyVersion">
        <Icons.Copy class="btn-icon" :size="14" />
        {{ copyLabel }}
      </button>
      <button
        class="btn-secondary"
        @click="openRepo"
      >
        <Icons.ExternalLink class="btn-icon" :size="14" />
        Open Repository
      </button>
      <button
        class="btn-secondary"
        @click="openDocs"
      >
        <Icons.FileCode class="btn-icon" :size="14" />
        Open Documentation
      </button>
      <button class="btn-secondary" disabled title="Coming in a future release">
        <Icons.Refresh class="btn-icon" :size="14" />
        Check for Updates
      </button>
    </div>
  </div>
</template>

<style scoped>
.page {
  max-width: var(--content-max-width);
  margin: 0 auto;
}

.page-header {
  display: flex;
  align-items: center;
  gap: var(--space-4);
  margin-bottom: var(--space-8);
}

.branding-icon {
  color: var(--color-accent-primary);
  flex-shrink: 0;
}

.page-header-text {
  flex: 1;
}

.page-title {
  font-size: var(--text-heading);
  font-weight: var(--weight-semibold);
  color: var(--color-neutral-110);
  line-height: var(--leading-tight);
  margin-bottom: var(--space-1);
}

.page-desc {
  font-size: var(--text-body);
  color: var(--color-neutral-70);
}

.about-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-4);
  margin-bottom: var(--space-6);
}

.card-span-2 {
  grid-column: span 2;
}

.card {
  background: var(--color-neutral-35);
  border: var(--border-width-thin) solid var(--border-color-subtle);
  border-radius: var(--radius-xl);
  overflow: hidden;
}

.card-header {
  padding: var(--space-2) var(--space-5);
  font-size: var(--text-caption);
  font-weight: var(--weight-medium);
  color: var(--color-neutral-60);
  text-transform: uppercase;
  letter-spacing: 0.06em;
  border-bottom: var(--border-width-thin) solid rgba(255,255,255,0.04);
}

.card-body {
  padding: var(--space-4) var(--space-5);
}

.info-list {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr;
  gap: var(--space-3);
}

.info-row {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.info-label {
  font-size: var(--text-caption);
  color: var(--color-neutral-60);
  font-weight: var(--weight-regular);
}

.info-value {
  font-size: var(--text-body);
  color: var(--color-neutral-100);
  font-weight: var(--weight-medium);
}

.info-mono {
  font-family: var(--font-mono);
  font-size: var(--text-label);
}

/* Links Section */
.links-section {
  margin-bottom: var(--space-3);
}

.link-item {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-1) 0;
  color: var(--color-accent-primary);
  text-decoration: none;
  font-size: var(--text-body);
  transition: opacity var(--duration-fast) var(--ease-standard);
}

.link-item:hover {
  opacity: 0.8;
}

.link-icon {
  flex-shrink: 0;
}

.link-label {
  font-weight: var(--weight-medium);
}

.divider {
  border: none;
  border-top: var(--border-width-thin) solid rgba(255,255,255,0.04);
  margin: var(--space-3) 0;
}

.license-text {
  font-size: var(--text-body);
  color: var(--color-neutral-100);
  font-weight: var(--weight-medium);
  margin-bottom: var(--space-1);
}

.license-desc {
  font-size: var(--text-label);
  color: var(--color-neutral-70);
}

/* Action Bar */
.action-bar {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-3);
}

.btn-secondary {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-4);
  background: var(--color-neutral-40);
  color: var(--color-neutral-100);
  border: var(--border-width-thin) solid rgba(255,255,255,0.06);
  border-radius: var(--radius-md);
  font-size: var(--text-body);
  font-family: var(--font-sans);
  font-weight: var(--weight-medium);
  cursor: pointer;
  text-decoration: none;
  transition: background var(--duration-fast) var(--ease-standard);
}

.btn-secondary:hover {
  background: var(--color-neutral-45);
}

.btn-secondary:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.btn-icon {
  flex-shrink: 0;
  color: var(--color-neutral-70);
}
</style>
