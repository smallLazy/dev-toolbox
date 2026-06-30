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
      output.value = encodeComponent.value ? encodeURIComponent(input.value) : encodeURI(input.value);
    } else {
      output.value = encodeComponent.value ? decodeURIComponent(input.value) : decodeURI(input.value);
    }
  } catch (e) {
    errorMsg.value = `操作失败: ${(e as Error).message}`;
  }
}
</script>

<template>
  <div class="tool-panel">
    <div class="tool-header">
      <h2 class="tool-title">URL 编解码</h2>
      <p class="tool-desc">URL 编解码 (encodeURIComponent / encodeURI)</p>
    </div>

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
      <textarea v-model="input" rows="6" placeholder="输入 URL 或文本..." />
    </div>

    <div class="action-row">
      <button class="btn-primary" @click="execute">{{ mode === 'encode' ? '→ 编码' : '→ 解码' }}</button>
    </div>

    <div v-if="errorMsg" class="error-msg">{{ errorMsg }}</div>

    <div class="form-group full-width" v-if="output">
      <label>输出</label>
      <textarea v-model="output" rows="6" readonly class="output-area" />
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
  cursor: pointer; font-size: var(--text-label); font-family: var(--font-sans); transition: all var(--duration-fast) var(--ease-standard); white-space: nowrap;
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
.error-msg {
  padding: 10px var(--space-3); background: var(--color-danger-bg); border: var(--border-width-thin) solid var(--color-danger-border);
  border-radius: var(--radius-md); color: var(--color-danger-text); font-size: var(--text-label); margin-bottom: var(--space-3);
}
.output-area { background: var(--color-neutral-10) !important; border-color: var(--border-color-focus) !important; }
</style>
