/**
 * Hello Plugin — Framework Validation Plugin
 *
 * This plugin proves the entire Workspace Core Framework works end-to-end:
 *
 *   1. Plugin Manifest → auto-discovered by PluginManager
 *   2. Route → auto-registered in Vue Router
 *   3. Sidebar → auto-populated from ToolRegistry
 *   4. Command Palette → auto-populated from CommandRegistry
 *   5. Shortcuts → auto-registered in ShortcutRegistry
 *   6. Search → auto-registered in SearchRegistry
 *   7. History → auto-enabled via manifest
 *   8. Favorites → auto-supported via FavoriteRegistry
 *   9. Recent → auto-recorded via RecentRegistry
 *  10. Deactivation → cleanup without side effects
 *  11. Uninstall → complete registry cleanup
 */

import type { ToolPlugin } from '@/core/plugin-types'

export const helloPlugin: ToolPlugin = {
  // ── Meta ──────────────────────────────────────────────────────────
  id: 'hello',
  name: 'Hello Plugin',
  description: 'Framework Validation — 验证 Workspace Core 是否正常运行',
  icon: '👋',
  version: '1.0.0',
  category: 'utility',

  // ── Route ─────────────────────────────────────────────────────────
  route: {
    path: '/hello',
    component: () => import('@/features/hello/HelloView.vue'),
    meta: {
      title: 'Hello Plugin',
      requiresActivation: true,
    },
  },

  // ── Commands ──────────────────────────────────────────────────────
  commands: [
    {
      id: 'hello:greet',
      label: 'Hello: Greet',
      description: 'Display greeting message',
      shortcut: 'Cmd+Shift+H',
      palette: true,
    },
    {
      id: 'hello:version',
      label: 'Hello: Show Version',
      description: 'Show plugin version and session info',
      shortcut: 'Cmd+Shift+V',
      palette: true,
    },
  ],

  // ── Shortcuts ─────────────────────────────────────────────────────
  shortcuts: {
    'hello:greet': {
      default: 'Ctrl+Shift+H',
      mac: 'Cmd+Shift+H',
      windows: 'Ctrl+Shift+H',
    },
    'hello:version': {
      default: 'Ctrl+Shift+V',
      mac: 'Cmd+Shift+V',
      windows: 'Ctrl+Shift+V',
    },
  },

  // ── Search ────────────────────────────────────────────────────────
  searchKeywords: [
    'hello',
    'framework',
    'validation',
    'plugin',
    'test',
    'core',
    'registry',
    '框架',
    '验证',
    '测试',
    '插件',
  ],

  // ── Permissions ───────────────────────────────────────────────────
  permissions: ['clipboard:read'],

  // ── Settings ──────────────────────────────────────────────────────
  settings: {
    greetingName: {
      type: 'input' as const,
      default: 'Developer',
      label: 'Greeting Name',
      description: 'Name used in the greeting message',
    },
    autoActivate: {
      type: 'toggle' as const,
      default: true,
      label: 'Auto Activate',
      description: 'Automatically activate the plugin on load',
    },
  },

  // ── History ───────────────────────────────────────────────────────
  history: {
    enabled: true,
    maxItems: 20,
    fields: ['sessionId', 'version', 'greeting', 'timestamp'],
  },
}
