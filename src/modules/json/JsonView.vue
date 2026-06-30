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
.tool-panel { max-width: var(--content-max-width); margin: 0 auto; }
.tool-header { margin-bottom: var(--space-6); padding-bottom: var(--space-4); border-bottom: var(--border-width-thin) solid var(--border-color-subtle); }
.tool-title { font-size: var(--text-title); font-weight: var(--weight-semibold); color: var(--color-neutral-100); margin-bottom: var(--space-1); }
.tool-desc { color: var(--color-neutral-80); font-size: var(--text-body); }
.form-row { display: flex; gap: var(--space-3); margin-bottom: var(--space-3); }
.form-group { display: flex; flex-direction: column; gap: 5px; }
.form-group.full-width { width: 100%; margin-bottom: var(--space-3); }
.form-group label { font-size: var(--text-label); font-weight: var(--weight-medium); color: var(--color-neutral-90); }
.form-group select {
  padding: var(--space-2) 10px; border: var(--border-width-thin) solid var(--border-color-default); border-radius: var(--radius-md);
  font-size: var(--text-body); background: var(--color-neutral-20); color: var(--color-neutral-100); cursor: pointer;
  appearance: none; padding-right: 28px; font-family: var(--font-sans);
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' fill='%239D9D9D' viewBox='0 0 16 16'%3E%3Cpath d='M8 11L3 6h10z'/%3E%3C/svg%3E");
  background-repeat: no-repeat; background-position: right 10px center;
  transition: border-color var(--duration-normal) var(--ease-standard), box-shadow var(--duration-normal) var(--ease-standard);
}
.form-group select:focus { outline: none; border-color: var(--border-color-focus); box-shadow: 0 0 0 1px var(--color-accent-moderate); }
.form-group select option { background: var(--color-neutral-50); color: var(--color-neutral-100); }
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
.action-row { margin: var(--space-4) 0; }
.btn-primary {
  padding: 9px var(--space-5); background: var(--color-accent-primary); color: var(--color-neutral-120);
  border: none; border-radius: var(--radius-md); font-size: var(--text-body); font-weight: var(--weight-medium);
  font-family: var(--font-sans); cursor: pointer; transition: background var(--duration-fast) var(--ease-standard);
}
.btn-primary:hover { background: var(--color-accent-hover); }
.btn-sm {
  padding: 4px var(--space-3); background: var(--color-neutral-50); color: var(--color-neutral-100);
  border: var(--border-width-thin) solid var(--border-color-default); border-radius: var(--radius-md);
  font-size: var(--text-label); font-family: var(--font-sans); cursor: pointer; transition: background var(--duration-fast) var(--ease-standard);
}
.btn-sm:hover { background: var(--color-neutral-40); }
.output-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 5px; }
.error-msg {
  padding: 10px var(--space-3); background: var(--color-danger-bg); border: var(--border-width-thin) solid var(--color-danger-border);
  border-radius: var(--radius-md); color: var(--color-danger-text); font-size: var(--text-label); margin-bottom: var(--space-3);
}
.output-area { background: var(--color-neutral-10) !important; border-color: var(--border-color-focus) !important; }
</style>
