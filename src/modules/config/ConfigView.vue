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
    <h2 class="tool-title">⚙️ 配置管理</h2>
    <p class="tool-desc">管理各工具的默认编码设置，配置自动保存到本地</p>

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
      <button class="btn-primary" @click="handleSave">💾 保存配置</button>
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
.tool-panel { max-width: 800px; margin: 0 auto; }
.tool-title { font-size: 22px; margin-bottom: 4px; color: #1e1e2e; }
.tool-desc { color: #6c7086; margin-bottom: 20px; font-size: 14px; }

.config-card {
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  padding: 20px 24px;
  margin-bottom: 16px;
}

.config-card h3 { font-size: 16px; color: #1e1e2e; margin-bottom: 4px; }
.config-note { font-size: 13px; color: #6c7086; margin-bottom: 16px; }

.form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
.form-group { display: flex; flex-direction: column; gap: 6px; }
.form-group label { font-size: 13px; font-weight: 600; color: #45475a; }
.form-group select {
  padding: 8px 12px; border: 1px solid #d1d5db; border-radius: 6px;
  font-size: 14px; background: #fff;
}
.form-group select:focus { outline: none; border-color: #cba6f7; box-shadow: 0 0 0 2px rgba(203, 166, 247, 0.2); }

.action-row { display: flex; align-items: center; gap: 16px; margin: 16px 0; }
.btn-primary {
  padding: 10px 24px; background: #cba6f7; color: #1e1e2e;
  border: none; border-radius: 6px; font-size: 14px; font-weight: 600; cursor: pointer;
}
.btn-primary:hover { opacity: 0.85; }
.saved-msg { font-size: 14px; color: #16a34a; font-weight: 500; }

.info-card {
  background: #f0f9ff;
  border: 1px solid #bae6fd;
  border-radius: 8px;
  padding: 16px 20px;
  margin-top: 24px;
}

.info-card h4 { font-size: 14px; color: #0369a1; margin-bottom: 8px; }
.info-card ul { font-size: 13px; color: #45475a; padding-left: 20px; }
.info-card li { margin-bottom: 4px; }
</style>
