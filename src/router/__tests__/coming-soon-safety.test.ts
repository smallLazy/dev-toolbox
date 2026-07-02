/**
 * Coming-Soon Tool Safety Tests
 *
 * Verifies that coming-soon tools (registered plugins without implementation)
 * can NEVER render their stub views. Enforces:
 *
 *   a) No stub view component is imported by any router record
 *   b) Every coming-soon tool path is covered by the catch-all → ToolUnavailable
 *   c) ToolUnavailable has "Tool not activated" for known-plugins
 *   d) Chinese stub views are NEVER accessible via routing
 */

import { describe, it, expect } from 'vitest'
import routerSource from '../index.ts?raw'

// ── Helpers ──────────────────────────────────────────────────────────────

/** Extract route paths ONLY (not inside redirect blocks) */
function getRoutePaths(source: string): string[] {
  const paths: string[] = []
  const lines = source.split('\n')
  for (let i = 0; i < lines.length; i++) {
    const m = lines[i].match(/^\s*path:\s*["']([^"']+)["']/)
    if (!m) continue
    const context = lines.slice(Math.max(0, i - 2), i).join(' ')
    if (context.includes('redirect:')) continue
    paths.push(m[1])
  }
  return paths
}

/** Extract all lazy-imported component paths (feature View.vue files) */
function getImportedComponents(source: string): string[] {
  const imports: string[] = []
  const regex = /import\s*\(\s*["']([^"']+View\.vue)["']\s*\)/g
  let m: RegExpExecArray | null
  while ((m = regex.exec(source)) !== null) {
    imports.push(m[1])
  }
  return imports
}

// Plugin routes from the plugin definitions
const PLUGIN_ROUTES: Record<string, string> = {
  agent: '/agent', base64: '/base64', color: '/color', crypto: '/crypto',
  curl: '/curl', diff: '/diff', explain: '/explain', gitee: '/gitee',
  github: '/github', graphql: '/graphql', hash: '/hash', hello: '/hello',
  'html-encode': '/html-encode', 'http-client': '/http-client', jira: '/jira',
  json: '/json', jwt: '/jwt', markdown: '/markdown',
  'preset-php-compatible': '/preset/php-compatible', prompt: '/prompt',
  qrcode: '/qrcode', regex: '/regex', 'request-decoder': '/request-decoder',
  review: '/review', rsa: '/rsa', sentry: '/sentry', sm2: '/sm2', sm3: '/sm3',
  sm4: '/sm4', sql: '/sql', timestamp: '/timestamp', translate: '/translate',
  unicode: '/unicode', url: '/url', uuid: '/uuid', websocket: '/websocket',
  wecom: '/wecom', xml: '/xml', yaml: '/yaml', zentao: '/zentao',
}

// Active plugins: those with explicit router records pointing to real views
const ACTIVE_PLUGINS = new Set([
  'base64', 'crypto', 'hash', 'hello', 'html-encode', 'json', 'jwt',
  'preset-php-compatible', 'sql', 'timestamp', 'url',
])

// Stub view file names — auto-generated placeholders that must never render
const STUB_VIEW_NAMES = [
  'AgentView.vue', 'ColorView.vue', 'CurlView.vue', 'DiffView.vue',
  'ExplainView.vue', 'GiteeView.vue', 'GithubView.vue', 'GraphqlView.vue',
  'HttpClientView.vue', 'JiraView.vue',
  'MarkdownView.vue', 'PromptView.vue', 'QrcodeView.vue',
  'RegexView.vue', 'RequestDecoderView.vue', 'ReviewView.vue',
  'RsaView.vue', 'SentryView.vue', 'Sm2View.vue', 'Sm3View.vue',
  'Sm4View.vue', 'TranslateView.vue', 'UnicodeView.vue',
  'UuidView.vue', 'WebsocketView.vue', 'WecomView.vue',
  'XmlView.vue', 'YamlView.vue', 'ZentaoView.vue',
]

// ── Tests ────────────────────────────────────────────────────────────────

