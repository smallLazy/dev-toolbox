<script setup lang="ts">
import { Icons } from '@/design/icons'
import { useAppStore } from '@/stores/app'
import { ref } from 'vue'

const appStore = useAppStore()
const savedMsg = ref('')
const activeTab = ref('general')

const tabs = [
  { id: 'general', label: 'General', icon: 'Settings' as const },
  { id: 'plugins', label: 'Plugins', icon: 'Package' as const },
  { id: 'shortcuts', label: 'Shortcuts', icon: 'Zap' as const },
  { id: 'about', label: 'About', icon: 'Info' as const },
]

async function handleSave() {
  await appStore.saveConfig()
  savedMsg.value = 'Saved'
  setTimeout(() => savedMsg.value = '', 2000)
}
</script>

<template>
  <div class="page">
    <header class="page-header">
      <h1 class="page-title">Settings</h1>
      <p class="page-desc">Configure your workspace preferences</p>
    </header>

    <div class="settings-layout">
      <!-- Tab Sidebar -->
      <nav class="settings-tabs">
        <button
          v-for="tab in tabs" :key="tab.id"
          :class="['tab-item', { active: activeTab === tab.id }]"
          @click="activeTab = tab.id"
        >
          <component :is="Icons[tab.icon]" class="tab-icon" :size="16" />
          {{ tab.label }}
        </button>
      </nav>

      <!-- Content -->
      <div class="settings-content">
        <!-- General -->
        <div v-if="activeTab === 'general'" class="card">
          <div class="card-header">Crypto Defaults</div>
          <div class="card-body">
            <p class="card-desc">Default encoding settings for AES crypto tools.</p>
            <div class="form-grid">
              <div class="field">
                <label class="field-label">Key Encoding</label>
                <select v-model="appStore.config.crypto.keyEncoding" class="dt-select">
                  <option value="utf8">UTF-8</option>
                  <option value="hex">Hex</option>
                  <option value="base64">Base64</option>
                </select>
              </div>
              <div class="field">
                <label class="field-label">IV Encoding</label>
                <select v-model="appStore.config.crypto.ivEncoding" class="dt-select">
                  <option value="utf8">UTF-8</option>
                  <option value="hex">Hex</option>
                  <option value="base64">Base64</option>
                </select>
              </div>
              <div class="field">
                <label class="field-label">Input Encoding</label>
                <select v-model="appStore.config.crypto.inputEncoding" class="dt-select">
                  <option value="utf8">UTF-8</option>
                  <option value="hex">Hex</option>
                  <option value="base64">Base64</option>
                </select>
              </div>
              <div class="field">
                <label class="field-label">Output Encoding</label>
                <select v-model="appStore.config.crypto.outputEncoding" class="dt-select">
                  <option value="hex">Hex</option>
                  <option value="base64">Base64</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <!-- Plugins -->
        <div v-if="activeTab === 'plugins'" class="card">
          <div class="card-header">Installed Plugins</div>
          <div class="card-body">
            <p class="empty-hint">Plugin management coming soon.</p>
          </div>
        </div>

        <!-- Shortcuts -->
        <div v-if="activeTab === 'shortcuts'" class="card">
          <div class="card-header">Keyboard Shortcuts</div>
          <div class="card-body">
            <div class="shortcut-list">
              <div class="shortcut-row"><span>Search tools</span><kbd>⌘K</kbd></div>
              <div class="shortcut-row"><span>Execute action</span><kbd>⌘Enter</kbd></div>
              <div class="shortcut-row"><span>Copy output</span><kbd>⌘Shift C</kbd></div>
            </div>
          </div>
        </div>

        <!-- About -->
        <div v-if="activeTab === 'about'" class="card">
          <div class="card-header">About</div>
          <div class="card-body">
            <div class="about-info">
              <p><strong>Dev Toolbox</strong> v0.1.0</p>
              <p class="about-desc">A developer workspace for everyday tools.</p>
              <p class="about-tech">Tauri v2 · Vue 3 · TypeScript · Rust</p>
            </div>
          </div>
        </div>

        <div class="action-bar">
          <button class="btn-accent" @click="handleSave">Save</button>
          <span v-if="savedMsg" class="saved-msg">{{ savedMsg }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.page { max-width: 900px; margin: 0 auto; }
.page-header { margin-bottom: var(--space-6); }
.page-title { font-size: var(--text-title); font-weight: var(--weight-semibold); color: var(--color-neutral-110); margin-bottom: var(--space-1); }
.page-desc { font-size: var(--text-body); color: var(--color-neutral-70); }

.settings-layout { display: flex; gap: var(--space-8); }

/* Tabs */
.settings-tabs { width: 160px; flex-shrink: 0; display: flex; flex-direction: column; gap: 2px; }
.tab-item {
  display: flex; align-items: center; gap: 8px; padding: 7px var(--space-3);
  border: none; background: transparent; color: var(--color-neutral-80);
  font-size: var(--text-body); font-family: var(--font-sans); cursor: pointer;
  border-radius: var(--radius-md); text-align: left;
  transition: all var(--duration-fast) var(--ease-standard);
}
.tab-item:hover { background: rgba(255,255,255,0.04); color: var(--color-neutral-100); }
.tab-item.active { background: var(--color-accent-dim); color: var(--color-accent-primary); }
.tab-icon { color: var(--color-neutral-70); }
.tab-item.active .tab-icon { color: var(--color-accent-primary); }

.settings-content { flex: 1; min-width: 0; }

/* Cards */
.card { background: var(--color-neutral-35); border: var(--border-width-thin) solid rgba(255,255,255,0.05); border-radius: var(--radius-xl); overflow: hidden; margin-bottom: var(--space-4); }
.card-header { padding: 9px var(--space-5); font-size: var(--text-caption); font-weight: var(--weight-medium); color: var(--color-neutral-60); text-transform: uppercase; letter-spacing: 0.06em; border-bottom: var(--border-width-thin) solid rgba(255,255,255,0.04); }
.card-body { padding: var(--space-4) var(--space-5); }
.card-desc { font-size: var(--text-label); color: var(--color-neutral-70); margin-bottom: var(--space-4); }

.form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-3); }
.field { display: flex; flex-direction: column; gap: 3px; }
.field-label { font-size: var(--text-label); font-weight: var(--weight-medium); color: var(--color-neutral-80); }

