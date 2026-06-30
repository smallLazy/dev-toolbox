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

    if (payload.exp) {
      const expDate = new Date(payload.exp * 1000);
      if (expDate < new Date()) {
        payloadOutput.value += `\n\n⚠️ Token 已过期 (${expDate.toLocaleString("zh-CN")})`;
      } else {
        payloadOutput.value += `\n\n✅ Token 有效至 ${expDate.toLocaleString("zh-CN")}`;
      }
    }

    if (payload.iat) {
      payloadOutput.value += `\n📅 签发时间: ${new Date(payload.iat * 1000).toLocaleString("zh-CN")}`;
    }
  } catch {
    payloadOutput.value = "[无法解析 Payload]";
  }

  signatureOutput.value = parts[2];
}

function base64UrlDecode(str: string): string {
  str = str.replace(/-/g, "+").replace(/_/g, "/");
  while (str.length % 4) str += "=";
  const binary = atob(str);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return new TextDecoder().decode(bytes);
}
</script>

<template>
  <div class="tool-panel">
    <div class="tool-header">
      <h2 class="tool-title">JWT 解析</h2>
      <p class="tool-desc">解析 JWT Token 的 Header、Payload 和 Signature</p>
    </div>

    <div class="form-group full-width">
      <label>JWT Token</label>
      <textarea v-model="token" rows="3" placeholder="粘贴 JWT Token (eyJhbGciOi...)" />
    </div>

    <div class="action-row">
      <button class="btn-primary" @click="parseJwt">解析</button>
    </div>

    <div v-if="errorMsg" class="error-msg">{{ errorMsg }}</div>

    <div v-if="headerOutput" class="section">
      <h3>Header</h3>
      <pre class="json-output">{{ headerOutput }}</pre>
    </div>

    <div v-if="payloadOutput" class="section">
      <h3>Payload</h3>
      <pre class="json-output">{{ payloadOutput }}</pre>
    </div>

    <div v-if="signatureOutput" class="section">
      <h3>Signature</h3>
      <div class="sig-output">{{ signatureOutput }}</div>
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
.action-row { margin: 16px 0; }
.btn-primary {
  padding: 9px 20px; background: #0078D4; color: #FFF; border: none; border-radius: 4px;
  font-size: 13px; font-weight: 500; font-family: inherit; cursor: pointer; transition: background 0.15s;
}
.btn-primary:hover { background: #1A8FE3; }
.section { margin-bottom: 20px; }
.section h3 { font-size: 13px; font-weight: 500; color: #9D9D9D; margin-bottom: 6px; }
.json-output {
  padding: 12px 16px; background: #111; border: 1px solid #2D2D2D; border-radius: 4px;
  font-size: 13px; font-family: "Cascadia Code","Fira Code","Menlo","Monaco","Courier New",monospace;
  color: #E8E8E8; white-space: pre-wrap; overflow-x: auto;
}
.sig-output {
  padding: 10px 14px; background: #2D2210; border: 1px solid #5D4A20; border-radius: 4px;
  font-size: 11px; font-family: "Cascadia Code","Fira Code","Menlo","Monaco","Courier New",monospace;
  color: #D4A843; word-break: break-all;
}
.error-msg {
  padding: 10px 14px; background: #3D1F1F; border: 1px solid #CF6679;
  border-radius: 4px; color: #CF6679; font-size: 12px; margin-bottom: 14px;
}
</style>
