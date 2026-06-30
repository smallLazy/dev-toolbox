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
  { path: "/crypto", label: "参数加解密", icon: "🔐" },
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
      <h1>Dev Toolbox</h1>
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
      <span class="version">v0.1.0</span>
    </div>
  </aside>
</template>

<style scoped>
.sidebar {
  width: 220px;
  min-width: 220px;
  background: #1e1e2e;
  color: #cdd6f4;
  display: flex;
  flex-direction: column;
  height: 100vh;
  user-select: none;
}

.sidebar-header {
  padding: 20px 16px;
  border-bottom: 1px solid #313244;
}

.sidebar-header h1 {
  font-size: 18px;
  font-weight: 600;
  color: #cba6f7;
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
  padding: 10px 16px;
  border: none;
  background: transparent;
  color: #cdd6f4;
  font-size: 14px;
  cursor: pointer;
  transition: background 0.15s;
  text-align: left;
}

.nav-item:hover {
  background: #313244;
}

.nav-item.active {
  background: #45475a;
  color: #cba6f7;
  border-right: 3px solid #cba6f7;
}

.nav-icon {
  font-size: 18px;
  width: 24px;
  text-align: center;
  flex-shrink: 0;
}

.nav-label {
  white-space: nowrap;
}

.sidebar-footer {
  padding: 12px 16px;
  border-top: 1px solid #313244;
  font-size: 12px;
  color: #6c7086;
}
</style>
