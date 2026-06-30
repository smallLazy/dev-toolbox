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
  <div class="page">
    <header class="page-header">
      <h1 class="page-title">AES 加解密</h1>
      <p class="page-desc">AES-256 对称加解密 — 支持 CBC / ECB 模式，多种编码格式</p>
    </header>

    <div class="page-content">
      <!-- Card: Configuration -->
      <div class="card">
        <div class="card-header">配置</div>
        <div class="card-body">
          <div class="form-grid">
            <div class="field">
              <label class="field-label">模式</label>
              <div class="segmented-control">
                <button :class="{ active: mode === 'encrypt' }" @click="mode = 'encrypt'">加密</button>
                <button :class="{ active: mode === 'decrypt' }" @click="mode = 'decrypt'">解密</button>
              </div>
            </div>
            <div class="field">
              <label class="field-label">算法</label>
              <select v-model="algorithm" class="dt-select">
                <option value="aes-256-cbc">AES-256-CBC</option>
                <option value="aes-256-ecb">AES-256-ECB</option>
              </select>
            </div>
            <div class="field">
              <label class="field-label">密钥 (Key)</label>
              <input v-model="key" type="text" class="dt-input" placeholder="输入 32 字节密钥" />
            </div>
            <div class="field" v-if="algorithm === 'aes-256-cbc'">
              <label class="field-label">初始向量 (IV)</label>
              <input v-model="iv" type="text" class="dt-input" placeholder="CBC 模式需要 16 字节 IV" />
            </div>
            <div class="field">
              <label class="field-label">Key 编码</label>
              <select v-model="keyEncoding" class="dt-select">
                <option value="utf8">UTF-8</option>
                <option value="hex">Hex</option>
                <option value="base64">Base64</option>
              </select>
            </div>
            <div class="field" v-if="algorithm === 'aes-256-cbc'">
              <label class="field-label">IV 编码</label>
              <select v-model="ivEncoding" class="dt-select">
                <option value="utf8">UTF-8</option>
                <option value="hex">Hex</option>
                <option value="base64">Base64</option>
              </select>
            </div>
            <div class="field">
              <label class="field-label">输入编码</label>
              <select v-model="inputEncoding" class="dt-select">
                <option value="utf8">UTF-8</option>
                <option value="hex">Hex</option>
                <option value="base64">Base64</option>
              </select>
            </div>
            <div class="field">
              <label class="field-label">输出编码</label>
              <select v-model="outputEncoding" class="dt-select">
                <option value="hex">Hex</option>
                <option value="base64">Base64</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <!-- Card: Input -->
      <div class="card">
        <div class="card-header">输入</div>
        <div class="card-body">
          <textarea v-model="input" class="dt-textarea" rows="5" :placeholder="mode === 'encrypt' ? '输入要加密的明文...' : '输入要解密的密文...'" />
        </div>
      </div>

      <!-- Action Bar -->
      <div class="action-bar">
        <button class="btn-accent" @click="execute" :disabled="loading">
          <span v-if="loading" class="spinner"></span>
          {{ loading ? '处理中...' : (mode === 'encrypt' ? '加密' : '解密') }}
        </button>
        <button class="btn-secondary" @click="swapMode">切换加/解密</button>
      </div>

      <div v-if="errorMsg" class="alert-error">{{ errorMsg }}</div>

      <!-- Card: Output -->
      <div class="card card-output" v-if="output">
        <div class="card-header">输出</div>
        <div class="card-body">
          <textarea v-model="output" class="dt-textarea" rows="5" readonly />
        </div>
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

/* ── Card ─────────────────────────── */
.card { background: var(--color-neutral-35); border: var(--border-width-thin) solid rgba(255,255,255,0.05); border-radius: var(--radius-xl); overflow: hidden; }
.card-header { padding: 9px var(--space-5); font-size: var(--text-caption); font-weight: var(--weight-medium); color: var(--color-neutral-60); text-transform: uppercase; letter-spacing: 0.06em; border-bottom: var(--border-width-thin) solid rgba(255,255,255,0.04); }
.card-body { padding: var(--space-4) var(--space-5); }
.card-output { border-color: var(--border-color-focus); }
.card-output .card-body { background: var(--color-neutral-15); }

/* ── Form Grid ────────────────────── */
.form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-3); }
.field { display: flex; flex-direction: column; gap: 3px; }
.field-label { font-size: var(--text-label); font-weight: var(--weight-medium); color: var(--color-neutral-80); }

/* ── Action Bar ───────────────────── */
.action-bar { display: flex; gap: 8px; }
</style>
