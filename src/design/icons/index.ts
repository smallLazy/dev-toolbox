/**
 * Icon System — Single Source of Truth
 *
 * ALL icons in Developer Workspace flow through this registry.
 * No direct lucide imports. No emoji. No PNG. No custom SVG.
 *
 * Usage:
 *   import { Icons, TOOL_ICONS, APP_ICONS } from '@/design/icons'
 *   <Icons.Lock :size="20" />
 *   <component :is="TOOL_ICONS.json" :size="24" />
 */

import { h, defineComponent } from 'vue'

// ═══════════════════════════════════════════════════════════════════════════
// Constants
// ═══════════════════════════════════════════════════════════════════════════

export const ICON_SIZE = {
  sm: 14,   // Badge, inline
  md: 16,   // Toolbar, Search, Form label
  lg: 18,   // Sidebar nav
  xl: 20,   // Sidebar active, Card title
  '2xl': 24, // Dashboard card, Page header
  '3xl': 32, // Empty state
} as const

export const ICON_STROKE = 2

// ═══════════════════════════════════════════════════════════════════════════
// SVG Factory
// ═══════════════════════════════════════════════════════════════════════════

/** A single SVG element descriptor — either a path-d string or a [tag, attrs] tuple. */
type IconElement = string | [string, Record<string, string>]

function icon(elements: IconElement[], viewBox = '0 0 24 24') {
  return defineComponent({
    props: { size: { type: [Number, String], default: 24 } },
    setup(props: { size: number | string }, { attrs }) {
      return () =>
        h('svg', {
          xmlns: 'http://www.w3.org/2000/svg',
          width: props.size, height: props.size,
          viewBox, fill: 'none',
          stroke: 'currentColor',
          'stroke-width': ICON_STROKE,
          'stroke-linecap': 'round' as const,
          'stroke-linejoin': 'round' as const,
          ...attrs,
        }, elements.map((el) => {
          if (typeof el === 'string') {
            return h('path', { d: el })
          }
          const [tag, elAttrs] = el
          return h(tag, elAttrs)
        }))
    },
  })
}

// ═══════════════════════════════════════════════════════════════════════════
// App Icons (generic actions)
// ═══════════════════════════════════════════════════════════════════════════

