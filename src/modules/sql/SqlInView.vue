<script setup lang="ts">
import { computed, ref } from "vue";

const input = ref("");
const output = ref("");
const errorMsg = ref("");
const valueType = ref<"string" | "number">("string");
const wrapWithParentheses = ref(true);
const lineMode = ref<"single" | "multi">("single");
const dedupe = ref(true);

const itemCount = computed(() => parseItems(input.value, dedupe.value).length);

function parseItems(text: string, shouldDedupe: boolean): string[] {
  const rawItems = text
    .split(/[\s,，;；]+/)
    .map((item) => item.trim())
    .filter(Boolean);

  if (!shouldDedupe) return rawItems;

  const seen = new Set<string>();
  return rawItems.filter((item) => {
    if (seen.has(item)) return false;
    seen.add(item);
    return true;
  });
}

function formatItem(item: string): string {
  if (valueType.value === "number") return item;
  return `'${item.replace(/'/g, "''")}'`;
}

function execute() {
  errorMsg.value = "";
  output.value = "";

  const items = parseItems(input.value, dedupe.value);
  if (items.length === 0) {
    errorMsg.value = "请输入待转换的数据";
    return;
  }

  const separator = lineMode.value === "single" ? "," : ",\n";
  const body = items.map(formatItem).join(separator);
  output.value = wrapWithParentheses.value ? `(${body})` : body;
}

function clearAll() {
  input.value = "";
  output.value = "";
  errorMsg.value = "";
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
      <h1 class="page-title">SQL IN 列表转换</h1>
      <p class="page-desc">批量数据转换为可直接用于 SQL IN 查询的列表片段</p>
    </header>

    <div class="page-content">
      <div class="card">
        <div class="card-header">配置</div>
        <div class="card-body">
          <div class="form-grid">
            <div class="field">
              <label class="field-label">值类型</label>
              <div class="segmented-control">
                <button :class="{ active: valueType === 'string' }" @click="valueType = 'string'">字符串</button>
                <button :class="{ active: valueType === 'number' }" @click="valueType = 'number'">数字</button>
              </div>
            </div>

            <div class="field">
              <label class="field-label">输出格式</label>
              <div class="segmented-control">
                <button :class="{ active: lineMode === 'single' }" @click="lineMode = 'single'">单行</button>
                <button :class="{ active: lineMode === 'multi' }" @click="lineMode = 'multi'">多行</button>
              </div>
            </div>

            <label class="check-field">
              <input v-model="wrapWithParentheses" type="checkbox" />
              <span>带括号</span>
            </label>

            <label class="check-field">
              <input v-model="dedupe" type="checkbox" />
              <span>去重</span>
            </label>
          </div>
        </div>
      </div>

      <div class="card">
        <div class="card-header">
          <span>输入</span>
          <span class="item-count">{{ itemCount }} 项</span>
        </div>
        <div class="card-body">
          <textarea
            v-model="input"
            class="dt-textarea"
            rows="9"
            placeholder="粘贴手机号、ID 或其他字段值，支持空格、换行、逗号、分号分隔..."
          />
        </div>
      </div>

      <div class="action-bar">
        <button class="btn-accent" @click="execute">转换</button>
        <button class="btn-secondary" @click="clearAll">清空</button>
      </div>

      <div v-if="errorMsg" class="alert-error">{{ errorMsg }}</div>

      <div class="card card-output" v-if="output">
        <div class="card-header">
          <span>输出</span>
          <button class="btn-sm" @click="copyOutput">复制</button>
        </div>
        <div class="card-body">
          <textarea v-model="output" class="dt-textarea" rows="9" readonly />
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
.card-header { padding: var(--space-card-header-y) var(--space-5); font-size: var(--text-caption); font-weight: var(--weight-medium); color: var(--color-neutral-60); text-transform: uppercase; letter-spacing: 0.06em; border-bottom: var(--border-width-thin) solid rgba(255,255,255,0.04); display: flex; justify-content: space-between; align-items: center; }
.card-body { padding: var(--space-4) var(--space-5); }
.card-output { border-color: var(--border-color-focus); }
.card-output .card-body { background: var(--color-neutral-15); }

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr auto auto;
  gap: var(--space-3);
  align-items: end;
}
.field { display: flex; flex-direction: column; gap: var(--space-compact); }
.field-label { font-size: var(--text-label); font-weight: var(--weight-medium); color: var(--color-neutral-80); }

.check-field {
  min-height: 31px;
  display: inline-flex;
  align-items: center;
  gap: var(--space-control-y);
  padding: 0 2px;
  color: var(--color-neutral-90);
  font-size: var(--text-body);
  cursor: pointer;
}
.check-field input {
  width: 14px;
  height: 14px;
  accent-color: var(--color-accent-primary);
}
.item-count {
  color: var(--color-neutral-80);
  text-transform: none;
  letter-spacing: 0;
}
.action-bar { display: flex; gap: var(--space-2); }
</style>
