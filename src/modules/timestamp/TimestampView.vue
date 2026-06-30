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
.tool-panel { max-width: 820px; margin: 0 auto; }
.tool-header { margin-bottom: 24px; padding-bottom: 16px; border-bottom: 1px solid #2D2D2D; }
.tool-title { font-size: 20px; font-weight: 600; color: #E8E8E8; margin-bottom: 4px; }
.tool-desc { color: #6E6E6E; font-size: 13px; }
.current-time-card {
  background: linear-gradient(135deg, #0078D4, #1A8FE3); padding: 18px 22px;
  border-radius: 6px; margin-bottom: 28px;
}
.time-big { font-size: 22px; font-weight: 600; color: #FFF; margin-bottom: 4px; }
.time-meta { font-size: 11px; color: rgba(255,255,255,.7); font-family: "Cascadia Code","Fira Code","Menlo","Monaco","Courier New",monospace; }
.section { margin-bottom: 24px; }
.section h3 { font-size: 14px; font-weight: 500; color: #E8E8E8; margin-bottom: 10px; }
.form-group { display: flex; flex-direction: column; gap: 5px; margin-bottom: 10px; }
.form-group label { font-size: 12px; font-weight: 500; color: #9D9D9D; }
.form-group input {
  padding: 8px 10px; border: 1px solid #3D3D3D; border-radius: 4px;
  font-size: 13px; font-family: "Cascadia Code","Fira Code","Menlo","Monaco","Courier New",monospace;
  background: #1A1A1A; color: #E8E8E8;
}
.form-group input:focus { outline: none; border-color: #0078D4; box-shadow: 0 0 0 1px rgba(0,120,212,.3); }
.form-group input::placeholder { color: #555; }
.btn-primary {
  padding: 9px 20px; background: #0078D4; color: #FFF; border: none; border-radius: 4px;
  font-size: 13px; font-weight: 500; font-family: inherit; cursor: pointer; transition: background 0.15s;
}
.btn-primary:hover { background: #1A8FE3; }
.output-box {
  margin-top: 12px; padding: 12px 16px; background: #111; border: 1px solid #0078D4;
  border-radius: 4px;
}
.output-box pre {
  font-size: 13px; font-family: "Cascadia Code","Fira Code","Menlo","Monaco","Courier New",monospace;
  color: #E8E8E8; white-space: pre-wrap; margin: 0;
}
.error-msg {
  padding: 10px 14px; background: #3D1F1F; border: 1px solid #CF6679;
  border-radius: 4px; color: #CF6679; font-size: 12px;
}
</style>
