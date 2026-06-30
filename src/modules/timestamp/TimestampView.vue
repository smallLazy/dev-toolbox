<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from "vue";

const now = ref(Date.now());
const tsSeconds = ref(Math.floor(now.value / 1000).toString());
const tsMillis = ref(now.value.toString());
const dateStr = ref("");
const dateOutput = ref("");
const tsOutput = ref("");
const errorMsg = ref("");

let timer: ReturnType<typeof setInterval> | null = null;

function startTimer() { timer = setInterval(() => { now.value = Date.now(); }, 1000); }
function stopTimer() { if (timer) clearInterval(timer); }
onMounted(() => startTimer());
onUnmounted(() => stopTimer());

const nowFormatted = computed(() => new Date(now.value).toLocaleString("zh-CN"));
const nowISO = computed(() => new Date(now.value).toISOString());

function convertTsToDate() {
  errorMsg.value = ""; dateOutput.value = "";
  const raw = tsSeconds.value.trim();
  if (!raw) { errorMsg.value = "请输入时间戳"; return; }
  let ts = parseInt(raw, 10);
  if (isNaN(ts)) { errorMsg.value = "无效的时间戳"; return; }
  if (ts <= 9999999999) ts = ts * 1000;
  const d = new Date(ts);
  dateOutput.value = `本地时间: ${d.toLocaleString("zh-CN")}\nISO 8601:  ${d.toISOString()}\nUTC:       ${d.toUTCString()}`;
}

function convertDateToTs() {
  errorMsg.value = ""; tsOutput.value = "";
  if (!dateStr.value.trim()) { errorMsg.value = "请输入日期时间"; return; }
  const d = new Date(dateStr.value);
  if (isNaN(d.getTime())) { errorMsg.value = "无效的日期格式（支持 ISO 8601 等）"; return; }
  tsOutput.value = `秒级时间戳: ${Math.floor(d.getTime() / 1000)}\n毫秒级时间戳: ${d.getTime()}`;
}
</script>

<template>
  <div class="tool-panel">
    <div class="tool-header">
      <h2 class="tool-title">时间戳转换</h2>
      <p class="tool-desc">时间戳与日期互转</p>
    </div>

    <div class="current-time-card">
      <div class="time-big">{{ nowFormatted }}</div>
      <div class="time-meta">ISO: {{ nowISO }}</div>
    </div>

    <div class="section">
      <h3>时间戳 → 日期</h3>
      <div class="form-group">
        <label>时间戳（秒或毫秒，自动识别）</label>
        <input v-model="tsSeconds" type="text" placeholder="如 1700000000 或 1700000000000" @keyup.enter="convertTsToDate" />
      </div>
      <button class="btn-primary" @click="convertTsToDate">→ 转换</button>
      <div v-if="dateOutput" class="output-box"><pre>{{ dateOutput }}</pre></div>
    </div>

    <div class="section">
      <h3>日期 → 时间戳</h3>
      <div class="form-group">
        <label>日期时间</label>
        <input v-model="dateStr" type="text" placeholder="如 2024-01-01T00:00:00Z" @keyup.enter="convertDateToTs" />
      </div>
      <button class="btn-primary" @click="convertDateToTs">→ 转换</button>
      <div v-if="tsOutput" class="output-box"><pre>{{ tsOutput }}</pre></div>
    </div>

    <div v-if="errorMsg" class="error-msg">{{ errorMsg }}</div>
  </div>
</template>

<style scoped>
.tool-panel { max-width: var(--content-max-width); margin: 0 auto; }
.tool-header { margin-bottom: var(--space-6); padding-bottom: var(--space-4); border-bottom: var(--border-width-thin) solid var(--border-color-subtle); }
.tool-title { font-size: var(--text-title); font-weight: var(--weight-semibold); color: var(--color-neutral-100); margin-bottom: var(--space-1); }
.tool-desc { color: var(--color-neutral-80); font-size: var(--text-body); }
.current-time-card {
  background: linear-gradient(135deg, var(--color-accent-primary), var(--color-accent-hover));
  padding: 18px 22px; border-radius: var(--radius-lg); margin-bottom: 28px;
}
.time-big { font-size: 22px; font-weight: var(--weight-semibold); color: var(--color-neutral-120); margin-bottom: var(--space-1); }
.time-meta { font-size: var(--text-caption); color: rgba(255,255,255,.7); font-family: var(--font-mono); }
.section { margin-bottom: var(--space-6); }
.section h3 { font-size: var(--text-base); font-weight: var(--weight-medium); color: var(--color-neutral-100); margin-bottom: 10px; }
.form-group { display: flex; flex-direction: column; gap: 5px; margin-bottom: 10px; }
.form-group label { font-size: var(--text-label); font-weight: var(--weight-medium); color: var(--color-neutral-90); }
.form-group input {
  padding: var(--space-2) 10px; border: var(--border-width-thin) solid var(--border-color-default); border-radius: var(--radius-md);
  font-size: var(--text-body); font-family: var(--font-mono); background: var(--color-neutral-20); color: var(--color-neutral-100);
  transition: border-color var(--duration-normal) var(--ease-standard), box-shadow var(--duration-normal) var(--ease-standard);
}
.form-group input:focus { outline: none; border-color: var(--border-color-focus); box-shadow: 0 0 0 1px var(--color-accent-moderate); }
.form-group input::placeholder { color: var(--color-neutral-70); }
.btn-primary {
  padding: 9px var(--space-5); background: var(--color-accent-primary); color: var(--color-neutral-120);
  border: none; border-radius: var(--radius-md); font-size: var(--text-body); font-weight: var(--weight-medium);
  font-family: var(--font-sans); cursor: pointer; transition: background var(--duration-fast) var(--ease-standard);
}
.btn-primary:hover { background: var(--color-accent-hover); }
.output-box { margin-top: var(--space-3); padding: var(--space-3) var(--space-4); background: var(--color-neutral-10); border: var(--border-width-thin) solid var(--border-color-focus); border-radius: var(--radius-md); }
.output-box pre { font-size: var(--text-body); font-family: var(--font-mono); color: var(--color-neutral-100); white-space: pre-wrap; margin: 0; }
.error-msg {
  padding: 10px var(--space-3); background: var(--color-danger-bg); border: var(--border-width-thin) solid var(--color-danger-border);
  border-radius: var(--radius-md); color: var(--color-danger-text); font-size: var(--text-label);
}
</style>
