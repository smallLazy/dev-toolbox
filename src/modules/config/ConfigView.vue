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
  <div class="tool-panel">
    <div class="tool-header">
      <h2 class="tool-title">配置管理</h2>
      <p class="tool-desc">管理各工具的默认编码设置，配置自动保存到本地</p>
    </div>

    <div class="config-card">
      <h3>🔐 加解密默认编码</h3>
      <p class="config-note">这些设置将作为加解密工具的默认编码选项</p>

      <div class="form-grid">
        <div class="form-group">
          <label>Key 编码</label>
          <select v-model="appStore.config.crypto.keyEncoding">
            <option value="utf8">UTF-8</option>
            <option value="hex">Hex</option>
            <option value="base64">Base64</option>
          </select>
        </div>
        <div class="form-group">
          <label>IV 编码</label>
          <select v-model="appStore.config.crypto.ivEncoding">
            <option value="utf8">UTF-8</option>
            <option value="hex">Hex</option>
            <option value="base64">Base64</option>
          </select>
        </div>
        <div class="form-group">
          <label>输入编码</label>
          <select v-model="appStore.config.crypto.inputEncoding">
            <option value="utf8">UTF-8</option>
            <option value="hex">Hex</option>
            <option value="base64">Base64</option>
          </select>
        </div>
        <div class="form-group">
          <label>输出编码</label>
          <select v-model="appStore.config.crypto.outputEncoding">
            <option value="hex">Hex</option>
            <option value="base64">Base64</option>
          </select>
        </div>
      </div>
    </div>

    <div class="action-row">
      <button class="btn-primary" @click="handleSave">保存配置</button>
      <span v-if="savedMsg" class="saved-msg">{{ savedMsg }}</span>
    </div>

    <div class="info-card">
      <h4>ℹ️ 说明</h4>
      <ul>
        <li>配置保存在本地 Tauri Store 中，不会上传到任何服务器</li>
        <li>Key 和 IV 不会被记录——每次使用需手动输入</li>
        <li>加解密操作不记录明文参数</li>
      </ul>
    </div>
  </div>
</template>

<style scoped>
.tool-panel { max-width: var(--content-max-width); margin: 0 auto; }
.tool-header { margin-bottom: var(--space-6); padding-bottom: var(--space-4); border-bottom: var(--border-width-thin) solid var(--border-color-subtle); }
.tool-title { font-size: var(--text-title); font-weight: var(--weight-semibold); color: var(--color-neutral-100); margin-bottom: var(--space-1); }
.tool-desc { color: var(--color-neutral-80); font-size: var(--text-body); }
.config-card {
  background: var(--color-neutral-40); border: var(--border-width-thin) solid var(--border-color-subtle);
  border-radius: var(--radius-lg); padding: var(--space-5) var(--space-6); margin-bottom: var(--space-4);
}
.config-card h3 { font-size: var(--text-base); font-weight: var(--weight-medium); color: var(--color-neutral-100); margin-bottom: 2px; }
.config-note { font-size: var(--text-label); color: var(--color-neutral-80); margin-bottom: var(--space-4); }
.form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-3); }
.form-group { display: flex; flex-direction: column; gap: 5px; }
.form-group label { font-size: var(--text-label); font-weight: var(--weight-medium); color: var(--color-neutral-90); }
.form-group select {
  padding: var(--space-2) 10px; border: var(--border-width-thin) solid var(--border-color-default); border-radius: var(--radius-md);
  font-size: var(--text-body); background: var(--color-neutral-20); color: var(--color-neutral-100); cursor: pointer;
  appearance: none; padding-right: 28px; font-family: var(--font-sans);
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' fill='%239D9D9D' viewBox='0 0 16 16'%3E%3Cpath d='M8 11L3 6h10z'/%3E%3C/svg%3E");
  background-repeat: no-repeat; background-position: right 10px center;
  transition: border-color var(--duration-normal) var(--ease-standard), box-shadow var(--duration-normal) var(--ease-standard);
}
.form-group select:focus { outline: none; border-color: var(--border-color-focus); box-shadow: 0 0 0 1px var(--color-accent-moderate); }
.form-group select option { background: var(--color-neutral-50); color: var(--color-neutral-100); }
.action-row { display: flex; align-items: center; gap: var(--space-4); margin: var(--space-4) 0; }
.btn-primary {
  padding: 9px var(--space-5); background: var(--color-accent-primary); color: var(--color-neutral-120);
  border: none; border-radius: var(--radius-md); font-size: var(--text-body); font-weight: var(--weight-medium);
  font-family: var(--font-sans); cursor: pointer; transition: background var(--duration-fast) var(--ease-standard);
}
.btn-primary:hover { background: var(--color-accent-hover); }
.saved-msg { font-size: var(--text-body); color: var(--color-success-text); font-weight: var(--weight-medium); }
.info-card { background: var(--color-info-bg); border: var(--border-width-thin) solid rgba(107,165,231,.3); border-radius: var(--radius-lg); padding: var(--space-4) var(--space-5); margin-top: var(--space-6); }
.info-card h4 { font-size: var(--text-body); color: var(--color-info-text); margin-bottom: var(--space-2); font-weight: var(--weight-medium); }
.info-card ul { font-size: var(--text-label); color: var(--color-neutral-90); padding-left: var(--space-5); }
.info-card li { margin-bottom: 3px; }
</style>
