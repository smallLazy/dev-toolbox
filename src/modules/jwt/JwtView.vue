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
.tool-panel { max-width: var(--content-max-width); margin: 0 auto; }
.tool-header { margin-bottom: var(--space-6); padding-bottom: var(--space-4); border-bottom: var(--border-width-thin) solid var(--border-color-subtle); }
.tool-title { font-size: var(--text-title); font-weight: var(--weight-semibold); color: var(--color-neutral-100); margin-bottom: var(--space-1); }
.tool-desc { color: var(--color-neutral-80); font-size: var(--text-body); }
.form-group { display: flex; flex-direction: column; gap: 5px; margin-bottom: var(--space-3); }
.form-group.full-width { width: 100%; }
.form-group label { font-size: var(--text-label); font-weight: var(--weight-medium); color: var(--color-neutral-90); }
.form-group textarea {
  padding: 10px; border: var(--border-width-thin) solid var(--border-color-default); border-radius: var(--radius-md);
  font-size: var(--text-body); font-family: var(--font-mono); background: var(--color-neutral-20);
  color: var(--color-neutral-100); resize: vertical; width: 100%;
  transition: border-color var(--duration-normal) var(--ease-standard), box-shadow var(--duration-normal) var(--ease-standard);
}
.form-group textarea:focus { outline: none; border-color: var(--border-color-focus); box-shadow: 0 0 0 1px var(--color-accent-moderate); }
.form-group textarea::placeholder { color: var(--color-neutral-70); }
.action-row { margin: var(--space-4) 0; }
.btn-primary {
  padding: 9px var(--space-5); background: var(--color-accent-primary); color: var(--color-neutral-120);
  border: none; border-radius: var(--radius-md); font-size: var(--text-body); font-weight: var(--weight-medium);
  font-family: var(--font-sans); cursor: pointer; transition: background var(--duration-fast) var(--ease-standard);
}
.btn-primary:hover { background: var(--color-accent-hover); }
.section { margin-bottom: var(--space-5); }
.section h3 { font-size: var(--text-body); font-weight: var(--weight-medium); color: var(--color-neutral-90); margin-bottom: 6px; }
.json-output {
  padding: var(--space-3) var(--space-4); background: var(--color-neutral-10);
  border: var(--border-width-thin) solid var(--border-color-subtle); border-radius: var(--radius-md);
  font-size: var(--text-body); font-family: var(--font-mono); color: var(--color-neutral-100);
  white-space: pre-wrap; overflow-x: auto;
}
.sig-output {
  padding: 10px var(--space-3); background: var(--color-warning-bg); border: var(--border-width-thin) solid rgba(212,168,67,.3);
  border-radius: var(--radius-md); font-size: var(--text-caption); font-family: var(--font-mono);
  color: var(--color-warning-text); word-break: break-all;
}
.error-msg {
  padding: 10px var(--space-3); background: var(--color-danger-bg); border: var(--border-width-thin) solid var(--color-danger-border);
  border-radius: var(--radius-md); color: var(--color-danger-text); font-size: var(--text-label); margin-bottom: var(--space-3);
}
</style>
