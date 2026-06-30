<script setup lang="ts">
import { ref } from "vue";

const input = ref("");
const output = ref("");
const mode = ref<"encode" | "decode">("encode");
const errorMsg = ref("");

function execute() {
  errorMsg.value = "";
  output.value = "";

  if (!input.value.trim()) {
    errorMsg.value = "请输入文本";
    return;
  }

  try {
    if (mode.value === "encode") {
      const bytes = new TextEncoder().encode(input.value);
      let binary = "";
      bytes.forEach((b) => (binary += String.fromCharCode(b)));
      output.value = btoa(binary);
    } else {
      const binary = atob(input.value.trim());
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
      }
      output.value = new TextDecoder().decode(bytes);
    }
  } catch (e) {
    errorMsg.value = `操作失败: ${(e as Error).message || "输入可能不是有效的 Base64 文本"}`;
  }
}
</script>

<template>
  <div class="page">
    <header class="page-header">
      <h1 class="page-title">Base64 编解码</h1>
      <p class="page-desc">Base64 编码与解码，支持 Unicode 和 Emoji</p>
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
        <div class="card-header">输入</div>
        <div class="card-body">
          <textarea v-model="input" class="dt-textarea" rows="6" :placeholder="mode === 'encode' ? '输入要编码的文本...' : '输入 Base64 字符串...'" />
        </div>
      </div>

      <div class="action-bar">
        <button class="btn-accent" @click="execute">{{ mode === 'encode' ? '编码' : '解码' }}</button>
      </div>

      <div v-if="errorMsg" class="alert-error">{{ errorMsg }}</div>

      <div class="card card-output" v-if="output">
        <div class="card-header">输出</div>
        <div class="card-body">
          <textarea v-model="output" class="dt-textarea" rows="6" readonly />
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

.card { background: var(--color-neutral-35); border: var(--border-width-thin) solid rgba(255,255,255,0.05); border-radius: var(--radius-xl); overflow: hidden; }
.card-header { padding: var(--space-card-header-y) var(--space-5); font-size: var(--text-caption); font-weight: var(--weight-medium); color: var(--color-neutral-60); text-transform: uppercase; letter-spacing: 0.06em; border-bottom: var(--border-width-thin) solid rgba(255,255,255,0.04); }
.card-body { padding: var(--space-4) var(--space-5); }
.card-output { border-color: var(--border-color-focus); }
.card-output .card-body { background: var(--color-neutral-15); }

.field { display: flex; flex-direction: column; gap: var(--space-compact); }
.field-label { font-size: var(--text-label); font-weight: var(--weight-medium); color: var(--color-neutral-80); }

.action-bar { display: flex; gap: var(--space-2); }
</style>