describe('Coming-Soon Tool Route Safety', () => {
  const routePaths = getRoutePaths(routerSource)
  const importedComponents = getImportedComponents(routerSource)

  it('no stub view is imported by any router record', () => {
    const violations: string[] = []
    for (const stubName of STUB_VIEW_NAMES) {
      for (const importPath of importedComponents) {
        if (importPath.includes(stubName)) {
          violations.push(`Stub "${stubName}" imported as "${importPath}"`)
        }
      }
    }
    expect(
      violations,
      `Stub views found in router imports — they MUST be removed:\n${violations.join('\n')}`
    ).toHaveLength(0)
  })

  it('coming-soon plugins have NO explicit router record', () => {
    const violations: string[] = []
    for (const [pluginId, route] of Object.entries(PLUGIN_ROUTES)) {
      if (ACTIVE_PLUGINS.has(pluginId)) continue
      if (routePaths.includes(route)) {
        violations.push(
          `Coming-soon "${pluginId}" has explicit route "${route}" — must point to ToolUnavailable or be removed`
        )
      }
    }
    expect(
      violations,
      `Coming-soon plugins with explicit routes:\n${violations.join('\n')}`
    ).toHaveLength(0)
  })

  it('catch-all /:pathMatch(.*)* covers all coming-soon paths', () => {
    const hasCatchAll = routerSource.includes('/:pathMatch(.*)*')
    expect(hasCatchAll, 'Router must have catch-all /:pathMatch(.*)*').toBe(true)

    const catchAllIdx = routerSource.indexOf('/:pathMatch(.*)*')
    const afterCatchAll = routerSource.slice(catchAllIdx)
    expect(
      afterCatchAll.includes('ToolUnavailable'),
      'Catch-all must import ToolUnavailable.vue'
    ).toBe(true)
  })

  it('every active plugin has a dedicated router record', () => {
    const violations: string[] = []
    for (const pluginId of ACTIVE_PLUGINS) {
      const route = PLUGIN_ROUTES[pluginId]
      if (!route) { violations.push(`Active "${pluginId}" has no known route`); continue }
      if (!routePaths.includes(route)) {
        violations.push(`Active "${pluginId}" route "${route}" not in router`)
      }
    }
    expect(violations, `Active plugins missing routes:\n${violations.join('\n')}`).toHaveLength(0)
  })

  it('ToolUnavailable has both "Tool not activated" and "Page not found"', async () => {
    const source = (await import('../../components/ToolUnavailable.vue?raw')).default as string
    expect(source, 'Must have "Tool not activated"').toContain('Tool not activated')
    expect(source, 'Must have "Page not found"').toContain('Page not found')
    expect(source, 'Must use workspace store').toContain('useWorkspaceStore')
    expect(source, 'Must check isKnownPlugin').toContain('isKnownPlugin')
    // Zero Chinese
    expect(/[一-鿿]/.test(source), 'Must not contain Chinese characters').toBe(false)
  })

  it('ToolUnavailable has zero emoji characters', async () => {
    const source = (await import('../../components/ToolUnavailable.vue?raw')).default as string
    const emojiRe = /[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/u
    expect(emojiRe.test(source), 'ToolUnavailable must not contain emoji characters').toBe(false)
  })

  it('ToolUnavailable handles disabled status', async () => {
    const source = (await import('../../components/ToolUnavailable.vue?raw')).default as string
    expect(source, 'Must handle disabled status').toContain('Tool unavailable')
  })
})

describe('Sidebar and Home Badge Emoji Check', () => {
  it('Sidebar.vue has zero emoji characters', async () => {
    const source = (await import('../../components/Sidebar.vue?raw')).default as string
    const emojiRe = /[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/u
    expect(emojiRe.test(source), 'Sidebar.vue must not contain emoji characters').toBe(false)
  })

  it('Sidebar.vue has coming-soon badge markup', async () => {
    const source = (await import('../../components/Sidebar.vue?raw')).default as string
    expect(source, 'Sidebar must have Soon badge').toContain('nav-status-badge')
    expect(source, 'Sidebar must show Soon text').toContain('Soon')
  })

  it('DashboardCard.vue has coming-soon badge markup', async () => {
    const source = (await import('../../components/DashboardCard.vue?raw')).default as string
    expect(source, 'DashboardCard must have status badge').toContain('card-status-badge')
    expect(source, 'DashboardCard must show Soon badge').toContain('Soon')
  })

  it('DashboardCard.vue has zero emoji characters', async () => {
    const source = (await import('../../components/DashboardCard.vue?raw')).default as string
    const emojiRe = /[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/u
    expect(emojiRe.test(source), 'DashboardCard.vue must not contain emoji characters').toBe(false)
  })
})

describe('Chinese Stub View Audit', () => {
  it('documents Chinese text in stub views but confirms they are unreachable', async () => {
    // This test documents the known state: stub views contain Chinese text,
    // but they are structurally unreachable via routing.
    // When a stub tool is activated, its view must be rewritten in English.

    // Spot-check: load one representative stub view
    let stubHasChinese = false
    try {
      const stubSource = (await import('../../features/color/ColorView.vue?raw')).default as string
      stubHasChinese = /[一-鿿]/.test(stubSource)
    } catch {
      // View may not be loadable as raw — that's fine
    }

    // The key assertion: ToolUnavailable (which IS reachable) has zero Chinese
    const fallbackSource = (await import('../../components/ToolUnavailable.vue?raw')).default as string
    const fallbackHasChinese = /[一-鿿]/.test(fallbackSource)

    console.log(`\n  [INFO] Stub views contain Chinese: ${stubHasChinese}`)
    console.log('  [INFO] These are UNREACHABLE — catch-all renders ToolUnavailable.')
    console.log(`  [INFO] ToolUnavailable has Chinese: ${fallbackHasChinese}\n`)

    // The catch-all fallback must be Chinese-free
    expect(fallbackHasChinese, 'ToolUnavailable (the reachable fallback) must not have Chinese').toBe(false)
  })
})
