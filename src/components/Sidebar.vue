<script setup lang="ts">
import { ref, computed } from "vue";
import { useRouter, useRoute } from "vue-router";

const router = useRouter();
const route = useRoute();
const searchQuery = ref("");

interface MenuItem {
  path: string;
  label: string;
  icon: string;
  keywords: string;
}

const menuItems: MenuItem[] = [
  { path: "/crypto", label: "AES 加解密", icon: "🔐", keywords: "aes 加密 解密 cbc ecb" },
  { path: "/cloud-encrypt", label: "请求参数编解码", icon: "📦", keywords: "base_encryption filter urlencode" },
  { path: "/json", label: "JSON 格式化", icon: "📋", keywords: "json format compact" },
  { path: "/base64", label: "Base64 编解码", icon: "🔤", keywords: "base64 encode decode" },
  { path: "/url", label: "URL 编解码", icon: "🔗", keywords: "url encode decode uri" },
  { path: "/timestamp", label: "时间戳转换", icon: "⏰", keywords: "timestamp unix 日期" },
  { path: "/hash", label: "Hash 计算", icon: "🔑", keywords: "md5 sha256 hash" },
  { path: "/jwt", label: "JWT 解析", icon: "🎫", keywords: "jwt token decode" },
  { path: "/config", label: "设置", icon: "⚙️", keywords: "设置 配置 config" },
];

const filteredItems = computed(() => {
  const q = searchQuery.value.toLowerCase().trim();
  if (!q) return menuItems;
  return menuItems.filter(
    (item) =>
      item.label.toLowerCase().includes(q) ||
      item.keywords.toLowerCase().includes(q)
  );
});

function navigate(path: string) {
  router.push(path);
}

function isActive(path: string): boolean {
  return route.path === path;
}
</script>

<template>
  <aside class="sidebar">
    <div class="sidebar-header" @click="navigate('/')">
      <span class="logo-icon">🛠️</span>
      <div class="logo-text">
        <h1>Dev Toolbox</h1>
        <span class="logo-sub">开发者工具箱</span>
      </div>
    </div>

    <div class="search-box">
      <span class="search-icon">🔍</span>
      <input
        v-model="searchQuery"
        type="text"
        class="search-input"
        placeholder="搜索工具..."
      />
      <button v-if="searchQuery" class="search-clear" @click="searchQuery = ''">✕</button>
    </div>

    <nav class="sidebar-nav">
      <button
        v-for="item in filteredItems"
        :key="item.path"
        :class="['nav-item', { active: isActive(item.path) }]"
        @click="navigate(item.path)"
      >
        <span class="nav-icon">{{ item.icon }}</span>
        <span class="nav-label">{{ item.label }}</span>
      </button>
      <div v-if="filteredItems.length === 0" class="nav-empty">
        未找到匹配的工具
      </div>
    </nav>

    <div class="sidebar-footer">
      <span class="version">v0.1.0-beta.1</span>
    </div>
  </aside>
</template>

<style scoped>
.sidebar {
  width: var(--sidebar-width); min-width: var(--sidebar-width);
  background: var(--color-neutral-15);
  color: var(--color-neutral-100);
  display: flex; flex-direction: column; height: 100vh;
  user-select: none;
  border-right: var(--border-width-thin) solid rgba(255,255,255,0.04);
}

/* ── Header ───────────────────────────── */
.sidebar-header {
  padding: 18px var(--space-5) 14px;
  display: flex; align-items: center; gap: 10px;
  cursor: pointer; flex-shrink: 0;
  transition: opacity var(--duration-fast) var(--ease-standard);
}
.sidebar-header:hover { opacity: 0.85; }

.logo-icon {
  font-size: 20px; line-height: 1;
  filter: grayscale(0.2);
}
.logo-text h1 {
  font-size: var(--text-subtitle); font-weight: var(--weight-semibold);
  color: var(--color-neutral-110); line-height: var(--leading-tight);
  letter-spacing: -0.01em;
}
.logo-sub {
  font-size: var(--text-caption); color: var(--color-neutral-70);
  font-weight: var(--weight-regular); letter-spacing: 0.02em;
}

/* ── Search ───────────────────────────── */
.search-box {
  margin: 2px var(--space-3) var(--space-2);
  position: relative; display: flex; align-items: center;
}
.search-icon {
  position: absolute; left: 11px; font-size: 12px;
  pointer-events: none; opacity: 0.5;
}
.search-input {
  width: 100%;
  padding: 6px 26px 6px 30px;
  border: var(--border-width-thin) solid var(--border-color-default);
  border-radius: var(--radius-md);
  background: var(--color-neutral-20);
  color: var(--color-neutral-100);
  font-size: var(--text-body); font-family: var(--font-sans);
  outline: none;
  transition: border-color var(--duration-fast) var(--ease-standard),
              background var(--duration-fast) var(--ease-standard),
              box-shadow var(--duration-fast) var(--ease-standard);
}
.search-input:hover { background: var(--color-neutral-25); border-color: var(--border-color-hover); }
.search-input:focus {
  background: var(--color-neutral-15);
  border-color: var(--border-color-focus);
  box-shadow: 0 0 0 2px var(--color-accent-dim);
}
.search-input::placeholder { color: var(--color-neutral-70); }
.search-clear {
  position: absolute; right: 6px;
  background: none; border: none;
  color: var(--color-neutral-70); cursor: pointer;
  font-size: 11px; padding: 3px 4px; border-radius: var(--radius-sm);
  transition: color var(--duration-fast) var(--ease-standard);
}
.search-clear:hover { color: var(--color-neutral-100); }

/* ── Nav ──────────────────────────────── */
.sidebar-nav { flex: 1; padding: var(--space-1) 0; overflow-y: auto; }

.nav-item {
  display: flex; align-items: center; gap: 10px; width: 100%;
  padding: 7px var(--space-5);
  margin: 1px 0;
  border: none; background: transparent;
  color: var(--color-neutral-80);
  font-size: var(--text-body); font-family: var(--font-sans);
  cursor: pointer; text-align: left;
  border-left: var(--border-width-thick) solid transparent;
  transition: color var(--duration-fast) var(--ease-standard),
              background var(--duration-fast) var(--ease-standard),
              border-color var(--duration-fast) var(--ease-standard);
}
.nav-item:hover {
  background: rgba(255,255,255,0.04);
  color: var(--color-neutral-100);
}
.nav-item.active {
  background: var(--color-accent-dim);
  color: var(--color-accent-primary);
  border-left-color: var(--color-accent-primary);
}
.nav-item.active .nav-icon { filter: none; }

.nav-icon {
  font-size: 15px; width: 20px; text-align: center; flex-shrink: 0;
  transition: transform var(--duration-fast) var(--ease-standard);
}
.nav-item:hover .nav-icon { transform: translateX(1px); }

.nav-label { white-space: nowrap; font-weight: var(--weight-regular); }
.nav-empty { padding: var(--space-5); text-align: center; color: var(--color-neutral-70); font-size: var(--text-body); }

/* ── Footer ───────────────────────────── */
.sidebar-footer {
  padding: 10px var(--space-5);
  border-top: var(--border-width-thin) solid rgba(255,255,255,0.04);
  flex-shrink: 0;
}
.version { font-size: var(--text-caption); color: var(--color-neutral-60); letter-spacing: 0.03em; }
</style>
