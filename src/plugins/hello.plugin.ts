/**
 * Hello Plugin — Powered by Plugin SDK
 *
 * This is an internal framework validation tool used to verify that the
 * Workspace Core (plugin lifecycle, DI, routing, command registry) is
 * functioning correctly. It is intentionally excluded from the plugin
 * barrel export and the user-facing tool list.
 *
 * Not a user-facing developer tool — kept for development and testing.
 */

import { definePlugin, createCommand, type PluginContext } from '@/sdk/plugin'

export default definePlugin({
  id: 'hello',
  name: 'Hello Plugin',
  icon: 'Beaker',
  version: '1.0.0',
  description: 'Framework Validation — verify Workspace Core is running correctly',
  category: 'utility',
  status: 'coming-soon',

  // Route: string path + lazy component
  route: '/hello',
  component: () => import('@/features/hello/HelloView.vue'),

  // Commands: auto-registered in CommandRegistry
  commands: [
    createCommand({
      id: 'hello:greet',
      label: 'Hello: Greet',
      description: 'Display greeting message',
      shortcut: 'Cmd+Shift+H',
    }),
    createCommand({
      id: 'hello:version',
      label: 'Hello: Show Version',
      description: 'Show plugin version and session info',
      shortcut: 'Cmd+Shift+V',
    }),
  ],

  // Shortcuts: auto-registered in ShortcutRegistry
  shortcuts: [
    { commandId: 'hello:greet', default: 'Ctrl+Shift+H', mac: 'Cmd+Shift+H' },
    { commandId: 'hello:version', default: 'Ctrl+Shift+V', mac: 'Cmd+Shift+V' },
  ],

  // Keywords: auto-registered in SearchRegistry
  keywords: ['hello', 'framework', 'validation', 'plugin', 'test', '框架', '验证', '插件'],

  // Permissions: future enforcement
  permissions: ['clipboard:read'],

  // Settings: auto-generated settings UI
  settings: {
    greetingName: {
      key: 'greetingName',
      type: 'input',
      label: 'Greeting Name',
      default: 'Developer',
    },
    autoActivate: {
      key: 'autoActivate',
      type: 'toggle',
      label: 'Auto Activate',
      default: true,
    },
  },

  // History: auto-enabled
  history: { enabled: true, maxItems: 20 },

  // Lifecycle hooks (optional, auto-managed by default)
  onActivate(ctx: PluginContext) {
    ctx.logger.info(`Hello Plugin activated — ${ctx.id} v${ctx.version}`)
  },
  onDeactivate(ctx: PluginContext) {
    ctx.logger.info('Hello Plugin deactivated')
  },
})
