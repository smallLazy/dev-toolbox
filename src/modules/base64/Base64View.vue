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
      // Use TextEncoder for proper Unicode support (replaces deprecated unescape/encodeURIComponent)
      const bytes = new TextEncoder().encode(input.value);
      let binary = "";
      bytes.forEach((b) => (binary += String.fromCharCode(b)));
      output.value = btoa(binary);
    } else {
      // Decode Base64 with proper UTF-8 support (replaces deprecated escape/decodeURIComponent)
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
  <div class="tool-panel">
    <h2 class="tool-title">🔤 Base64 编码 / 解码</h2>
    <p class="tool-desc">Base64 编解码，支持 Unicode 字符</p>

    <div class="form-group">
      <label>模式</label>
      <div class="mode-switch">
        <button :class="{ active: mode === 'encode' }" @click="mode = 'encode'">编码 (Encode)</button>
        <button :class="{ active: mode === 'decode' }" @click="mode = 'decode'">解码 (Decode)</button>
      </div>
    </div>

    <div class="form-group full-width">
      <label>输入</label>
      <textarea v-model="input" rows="8" :placeholder="mode === 'encode' ? '输入要编码的文本...' : '输入 Base64 字符串...'" />
    </div>

    <div class="action-row">
      <button class="btn-primary" @click="execute">
        {{ mode === 'encode' ? '→ 编码' : '→ 解码' }}
      </button>
    </div>

    <div v-if="errorMsg" class="error-msg">{{ errorMsg }}</div>

    <div class="form-group full-width" v-if="output">
      <label>输出</label>
      <textarea v-model="output" rows="8" readonly />
    </div>
  </div>
</template>

<style scoped>
.tool-panel { max-width: 800px; margin: 0 auto; }
.tool-title { font-size: 22px; margin-bottom: 4px; color: #1e1e2e; }
.tool-desc { color: #6c7086; margin-bottom: 20px; font-size: 14px; }
.form-group { display: flex; flex-direction: column; gap: 6px; margin-bottom: 16px; }
.form-group.full-width { width: 100%; }
.form-group label { font-size: 13px; font-weight: 600; color: #45475a; }
.form-group textarea {
  padding: 12px; border: 1px solid #d1d5db; border-radius: 6px;
  font-size: 13px; font-family: "Menlo", "Monaco", "Courier New", monospace;
  background: #fff; resize: vertical; width: 100%;
}
.form-group textarea:focus { outline: none; border-color: #cba6f7; box-shadow: 0 0 0 2px rgba(203, 166, 247, 0.2); }
.mode-switch { display: flex; }
.mode-switch button {
  flex: 1; padding: 8px 16px; border: 1px solid #d1d5db; background: #fff;
  cursor: pointer; font-size: 14px; transition: all 0.15s;
}
.mode-switch button:first-child { border-radius: 6px 0 0 6px; }
.mode-switch button:last-child { border-radius: 0 6px 6px 0; }
.mode-switch button.active { background: #cba6f7; color: #1e1e2e; border-color: #cba6f7; font-weight: 600; }
.action-row { margin: 16px 0; }
.btn-primary {
  padding: 10px 24px; background: #cba6f7; color: #1e1e2e;
  border: none; border-radius: 6px; font-size: 14px; font-weight: 600; cursor: pointer;
}
.btn-primary:hover { opacity: 0.85; }
.error-msg {
  padding: 10px 14px; background: #fef2f2; border: 1px solid #fecaca;
  border-radius: 6px; color: #dc2626; font-size: 13px; margin-bottom: 12px;
}
</style>
