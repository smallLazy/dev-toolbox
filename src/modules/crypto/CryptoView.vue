<script setup lang="ts">
import { ref, computed } from "vue";
import { useAppStore } from "../../stores/app";

const appStore = useAppStore();

const key = ref("");
const iv = ref("");
const input = ref("");
const output = ref("");
const mode = ref<"encrypt" | "decrypt">("encrypt");
const algorithm = ref<"aes-256-cbc" | "aes-256-ecb">("aes-256-cbc");

const keyEncoding = computed({
  get: () => appStore.config.crypto.keyEncoding,
  set: (v) => { appStore.config.crypto.keyEncoding = v; appStore.saveConfig(); },
});
const ivEncoding = computed({
  get: () => appStore.config.crypto.ivEncoding,
  set: (v) => { appStore.config.crypto.ivEncoding = v; appStore.saveConfig(); },
});
const inputEncoding = computed({
  get: () => appStore.config.crypto.inputEncoding,
  set: (v) => { appStore.config.crypto.inputEncoding = v; appStore.saveConfig(); },
});
const outputEncoding = computed({
  get: () => appStore.config.crypto.outputEncoding,
  set: (v) => { appStore.config.crypto.outputEncoding = v; appStore.saveConfig(); },
});

const errorMsg = ref("");
const loading = ref(false);

function showError(msg: string) {
  errorMsg.value = msg;
  setTimeout(() => { errorMsg.value = ""; }, 5000);
}

async function execute() {
  errorMsg.value = "";
  output.value = "";

  if (!key.value.trim()) {
    showError("请输入密钥 (Key)");
    return;
  }
  if (!input.value.trim()) {
    showError("请输入待处理的文本");
    return;
  }
  if (algorithm.value === "aes-256-cbc" && !iv.value.trim()) {
    showError("CBC 模式需要填写 IV");
    return;
  }

  loading.value = true;
  try {
    const { invoke } = await import("@tauri-apps/api/core");
    const result = await invoke<string>("aes_crypt", {
      request: {
        mode: mode.value,
        algorithm: algorithm.value,
        key: key.value,
        iv: algorithm.value === "aes-256-ecb" ? "" : iv.value,
        input: input.value,
        keyEncoding: keyEncoding.value,
        ivEncoding: ivEncoding.value,
        inputEncoding: inputEncoding.value,
        outputEncoding: outputEncoding.value,
      },
    });
    output.value = result;
  } catch (e: unknown) {
    const msg = typeof e === "string" ? e : (e as Error).message || "未知错误";
    showError(`操作失败: ${msg}`);
  } finally {
    loading.value = false;
  }
}

function swapMode() {
  mode.value = mode.value === "encrypt" ? "decrypt" : "encrypt";
}
</script>

<template>
  <div class="tool-panel">
    <div class="tool-header">
      <h2 class="tool-title">参数加解密</h2>
      <p class="tool-desc">AES-256 对称加解密，支持 CBC / ECB 模式</p>
    </div>

    <div class="form-grid">
      <div class="form-group">
        <label>模式</label>
        <div class="mode-switch">
          <button :class="{ active: mode === 'encrypt' }" @click="mode = 'encrypt'">加密</button>
          <button :class="{ active: mode === 'decrypt' }" @click="mode = 'decrypt'">解密</button>
        </div>
      </div>

      <div class="form-group">
        <label>算法</label>
        <select v-model="algorithm">
          <option value="aes-256-cbc">AES-256-CBC</option>
          <option value="aes-256-ecb">AES-256-ECB</option>
        </select>
      </div>

      <div class="form-group">
        <label>密钥 (Key)</label>
        <input v-model="key" type="text" placeholder="输入加密/解密密钥" />
      </div>

      <div class="form-group" v-if="algorithm === 'aes-256-cbc'">
        <label>初始向量 (IV)</label>
        <input v-model="iv" type="text" placeholder="CBC 模式需要 16 字节 IV" />
      </div>

      <div class="form-group">
        <label>Key 编码</label>
        <select v-model="keyEncoding">
          <option value="utf8">UTF-8</option>
          <option value="hex">Hex</option>
          <option value="base64">Base64</option>
        </select>
      </div>

      <div class="form-group" v-if="algorithm === 'aes-256-cbc'">
        <label>IV 编码</label>
        <select v-model="ivEncoding">
          <option value="utf8">UTF-8</option>
          <option value="hex">Hex</option>
          <option value="base64">Base64</option>
        </select>
      </div>

      <div class="form-group">
        <label>输入编码</label>
        <select v-model="inputEncoding">
          <option value="utf8">UTF-8</option>
          <option value="hex">Hex</option>
          <option value="base64">Base64</option>
        </select>
      </div>

      <div class="form-group">
        <label>输出编码</label>
        <select v-model="outputEncoding">
          <option value="hex">Hex</option>
          <option value="base64">Base64</option>
        </select>
      </div>
    </div>

    <div class="form-group full-width">
      <label>输入内容</label>
      <textarea v-model="input" rows="5" :placeholder="mode === 'encrypt' ? '输入要加密的明文...' : '输入要解密的密文...'" />
    </div>

    <div class="action-row">
      <button class="btn-primary" @click="execute" :disabled="loading">
        <span v-if="loading" class="spinner"></span>
        {{ loading ? '处理中...' : (mode === 'encrypt' ? '加密' : '解密') }}
      </button>
      <button class="btn-secondary" @click="swapMode">切换加/解密</button>
    </div>

    <div v-if="errorMsg" class="error-msg">{{ errorMsg }}</div>

    <div class="form-group full-width" v-if="output">
      <label>输出结果</label>
      <textarea v-model="output" rows="5" readonly class="output-area" />
    </div>
  </div>
