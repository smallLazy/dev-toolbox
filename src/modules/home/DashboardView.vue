<script setup lang="ts">
import { useRouter } from "vue-router";

const router = useRouter();

interface ToolCard {
  path: string;
  icon: string;
  title: string;
  desc: string;
}

const tools: ToolCard[] = [
  { path: "/crypto", icon: "🔐", title: "AES 加解密", desc: "AES-256-CBC / ECB 对称加解密，支持多种编码格式" },
  { path: "/cloud-encrypt", icon: "📦", title: "请求参数编解码", desc: "PHP base_encryption / filter 兼容的编解码管道" },
  { path: "/json", icon: "📋", title: "JSON 格式化", desc: "JSON 美化与压缩，支持 2/4 空格缩进" },
  { path: "/base64", icon: "🔤", title: "Base64 编解码", desc: "Base64 编码与解码，支持 Unicode 和 Emoji" },
  { path: "/url", icon: "🔗", title: "URL 编解码", desc: "encodeURIComponent / encodeURI 编解码" },
  { path: "/timestamp", icon: "⏰", title: "时间戳转换", desc: "Unix 时间戳与日期互转，自动识别秒/毫秒" },
  { path: "/hash", icon: "🔑", title: "Hash 计算", desc: "MD5 / SHA-256 哈希值计算" },
  { path: "/jwt", icon: "🎫", title: "JWT 解析", desc: "解析 JWT Header / Payload / Signature" },
  { path: "/config", icon: "⚙️", title: "设置", desc: "管理默认编码配置，本地持久化存储" },
];

function openTool(path: string) {
  router.push(path);
}
</script>

<template>
  <div class="dashboard">
    <header class="page-header">
      <h1 class="page-title">Dev Toolbox</h1>
      <p class="page-desc">开发者日常工具箱 — 选择一个工具开始使用</p>
    </header>

    <div class="tool-grid">
      <button
        v-for="tool in tools"
        :key="tool.path"
        class="tool-card"
        @click="openTool(tool.path)"
      >
        <span class="tool-card-icon">{{ tool.icon }}</span>
        <div class="tool-card-body">
          <h3 class="tool-card-title">{{ tool.title }}</h3>
          <p class="tool-card-desc">{{ tool.desc }}</p>
        </div>
      </button>
    </div>
  </div>
</template>

<style scoped>
.dashboard { max-width: 960px; margin: 0 auto; }

.page-header {
  margin-bottom: var(--space-10);
  text-align: center;
}

.page-title {
  font-size: 26px;
  font-weight: var(--weight-semibold);
  color: var(--color-neutral-110);
  margin-bottom: var(--space-2);
  letter-spacing: -0.02em;
}

.page-desc {
  font-size: var(--text-base);
  color: var(--color-neutral-70);
  font-weight: var(--weight-regular);
}

/* ── Tool Grid ────────────────────────── */
.tool-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space-3);
}

.tool-card {
  display: flex; align-items: flex-start; gap: var(--space-3);
  padding: 18px var(--space-5);
  background: var(--color-neutral-35);
  border: var(--border-width-thin) solid rgba(255,255,255,0.05);
  border-radius: var(--radius-xl);
  cursor: pointer; text-align: left;
  font-family: var(--font-sans);
  transition: all var(--duration-normal) var(--ease-decelerate);
}
.tool-card:hover {
  background: var(--color-neutral-40);
  border-color: rgba(255,255,255,0.10);
  box-shadow: var(--shadow-sm);
  transform: translateY(-2px);
}
.tool-card:active {
  transform: translateY(0);
  box-shadow: var(--shadow-xs);
  transition: all var(--duration-fast) var(--ease-standard);
}
.tool-card-icon {
  font-size: 26px; line-height: 1; flex-shrink: 0; margin-top: 1px;
  transition: transform var(--duration-normal) var(--ease-decelerate);
}
.tool-card:hover .tool-card-icon { transform: scale(1.08); }
.tool-card-body { min-width: 0; }
.tool-card-title {
  font-size: var(--text-base); font-weight: var(--weight-medium);
  color: var(--color-neutral-110); margin-bottom: 2px;
  transition: color var(--duration-fast) var(--ease-standard);
}
.tool-card:hover .tool-card-title { color: #fff; }
.tool-card-desc {
  font-size: var(--text-label); color: var(--color-neutral-70);
  line-height: var(--leading-relaxed);
}
</style>
