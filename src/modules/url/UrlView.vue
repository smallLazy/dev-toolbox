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
.page-title { font-size: var(--text-title); font-weight: var(--weight-semibold); color: var(--color-neutral-100); margin-bottom: var(--space-1); }
.page-desc { font-size: var(--text-body); color: var(--color-neutral-80); }
.page-content { display: flex; flex-direction: column; gap: var(--space-4); }

.card { background: var(--color-neutral-40); border: var(--border-width-thin) solid var(--border-color-subtle); border-radius: var(--radius-lg); overflow: hidden; }
.card-header { padding: 10px var(--space-5); font-size: var(--text-label); font-weight: var(--weight-medium); color: var(--color-neutral-80); border-bottom: var(--border-width-thin) solid var(--border-color-subtle); }
.card-body { padding: var(--space-4) var(--space-5); }
.card-output .card-body textarea { background: var(--color-neutral-10); border-color: var(--border-color-focus); }

.form-row { display: flex; gap: var(--space-3); }
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

.alert-error { padding: 10px var(--space-4); background: var(--color-danger-bg); border: var(--border-width-thin) solid var(--color-danger-border); border-radius: var(--radius-md); color: var(--color-danger-text); font-size: var(--text-label); }
</style>