</template>

<style scoped>
.tool-panel {
  max-width: 820px;
  margin: 0 auto;
}

.tool-header {
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid #2D2D2D;
}

.tool-title {
  font-size: 20px;
  font-weight: 600;
  color: #E8E8E8;
  margin-bottom: 4px;
}

.tool-desc {
  color: #6E6E6E;
  font-size: 13px;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.form-group.full-width {
  grid-column: 1 / -1;
  margin-top: 14px;
}

.form-group label {
  font-size: 12px;
  font-weight: 500;
  color: #9D9D9D;
  text-transform: none;
}

.form-group input,
.form-group select,
.form-group textarea {
  padding: 8px 10px;
  border: 1px solid #3D3D3D;
  border-radius: 4px;
  font-size: 13px;
  font-family: "Cascadia Code", "Fira Code", "Menlo", "Monaco", "Courier New", monospace;
  background: #1A1A1A;
  color: #E8E8E8;
  transition: border-color 0.15s, box-shadow 0.15s;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #0078D4;
  box-shadow: 0 0 0 1px rgba(0, 120, 212, 0.3);
}

.form-group input::placeholder,
.form-group textarea::placeholder {
  color: #555;
}

.form-group select {
  cursor: pointer;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' fill='%239D9D9D' viewBox='0 0 16 16'%3E%3Cpath d='M8 11L3 6h10z'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 10px center;
  padding-right: 28px;
}

.form-group select option {
  background: #2D2D2D;
  color: #E8E8E8;
}

.mode-switch {
  display: flex;
}

.mode-switch button {
  flex: 1;
  padding: 7px 14px;
  border: 1px solid #3D3D3D;
  background: #1A1A1A;
  color: #9D9D9D;
  cursor: pointer;
  font-size: 13px;
  font-family: inherit;
  transition: all 0.15s;
}

.mode-switch button:first-child {
  border-radius: 4px 0 0 4px;
}

.mode-switch button:last-child {
  border-radius: 0 4px 4px 0;
  border-left: none;
}

.mode-switch button.active {
  background: #0078D4;
  color: #FFF;
  border-color: #0078D4;
  font-weight: 500;
}

.action-row {
  display: flex;
  gap: 10px;
  margin: 20px 0;
}

.btn-primary {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 9px 20px;
  background: #0078D4;
  color: #FFF;
  border: none;
  border-radius: 4px;
  font-size: 13px;
  font-weight: 500;
  font-family: inherit;
  cursor: pointer;
  transition: background 0.15s;
}

.btn-primary:hover { background: #1A8FE3; }
.btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }

.btn-secondary {
  padding: 9px 20px;
  background: #2D2D2D;
  color: #E8E8E8;
  border: 1px solid #3D3D3D;
  border-radius: 4px;
  font-size: 13px;
  font-family: inherit;
  cursor: pointer;
  transition: background 0.15s;
}

.btn-secondary:hover { background: #383838; }

.error-msg {
  padding: 10px 14px;
  background: #3D1F1F;
  border: 1px solid #CF6679;
  border-radius: 4px;
  color: #CF6679;
  font-size: 12px;
  margin-bottom: 14px;
}

.output-area {
  background: #111 !important;
  border-color: #0078D4 !important;
}

.spinner {
  display: inline-block;
  width: 14px;
  height: 14px;
  border: 2px solid rgba(255,255,255,0.3);
  border-top-color: #FFF;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

textarea {
  resize: vertical;
}
</style>
