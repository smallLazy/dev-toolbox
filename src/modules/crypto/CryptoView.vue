<script setup lang="ts">
import { ref, computed } from "vue";
import { useAppStore } from "../../stores/app";

const appStore = useAppStore();

// Form fields
const key = ref("");
const iv = ref("");
const input = ref("");
const output = ref("");
const mode = ref<"encrypt" | "decrypt">("encrypt");
const algorithm = ref<"aes-256-cbc" | "aes-256-ecb">("aes-256-cbc");

// Encoding options - synced with store
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
    <h2 class="tool-title">🔐 参数加解密</h2>
    <p class="tool-desc">AES-256 对称加解密，支持 CBC / ECB 模式</p>

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
      <textarea v-model="input" rows="6" :placeholder="mode === 'encrypt' ? '输入要加密的明文...' : '输入要解密的密文...'" />
    </div>

    <div class="action-row">
      <button class="btn-primary" @click="execute" :disabled="loading">
        {{ loading ? '处理中...' : (mode === 'encrypt' ? '🔒 加密' : '🔓 解密') }}
      </button>
      <button class="btn-secondary" @click="swapMode">
        ⇄ 切换加/解密
      </button>
    </div>

    <div v-if="errorMsg" class="error-msg">{{ errorMsg }}</div>

    <div class="form-group full-width" v-if="output">
      <label>输出结果</label>
      <textarea v-model="output" rows="6" readonly />
    </div>
  </div>
</template>

<style scoped>
.tool-panel {
  max-width: 800px;
  margin: 0 auto;
}

.tool-title {
  font-size: 22px;
  margin-bottom: 4px;
  color: #1e1e2e;
}

.tool-desc {
  color: #6c7086;
  margin-bottom: 20px;
  font-size: 14px;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-group.full-width {
  grid-column: 1 / -1;
}

.form-group label {
  font-size: 13px;
  font-weight: 600;
  color: #45475a;
}

.form-group input,
.form-group select,
.form-group textarea {
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  font-family: "Menlo", "Monaco", "Courier New", monospace;
  background: #fff;
  transition: border-color 0.15s;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #cba6f7;
  box-shadow: 0 0 0 2px rgba(203, 166, 247, 0.2);
}

.mode-switch {
  display: flex;
  gap: 0;
}

.mode-switch button {
  flex: 1;
  padding: 8px 16px;
  border: 1px solid #d1d5db;
  background: #fff;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.15s;
}

.mode-switch button:first-child {
  border-radius: 6px 0 0 6px;
}

.mode-switch button:last-child {
  border-radius: 0 6px 6px 0;
}

.mode-switch button.active {
  background: #cba6f7;
  color: #1e1e2e;
  border-color: #cba6f7;
  font-weight: 600;
}

.action-row {
  display: flex;
  gap: 12px;
  margin: 20px 0;
}

.btn-primary {
  padding: 10px 24px;
  background: #cba6f7;
  color: #1e1e2e;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.15s;
}

.btn-primary:hover { opacity: 0.85; }
.btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }

.btn-secondary {
  padding: 10px 24px;
  background: #e6e6fa;
  color: #45475a;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  transition: background 0.15s;
}

.btn-secondary:hover { background: #dcdcf0; }

.error-msg {
  padding: 10px 14px;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 6px;
  color: #dc2626;
  font-size: 13px;
  margin-bottom: 12px;
}

textarea {
  resize: vertical;
}
</style>
