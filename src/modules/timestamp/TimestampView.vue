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
  <div class="page">
    <header class="page-header">
      <h1 class="page-title">时间戳转换</h1>
      <p class="page-desc">Unix 时间戳与日期互转，自动识别秒/毫秒</p>
    </header>

    <div class="page-content">
      <div class="time-banner">
        <div class="time-big">{{ nowFormatted }}</div>
        <div class="time-meta">ISO: {{ nowISO }}</div>
      </div>

      <div class="card">
        <div class="card-header">时间戳 → 日期</div>
        <div class="card-body">
          <div class="field">
            <label class="field-label">时间戳（秒或毫秒，自动识别）</label>
            <input v-model="tsSeconds" class="dt-input" type="text" placeholder="1700000000" @keyup.enter="convertTsToDate" />
          </div>
          <button class="btn-accent" style="margin-top:var(--space-3)" @click="convertTsToDate">转换</button>
          <pre v-if="dateOutput" class="output-pre">{{ dateOutput }}</pre>
        </div>
      </div>

      <div class="card">
        <div class="card-header">日期 → 时间戳</div>
        <div class="card-body">
          <div class="field">
            <label class="field-label">日期时间</label>
            <input v-model="dateStr" class="dt-input" type="text" placeholder="2024-01-01T00:00:00Z" @keyup.enter="convertDateToTs" />
          </div>
          <button class="btn-accent" style="margin-top:var(--space-3)" @click="convertDateToTs">转换</button>
          <pre v-if="tsOutput" class="output-pre">{{ tsOutput }}</pre>
        </div>
      </div>

      <div v-if="errorMsg" class="alert-error">{{ errorMsg }}</div>
    </div>
  </div>
</template>

<style scoped>
.page { max-width: var(--content-max-width); margin: 0 auto; }
.page-header { margin-bottom: var(--space-6); }
.page-title { font-size: var(--text-title); font-weight: var(--weight-semibold); color: var(--color-neutral-110); margin-bottom: var(--space-1); letter-spacing: -0.01em; }
.page-desc { font-size: var(--text-body); color: var(--color-neutral-70); }
.page-content { display: flex; flex-direction: column; gap: var(--space-3); }

.time-banner {
  background: linear-gradient(135deg, var(--color-accent-primary), var(--color-accent-hover));
  padding: var(--space-button-secondary-x) var(--space-6); border-radius: var(--radius-xl);
}
.time-big { font-size: 22px; font-weight: var(--weight-semibold); color: var(--color-neutral-120); margin-bottom: var(--space-1); }
.time-meta { font-size: var(--text-caption); color: var(--text-color-label); font-family: var(--font-mono); }

.card { background: var(--color-neutral-35); border: var(--border-width-thin) solid var(--border-color-subtle); border-radius: var(--radius-xl); overflow: hidden; }
.card-header { padding: var(--space-card-header-y) var(--space-5); font-size: var(--text-caption); font-weight: var(--weight-medium); color: var(--color-neutral-60); text-transform: uppercase; letter-spacing: 0.06em; border-bottom: var(--border-width-thin) solid var(--border-color-subtle); }
.card-body { padding: var(--space-4) var(--space-5); }

.field { display: flex; flex-direction: column; gap: var(--space-compact); }
.field-label { font-size: var(--text-label); font-weight: var(--weight-medium); color: var(--color-neutral-80); }

.output-pre { margin-top: var(--space-3); padding: var(--space-3) var(--space-4); background: var(--color-neutral-10); border: var(--border-width-thin) solid var(--border-color-focus); border-radius: var(--radius-md); font-size: var(--text-body); font-family: var(--font-mono); color: var(--color-neutral-100); white-space: pre-wrap; }
</style>
