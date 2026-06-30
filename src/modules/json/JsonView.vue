<script setup lang="ts">
import { ref } from "vue";

const input = ref("");
const output = ref("");
const mode = ref<"format" | "compact">("format");
const indentSize = ref(2);
const errorMsg = ref("");

function execute() {
  errorMsg.value = "";
  output.value = "";

  if (!input.value.trim()) {
    errorMsg.value = "请输入 JSON 文本";
    return;
  }

  try {
    const parsed = JSON.parse(input.value);
    if (mode.value === "format") {
      output.value = JSON.stringify(parsed, null, indentSize.value);
    } else {
      output.value = JSON.stringify(parsed);
    }
  } catch (e) {
    errorMsg.value = `JSON 解析错误: ${(e as Error).message}`;
  }
}

function copyOutput() {
  if (output.value) {
    navigator.clipboard.writeText(output.value);
  }
}
</script>

<template>
  <div class="tool-panel">
    <h2 class="tool-title">📋 JSON 格式化 / 压缩</h2>
    <p class="tool-desc">格式化或压缩 JSON 文本</p>

    <div class="form-row">
      <div class="form-group">
        <label>模式</label>
        <div class="mode-switch">
          <button :class="{ active: mode === 'format' }" @click="mode = 'format'">格式化</button>
          <button :class="{ active: mode === 'compact' }" @click="mode = 'compact'">压缩</button>
        </div>
      </div>
      <div class="form-group" v-if="mode === 'format'">
        <label>缩进空格数</label>
        <select v-model="indentSize">
          <option :value="2">2</option>
          <option :value="4">4</option>
        </select>
      </div>
    </div>

    <div class="form-group full-width">
      <label>输入</label>
      <textarea v-model="input" rows="10" placeholder="粘贴 JSON 文本..." />
    </div>

    <div class="action-row">
      <button class="btn-primary" @click="execute">
        {{ mode === 'format' ? '✨ 格式化' : '📦 压缩' }}
      </button>
    </div>

    <div v-if="errorMsg" class="error-msg">{{ errorMsg }}</div>

    <div class="form-group full-width" v-if="output">
      <div class="output-header">
        <label>输出</label>
        <button class="btn-sm" @click="copyOutput">📋 复制</button>
      </div>
      <textarea v-model="output" rows="10" readonly />
    </div>
  </div>
</template>

<style scoped>
.tool-panel { max-width: 800px; margin: 0 auto; }
.tool-title { font-size: 22px; margin-bottom: 4px; color: #1e1e2e; }
.tool-desc { color: #6c7086; margin-bottom: 20px; font-size: 14px; }

.form-row {
  display: flex;
  gap: 16px;
  margin-bottom: 16px;
}

.form-group { display: flex; flex-direction: column; gap: 6px; }
.form-group.full-width { width: 100%; margin-bottom: 16px; }
.form-group label { font-size: 13px; font-weight: 600; color: #45475a; }

.form-group select {
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  background: #fff;
}

.form-group textarea {
  padding: 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 13px;
  font-family: "Menlo", "Monaco", "Courier New", monospace;
  background: #fff;
  resize: vertical;
  width: 100%;
}

.form-group textarea:focus,
.form-group select:focus {
  outline: none;
  border-color: #cba6f7;
  box-shadow: 0 0 0 2px rgba(203, 166, 247, 0.2);
}

.mode-switch { display: flex; }
.mode-switch button {
  flex: 1; padding: 8px 16px;
  border: 1px solid #d1d5db; background: #fff;
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

.btn-sm {
  padding: 4px 12px; background: #e6e6fa; color: #45475a;
  border: 1px solid #d1d5db; border-radius: 4px; font-size: 12px; cursor: pointer;
}
.btn-sm:hover { background: #dcdcf0; }

.output-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px; }

.error-msg {
  padding: 10px 14px; background: #fef2f2; border: 1px solid #fecaca;
  border-radius: 6px; color: #dc2626; font-size: 13px; margin-bottom: 12px;
}
</style>
