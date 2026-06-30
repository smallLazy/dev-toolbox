<script setup lang="ts">
import { ref } from "vue";

const input = ref("");
const output = ref("");
const mode = ref<"encode" | "decode">("encode");
const errorMsg = ref("");
const loading = ref(false);

function showError(msg: string) {
  errorMsg.value = msg;
  setTimeout(() => { errorMsg.value = ""; }, 5000);
}

async function execute() {
  errorMsg.value = "";
  output.value = "";

  if (!input.value.trim()) {
    showError(mode.value === "encode" ? "请输入要编码的内容" : "请输入要解码的字符串");
    return;
  }

  loading.value = true;
  try {
    const { invoke } = await import("@tauri-apps/api/core");
    const result = await invoke<string>("cloud_encrypt", {
      mode: mode.value,
      input: input.value,
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
  mode.value = mode.value === "encode" ? "decode" : "encode";
  output.value = "";
  errorMsg.value = "";
}
</script>

<template>
  <div class="tool-panel">
    <div class="tool-header">
      <h2 class="tool-title">请求参数编解码</h2>
      <p class="tool-desc">PHP base_encryption / filter 兼容的编解码管道 &mdash; JSON &rarr; URL Encode &rarr; Base64 &rarr; 去填充</p>
    </div>

    <div class="form-group">
      <label>模式</label>
      <div class="mode-switch">
        <button :class="{ active: mode === 'encode' }" @click="mode = 'encode'">编码 (Encode)</button>
        <button :class="{ active: mode === 'decode' }" @click="mode = 'decode'">解码 (Decode)</button>
      </div>
    </div>

    <div class="form-group full-width">
      <label>{{ mode === 'encode' ? '原始内容' : '已编码字符串' }}</label>
      <textarea
        v-model="input"
        rows="6"
        :placeholder="mode === 'encode'
          ? '输入要编码的内容（JSON / URL 参数 / 任意文本）...'
          : '粘贴已编码的字符串（如 URL 中的 f 参数值）...'"
      />
    </div>

    <div class="action-row">
      <button class="btn-primary" @click="execute" :disabled="loading">
        <span v-if="loading" class="spinner"></span>
        {{ loading ? '处理中...' : (mode === 'encode' ? '→ 编码' : '→ 解码') }}
      </button>
      <button class="btn-secondary" @click="swapMode">切换编/解码</button>
    </div>

    <div v-if="errorMsg" class="error-msg">{{ errorMsg }}</div>

    <div class="form-group full-width" v-if="output">
      <label>输出结果</label>
      <textarea v-model="output" rows="6" readonly class="output-area" />
    </div>

    <div class="info-card">
      <h4>ℹ️ 编码管道说明</h4>
      <div class="pipeline">
        <code v-if="mode === 'encode'">
          原始内容 → URL Encode → Base64 → 去除 '=' 填充
        </code>
        <code v-else>
          已编码字符串 → 补回 '=' 填充 → 空格替换为 '+' → Base64 解码 → URL Decode
        </code>
      </div>
      <ul>
        <li>等价于 PHP <code>base_encryption()</code> / <code>filter()</code></li>
        <li>非加密算法，仅做编码混淆</li>
        <li>前端通常取 <code>f</code> 参数后自行补 <code>==</code> 再 base64 解码</li>
      </ul>
    </div>
  </div>
</template>

<style scoped>
.tool-panel { max-width: 820px; margin: 0 auto; }
.tool-header { margin-bottom: 24px; padding-bottom: 16px; border-bottom: 1px solid #2D2D2D; }
.tool-title { font-size: 20px; font-weight: 600; color: #E8E8E8; margin-bottom: 4px; }
.tool-desc { color: #6E6E6E; font-size: 13px; }

.form-group { display: flex; flex-direction: column; gap: 5px; margin-bottom: 14px; }
.form-group.full-width { width: 100%; }
.form-group label { font-size: 12px; font-weight: 500; color: #9D9D9D; }

.form-group textarea {
  padding: 10px; border: 1px solid #3D3D3D; border-radius: 4px;
  font-size: 13px; font-family: "Cascadia Code","Fira Code","Menlo","Monaco","Courier New",monospace;
  background: #1A1A1A; color: #E8E8E8; resize: vertical; width: 100%;
}
.form-group textarea:focus { outline: none; border-color: #0078D4; box-shadow: 0 0 0 1px rgba(0,120,212,.3); }
.form-group textarea::placeholder { color: #555; }

.mode-switch { display: flex; }
.mode-switch button {
  flex: 1; padding: 7px 14px; border: 1px solid #3D3D3D; background: #1A1A1A; color: #9D9D9D;
  cursor: pointer; font-size: 13px; font-family: inherit; transition: all .15s;
}
.mode-switch button:first-child { border-radius: 4px 0 0 4px; }
.mode-switch button:last-child { border-radius: 0 4px 4px 0; border-left: none; }
.mode-switch button.active { background: #0078D4; color: #FFF; border-color: #0078D4; font-weight: 500; }

.action-row { display: flex; gap: 10px; margin: 20px 0; }

.btn-primary {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 9px 20px; background: #0078D4; color: #FFF; border: none; border-radius: 4px;
  font-size: 13px; font-weight: 500; font-family: inherit; cursor: pointer; transition: background .15s;
}
.btn-primary:hover { background: #1A8FE3; }
.btn-primary:disabled { opacity: .5; cursor: not-allowed; }

.btn-secondary {
  padding: 9px 20px; background: #2D2D2D; color: #E8E8E8; border: 1px solid #3D3D3D;
  border-radius: 4px; font-size: 13px; font-family: inherit; cursor: pointer; transition: background .15s;
}
.btn-secondary:hover { background: #383838; }

.error-msg {
  padding: 10px 14px; background: #3D1F1F; border: 1px solid #CF6679;
  border-radius: 4px; color: #CF6679; font-size: 12px; margin-bottom: 14px;
}

.output-area { background: #111 !important; border-color: #0078D4 !important; }

.spinner {
  display: inline-block; width: 14px; height: 14px;
  border: 2px solid rgba(255,255,255,.3); border-top-color: #FFF;
  border-radius: 50%; animation: spin .6s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

.info-card {
  background: #1A2744; border: 1px solid #1D3A6C; border-radius: 6px;
  padding: 16px 20px; margin-top: 24px;
}
.info-card h4 { font-size: 13px; color: #6BA5E7; margin-bottom: 10px; }
.info-card .pipeline { margin-bottom: 10px; }
.info-card .pipeline code {
  font-size: 12px; font-family: "Cascadia Code","Fira Code","Menlo","Monaco","Courier New",monospace;
  color: #E8E8E8; background: #0D1A2E; padding: 4px 8px; border-radius: 3px;
}
.info-card ul { font-size: 12px; color: #9D9D9D; padding-left: 20px; }
.info-card li { margin-bottom: 3px; }
.info-card code {
  font-family: "Cascadia Code","Fira Code","Menlo","Monaco","Courier New",monospace;
  background: #0D1A2E; padding: 1px 5px; border-radius: 3px; font-size: 11px; color: #6BA5E7;
}
</style>
