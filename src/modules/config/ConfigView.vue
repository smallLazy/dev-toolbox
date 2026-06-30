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
.tool-panel { max-width: 820px; margin: 0 auto; }
.tool-header { margin-bottom: 24px; padding-bottom: 16px; border-bottom: 1px solid #2D2D2D; }
.tool-title { font-size: 20px; font-weight: 600; color: #E8E8E8; margin-bottom: 4px; }
.tool-desc { color: #6E6E6E; font-size: 13px; }
.config-card {
  background: #252525; border: 1px solid #2D2D2D; border-radius: 6px;
  padding: 20px 24px; margin-bottom: 16px;
}
.config-card h3 { font-size: 14px; font-weight: 500; color: #E8E8E8; margin-bottom: 2px; }
.config-note { font-size: 12px; color: #6E6E6E; margin-bottom: 16px; }
.form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
.form-group { display: flex; flex-direction: column; gap: 5px; }
.form-group label { font-size: 12px; font-weight: 500; color: #9D9D9D; }
.form-group select {
  padding: 8px 10px; border: 1px solid #3D3D3D; border-radius: 4px;
  font-size: 13px; background: #1A1A1A; color: #E8E8E8; cursor: pointer;
  appearance: none; padding-right: 28px;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' fill='%239D9D9D' viewBox='0 0 16 16'%3E%3Cpath d='M8 11L3 6h10z'/%3E%3C/svg%3E");
  background-repeat: no-repeat; background-position: right 10px center;
}
.form-group select:focus { outline: none; border-color: #0078D4; box-shadow: 0 0 0 1px rgba(0,120,212,.3); }
.form-group select option { background: #2D2D2D; color: #E8E8E8; }
.action-row { display: flex; align-items: center; gap: 16px; margin: 16px 0; }
.btn-primary {
  padding: 9px 20px; background: #0078D4; color: #FFF; border: none; border-radius: 4px;
  font-size: 13px; font-weight: 500; font-family: inherit; cursor: pointer; transition: background 0.15s;
}
.btn-primary:hover { background: #1A8FE3; }
.saved-msg { font-size: 13px; color: #4CAF50; font-weight: 500; }
.info-card {
  background: #1A2744; border: 1px solid #1D3A6C; border-radius: 6px;
  padding: 16px 20px; margin-top: 24px;
}
.info-card h4 { font-size: 13px; color: #6BA5E7; margin-bottom: 8px; }
.info-card ul { font-size: 12px; color: #9D9D9D; padding-left: 20px; }
.info-card li { margin-bottom: 3px; }
</style>