.action-bar { display: flex; align-items: center; gap: var(--space-4); }
.btn-accent { padding: 8px 20px; background: var(--color-accent-primary); color: #fff; border: none; border-radius: var(--radius-md); font-size: var(--text-body); font-weight: var(--weight-medium); font-family: var(--font-sans); cursor: pointer; }
.btn-accent:hover { background: var(--color-accent-hover); }
.saved-msg { font-size: var(--text-body); color: var(--color-success-text); }

.shortcut-list { display: flex; flex-direction: column; gap: 6px; }
.shortcut-row { display: flex; justify-content: space-between; align-items: center; font-size: var(--text-body); color: var(--color-neutral-100); padding: 4px 0; }
.shortcut-row kbd { font-size: var(--text-caption); padding: 2px 6px; background: var(--color-neutral-40); border: var(--border-width-thin) solid rgba(255,255,255,0.06); border-radius: var(--radius-sm); font-family: var(--font-mono); color: var(--color-neutral-70); }

.about-info p { font-size: var(--text-body); color: var(--color-neutral-100); margin-bottom: 4px; }
.about-desc { color: var(--color-neutral-70) !important; }
.about-tech { font-size: var(--text-label) !important; color: var(--color-neutral-60) !important; font-family: var(--font-mono); margin-top: var(--space-2); }

.empty-hint { text-align: center; padding: var(--space-6) 0; color: var(--color-neutral-70); font-size: var(--text-body); }
</style>
