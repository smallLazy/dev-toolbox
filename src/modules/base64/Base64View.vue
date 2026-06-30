<script setup lang="ts">
import { ref } from "vue";

const input = ref("");
const output = ref("");
const mode = ref<"encode" | "decode">("encode");
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
      const bytes = new TextEncoder().encode(input.value);
      let binary = "";
      bytes.forEach((b) => (binary += String.fromCharCode(b)));
      output.value = btoa(binary);
    } else {
      const binary = atob(input.value.trim());
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
      }
      output.value = new TextDecoder().decode(bytes);
    }
  } catch (e) {
    errorMsg.value = `操作失败: ${(e as Error).message || "输入可能不是有效的 Base64 文本"}`;
  }
}
</script>

<template>
  <div class="tool-panel">
    <div class="tool-header">
      <h2 class="tool-title">Base64 编解码</h2>
      <p class="tool-desc">Base64 编解码，支持 Unicode 字符</p>
    </div>

    <div class="form-group">
      <label>模式</label>
      <div class="mode-switch">
        <button :class="{ active: mode === 'encode' }" @click="mode = 'encode'">编码 (Encode)</button>
        <button :class="{ active: mode === 'decode' }" @click="mode = 'decode'">解码 (Decode)</button>
      </div>
    </div>

    <div class="form-group full-width">
      <label>输入</label>
      <textarea v-model="input" rows="6" :placeholder="mode === 'encode' ? '输入要编码的文本...' : '输入 Base64 字符串...'" />
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
.tool-panel { max-width: 820px; margin: 0 auto; }
.tool-header { margin-bottom: 24px; padding-bottom: 16px; border-bottom: 1px solid #2D2D2D; }
.tool-title { font-size: 20px; font-weight: 600; color: #E8E8E8; margin-bottom: 4px; }
.tool-desc { color: #6E6E6E; font-size: 13px; }
.form-group { display: flex; flex-direction: column; gap: 5px; margin-bottom: 14px; }
.form-group.full-width { width: 100%; }
.form-group label { font-size: 12px; font-weight: 500; color: #9D9D9D; }
.form-group textarea {
  padding: 10px; border: 1px solid #3D3D3D; border-radius: 4px;
  font-size: 13px; font-family: "Cascadia Code","Fira Code","Menlo","Monaco","Courier New",monospace;
  background: #1A1A1A; color: #E8E8E8; resize: vertical; width: 100%;
}
.form-group textarea:focus { outline: none; border-color: #0078D4; box-shadow: 0 0 0 1px rgba(0,120,212,.3); }
.form-group textarea::placeholder { color: #555; }
.mode-switch { display: flex; }
.mode-switch button {
  flex: 1; padding: 7px 14px; border: 1px solid #3D3D3D; background: #1A1A1A; color: #9D9D9D;
  cursor: pointer; font-size: 13px; font-family: inherit; transition: all 0.15s;
}
.mode-switch button:first-child { border-radius: 4px 0 0 4px; }
.mode-switch button:last-child { border-radius: 0 4px 4px 0; border-left: none; }
.mode-switch button.active { background: #0078D4; color: #FFF; border-color: #0078D4; font-weight: 500; }
.action-row { margin: 16px 0; }
.btn-primary {
  padding: 9px 20px; background: #0078D4; color: #FFF; border: none; border-radius: 4px;
  font-size: 13px; font-weight: 500; font-family: inherit; cursor: pointer; transition: background 0.15s;
}
.btn-primary:hover { background: #1A8FE3; }
.error-msg {
  padding: 10px 14px; background: #3D1F1F; border: 1px solid #CF6679;
  border-radius: 4px; color: #CF6679; font-size: 12px; margin-bottom: 14px;
}
.output-area { background: #111 !important; border-color: #0078D4 !important; }
</style>
