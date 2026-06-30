<script setup lang="ts">
import { useRouter, useRoute } from "vue-router";

const router = useRouter();
const route = useRoute();

interface MenuItem {
  path: string;
  label: string;
  icon: string;
}

const menuItems: MenuItem[] = [
  { path: "/crypto", label: "AES 加解密", icon: "🔐" },
  { path: "/cloud-encrypt", label: "请求参数编解码", icon: "📦" },
  { path: "/json", label: "JSON 格式化", icon: "📋" },
  { path: "/base64", label: "Base64 编解码", icon: "🔤" },
  { path: "/url", label: "URL 编解码", icon: "🔗" },
  { path: "/timestamp", label: "时间戳转换", icon: "⏰" },
  { path: "/hash", label: "MD5 / SHA256", icon: "🔑" },
  { path: "/jwt", label: "JWT 解析", icon: "🎫" },
  { path: "/config", label: "配置管理", icon: "⚙️" },
];

function navigate(path: string) {
  router.push(path);
}

function isActive(path: string): boolean {
  return route.path === path;
}
</script>

<template>
  <aside class="sidebar">
    <div class="sidebar-header">
      <span class="logo-icon">🛠️</span>
      <div class="logo-text">
        <h1>Dev Toolbox</h1>
        <span class="logo-sub">开发者工具箱</span>
      </div>
    </div>

    <nav class="sidebar-nav">
      <button
        v-for="item in menuItems"
        :key="item.path"
        :class="['nav-item', { active: isActive(item.path) }]"
        @click="navigate(item.path)"
      >
        <span class="nav-icon">{{ item.icon }}</span>
        <span class="nav-label">{{ item.label }}</span>
      </button>
    </nav>

    <div class="sidebar-footer">
      <span class="version">v0.1.0-beta.1</span>
    </div>
  </aside>
</template>

<style scoped>
.sidebar {
  width: var(--sidebar-width);
  min-width: var(--sidebar-width);
  background: var(--color-neutral-10);
  color: var(--color-neutral-100);
  display: flex;
  flex-direction: column;
  height: 100vh;
  user-select: none;
  border-right: var(--border-width-thin) solid var(--border-color-subtle);
}

.sidebar-header {
  padding: var(--space-5) var(--space-5) var(--space-4);
  display: flex;
  align-items: center;
  gap: var(--space-3);
  border-bottom: var(--border-width-thin) solid var(--border-color-subtle);
}

.logo-icon { font-size: var(--text-heading); line-height: 1; }
.logo-text h1 {
  font-size: var(--text-subtitle);
  font-weight: var(--weight-semibold);
  color: var(--color-neutral-100);
  line-height: var(--leading-tight);
}
.logo-sub { font-size: var(--text-caption); color: var(--color-neutral-80); font-weight: var(--weight-regular); }

.sidebar-nav { flex: 1; padding: var(--space-2) 0; overflow-y: auto; }

.nav-item {
  display: flex; align-items: center; gap: 10px; width: 100%;
  padding: 9px var(--space-5);
  border: none; background: transparent;
  color: var(--color-neutral-90);
  font-size: var(--text-body); font-family: var(--font-sans);
  cursor: pointer; text-align: left;
  transition: all var(--duration-normal) var(--ease-standard);
  border-left: var(--border-width-thick) solid transparent;
}

.nav-item:hover { background: var(--color-neutral-40); color: var(--color-neutral-100); }
.nav-item.active {
  background: var(--color-accent-dim);
  color: var(--color-accent-primary);
  border-left-color: var(--color-accent-primary);
}

.nav-icon { font-size: var(--text-subtitle); width: 22px; text-align: center; flex-shrink: 0; }
.nav-label { white-space: nowrap; font-weight: var(--weight-regular); }

.sidebar-footer {
  padding: var(--space-3) var(--space-5);
  border-top: var(--border-width-thin) solid var(--border-color-subtle);
}
.version { font-size: var(--text-caption); color: var(--color-neutral-70); }
</style>
