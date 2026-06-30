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
.tool-panel { max-width: var(--content-max-width); margin: 0 auto; }
.tool-header { margin-bottom: var(--space-6); padding-bottom: var(--space-4); border-bottom: var(--border-width-thin) solid var(--border-color-subtle); }
.tool-title { font-size: var(--text-title); font-weight: var(--weight-semibold); color: var(--color-neutral-100); margin-bottom: var(--space-1); }
.tool-desc { color: var(--color-neutral-80); font-size: var(--text-body); }

.form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-3); }
.form-group { display: flex; flex-direction: column; gap: 5px; }
.form-group.full-width { grid-column: 1 / -1; margin-top: var(--space-3); }
.form-group label { font-size: var(--text-label); font-weight: var(--weight-medium); color: var(--color-neutral-90); }

.form-group input,
.form-group select,
.form-group textarea {
  padding: var(--space-2) 10px;
  border: var(--border-width-thin) solid var(--border-color-default);
  border-radius: var(--radius-md);
  font-size: var(--text-body);
  font-family: var(--font-mono);
  background: var(--color-neutral-20);
  color: var(--color-neutral-100);
  transition: border-color var(--duration-normal) var(--ease-standard), box-shadow var(--duration-normal) var(--ease-standard);
}
.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus { outline: none; border-color: var(--border-color-focus); box-shadow: 0 0 0 1px var(--color-accent-moderate); }
.form-group input::placeholder,
.form-group textarea::placeholder { color: var(--color-neutral-70); }
.form-group select {
  cursor: pointer; appearance: none; padding-right: 28px;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' fill='%239D9D9D' viewBox='0 0 16 16'%3E%3Cpath d='M8 11L3 6h10z'/%3E%3C/svg%3E");
  background-repeat: no-repeat; background-position: right 10px center;
}
.form-group select option { background: var(--color-neutral-50); color: var(--color-neutral-100); }

.mode-switch { display: flex; }
.mode-switch button {
  flex: 1; padding: 7px var(--space-3);
  border: var(--border-width-thin) solid var(--border-color-default);
  background: var(--color-neutral-20); color: var(--color-neutral-90);
  cursor: pointer; font-size: var(--text-body); font-family: var(--font-sans);
  transition: all var(--duration-fast) var(--ease-standard);
}
.mode-switch button:first-child { border-radius: var(--radius-md) 0 0 var(--radius-md); }
.mode-switch button:last-child { border-radius: 0 var(--radius-md) var(--radius-md) 0; border-left: none; }
.mode-switch button.active { background: var(--color-accent-primary); color: var(--color-neutral-120); border-color: var(--color-accent-primary); font-weight: var(--weight-medium); }

.action-row { display: flex; gap: 10px; margin: var(--space-5) 0; }
.btn-primary {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 9px var(--space-5); background: var(--color-accent-primary); color: var(--color-neutral-120);
  border: none; border-radius: var(--radius-md); font-size: var(--text-body);
  font-weight: var(--weight-medium); font-family: var(--font-sans); cursor: pointer;
  transition: background var(--duration-fast) var(--ease-standard);
}
.btn-primary:hover { background: var(--color-accent-hover); }
.btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
.btn-secondary {
  padding: 9px var(--space-5); background: var(--color-neutral-50); color: var(--color-neutral-100);
  border: var(--border-width-thin) solid var(--border-color-default); border-radius: var(--radius-md);
  font-size: var(--text-body); font-family: var(--font-sans); cursor: pointer;
  transition: background var(--duration-fast) var(--ease-standard);
}
.btn-secondary:hover { background: var(--color-neutral-40); }
.error-msg {
  padding: 10px var(--space-3); background: var(--color-danger-bg);
  border: var(--border-width-thin) solid var(--color-danger-border);
  border-radius: var(--radius-md); color: var(--color-danger-text);
  font-size: var(--text-label); margin-bottom: var(--space-3);
}
.output-area { background: var(--color-neutral-10) !important; border-color: var(--border-color-focus) !important; }
.spinner { display: inline-block; width: 14px; height: 14px; border: 2px solid rgba(255,255,255,.3); border-top-color: var(--color-neutral-120); border-radius: var(--radius-full); animation: spin .6s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
textarea { resize: vertical; }
</style>
