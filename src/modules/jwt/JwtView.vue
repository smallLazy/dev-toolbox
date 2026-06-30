<script setup lang="ts">
import { ref } from "vue";

const token = ref("");
const headerOutput = ref("");
const payloadOutput = ref("");
const signatureOutput = ref("");
const errorMsg = ref("");

function parseJwt() {
  errorMsg.value = "";
  headerOutput.value = "";
  payloadOutput.value = "";
  signatureOutput.value = "";

  const raw = token.value.trim();
  if (!raw) {
    errorMsg.value = "请输入 JWT Token";
    return;
  }

  const parts = raw.split(".");
  if (parts.length !== 3) {
    errorMsg.value = "无效的 JWT 格式（应为 header.payload.signature 三段）";
    return;
  }

  try {
    const header = JSON.parse(base64UrlDecode(parts[0]));
    headerOutput.value = JSON.stringify(header, null, 2);
  } catch {
    headerOutput.value = "[无法解析 Header]";
  }

  try {
    const payload = JSON.parse(base64UrlDecode(parts[1]));
    payloadOutput.value = JSON.stringify(payload, null, 2);

    // Check expiration
    if (payload.exp) {
      const expDate = new Date(payload.exp * 1000);
      const now = new Date();
      if (expDate < now) {
        payloadOutput.value += `\n\n⚠️ Token 已过期 (${expDate.toLocaleString("zh-CN")})`;
      } else {
        payloadOutput.value += `\n\n✅ Token 有效至 ${expDate.toLocaleString("zh-CN")}`;
      }
    }

    if (payload.iat) {
      const iatDate = new Date(payload.iat * 1000);
      payloadOutput.value += `\n📅 签发时间: ${iatDate.toLocaleString("zh-CN")}`;
    }
  } catch {
    payloadOutput.value = "[无法解析 Payload]";
  }

  signatureOutput.value = parts[2];
}

function base64UrlDecode(str: string): string {
  // Replace URL-safe chars and pad
  str = str.replace(/-/g, "+").replace(/_/g, "/");
  while (str.length % 4) str += "=";

  // Use TextDecoder for proper UTF-8 support (replaces deprecated escape/decodeURIComponent)
  const binary = atob(str);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new TextDecoder().decode(bytes);
}
</script>

<template>
  <div class="tool-panel">
    <h2 class="tool-title">🎫 JWT 解析</h2>
    <p class="tool-desc">解析 JWT Token 的 Header、Payload 和 Signature</p>

    <div class="form-group full-width">
      <label>JWT Token</label>
      <textarea v-model="token" rows="4" placeholder="粘贴 JWT Token (eyJhbGciOi...)" />
    </div>

    <div class="action-row">
      <button class="btn-primary" @click="parseJwt">🔍 解析</button>
    </div>

    <div v-if="errorMsg" class="error-msg">{{ errorMsg }}</div>

    <div v-if="headerOutput" class="section">
      <h3>📋 Header</h3>
      <pre class="json-output">{{ headerOutput }}</pre>
    </div>

    <div v-if="payloadOutput" class="section">
      <h3>📦 Payload</h3>
      <pre class="json-output">{{ payloadOutput }}</pre>
    </div>

    <div v-if="signatureOutput" class="section">
      <h3>🔏 Signature</h3>
      <div class="sig-output">{{ signatureOutput }}</div>
    </div>
  </div>
</template>

<style scoped>
.tool-panel { max-width: 800px; margin: 0 auto; }
.tool-title { font-size: 22px; margin-bottom: 4px; color: #1e1e2e; }
.tool-desc { color: #6c7086; margin-bottom: 20px; font-size: 14px; }
.form-group { display: flex; flex-direction: column; gap: 6px; margin-bottom: 16px; }
.form-group.full-width { width: 100%; }
.form-group label { font-size: 13px; font-weight: 600; color: #45475a; }
.form-group textarea {
  padding: 12px; border: 1px solid #d1d5db; border-radius: 6px;
  font-size: 13px; font-family: "Menlo", "Monaco", "Courier New", monospace;
  background: #fff; resize: vertical; width: 100%;
}
.form-group textarea:focus { outline: none; border-color: #cba6f7; box-shadow: 0 0 0 2px rgba(203, 166, 247, 0.2); }
.action-row { margin: 16px 0; }
.btn-primary {
  padding: 10px 24px; background: #cba6f7; color: #1e1e2e;
  border: none; border-radius: 6px; font-size: 14px; font-weight: 600; cursor: pointer;
}
.btn-primary:hover { opacity: 0.85; }
.section { margin-bottom: 20px; }
.section h3 { font-size: 15px; color: #1e1e2e; margin-bottom: 8px; }
.json-output {
  padding: 12px 16px; background: #f8fafc; border: 1px solid #e2e8f0;
  border-radius: 6px; font-size: 13px; font-family: "Menlo", "Monaco", "Courier New", monospace;
  color: #1e1e2e; white-space: pre-wrap; overflow-x: auto;
}
.sig-output {
  padding: 12px 16px; background: #fefce8; border: 1px solid #fef08a;
  border-radius: 6px; font-size: 11px; font-family: "Menlo", "Monaco", "Courier New", monospace;
  color: #854d0e; word-break: break-all;
}
.error-msg {
  padding: 10px 14px; background: #fef2f2; border: 1px solid #fecaca;
  border-radius: 6px; color: #dc2626; font-size: 13px; margin-bottom: 12px;
}
</style>
