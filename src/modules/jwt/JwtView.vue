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
  <div class="page">
    <header class="page-header">
      <h1 class="page-title">JWT 解析</h1>
      <p class="page-desc">解析 JWT Token — Header、Payload、Signature，支持过期检测</p>
    </header>

    <div class="page-content">
      <div class="card">
        <div class="card-header">JWT Token</div>
        <div class="card-body">
          <textarea v-model="token" class="dt-textarea" rows="3" placeholder="粘贴 JWT Token (eyJhbGciOi...)" />
        </div>
      </div>

      <div class="action-bar">
        <button class="btn-accent" @click="parseJwt">解析</button>
      </div>

      <div v-if="errorMsg" class="alert-error">{{ errorMsg }}</div>

      <div class="card" v-if="headerOutput">
        <div class="card-header">Header</div>
        <div class="card-body"><pre class="code-block">{{ headerOutput }}</pre></div>
      </div>

      <div class="card" v-if="payloadOutput">
        <div class="card-header">Payload</div>
        <div class="card-body"><pre class="code-block">{{ payloadOutput }}</pre></div>
      </div>

      <div class="card card-warning" v-if="signatureOutput">
        <div class="card-header">Signature</div>
        <div class="card-body"><div class="sig-text">{{ signatureOutput }}</div></div>
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
.card-warning .card-body { background: var(--color-warning-bg); }

.code-block { font-size: var(--text-body); font-family: var(--font-mono); color: var(--color-neutral-100); white-space: pre-wrap; overflow-x: auto; margin: 0; }
.sig-text { font-size: var(--text-caption); font-family: var(--font-mono); color: var(--color-warning-text); word-break: break-all; }

.action-bar { display: flex; gap: 10px; }
.btn-accent { padding: 9px 24px; background: var(--color-accent-primary); color: #fff; border: none; border-radius: var(--radius-md); font-size: var(--text-body); font-weight: var(--weight-medium); font-family: var(--font-sans); cursor: pointer; transition: background var(--duration-fast) var(--ease-standard); }
.btn-accent:hover { background: var(--color-accent-hover); }

.alert-error { padding: 10px var(--space-4); background: var(--color-danger-bg); border: var(--border-width-thin) solid var(--color-danger-border); border-radius: var(--radius-md); color: var(--color-danger-text); font-size: var(--text-label); }
</style>
