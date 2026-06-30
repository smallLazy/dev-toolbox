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
    <div class="tool-header">
      <h2 class="tool-title">JSON 格式化</h2>
      <p class="tool-desc">格式化或压缩 JSON 文本</p>
    </div>

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
      <textarea v-model="input" rows="8" placeholder="粘贴 JSON 文本..." />
    </div>

    <div class="action-row">
      <button class="btn-primary" @click="execute">{{ mode === 'format' ? '✨ 格式化' : '📦 压缩' }}</button>
    </div>

    <div v-if="errorMsg" class="error-msg">{{ errorMsg }}</div>

    <div class="form-group full-width" v-if="output">
      <div class="output-header">
        <label>输出</label>
        <button class="btn-sm" @click="copyOutput">复制</button>
      </div>
      <textarea v-model="output" rows="8" readonly class="output-area" />
    </div>
  </div>
</template>

<style scoped>
.tool-panel { max-width: 820px; margin: 0 auto; }
.tool-header { margin-bottom: 24px; padding-bottom: 16px; border-bottom: 1px solid #2D2D2D; }
.tool-title { font-size: 20px; font-weight: 600; color: #E8E8E8; margin-bottom: 4px; }
.tool-desc { color: #6E6E6E; font-size: 13px; }
.form-row { display: flex; gap: 14px; margin-bottom: 14px; }
.form-group { display: flex; flex-direction: column; gap: 5px; }
.form-group.full-width { width: 100%; margin-bottom: 14px; }
.form-group label { font-size: 12px; font-weight: 500; color: #9D9D9D; }
.form-group select {
  padding: 8px 10px; border: 1px solid #3D3D3D; border-radius: 4px;
  font-size: 13px; background: #1A1A1A; color: #E8E8E8; cursor: pointer;
  appearance: none; padding-right: 28px;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' fill='%239D9D9D' viewBox='0 0 16 16'%3E%3Cpath d='M8 11L3 6h10z'/%3E%3C/svg%3E");
  background-repeat: no-repeat; background-position: right 10px center;
}
.form-group select:focus { outline: none; border-color: #0078D4; box-shadow: 0 0 0 1px rgba(0,120,212,.3); }
.form-group select option { background: #2D2D2D; color: #E8E8E8; }
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
  cursor: pointer; font-size: 13px; font-family: inherit; transition: all 0.15s;
}
.mode-switch button:first-child { border-radius: 4px 0 0 4px; }
.mode-switch button:last-child { border-radius: 0 4px 4px 0; border-left: none; }
.mode-switch button.active { background: #0078D4; color: #FFF; border-color: #0078D4; font-weight: 500; }
.action-row { margin: 16px 0; }
.btn-primary {
  padding: 9px 20px; background: #0078D4; color: #FFF; border: none; border-radius: 4px;
  font-size: 13px; font-weight: 500; font-family: inherit; cursor: pointer; transition: background 0.15s;
}
.btn-primary:hover { background: #1A8FE3; }
.btn-sm {
  padding: 4px 12px; background: #2D2D2D; color: #E8E8E8; border: 1px solid #3D3D3D;
  border-radius: 4px; font-size: 12px; font-family: inherit; cursor: pointer;
}
.btn-sm:hover { background: #383838; }
.output-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 5px; }
.error-msg {
  padding: 10px 14px; background: #3D1F1F; border: 1px solid #CF6679;
  border-radius: 4px; color: #CF6679; font-size: 12px; margin-bottom: 14px;
}
.output-area { background: #111 !important; border-color: #0078D4 !important; }
</style>
