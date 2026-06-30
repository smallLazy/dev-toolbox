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
  width: var(--sidebar-width, 240px);
  min-width: var(--sidebar-width, 240px);
  background: #171717;
  color: #E8E8E8;
  display: flex;
  flex-direction: column;
  height: 100vh;
  user-select: none;
  border-right: 1px solid #2D2D2D;
}

.sidebar-header {
  padding: 20px 20px 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  border-bottom: 1px solid #2D2D2D;
}

.logo-icon {
  font-size: 24px;
  line-height: 1;
}

.logo-text h1 {
  font-size: 16px;
  font-weight: 600;
  color: #E8E8E8;
  line-height: 1.3;
}

.logo-sub {
  font-size: 11px;
  color: #6E6E6E;
  font-weight: 400;
}

.sidebar-nav {
  flex: 1;
  padding: 8px 0;
  overflow-y: auto;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 9px 20px;
  border: none;
  background: transparent;
  color: #9D9D9D;
  font-size: 13px;
  font-family: inherit;
  cursor: pointer;
  transition: all 0.15s ease;
  text-align: left;
  border-left: 3px solid transparent;
}

.nav-item:hover {
  background: #252525;
  color: #E8E8E8;
}

.nav-item.active {
  background: rgba(0, 120, 212, 0.12);
  color: #0078D4;
  border-left-color: #0078D4;
}

.nav-icon {
  font-size: 16px;
  width: 22px;
  text-align: center;
  flex-shrink: 0;
}

.nav-label {
  white-space: nowrap;
  font-weight: 400;
}

.sidebar-footer {
  padding: 12px 20px;
  border-top: 1px solid #2D2D2D;
}

.version {
  font-size: 11px;
  color: #555;
}
</style>
