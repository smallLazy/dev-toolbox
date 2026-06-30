<script setup lang="ts">
import { ref } from "vue";

const input = ref("");
const output = ref("");
const mode = ref<"encode" | "decode">("encode");
const encodeComponent = ref(true);
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
      if (encodeComponent.value) {
        output.value = encodeURIComponent(input.value);
      } else {
        output.value = encodeURI(input.value);
      }
    } else {
      if (encodeComponent.value) {
        output.value = decodeURIComponent(input.value);
      } else {
        output.value = decodeURI(input.value);
      }
    }
  } catch (e) {
    errorMsg.value = `操作失败: ${(e as Error).message}`;
  }
}
</script>

<template>
  <div class="tool-panel">
    <h2 class="tool-title">🔗 URL 编码 / 解码</h2>
    <p class="tool-desc">URL 编解码 (encodeURIComponent / encodeURI)</p>

    <div class="form-row">
      <div class="form-group">
        <label>模式</label>
        <div class="mode-switch">
          <button :class="{ active: mode === 'encode' }" @click="mode = 'encode'">编码</button>
          <button :class="{ active: mode === 'decode' }" @click="mode = 'decode'">解码</button>
        </div>
      </div>
      <div class="form-group">
        <label>编码范围</label>
        <div class="mode-switch">
          <button :class="{ active: encodeComponent }" @click="encodeComponent = true">Component (严格)</button>
          <button :class="{ active: !encodeComponent }" @click="encodeComponent = false">URI (保留://)</button>
        </div>
      </div>
    </div>

    <div class="form-group full-width">
      <label>输入</label>
      <textarea v-model="input" rows="8" placeholder="输入 URL 或文本..." />
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
.form-row { display: flex; gap: 16px; margin-bottom: 16px; }
.form-group { display: flex; flex-direction: column; gap: 6px; }
.form-group.full-width { width: 100%; margin-bottom: 16px; }
.form-group label { font-size: 13px; font-weight: 600; color: #45475a; }
.form-group textarea {
  padding: 12px; border: 1px solid #d1d5db; border-radius: 6px;
  font-size: 13px; font-family: "Menlo", "Monaco", "Courier New", monospace;
  background: #fff; resize: vertical; width: 100%;
}
.form-group textarea:focus { outline: none; border-color: #cba6f7; box-shadow: 0 0 0 2px rgba(203, 166, 247, 0.2); }
.mode-switch { display: flex; }
.mode-switch button {
  flex: 1; padding: 8px 12px; border: 1px solid #d1d5db; background: #fff;
  cursor: pointer; font-size: 13px; transition: all 0.15s; white-space: nowrap;
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
