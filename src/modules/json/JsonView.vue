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
.page-title { font-size: var(--text-title); font-weight: var(--weight-semibold); color: var(--color-neutral-110); margin-bottom: var(--space-1); letter-spacing: -0.01em; }
.page-desc { font-size: var(--text-body); color: var(--color-neutral-70); }
.page-content { display: flex; flex-direction: column; gap: var(--space-3); }

.card { background: var(--color-neutral-35); border: var(--border-width-thin) solid rgba(255,255,255,0.05); border-radius: var(--radius-xl); overflow: hidden; }
.card-header { padding: 9px var(--space-5); font-size: var(--text-caption); font-weight: var(--weight-medium); color: var(--color-neutral-60); text-transform: uppercase; letter-spacing: 0.06em; border-bottom: var(--border-width-thin) solid rgba(255,255,255,0.04); display: flex; justify-content: space-between; align-items: center; }
.card-body { padding: var(--space-4) var(--space-5); }
.card-output { border-color: var(--border-color-focus); }
.card-output .card-body { background: var(--color-neutral-15); }

.form-row { display: flex; gap: var(--space-3); align-items: flex-end; }
.field { display: flex; flex-direction: column; gap: 3px; }
.field.flex-1 { flex: 1; }
.field-label { font-size: var(--text-label); font-weight: var(--weight-medium); color: var(--color-neutral-80); }

.action-bar { display: flex; gap: 8px; }
</style>
