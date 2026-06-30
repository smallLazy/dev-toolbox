<script setup lang="ts">
import { ref, computed } from "vue";

const now = ref(Date.now());
const tsSeconds = ref(Math.floor(now.value / 1000).toString());
const tsMillis = ref(now.value.toString());
const dateStr = ref("");
const dateOutput = ref("");
const errorMsg = ref("");

// Update "now" every second
let timer: ReturnType<typeof setInterval> | null = null;

function startTimer() {
  timer = setInterval(() => {
    now.value = Date.now();
  }, 1000);
}

function stopTimer() {
  if (timer) clearInterval(timer);
}

// Called from template lifecycle not available in script setup, use onMounted/onUnmounted
import { onMounted, onUnmounted } from "vue";
onMounted(() => startTimer());
onUnmounted(() => stopTimer());

const nowFormatted = computed(() => {
  const d = new Date(now.value);
  return d.toLocaleString("zh-CN");
});

const nowISO = computed(() => {
  return new Date(now.value).toISOString();
});

function convertTsToDate() {
  errorMsg.value = "";
  dateOutput.value = "";

  const raw = tsSeconds.value.trim();
  if (!raw) {
    errorMsg.value = "请输入时间戳";
    return;
  }

  let ts = parseInt(raw, 10);
  if (isNaN(ts)) {
    errorMsg.value = "无效的时间戳";
    return;
  }

  // Auto-detect: if > 9999999999, it's milliseconds
  if (ts > 9999999999) {
    // already millis
  } else {
    ts = ts * 1000;
  }

  const d = new Date(ts);
  dateOutput.value = `本地时间: ${d.toLocaleString("zh-CN")}\n` +
    `ISO 8601:  ${d.toISOString()}\n` +
    `UTC:       ${d.toUTCString()}`;
}

function convertDateToTs() {
  errorMsg.value = "";
  dateOutput.value = "";

  if (!dateStr.value.trim()) {
    errorMsg.value = "请输入日期时间";
    return;
  }

  const d = new Date(dateStr.value);
  if (isNaN(d.getTime())) {
    errorMsg.value = "无效的日期格式（支持 ISO 8601 等）";
    return;
  }

  const sec = Math.floor(d.getTime() / 1000);
  const ms = d.getTime();
  dateOutput.value = `秒级时间戳: ${sec}\n毫秒级时间戳: ${ms}`;
}
</script>

<template>
  <div class="tool-panel">
    <h2 class="tool-title">⏰ 时间戳转换</h2>
    <p class="tool-desc">时间戳与日期互转</p>

    <!-- Current time display -->
    <div class="current-time-card">
      <div class="time-big">{{ nowFormatted }}</div>
      <div class="time-meta">ISO: {{ nowISO }}</div>
    </div>

    <!-- Timestamp to Date -->
    <div class="section">
      <h3>时间戳 → 日期</h3>
      <div class="form-group">
        <label>时间戳（秒或毫秒，自动识别）</label>
        <input v-model="tsSeconds" type="text" placeholder="如 1700000000 或 1700000000000" @keyup.enter="convertTsToDate" />
      </div>
      <button class="btn-primary" @click="convertTsToDate">→ 转换</button>
      <div v-if="dateOutput && !errorMsg" class="output-box">
        <pre>{{ dateOutput }}</pre>
      </div>
    </div>

    <!-- Date to Timestamp -->
    <div class="section">
      <h3>日期 → 时间戳</h3>
      <div class="form-group">
        <label>日期时间</label>
        <input v-model="dateStr" type="text" placeholder="如 2024-01-01 00:00:00 或 2024-01-01T00:00:00Z" @keyup.enter="convertDateToTs" />
      </div>
      <button class="btn-primary" @click="convertDateToTs">→ 转换</button>
      <div v-if="dateOutput && !errorMsg" class="output-box">
        <pre>{{ dateOutput }}</pre>
      </div>
    </div>

    <div v-if="errorMsg" class="error-msg">{{ errorMsg }}</div>
  </div>
</template>

<style scoped>
.tool-panel { max-width: 800px; margin: 0 auto; }
.tool-title { font-size: 22px; margin-bottom: 4px; color: #1e1e2e; }
.tool-desc { color: #6c7086; margin-bottom: 20px; font-size: 14px; }

.current-time-card {
  background: linear-gradient(135deg, #cba6f7, #f5c2e7);
  padding: 20px 24px;
  border-radius: 10px;
  margin-bottom: 24px;
}

.time-big {
  font-size: 24px;
  font-weight: 700;
  color: #1e1e2e;
  margin-bottom: 6px;
}

.time-meta {
  font-size: 12px;
  color: #45475a;
  font-family: "Menlo", "Monaco", "Courier New", monospace;
}

.section {
  margin-bottom: 24px;
}

.section h3 {
  font-size: 16px;
  color: #1e1e2e;
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 2px solid #e6e6fa;
}

.form-group { display: flex; flex-direction: column; gap: 6px; margin-bottom: 12px; }
.form-group label { font-size: 13px; font-weight: 600; color: #45475a; }
.form-group input {
  padding: 8px 12px; border: 1px solid #d1d5db; border-radius: 6px;
  font-size: 14px; font-family: "Menlo", "Monaco", "Courier New", monospace; background: #fff;
}
.form-group input:focus { outline: none; border-color: #cba6f7; box-shadow: 0 0 0 2px rgba(203, 166, 247, 0.2); }

.btn-primary {
  padding: 10px 24px; background: #cba6f7; color: #1e1e2e;
  border: none; border-radius: 6px; font-size: 14px; font-weight: 600; cursor: pointer;
}
.btn-primary:hover { opacity: 0.85; }

.output-box {
  margin-top: 12px;
  padding: 12px 16px;
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  border-radius: 6px;
}

.output-box pre {
  font-size: 13px;
  font-family: "Menlo", "Monaco", "Courier New", monospace;
  color: #1e1e2e;
  white-space: pre-wrap;
  margin: 0;
}

.error-msg {
  padding: 10px 14px; background: #fef2f2; border: 1px solid #fecaca;
  border-radius: 6px; color: #dc2626; font-size: 13px;
}
</style>
