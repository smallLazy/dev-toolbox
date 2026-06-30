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
.tool-panel { max-width: var(--content-max-width); margin: 0 auto; }
.tool-header { margin-bottom: var(--space-6); padding-bottom: var(--space-4); border-bottom: var(--border-width-thin) solid var(--border-color-subtle); }
.tool-title { font-size: var(--text-title); font-weight: var(--weight-semibold); color: var(--color-neutral-100); margin-bottom: var(--space-1); }
.tool-desc { color: var(--color-neutral-80); font-size: var(--text-body); }

.form-group { display: flex; flex-direction: column; gap: 5px; margin-bottom: var(--space-3); }
.form-group.full-width { width: 100%; }
.form-group label { font-size: var(--text-label); font-weight: var(--weight-medium); color: var(--color-neutral-90); }

.form-group textarea {
  padding: 10px; border: var(--border-width-thin) solid var(--border-color-default); border-radius: var(--radius-md);
  font-size: var(--text-body); font-family: var(--font-mono); background: var(--color-neutral-20);
  color: var(--color-neutral-100); resize: vertical; width: 100%;
  transition: border-color var(--duration-normal) var(--ease-standard), box-shadow var(--duration-normal) var(--ease-standard);
}
.form-group textarea:focus { outline: none; border-color: var(--border-color-focus); box-shadow: 0 0 0 1px var(--color-accent-moderate); }
.form-group textarea::placeholder { color: var(--color-neutral-70); }

.mode-switch { display: flex; }
.mode-switch button {
  flex: 1; padding: 7px var(--space-3); border: var(--border-width-thin) solid var(--border-color-default);
  background: var(--color-neutral-20); color: var(--color-neutral-90);
  cursor: pointer; font-size: var(--text-body); font-family: var(--font-sans); transition: all var(--duration-fast) var(--ease-standard);
}
.mode-switch button:first-child { border-radius: var(--radius-md) 0 0 var(--radius-md); }
.mode-switch button:last-child { border-radius: 0 var(--radius-md) var(--radius-md) 0; border-left: none; }
.mode-switch button.active { background: var(--color-accent-primary); color: var(--color-neutral-120); border-color: var(--color-accent-primary); font-weight: var(--weight-medium); }

.action-row { display: flex; gap: 10px; margin: var(--space-5) 0; }
.btn-primary {
  display: inline-flex; align-items: center; gap: 6px; padding: 9px var(--space-5);
  background: var(--color-accent-primary); color: var(--color-neutral-120); border: none; border-radius: var(--radius-md);
  font-size: var(--text-body); font-weight: var(--weight-medium); font-family: var(--font-sans); cursor: pointer;
  transition: background var(--duration-fast) var(--ease-standard);
}
.btn-primary:hover { background: var(--color-accent-hover); }
.btn-primary:disabled { opacity: .5; cursor: not-allowed; }
.btn-secondary {
  padding: 9px var(--space-5); background: var(--color-neutral-50); color: var(--color-neutral-100);
  border: var(--border-width-thin) solid var(--border-color-default); border-radius: var(--radius-md);
  font-size: var(--text-body); font-family: var(--font-sans); cursor: pointer; transition: background var(--duration-fast) var(--ease-standard);
}
.btn-secondary:hover { background: var(--color-neutral-40); }
.error-msg {
  padding: 10px var(--space-3); background: var(--color-danger-bg); border: var(--border-width-thin) solid var(--color-danger-border);
  border-radius: var(--radius-md); color: var(--color-danger-text); font-size: var(--text-label); margin-bottom: var(--space-3);
}
.output-area { background: var(--color-neutral-10) !important; border-color: var(--border-color-focus) !important; }
.spinner { display: inline-block; width: 14px; height: 14px; border: 2px solid rgba(255,255,255,.3); border-top-color: var(--color-neutral-120); border-radius: var(--radius-full); animation: spin .6s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
.info-card { background: var(--color-info-bg); border: var(--border-width-thin) solid rgba(107,165,231,.3); border-radius: var(--radius-lg); padding: var(--space-4) var(--space-5); margin-top: var(--space-6); }
.info-card h4 { font-size: var(--text-body); color: var(--color-info-text); margin-bottom: 10px; font-weight: var(--weight-medium); }
.info-card .pipeline { margin-bottom: 10px; }
.info-card .pipeline code { font-size: var(--text-label); font-family: var(--font-mono); color: var(--color-neutral-100); background: rgba(0,0,0,.3); padding: 4px var(--space-2); border-radius: var(--radius-sm); }
.info-card ul { font-size: var(--text-label); color: var(--color-neutral-90); padding-left: var(--space-5); }
.info-card li { margin-bottom: 3px; }
.info-card code { font-family: var(--font-mono); background: rgba(0,0,0,.3); padding: 1px 5px; border-radius: var(--radius-sm); font-size: var(--text-caption); color: var(--color-info-text); }
</style>