export const Icons = {
  // Navigation
  Home: icon(['M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z', 'M9 22V12h6v10']),
  Search: icon(['M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z']),
  ChevronRight: icon(['M9 18l6-6-6-6']),
  ExternalLink: icon(['M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3']),

  // Actions
  Copy: icon(['M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z']),
  Trash: icon(['M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2']),
  Star: icon(['M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z']),
  Refresh: icon(['M23 4v6h-6M1 20v-6h6M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15']),
  Download: icon(['M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3']),
  Upload: icon(['M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12']),
  Folder: icon(['M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z']),
  Zap: icon(['M13 2L3 14h9l-1 8 10-12h-9l1-8z']),
  Play: icon(['M5 3l14 9-14 9V3z']),
  Pause: icon(['M6 4h4v16H6zM14 4h4v16h-4z']),
  Check: icon(['M20 6L9 17l-5-5']),
  Alert: icon(['M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z']),
  Info: icon(['M12 16v-4m0-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z']),
  X: icon(['M18 6L6 18M6 6l12 12']),

  // App
  Settings: icon(['M12 15a3 3 0 100-6 3 3 0 000 6z', 'M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z']),
  Terminal: icon(['M4 17l6-6-6-6M12 19h8']),
  History: icon(['M3 3v5h5M3.05 13A9 9 0 106.58 5.3L3 8']),
  Beaker: icon(['M8 3h8M8 3v4.3a5 5 0 002.3 4.2L12 13l1.7-1.5A5 5 0 0016 7.3V3M8 3h8M3 21h18']),

  // Brand
  PanelsTopLeft: icon(['M21 3H3v7h18V3z', 'M21 14h-7v7h7v-7z', 'M10 14H3v7h7v-7z']),
  LayoutGrid: icon(['M3 3h7v7H3V3z', 'M14 3h7v7h-7V3z', 'M14 14h7v7h-7v-7z', 'M3 14h7v7H3v-7z']),
  Layers3: icon([
    'm12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z',
    'm6.08 9.5-3.5 1.6a1 1 0 0 0 0 1.81l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9a1 1 0 0 0 0-1.83l-3.5-1.59',
    'm6.08 14.5-3.5 1.6a1 1 0 0 0 0 1.81l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9a1 1 0 0 0 0-1.83l-3.5-1.59',
  ]),

  // Tool icons (used by TOOL_ICONS map)
  Lock: icon(['M19 11H5a2 2 0 00-2 2v7a2 2 0 002 2h14a2 2 0 002-2v-7a2 2 0 00-2-2z', 'M7 11V7a5 5 0 0110 0v4']),
  FileJson: icon(['M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z', 'M14 2v6h6', 'M12 18v-6l2 3 2-3v6']),
  Braces: icon(['M8 3H7a2 2 0 00-2 2v6l2 3-2 3v6a2 2 0 002 2h1', 'M16 3h1a2 2 0 012 2v6l-2 3 2 3v6a2 2 0 01-2 2h-1']),
  Hash: icon(['M4 9h16M4 15h16M10 3L8 21M16 3l-2 18']),
  Clock: icon(['M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z', 'M12 6v6l4 2']),
  Link: icon(['M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71', 'M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71']),
  Shield: icon(['M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z']),
  Package: icon(['M16.5 9.4l-9-5.19M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z', 'M3.3 7l8.7 5 8.7-5', 'M12 22V12']),
  CaseSensitive: icon(['M3 9l3-3m0 0l3 3M6 6v12', 'M21 9l-3-3m0 0l-3 3m3-3v12', 'M13 12h5l-2.5-2.5']),
  Database: icon(['M12 2c5.523 0 10 2.239 10 5s-4.477 5-10 5S2 9.761 2 7s4.477-5 10-5z', 'M2 7v5c0 2.761 4.477 5 10 5s10-2.239 10-5V7', 'M2 12v5c0 2.761 4.477 5 10 5s10-2.239 10-5v-5']),
  Globe: icon(['M12 2a10 10 0 100 20 10 10 0 000-20z', 'M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z']),
  Key: icon(['M21 2l-2 2m-7.61 7.61a5.5 5.5 0 11-7.778 7.778 5.5 5.5 0 017.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4']),
  FileCode: icon(['M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z', 'M14 2v6h6', 'M10 13l-2 2 2 2M14 13l2 2-2 2']),

  // Extended tool icons (Sprint 01)
  Palette: icon(['M2 12a10 10 0 1010-10 10 10 0 00-10 10z', 'M7.5 10a1.5 1.5 0 100-3 1.5 1.5 0 000 3z', 'M16.5 10a1.5 1.5 0 100-3 1.5 1.5 0 000 3z', 'M12 17.5a1.5 1.5 0 100-3 1.5 1.5 0 000 3z']),
  QrCode: icon(['M3 3h6v6H3z', 'M15 3h6v6h-6z', 'M3 15h6v6H3z', 'M15 15h3v3h-3z', 'M21 15v6h-6']),
  GitBranch: icon(['M6 3v12', 'M18 9a3 3 0 100-6 3 3 0 000 6z', 'M6 21a3 3 0 100-6 3 3 0 000 6z', 'M18 9a9 9 0 01-9 9']),
  MessagesSquare: icon(['M14 9a2 2 0 01-2 2H6l-4 4V4c0-1.1.9-2 2-2h8a2 2 0 012 2v5z', 'M18 9h2a2 2 0 012 2v11l-4-4h-6a2 2 0 01-2-2v-1']),
  Eye: icon(['M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z', 'M12 15a3 3 0 100-6 3 3 0 000 6z']),

  // ── Sprint 02 — per-tool identity icons ──
  Binary: icon([
    ['rect', { x: '14', y: '14', width: '4', height: '6', rx: '2' }],
    ['rect', { x: '6', y: '4', width: '4', height: '6', rx: '2' }],
    'M6 20h4',
    'M14 10h4',
    'M6 14h2v6',
    'M14 4h2v6',
  ]),
  KeyRound: icon([
    'M2.586 17.414A2 2 0 0 0 2 18.828V21a1 1 0 0 0 1 1h3a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h1a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h.172a2 2 0 0 0 1.414-.586l.814-.814a6.5 6.5 0 1 0-4-4z',
    ['circle', { cx: '16.5', cy: '7.5', r: '.5', fill: 'currentColor' }],
  ]),
  LockKeyhole: icon([
    ['circle', { cx: '12', cy: '16', r: '1' }],
    ['rect', { x: '3', y: '10', width: '18', height: '12', rx: '2' }],
    'M7 10V7a5 5 0 0 1 10 0v3',
  ]),
  FingerprintPattern: icon([
    'M12 10a2 2 0 0 0-2 2c0 1.02-.1 2.51-.26 4',
    'M14 13.12c0 2.38 0 6.38-1 8.88',
    'M17.29 21.02c.12-.6.43-2.3.5-3.02',
    'M2 12a10 10 0 0 1 18-6',
    'M2 16h.01',
    'M21.8 16c.2-2 .131-5.354 0-6',
    'M5 19.5C5.5 18 6 15 6 12a6 6 0 0 1 .34-2',
    'M8.65 22c.21-.66.45-1.32.57-2',
    'M9 6.8a6 6 0 0 1 9 5.2v2',
  ]),
  CodeXml: icon([
    'm18 16 4-4-4-4',
    'm6 8-4 4 4 4',
    'm14.5 4-5 16',
  ]),
  ShieldCheck: icon([
    'M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z',
    'm9 12 2 2 4-4',
  ]),
  BadgeCheck: icon([
    'M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z',
    'm9 12 2 2 4-4',
  ]),
  Wrench: icon([
    'M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.106-3.105c.32-.322.863-.22.983.218a6 6 0 0 1-8.259 7.057l-7.91 7.91a1 1 0 0 1-2.999-3l7.91-7.91a6 6 0 0 1 7.057-8.259c.438.12.54.662.219.984z',
  ]),
} as const

