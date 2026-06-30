<script setup lang="ts">
import { useAppStore } from "../../stores/app";
import { ref } from "vue";

const appStore = useAppStore();
const savedMsg = ref("");

async function handleSave() {
  await appStore.saveConfig();
  savedMsg.value = "✅ 配置已保存";
  setTimeout(() => { savedMsg.value = ""; }, 2000);
}
</script>

<template>
  <div class="page">
    <header class="page-header">
      <h1 class="page-title">设置</h1>
      <p class="page-desc">管理加解密工具的默认编码配置，自动保存到本地</p>
    </header>

    <div class="page-content">
      <div class="card">
        <div class="card-header">加解密默认编码</div>
        <div class="card-body">
          <p class="card-desc">这些设置将作为 AES 加解密工具的默认编码选项</p>
          <div class="form-grid">
            <div class="field">
              <label class="field-label">Key 编码</label>
              <select v-model="appStore.config.crypto.keyEncoding" class="dt-select">
                <option value="utf8">UTF-8</option>
                <option value="hex">Hex</option>
                <option value="base64">Base64</option>
              </select>
            </div>
            <div class="field">
              <label class="field-label">IV 编码</label>
              <select v-model="appStore.config.crypto.ivEncoding" class="dt-select">
                <option value="utf8">UTF-8</option>
                <option value="hex">Hex</option>
                <option value="base64">Base64</option>
              </select>
            </div>
            <div class="field">
              <label class="field-label">输入编码</label>
              <select v-model="appStore.config.crypto.inputEncoding" class="dt-select">
                <option value="utf8">UTF-8</option>
                <option value="hex">Hex</option>
                <option value="base64">Base64</option>
              </select>
            </div>
            <div class="field">
              <label class="field-label">输出编码</label>
              <select v-model="appStore.config.crypto.outputEncoding" class="dt-select">
                <option value="hex">Hex</option>
                <option value="base64">Base64</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div class="action-bar">
        <button class="btn-accent" @click="handleSave">保存配置</button>
        <span v-if="savedMsg" class="saved-msg">{{ savedMsg }}</span>
      </div>

      <div class="info-card">
        <h4>说明</h4>
        <ul>
          <li>配置保存在本地 Tauri Store 中，不会上传到任何服务器</li>
          <li>Key 和 IV 不会被记录 — 每次使用需手动输入</li>
          <li>加解密操作不记录明文参数</li>
        </ul>
      </div>
    </div>
  </div>
</template>

<style scoped>
.page { max-width: var(--content-max-width); margin: 0 auto; }
.page-header { margin-bottom: var(--space-6); }
.page-title { font-size: var(--text-title); font-weight: var(--weight-semibold); color: var(--color-neutral-100); margin-bottom: var(--space-1); }
.page-desc { font-size: var(--text-body); color: var(--color-neutral-80); }
.page-content { display: flex; flex-direction: column; gap: var(--space-4); }

.card { background: var(--color-neutral-40); border: var(--border-width-thin) solid var(--border-color-subtle); border-radius: var(--radius-lg); overflow: hidden; }
.card-header { padding: 10px var(--space-5); font-size: var(--text-label); font-weight: var(--weight-medium); color: var(--color-neutral-80); border-bottom: var(--border-width-thin) solid var(--border-color-subtle); }
.card-body { padding: var(--space-4) var(--space-5); }
.card-desc { font-size: var(--text-label); color: var(--color-neutral-80); margin-bottom: var(--space-4); }

.form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-3); }
.field { display: flex; flex-direction: column; gap: 4px; }
.field-label { font-size: var(--text-label); font-weight: var(--weight-medium); color: var(--color-neutral-90); }

.action-bar { display: flex; align-items: center; gap: var(--space-4); }
.btn-accent { padding: 9px 24px; background: var(--color-accent-primary); color: #fff; border: none; border-radius: var(--radius-md); font-size: var(--text-body); font-weight: var(--weight-medium); font-family: var(--font-sans); cursor: pointer; transition: background var(--duration-fast) var(--ease-standard); }
.btn-accent:hover { background: var(--color-accent-hover); }
.saved-msg { font-size: var(--text-body); color: var(--color-success-text); font-weight: var(--weight-medium); }

.info-card { background: var(--color-info-bg); border: var(--border-width-thin) solid rgba(107,165,231,.3); border-radius: var(--radius-lg); padding: var(--space-4) var(--space-5); }
.info-card h4 { font-size: var(--text-body); color: var(--color-info-text); margin-bottom: var(--space-2); font-weight: var(--weight-medium); }
.info-card ul { font-size: var(--text-label); color: var(--color-neutral-90); padding-left: var(--space-5); }
.info-card li { margin-bottom: 2px; }
</style>
