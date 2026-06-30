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
  <div class="page">
    <header class="page-header">
      <h1 class="page-title">JSON 格式化</h1>
      <p class="page-desc">JSON 美化与压缩，支持 2/4 空格缩进</p>
    </header>

    <div class="page-content">
      <div class="card">
        <div class="card-header">配置</div>
        <div class="card-body">
          <div class="form-row">
            <div class="field flex-1">
              <label class="field-label">模式</label>
              <div class="segmented-control">
                <button :class="{ active: mode === 'format' }" @click="mode = 'format'">格式化</button>
                <button :class="{ active: mode === 'compact' }" @click="mode = 'compact'">压缩</button>
              </div>
            </div>
            <div class="field" v-if="mode === 'format'">
              <label class="field-label">缩进</label>
              <select v-model="indentSize" class="dt-select">
                <option :value="2">2 空格</option>
                <option :value="4">4 空格</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div class="card">
        <div class="card-header">输入</div>
        <div class="card-body">
          <textarea v-model="input" class="dt-textarea" rows="8" placeholder="粘贴 JSON 文本..." />
        </div>
      </div>

      <div class="action-bar">
        <button class="btn-accent" @click="execute">{{ mode === 'format' ? '格式化' : '压缩' }}</button>
      </div>

      <div v-if="errorMsg" class="alert-error">{{ errorMsg }}</div>

      <div class="card card-output" v-if="output">
        <div class="card-header">
          <span>输出</span>
          <button class="btn-sm" @click="copyOutput">复制</button>
        </div>
        <div class="card-body">
          <textarea v-model="output" class="dt-textarea" rows="8" readonly />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.page { max-width: var(--content-max-width); margin: 0 auto; }
.page-header { margin-bottom: var(--space-6); }
.page-title { font-size: var(--text-title); font-weight: var(--weight-semibold); color: var(--color-neutral-100); margin-bottom: var(--space-1); }
.page-desc { font-size: var(--text-body); color: var(--color-neutral-80); }
.page-content { display: flex; flex-direction: column; gap: var(--space-4); }

.card { background: var(--color-neutral-40); border: var(--border-width-thin) solid var(--border-color-subtle); border-radius: var(--radius-lg); overflow: hidden; }
.card-header { padding: 10px var(--space-5); font-size: var(--text-label); font-weight: var(--weight-medium); color: var(--color-neutral-80); border-bottom: var(--border-width-thin) solid var(--border-color-subtle); display: flex; justify-content: space-between; align-items: center; }
.card-body { padding: var(--space-4) var(--space-5); }
.card-output .card-body textarea { background: var(--color-neutral-10); border-color: var(--border-color-focus); }

.form-row { display: flex; gap: var(--space-3); align-items: flex-end; }
.field { display: flex; flex-direction: column; gap: 4px; }
.field.flex-1 { flex: 1; }
.field-label { font-size: var(--text-label); font-weight: var(--weight-medium); color: var(--color-neutral-90); }

.segmented-control { display: flex; }
.segmented-control button {
  flex: 1; padding: 6px var(--space-3); border: var(--border-width-thin) solid var(--border-color-default);
  background: var(--color-neutral-20); color: var(--color-neutral-90);
  cursor: pointer; font-size: var(--text-body); font-family: var(--font-sans); transition: all var(--duration-fast) var(--ease-standard);
}
.segmented-control button:first-child { border-radius: var(--radius-md) 0 0 var(--radius-md); }
.segmented-control button:last-child { border-radius: 0 var(--radius-md) var(--radius-md) 0; border-left: none; }
.segmented-control button.active { background: var(--color-accent-primary); color: #fff; border-color: var(--color-accent-primary); font-weight: var(--weight-medium); }

.action-bar { display: flex; gap: 10px; }
.btn-accent { padding: 9px 24px; background: var(--color-accent-primary); color: #fff; border: none; border-radius: var(--radius-md); font-size: var(--text-body); font-weight: var(--weight-medium); font-family: var(--font-sans); cursor: pointer; transition: background var(--duration-fast) var(--ease-standard); }
.btn-accent:hover { background: var(--color-accent-hover); }
.btn-sm { padding: 3px 12px; background: var(--color-neutral-50); color: var(--color-neutral-100); border: var(--border-width-thin) solid var(--border-color-default); border-radius: var(--radius-md); font-size: var(--text-label); font-family: var(--font-sans); cursor: pointer; }
.btn-sm:hover { background: var(--color-neutral-40); }

.alert-error { padding: 10px var(--space-4); background: var(--color-danger-bg); border: var(--border-width-thin) solid var(--color-danger-border); border-radius: var(--radius-md); color: var(--color-danger-text); font-size: var(--text-label); }
</style>
