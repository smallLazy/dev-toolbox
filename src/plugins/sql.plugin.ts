/**
 * SQL Plugin — Plugin Manifest
 */

import { definePlugin } from '@/sdk/plugin'

export default definePlugin({
  id: 'sql',
  name: 'SQL',
  icon: 'Database',
  version: '1.0.0',
  description: 'SQL IN Builder and Formatter',
  category: 'formatter',
  status: 'active',

  route: '/sql',
  component: () => import('@/features/sql/SqlView.vue'),

  commands: [
    {
      id: 'sql:execute',
      label: 'SQL: Build IN List',
      description: 'Build SQL IN list from batch values',
      shortcut: 'Cmd+Enter',
    },
  ],

  shortcuts: [
    { commandId: 'sql:execute', default: 'Ctrl+Enter', mac: 'Cmd+Enter' },
  ],

  keywords: [
    'sql', 'sql in', 'in builder', 'mysql in', 'quote list',
    'batch ids', 'comma separated', 'list', 'where in',
  ],

  permissions: ['clipboard:read', 'clipboard:write'],

  settings: {
    defaultMode: {
      key: 'defaultMode',
      type: 'select' as const,
      label: 'Default Mode',
      default: 'in-builder',
    },
  },

  history: { enabled: true, maxItems: 20 },
})
