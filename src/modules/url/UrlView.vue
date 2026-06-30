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
  <div class="page">
    <header class="page-header">
      <h1 class="page-title">URL 编解码</h1>
      <p class="page-desc">URL 编码与解码 — encodeURIComponent / encodeURI</p>
    </header>

    <div class="page-content">
      <div class="card">
        <div class="card-header">配置</div>
        <div class="card-body">
          <div class="form-row">
            <div class="field flex-1">
              <label class="field-label">模式</label>
              <div class="segmented-control">
                <button :class="{ active: mode === 'encode' }" @click="mode = 'encode'">编码</button>
                <button :class="{ active: mode === 'decode' }" @click="mode = 'decode'">解码</button>
              </div>
            </div>
            <div class="field flex-1">
              <label class="field-label">范围</label>
              <div class="segmented-control">
                <button :class="{ active: encodeComponent }" @click="encodeComponent = true">Component</button>
                <button :class="{ active: !encodeComponent }" @click="encodeComponent = false">URI</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="card">
        <div class="card-header">输入</div>
        <div class="card-body">
          <textarea v-model="input" class="dt-textarea" rows="6" placeholder="输入 URL 或文本..." />
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
.card-header { padding: 9px var(--space-5); font-size: var(--text-caption); font-weight: var(--weight-medium); color: var(--color-neutral-60); text-transform: uppercase; letter-spacing: 0.06em; border-bottom: var(--border-width-thin) solid rgba(255,255,255,0.04); }
.card-body { padding: var(--space-4) var(--space-5); }
.card-output { border-color: var(--border-color-focus); }
.card-output .card-body { background: var(--color-neutral-15); }

.form-row { display: flex; gap: var(--space-3); }
.field { display: flex; flex-direction: column; gap: 3px; }
.field.flex-1 { flex: 1; }
.field-label { font-size: var(--text-label); font-weight: var(--weight-medium); color: var(--color-neutral-80); }

.action-bar { display: flex; gap: 8px; }
</style>
