<script setup lang="ts">
import { useHelloPlugin } from './composables'
import { ICON_SIZE, Icons } from '@/design/icons'

const {
  sessionId, version, greeting, loadedAt, activatedAt,
  registered, activated, registryCount, commandCount,
  shortcutCount, historyEntries,
  validationResults, summary, uptime,
  simulateHistoryEntry, formatTimestamp,
} = useHelloPlugin()
</script>

<template>
  <div class="page">
    <header class="page-header">
      <h1 class="page-title">Hello Plugin</h1>
      <p class="page-desc">Framework Validation — 验证整个 Workspace Core 是否正确运行</p>
    </header>

    <div class="page-content">
      <!-- Status Banner -->
      <div class="status-banner" :class="{ success: summary.allPassed, failed: !summary.allPassed }">
        <div class="status-banner-icon">
          <component :is="summary.allPassed ? Icons.Check : Icons.Alert" :size="ICON_SIZE.xl" />
        </div>
        <div class="status-banner-body">
          <div class="status-banner-title">
            {{ summary.allPassed ? 'Framework Validation Successful' : 'Framework Validation Incomplete' }}
          </div>
          <div class="status-banner-detail">
            {{ summary.passed }} / {{ summary.total }} checks passed
          </div>
        </div>
      </div>

      <!-- Plugin Context Card -->
      <div class="card">
        <div class="card-header">Plugin Context</div>
        <div class="card-body">
          <div class="context-grid">
            <div class="context-item">
              <span class="context-label">Plugin ID</span>
              <span class="context-value mono">hello</span>
            </div>
            <div class="context-item">
              <span class="context-label">Version</span>
              <span class="context-value mono">v{{ version }}</span>
            </div>
            <div class="context-item">
              <span class="context-label">Session</span>
              <span class="context-value mono">{{ sessionId }}</span>
            </div>
            <div class="context-item">
              <span class="context-label">Uptime</span>
              <span class="context-value mono">{{ uptime }}</span>
            </div>
            <div class="context-item">
              <span class="context-label">Loaded At</span>
              <span class="context-value mono">{{ formatTimestamp(loadedAt) }}</span>
            </div>
            <div class="context-item">
              <span class="context-label">Activated At</span>
              <span class="context-value mono">{{ formatTimestamp(activatedAt) }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Registry Status Card -->
      <div class="card">
        <div class="card-header">Registry Status</div>
        <div class="card-body">
          <div class="registry-grid">
            <div class="registry-item">
              <div class="registry-value">
                <component :is="registered ? Icons.Check : Icons.X" :size="ICON_SIZE.xl" />
              </div>
              <div class="registry-label">Registered</div>
            </div>
            <div class="registry-item">
              <div class="registry-value">
                <component :is="activated ? Icons.Check : Icons.X" :size="ICON_SIZE.xl" />
              </div>
              <div class="registry-label">Activated</div>
            </div>
            <div class="registry-item">
              <div class="registry-value mono">{{ registryCount }}</div>
              <div class="registry-label">Tool Registry</div>
            </div>
            <div class="registry-item">
              <div class="registry-value mono">{{ commandCount }}</div>
              <div class="registry-label">Commands</div>
            </div>
            <div class="registry-item">
              <div class="registry-value mono">{{ shortcutCount }}</div>
              <div class="registry-label">Shortcuts</div>
            </div>
            <div class="registry-item">
              <div class="registry-value mono">{{ historyEntries }}</div>
              <div class="registry-label">History</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Validation Checklist Card -->
      <div class="card">
        <div class="card-header">Framework Validation Checklist</div>
        <div class="card-body">
          <div class="checklist">
            <div
              v-for="(item, idx) in validationResults"
              :key="idx"
              class="checklist-item"
              :class="{ pass: item.passed, fail: !item.passed }"
            >
              <span class="checklist-icon">
                <component :is="item.passed ? Icons.Check : Icons.X" :size="ICON_SIZE.md" />
              </span>
              <div class="checklist-body">
                <div class="checklist-check">{{ item.check }}</div>
                <div class="checklist-detail">{{ item.detail }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Interactive Validation Card -->
      <div class="card">
        <div class="card-header">Interactive Validation</div>
        <div class="card-body">
          <div class="interactive-grid">
            <div>
              <p class="interactive-label">Greeting</p>
              <p class="interactive-value">{{ greeting }}</p>
            </div>
            <div>
              <p class="interactive-label">History Simulation</p>
              <button class="btn-secondary" @click="simulateHistoryEntry">
                Record History Entry ({{ historyEntries }})
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Info Card -->
      <div class="info-card">
        <h4>Architecture Verification</h4>
        <ul>
          <li>Plugin registered via <code>ToolPlugin</code> manifest — no core code modified</li>
          <li>Route auto-added by <code>PluginManager.register()</code></li>
          <li>Commands registered in <code>CommandRegistry</code></li>
          <li>Shortcuts registered in <code>ShortcutRegistry</code></li>
          <li>Search keywords registered in <code>SearchRegistry</code></li>
          <li>History enabled via manifest <code>history.enabled</code></li>
          <li>Favorites supported via <code>FavoriteRegistry</code></li>
          <li>Recent auto-recorded via <code>RecentRegistry.touch()</code></li>
        </ul>
      </div>
    </div>
  </div>
</template>

<style scoped>
.page { max-width: var(--content-max-width); margin: 0 auto; }
.page-header { margin-bottom: var(--space-6); }
.page-title { font-size: var(--text-title); font-weight: var(--weight-semibold); color: var(--color-neutral-110); margin-bottom: var(--space-1); letter-spacing: -0.01em; }
.page-desc { font-size: var(--text-body); color: var(--color-neutral-70); }
.page-content { display: flex; flex-direction: column; gap: var(--space-3); }

/* Status Banner */
.status-banner {
  display: flex; align-items: center; gap: var(--space-4);
  padding: var(--space-5); border-radius: var(--radius-xl);
}
.status-banner.success { background: var(--color-success-bg); border: var(--border-width-thin) solid rgba(92,187,92,0.3); }
.status-banner.failed { background: var(--color-danger-bg); border: var(--border-width-thin) solid var(--color-danger-border); }
.status-banner-icon { font-size: 32px; }
.status-banner-title { font-size: var(--text-subtitle); font-weight: var(--weight-semibold); color: var(--color-neutral-110); }
.status-banner-detail { font-size: var(--text-body); color: var(--color-neutral-70); margin-top: 2px; }

/* Card */
.card { background: var(--color-neutral-35); border: var(--border-width-thin) solid rgba(255,255,255,0.05); border-radius: var(--radius-xl); overflow: hidden; }
.card-header { padding: var(--space-card-header-y) var(--space-5); font-size: var(--text-caption); font-weight: var(--weight-medium); color: var(--color-neutral-60); text-transform: uppercase; letter-spacing: 0.06em; border-bottom: var(--border-width-thin) solid rgba(255,255,255,0.04); }
.card-body { padding: var(--space-4) var(--space-5); }

/* Context Grid */
.context-grid { display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-3); }
.context-item { display: flex; flex-direction: column; gap: 2px; }
.context-label { font-size: var(--text-label); color: var(--color-neutral-80); }
.context-value { font-size: var(--text-body); color: var(--color-neutral-100); }
.mono { font-family: var(--font-mono); }

/* Registry Grid */
.registry-grid { display: grid; grid-template-columns: repeat(6, 1fr); gap: var(--space-3); text-align: center; }
.registry-item { display: flex; flex-direction: column; align-items: center; gap: var(--space-1); }
.registry-value { font-size: var(--text-subtitle); }
.registry-label { font-size: var(--text-caption); color: var(--color-neutral-70); text-transform: uppercase; letter-spacing: 0.04em; }

/* Checklist */
.checklist { display: flex; flex-direction: column; gap: 2px; }
.checklist-item { display: flex; gap: var(--space-3); padding: var(--space-2) var(--space-3); border-radius: var(--radius-md); }
.checklist-item.pass { background: rgba(92,187,92,0.04); }
.checklist-item.fail { background: rgba(224,115,128,0.06); }
.checklist-icon { font-size: 14px; margin-top: 1px; flex-shrink: 0; }
.checklist-check { font-size: var(--text-body); font-weight: var(--weight-medium); color: var(--color-neutral-100); }
.checklist-detail { font-size: var(--text-label); color: var(--color-neutral-70); margin-top: 1px; }

/* Interactive */
.interactive-grid { display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-4); align-items: center; }
.interactive-label { font-size: var(--text-label); color: var(--color-neutral-80); margin-bottom: 4px; }
.interactive-value { font-size: var(--text-base); color: var(--color-neutral-100); font-weight: var(--weight-medium); }

/* Info Card */
.info-card { background: var(--color-info-bg); border: var(--border-width-thin) solid rgba(107,165,231,0.15); border-radius: var(--radius-xl); padding: var(--space-4) var(--space-5); }
.info-card h4 { font-size: var(--text-body); color: var(--color-info-text); margin-bottom: var(--space-2); font-weight: var(--weight-medium); }
.info-card ul { font-size: var(--text-label); color: var(--color-neutral-80); padding-left: var(--space-5); }
.info-card li { margin-bottom: 2px; }
.info-card code { font-family: var(--font-mono); background: rgba(0,0,0,.3); padding: 1px 5px; border-radius: var(--radius-sm); font-size: var(--text-caption); color: var(--color-info-text); }
</style>
