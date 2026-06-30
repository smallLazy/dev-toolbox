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
  <div class="page">
    <header class="page-header">
      <h1 class="page-title">请求参数编解码</h1>
      <p class="page-desc">PHP base_encryption / filter 兼容 — JSON → URL Encode → Base64 → 去填充</p>
    </header>

    <div class="page-content">
      <div class="card">
        <div class="card-header">配置</div>
        <div class="card-body">
          <div class="field">
            <label class="field-label">模式</label>
            <div class="segmented-control">
              <button :class="{ active: mode === 'encode' }" @click="mode = 'encode'">编码</button>
              <button :class="{ active: mode === 'decode' }" @click="mode = 'decode'">解码</button>
            </div>
          </div>
        </div>
      </div>

      <div class="card">
        <div class="card-header">{{ mode === 'encode' ? '原始内容' : '已编码字符串' }}</div>
        <div class="card-body">
          <textarea v-model="input" class="dt-textarea" rows="6" :placeholder="mode === 'encode' ? '输入要编码的内容...' : '粘贴已编码的字符串...'" />
        </div>
      </div>

      <div class="action-bar">
        <button class="btn-accent" @click="execute" :disabled="loading">
          <span v-if="loading" class="spinner"></span>
          {{ loading ? '处理中...' : (mode === 'encode' ? '编码' : '解码') }}
        </button>
        <button class="btn-secondary" @click="swapMode">切换编/解码</button>
      </div>

      <div v-if="errorMsg" class="alert-error">{{ errorMsg }}</div>

      <div class="card card-output" v-if="output">
        <div class="card-header">输出</div>
        <div class="card-body">
          <textarea v-model="output" class="dt-textarea" rows="6" readonly />
        </div>
      </div>

      <div class="info-card">
        <h4>编码管道</h4>
        <p class="pipeline"><code v-if="mode === 'encode'">原始内容 → URL Encode → Base64 → 去除 '=' 填充</code><code v-else>已编码字符串 → 补 '=' → Base64 解码 → URL Decode</code></p>
        <ul>
          <li>等价于 PHP <code>base_encryption()</code> / <code>filter()</code></li>
          <li>非加密算法，仅做编码混淆</li>
        </ul>
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

.card { background: var(--color-neutral-35); border: var(--border-width-thin) solid rgba(255,255,255,0.05); border-radius: var(--radius-xl); overflow: hidden; }
.card-header { padding: var(--space-card-header-y) var(--space-5); font-size: var(--text-caption); font-weight: var(--weight-medium); color: var(--color-neutral-60); text-transform: uppercase; letter-spacing: 0.06em; border-bottom: var(--border-width-thin) solid rgba(255,255,255,0.04); }
.card-body { padding: var(--space-4) var(--space-5); }
.card-output { border-color: var(--border-color-focus); }
.card-output .card-body { background: var(--color-neutral-15); }

.field { display: flex; flex-direction: column; gap: var(--space-compact); }
.field-label { font-size: var(--text-label); font-weight: var(--weight-medium); color: var(--color-neutral-80); }

.action-bar { display: flex; gap: var(--space-2); }

.info-card { background: var(--color-info-bg); border: var(--border-width-thin) solid rgba(107,165,231,0.15); border-radius: var(--radius-xl); padding: var(--space-4) var(--space-5); }
.info-card h4 { font-size: var(--text-body); color: var(--color-info-text); margin-bottom: var(--space-2); font-weight: var(--weight-medium); }
.info-card .pipeline { margin-bottom: var(--space-2); }
.info-card .pipeline code { font-size: var(--text-label); font-family: var(--font-mono); color: var(--color-neutral-100); background: rgba(0,0,0,.3); padding: var(--space-compact) var(--space-2); border-radius: var(--radius-sm); }
.info-card ul { font-size: var(--text-label); color: var(--color-neutral-80); padding-left: var(--space-5); }
.info-card li { margin-bottom: 2px; }
.info-card code { font-family: var(--font-mono); background: rgba(0,0,0,.3); padding: 1px 5px; border-radius: var(--radius-sm); font-size: var(--text-caption); color: var(--color-info-text); }
</style>
