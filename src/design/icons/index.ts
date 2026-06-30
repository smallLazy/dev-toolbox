/**
 * Icon System — SVG Icons (Lucide-style)
 *
 * All icons: 24×24, stroke-width 2, round caps, currentColor.
 * Usage: <component :is="Icons.Lock" />
 */

import { h, defineComponent } from 'vue'

// ── SVG Factory ──────────────────────────────────────────────────────

function icon(paths: string[], viewBox = '0 0 24 24') {
  return defineComponent({
    props: { size: { type: [Number, String], default: 24 } },
    setup(props: { size: number | string }) {
      return () =>
        h(
          'svg',
          {
            xmlns: 'http://www.w3.org/2000/svg',
            width: props.size,
            height: props.size,
            viewBox,
            fill: 'none',
            stroke: 'currentColor',
            'stroke-width': '2',
            'stroke-linecap': 'round' as const,
            'stroke-linejoin': 'round' as const,
          },
          paths.map((d) => h('path', { d }))
        )
    },
  })
}

// ── Icons ────────────────────────────────────────────────────────────

export const Icons = {
  // Navigation
  Home: icon(['M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z', 'M9 22V12h6v10']),
  Search: icon(['M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z'], '0 0 24 24'),
  Settings: icon(['M12 15a3 3 0 100-6 3 3 0 000 6z', 'M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z']),

  // Tools
  Lock: icon(['M19 11H5a2 2 0 00-2 2v7a2 2 0 002 2h14a2 2 0 002-2v-7a2 2 0 00-2-2z', 'M7 11V7a5 5 0 0110 0v4']),
  FileJson: icon(['M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z', 'M14 2v6h6', 'M12 18v-6l2 3 2-3v6']),
  Braces: icon(['M8 3H7a2 2 0 00-2 2v6l2 3-2 3v6a2 2 0 002 2h1', 'M16 3h1a2 2 0 012 2v6l-2 3 2 3v6a2 2 0 01-2 2h-1']),
  Hash: icon(['M4 9h16', 'M4 15h16', 'M10 3L8 21', 'M16 3l-2 18']),
  Clock: icon(['M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z', 'M12 6v6l4 2']),
  Link: icon(['M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71', 'M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71']),
  Shield: icon(['M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z']),
  Package: icon(['M16.5 9.4l-9-5.19M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z', 'M3.3 7l8.7 5 8.7-5', 'M12 22V12']),
  CaseSensitive: icon(['M3 9l3-3m0 0l3 3M6 6v12', 'M21 9l-3-3m0 0l-3 3m3-3v12', 'M13 12h5l-2.5-2.5']),

  // Actions
  Copy: icon(['M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z']),
  Trash: icon(['M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2']),
  Star: icon(['M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z']),
  Refresh: icon(['M23 4v6h-6', 'M1 20v-6h6', 'M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15']),
  ChevronRight: icon(['M9 18l6-6-6-6']),
  ExternalLink: icon(['M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3']),

  // Status
  Check: icon(['M20 6L9 17l-5-5']),
  Alert: icon(['M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z']),
  Info: icon(['M12 16v-4m0-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z']),
  Terminal: icon(['M4 17l6-6-6-6M12 19h8']),
  Beaker: icon(['M8 3h8M8 3v4.3a5 5 0 002.3 4.2L12 13l1.7-1.5A5 5 0 0016 7.3V3M8 3h8', 'M3 21h18']),
  Download: icon(['M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3']),
  Upload: icon(['M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12']),
  Folder: icon(['M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z']),
  Zap: icon(['M13 2L3 14h9l-1 8 10-12h-9l1-8z']),
} as const

export type IconName = keyof typeof Icons

/**
 * Map tool IDs to their canonical icon.
 * Used by Sidebar and Dashboard to render consistent icons.
 */
export const TOOL_ICON_MAP: Record<string, IconName> = {
  crypto: 'Lock',
  json: 'FileJson',
  'cloud-encrypt': 'Package',
  base64: 'CaseSensitive',
  url: 'Link',
  timestamp: 'Clock',
  hash: 'Hash',
  jwt: 'Shield',
  hello: 'Beaker',
  config: 'Settings',
  settings: 'Settings',
  home: 'Home',
  // Generated plugins
  yaml: 'FileJson',
  xml: 'FileJson',
  sql: 'FileJson',
  markdown: 'FileJson',
  'html-encode': 'Braces',
  unicode: 'CaseSensitive',
  rsa: 'Lock',
  sm2: 'Lock',
  sm3: 'Hash',
  sm4: 'Lock',
  curl: 'Terminal',
  'http-client': 'Terminal',
  graphql: 'Terminal',
  websocket: 'Zap',
  'request-decoder': 'Search',
  uuid: 'Hash',
  regex: 'Search',
  diff: 'FileJson',
  qrcode: 'Package',
  color: 'Braces',
  sentry: 'Shield',
  gitee: 'Folder',
  github: 'Folder',
  jira: 'Folder',
  zentao: 'Folder',
  wecom: 'Folder',
  prompt: 'Terminal',
  translate: 'Braces',
  review: 'Search',
  explain: 'Info',
  agent: 'Zap',
}
