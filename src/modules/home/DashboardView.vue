<script setup lang="ts">
import { useRouter } from "vue-router";
import { TOOL_ICONS, ICON_SIZE } from "@/design/icons";

const router = useRouter();

interface ToolCard {
  path: string;
  icon: keyof typeof TOOL_ICONS;
  title: string;
  desc: string;
}

const tools: ToolCard[] = [
  { path: "/json", icon: "json", title: "JSON", desc: "Format, minify, and validate JSON" },
  { path: "/crypto", icon: "crypto", title: "AES", desc: "AES-256-CBC / ECB symmetric encryption" },
  { path: "/base64", icon: "base64", title: "Base64", desc: "Encode and decode Base64 with Unicode support" },
  { path: "/url", icon: "url", title: "URL", desc: "encodeURIComponent / encodeURI" },
  { path: "/timestamp", icon: "timestamp", title: "Timestamp", desc: "Unix timestamp & date conversion" },
  { path: "/hash", icon: "hash", title: "Hash", desc: "MD5 / SHA-256 hash computation" },
  { path: "/jwt", icon: "jwt", title: "JWT", desc: "Decode JWT Header / Payload / Signature" },
  { path: "/cloud-encrypt", icon: "cloud-encrypt", title: "Cloud Encrypt", desc: "PHP base_encryption / filter codec" },
  { path: "/sql-in", icon: "sql-in", title: "SQL IN", desc: "Batch data to SQL IN clause" },
];

function openTool(path: string) {
  router.push(path);
}
</script>

<template>
  <div class="dashboard">
    <header class="page-header">
      <h1 class="page-title">Dev Toolbox</h1>
      <p class="page-desc">Choose a tool to get started</p>
    </header>

    <div class="tool-grid">
      <button
        v-for="tool in tools"
        :key="tool.path"
        class="tool-card"
        @click="openTool(tool.path)"
      >
        <component :is="TOOL_ICONS[tool.icon]" class="tool-card-icon" :size="ICON_SIZE['2xl']" />
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
  flex-shrink: 0; margin-top: 1px; color: var(--color-accent-primary);
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