// ═══════════════════════════════════════════════════════════════════════════
// Tool Icon Map — every tool gets ONE canonical icon
// ═══════════════════════════════════════════════════════════════════════════

export const TOOL_ICONS = {
  // ── Core tools ──
  json: Icons.FileJson,
  crypto: Icons.Lock,
  aes: Icons.LockKeyhole,
  base64: Icons.Binary,
  url: Icons.Link,
  timestamp: Icons.Clock,
  hash: Icons.FingerprintPattern,
  jwt: Icons.KeyRound,
  ['cloud-encrypt']: Icons.Package,
  ['preset-php-compatible']: Icons.Braces,
  ['sql-in']: Icons.Database,
  config: Icons.Settings,
  settings: Icons.Settings,
  hello: Icons.Beaker,
  home: Icons.Home,

  // ── Sprint 01 — 33-plugin full coverage ──
  agent: Icons.MessagesSquare,
  color: Icons.Palette,
  curl: Icons.Globe,
  diff: Icons.GitBranch,
  explain: Icons.MessagesSquare,
  gitee: Icons.GitBranch,
  github: Icons.GitBranch,
  graphql: Icons.Globe,
  ['html-encode']: Icons.CodeXml,
  ['http-client']: Icons.Globe,
  jira: Icons.Check,
  markdown: Icons.FileCode,
  prompt: Icons.MessagesSquare,
  qrcode: Icons.QrCode,
  regex: Icons.FileCode,
  ['request-decoder']: Icons.Globe,
  review: Icons.Check,
  rsa: Icons.ShieldCheck,
  sentry: Icons.Shield,
  sm2: Icons.BadgeCheck,
  sm3: Icons.Hash,
  sm4: Icons.Lock,
  sql: Icons.Database,
  translate: Icons.Globe,
  unicode: Icons.CaseSensitive,
  uuid: Icons.Hash,
  websocket: Icons.Globe,
  wecom: Icons.MessagesSquare,
  xml: Icons.FileCode,
  yaml: Icons.FileCode,
  zentao: Icons.Check,
} as const

// ═══════════════════════════════════════════════════════════════════════════
// App Icon Map — generic action icons
// ═══════════════════════════════════════════════════════════════════════════

export const APP_ICONS = {
  // Brand
  toolbox: Icons.Layers3,
  workspace: Icons.PanelsTopLeft,
  dashboard: Icons.LayoutGrid,

  // Actions
  copy: Icons.Copy,
  paste: Icons.Copy,
  clear: Icons.Trash,
  swap: Icons.Refresh,
  star: Icons.Star,
  history: Icons.History,
  settings: Icons.Settings,
  search: Icons.Search,
  download: Icons.Download,
  upload: Icons.Upload,
  play: Icons.Play,
  pause: Icons.Pause,
  check: Icons.Check,
  alert: Icons.Alert,
  info: Icons.Info,
  close: Icons.X,
  home: Icons.Home,
  terminal: Icons.Terminal,
  external: Icons.ExternalLink,
  folder: Icons.Folder,
  zap: Icons.Zap,
  chevronRight: Icons.ChevronRight,
} as const

export type IconName = keyof typeof Icons
export type ToolIconKey = keyof typeof TOOL_ICONS
export type AppIconKey = keyof typeof APP_ICONS

// ═══════════════════════════════════════════════════════════════════════════
// Reverse icon lookup — pre-built at module init for O(1) getToolIconName
// ═══════════════════════════════════════════════════════════════════════════

const ICON_NAME_BY_COMPONENT = new Map<object, IconName>()

for (const entry of Object.entries(Icons) as [IconName, object][]) {
  ICON_NAME_BY_COMPONENT.set(entry[1], entry[0])
}

/**
 * Get the canonical icon component for a plugin by its ID.
 * Falls back to Wrench for unknown tool IDs.
 */
export function getToolIcon(pluginId: string) {
  return TOOL_ICONS[pluginId as ToolIconKey] ?? Icons.Wrench
}

/**
 * Get the canonical icon name (string key) for a plugin by its ID.
 * Use this when the icon is rendered via <component :is="Icons[name]">.
 * Falls back to 'Wrench' for unknown tool IDs.
 *
 * Uses a module-level reverse Map built from Icons — O(1) lookup,
 * no per-call Object.entries() iteration.
 */
export function getToolIconName(pluginId: string): IconName {
  const component = getToolIcon(pluginId)
  return ICON_NAME_BY_COMPONENT.get(component) ?? 'Wrench'
}
